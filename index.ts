import { Telegraf, Context } from 'telegraf';
import { telegrafThrottler } from 'telegraf-throttler';
import config from './config';
import { v4 as v4uuid } from 'uuid';
import axios, { type AxiosError } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import cluster from 'cluster';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import md5 from 'md5';

let httpsAgent: HttpsProxyAgent | SocksProxyAgent | undefined = undefined;
if (config.httpsProxy) {
    httpsAgent = new HttpsProxyAgent(config.httpsProxy);
    httpsAgent.timeout = 30000;
} else if (config.socksProxy) {
    httpsAgent = new SocksProxyAgent(config.socksProxy);
    httpsAgent.timeout = 30000;
}

const signV1 = (obj: Record<string, unknown>) => {
    const str = JSON.stringify(obj);
    return md5(
        'https://h5.tu.qq.com' +
        (str.length + (encodeURIComponent(str).match(/%[89ABab]/g)?.length || 0)) +
        'HQ31X02e',
    );
};

const qqRequest = async (imgData: string) => {
    const uuid = v4uuid();

    let response;
    let data;
    for (let retry = 0; retry < 100; retry++) {
        const obj = {
            busiId: 'ai_painting_anime_entry',
            extra: JSON.stringify({
                face_rects: [],
                version: 2,
                platform: 'web',
                data_report: {
                    parent_trace_id: uuid,
                    root_channel: '',
                    level: 0,
                },
            }),
            images: [imgData],
        };
        try {
            response = await axios.request({
                httpsAgent,
                method: 'POST',
                url: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
                data: obj,
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://h5.tu.qq.com',
                    'Referer': 'https://h5.tu.qq.com/',
                    'User-Agent':
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                    'x-sign-value': signV1(obj),
                    'x-sign-version': 'v1',
                },
                timeout: 30000,
            });
        } catch (e) {
            response = (e as AxiosError).response;
        }

        data = response?.data as Record<string, unknown> | undefined;

        if (data?.msg === 'IMG_ILLEGAL') {
            throw new Error('Couldn\'t pass the censorship. Try another photo.');
        }

        if (data?.msg === 'VOLUMN_LIMIT') {
            retry--;
            console.log('QQ rate limit caught');
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        if (data?.code === 1001) {
            throw new Error('Face not found. Try another photo.');
        }

        if (
            data?.code === 2119 || // user_ip_country
            data?.code === -2111 || // AUTH_FAILED
            data?.code === -2110 // can't get bypass result from redis
        ) {
            console.error('Blocked', data);
            throw new Error(config.blockedMessage || 'The Chinese website has blocked the bot, too bad 🤷‍♂️');
        }

        if (data?.extra) {
            break;
        }

        console.error('Got no data from QQ', data);

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (data?.extra) {
        const extra = JSON.parse(data.extra as string);
        return {
            video: extra.video_urls[0],
            img: extra.img_urls[1],
        };
    } else {
        throw new Error(JSON.stringify(response?.data));
    }
};

const qqDownload = async (url: string): Promise<Buffer> => {
    let response;
    for (let retry = 0; retry < 100; retry++) {
        try {
            response = await axios.request({
                url,
                timeout: 5000,
                responseType: 'arraybuffer',
            });
        } catch (e) {
            response = (e as AxiosError).response;
            console.error('QQ file download error caught: ' + (e as AxiosError).toString());
        }

        if (response?.data) {
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return response?.data;
};

const userSessions: Array<UserSession> = [];

const cropImage = async (imgData: Buffer): Promise<Buffer> => {
    const img = await sharp(imgData);
    const meta = await img.metadata();
    const width = meta.width || 0;
    const height = meta.height || 0;

    let cropHeight;
    if (width > height) {
        cropHeight = 177;
    } else {
        cropHeight = 182;
    }

    return img.extract({
        top: 0,
        left: 0,
        width,
        height: height - cropHeight,
    })
        .toBuffer();
};

const processUserSession = async ({ ctx, userId, photoId, replyMessageId }: UserSession) => {
    try {
        const url = await ctx.telegram.getFileLink(photoId);

        let response;
        for (let retry = 0; retry < 100; retry++) {
            try {
                response = await axios.request({
                    url: url.href,
                    timeout: 5000,
                    responseType: 'arraybuffer',
                });
            } catch (e) {
                console.error('Telegram file download error caught: ' + (e as AxiosError).toString());
            }

            if (response?.data) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (!response) {
            console.log('Couldn\'t load the photo from ' + userId);
            throw new Error('Couldn\'t load the photo, please try again');
        }

        if (config.keepFiles) {
            fs.writeFile(
                path.join(__dirname, 'files', (new Date()).getTime() + '_' + userId + '_input.jpg'),
                response.data,
            );
        }

        try {
            await ctx.reply('Photo has been received, please wait', {
                reply_to_message_id: replyMessageId,
            });
        } catch (e) {
            console.error('Unable to send "photo received" message for ' + userId, (e as Error).toString());
        }

        console.log('Uploading to QQ for ' + userId);
        const urls = await qqRequest(response.data.toString('base64'));
        console.log('QQ responded successfully for ' + userId);

        console.log('Downloading from QQ for ' + userId);
        const [imgData, videoData] = await Promise.all([
            qqDownload(urls.img)
                .then((data) => cropImage(data)),
            ...((config.sendVideo ?? true) ? [qqDownload(urls.video)] : []),
        ]);

        if (config.keepFiles) {
            fs.writeFile(
                path.join(__dirname, 'files', (new Date()).getTime() + '_' + userId + '_output_img.jpg'),
                imgData,
            );
        }

        let mediaSuccessfullySent = false;
        for (let retry = 0; retry < 100; retry++) {
            try {
                await ctx.replyWithMediaGroup([
                    {
                        type: 'photo',
                        media: {
                            source: imgData,
                        },
                        caption: config.botUsername,
                    },
                    ...((config.sendVideo ?? true) ? [{
                        type: 'video',
                        media: {
                            source: videoData,
                        },
                    } as const] : []),
                ], {
                    reply_to_message_id: replyMessageId,
                });

                mediaSuccessfullySent = true;
                break;
            } catch (e) {
                const msg = (e as Error).toString();
                console.error('Unable to send media for ' + userId, msg);

                if (msg.includes('replied message not found')) {
                    throw new Error('Photo has been deleted');
                }

                if (msg.includes('was blocked by the user')) {
                    break;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (!mediaSuccessfullySent) {
            throw new Error('Unable to send media, please try again');
        }

        console.log('Files sent to ' + userId);

        if (config.byeMessage) {
            try {
                await ctx.reply(config.byeMessage, {
                    disable_web_page_preview: true,
                    parse_mode: 'MarkdownV2',
                });
            } catch (e) {
                console.error('Unable to send byeMessage for ' + userId, (e as Error).toString());
            }
        }
    } catch (e) {
        console.log('Error has occurred for ' + userId);
        console.error(e);

        for (let retry = 0; retry < 100; retry++) {
            try {
                await ctx.reply('Some nasty error has occurred, please try again\n\n' + (e as Error).toString());
                break;
            } catch (e) {
                const msg = (e as Error).toString();
                console.error('Unable to send error message for ' + userId, msg);

                if (msg.includes('was blocked by the user')) {
                    break;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    const currentSessionIndex = userSessions.findIndex((session) => session.userId === userId);
    userSessions.splice(currentSessionIndex, 1);
    console.log('Sessions length decreased: ' + userSessions.length);
    if (shuttingDown) {
        tryToShutDown();
    }
};

const addUserSession = async (ctx: Context, userId: number, photoId: string, replyMessageId: number) => {
    const currentSession = (userSessions.find((session) => session.userId === userId));
    if (currentSession) {
        await ctx.reply('You are already in the queue, please wait', {
            reply_to_message_id: replyMessageId,
        });
        return;
    }

    const session = {
        ctx,
        userId,
        photoId,
        replyMessageId,
    };
    userSessions.push(session);
    console.log('Sessions length increased: ' + userSessions.length);

    await processUserSession(session);
};

let bot: Telegraf;

const startBot = () => {
    bot = new Telegraf(config.botToken);

    const throttler = telegrafThrottler();
    bot.use(throttler);

    bot.start((ctx) => {
        ctx.reply(config.helloMessage, {
            disable_web_page_preview: true,
            parse_mode: 'MarkdownV2',
        })
            .catch((e) => {
                console.error('Unable to send helloMessage for ' + ctx.update.message.from.id, (e as Error).toString());
            });
    });

    bot.on('photo', (ctx) => {
        const userId = ctx.update.message.from.id;
        console.log('Received photo from ' + userId);

        const photoId = [...ctx.update.message.photo].pop()?.file_id || '';
        addUserSession(ctx, userId, photoId, ctx.update.message.message_id).catch(e => e);
    });

    bot.catch((e) => {
        console.error('Bot error has occurred ', e);
    });

    bot.launch();
};

const stopBot = () => {
    try {
        bot?.stop();
    } catch (e) {
        //
    }
};

let shuttingDown = false;

let tryToShutDown: () => void;

if (cluster.isPrimary) {
    let hasWorker = false;

    tryToShutDown = (): void => {
        shuttingDown = true;
        if (!hasWorker) {
            process.exit();
        }
    };

    const addWorker = (): void => {
        if (!shuttingDown) {
            const worker = cluster.fork();
            console.log(`Worker #${worker.process.pid} started`);
            hasWorker = true;
        }
    };
    addWorker();

    cluster.on('exit', (worker, code, signal) => {
        hasWorker = false;

        console.warn(`Worker #${worker.process.pid} is dead`, 'code:', code, 'signal:', signal);

        if (shuttingDown) {
            tryToShutDown();
        } else {
            setTimeout(() => {
                addWorker();
            }, 100);
        }
    });
} else {
    startBot();

    tryToShutDown = () => {
        if (!shuttingDown) {
            stopBot();
        }
        shuttingDown = true;

        if (!userSessions.length) {
            process.exit();
        }
    };
}

process.on('SIGINT', () => tryToShutDown());
process.on('SIGTERM', () => tryToShutDown());

process.on('unhandledRejection', (promise, reason) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    tryToShutDown();
});
process.on('uncaughtException', (err, origin) => {
    console.error('Uncaught Exception:', err, 'origin:', origin);
    tryToShutDown();
});
