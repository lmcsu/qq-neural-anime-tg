type UserSession = {
    userId: number;
    ctx: Context;
    photoId: string;
};

import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { v4 as v4uuid } from 'uuid';
import axios, { type AxiosError } from 'axios';
import fs from 'fs/promises';

dotenv.config();

const qqQueue: Array<{
    uuid: string;
}> = [];

const qqRequest = async (imgData: string) => {
    const uuid = v4uuid();

    qqQueue.push({
        uuid,
    });

    await new Promise<void>((resolve) => {
        const checkIndex = () => {
            const index = qqQueue.findIndex((item) => item.uuid === uuid);
            if (index === 0) {
                setTimeout(resolve, 1000);
            } else {
                setTimeout(checkIndex, 100);
            }
        };
        checkIndex();
    });

    let response;
    let data;
    for (let retry = 0; retry < 10; retry++) {
        try {
            response = await axios.request({
                method: 'POST',
                url: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
                data: {
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
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
        } catch (e) {
            response = (e as AxiosError).response;
        }

        data = response?.data as Record<string, unknown> | undefined;

        if (data?.msg === 'IMG_ILLEGAL') {
            qqQueue.shift();
            throw new Error('Couldn\'t pass the censorship. Try another photo.');
        }

        if (data?.msg === 'VOLUMN_LIMIT') {
            retry--;
            console.log('QQ rate limit caught');
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        if (data?.extra) {
            break;
        }
    }

    qqQueue.shift();
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

const qqDownload = async (url: string): Promise<NodeJS.ArrayBufferView> => {
    let response;
    for (let retry = 0; retry < 10; retry++) {
        try {
            response = await axios.request({
                url,
                timeout: 10000,
                responseType: 'arraybuffer',
            });
        } catch (e) {
            response = (e as AxiosError).response;
            console.error('QQ file download error caught: ' + (e as AxiosError).toString());
        }

        if (response?.data) {
            break;
        }
    }

    return response?.data;
};

const userSessions: Array<UserSession> = [];

const processUserSession = async ({ userId, photoId, ctx }: UserSession) => {
    try {
        const url = await ctx.telegram.getFileLink(photoId);

        const response = await axios.request({
            url: url.href,
            responseType: 'arraybuffer',
        });

        const fn = __dirname + '/files/' + (new Date()).getTime() + '_' + userId + '_input.jpg';
        fs.writeFile(fn, response.data);

        console.log('Uploading to QQ for ' + userId);
        await ctx.reply('Photo has been received, uploading to QQ');
        const urls = await qqRequest(response.data.toString('base64'));
        console.log('QQ responded successfully for ' + userId);

        await ctx.reply('Downloading the result from QQ');
        console.log('Downloading from QQ for ' + userId);
        const [videoData, imgData] = await Promise.all([
            qqDownload(urls.video),
            qqDownload(urls.img),
        ]);

        const time = (new Date()).getTime();
        const videoFn = __dirname + '/files/' + time + '_' + userId + '_output_video.mp4';
        const imgFn = __dirname + '/files/' + time + '_' + userId + '_output_img.jpg';
        await Promise.all([
            fs.writeFile(videoFn, videoData),
            fs.writeFile(imgFn, imgData),
        ]);

        await Promise.all([
            ctx.reply('Uploading to Telegram'),
            ctx.replyWithPhoto({
                source: imgFn,
            }),
            ctx.replyWithVideo({
                source: videoFn,
            }),
        ]);
        console.log('Files sent to ' + userId);

        await ctx.reply('Done');
    } catch (e) {
        ctx.reply('Some nasty error has occurred\n\n' + (e as Error).toString()).catch(e => e);
        console.log('Error has occurred for ' + userId);
        console.error(e);
    }

    const currentSessionIndex = userSessions.findIndex((session) => session.userId === userId);
    userSessions.splice(currentSessionIndex, 1);
    console.log('Sessions length decreased: ' + userSessions.length);
};

const addUserSession = async (userId: number, photoId: string, ctx: Context) => {
    const currentSession = (userSessions.find((session) => session.userId === userId));
    if (currentSession) {
        await ctx.reply('You are already in the queue, please wait');
        return;
    }

    const session = {
        userId,
        photoId,
        ctx,
    };
    userSessions.push(session);
    console.log('Sessions length increased: ' + userSessions.length);

    await processUserSession(session);
};

const bot = new Telegraf(process.env.BOT_TOKEN || '');

bot.start((ctx) => ctx.reply('Send me the picture you want to convert').catch((e) => e));

bot.on('photo', (ctx) => {
    const userId = ctx.update.message.from.id;
    console.log('Received photo from ' + userId);

    const photoId = [...ctx.update.message.photo].pop()?.file_id || '';
    addUserSession(userId, photoId, ctx).catch(e => e);
});

bot.catch((e) => {
    console.error('Bot error has occurred ', e);
})

bot.launch();

let shuttingDown = false;
const shutDown = async (reason: string) => {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;

    await Promise.all(userSessions.map((session) => {
        return session.ctx.reply('Oops, the bot goes down, please retry a bit later').catch((e) => e);
    }));

    bot.stop(reason);
};

process.once('unhandledRejection', () => shutDown('unhandledRejection'));
process.once('uncaughtException', () => shutDown('uncaughtException'));
process.once('SIGINT', () => shutDown('SIGINT'));
process.once('SIGTERM', () => shutDown('SIGTERM'));
