type UserSession = {
    ctx: Context;
    userId: number;
    photoId: string;
    replyMessageId: number;
};

import { Telegraf, Context } from 'telegraf';
import { telegrafThrottler } from 'telegraf-throttler';
import dotenv from 'dotenv';
import { v4 as v4uuid } from 'uuid';
import axios, { type AxiosError } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

dotenv.config();
const KEEP_FILES = !!(+(process.env.KEEP_FILES ?? '1') || 0); // "true" by default

const qqRequest = async (imgData: string) => {
    const uuid = v4uuid();

    let response;
    let data;
    for (let retry = 0; retry < 100; retry++) {
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
            throw new Error('Couldn\'t pass the censorship. Try another photo.');
        }

        if (data?.msg === 'VOLUMN_LIMIT') {
            retry--;
            console.log('QQ rate limit caught');
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        if (data?.code === 1001) {
            throw new Error('No face in image');
        }

        if (data?.extra) {
            break;
        }
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
}

const processUserSession = async ({ ctx, userId, photoId, replyMessageId }: UserSession) => {
    try {
        const url = await ctx.telegram.getFileLink(photoId);

        let response;
        for (let retry = 0; retry < 100; retry++) {
            try {
                response = await axios.request({
                    url: url.href,
                    timeout: 10000,
                    responseType: 'arraybuffer',
                });
            } catch (e) {}

            if (response?.data) {
                break;
            }
        }

        if (!response) {
            console.log('Couldn\'t load the photo from ' + userId);
            throw new Error('Couldn\'t load the photo, please try again');
        }

        if (KEEP_FILES) {
            fs.writeFile(
                path.join(__dirname, 'files', (new Date()).getTime() + '_' + userId + '_input.jpg'),
                response.data,
            );
        }

        await ctx.reply('Photo has been received, please wait', {
            reply_to_message_id: replyMessageId,
        });

        console.log('Uploading to QQ for ' + userId);
        const urls = await qqRequest(response.data.toString('base64'));
        console.log('QQ responded successfully for ' + userId);

        console.log('Downloading from QQ for ' + userId);
        const [videoData, imgData] = await Promise.all([
            qqDownload(urls.video),
            qqDownload(urls.img)
                .then((data) => cropImage(data)),
        ]);

        if (KEEP_FILES) {
            fs.writeFile(
                path.join(__dirname, 'files', (new Date()).getTime() + '_' + userId + '_output_img.jpg'),
                imgData,
            );
        }

        await ctx.replyWithMediaGroup([
            {
                type: 'photo',
                media: {
                    source: imgData,
                },
                caption: 'Done.\nPlease, rate and fork me on Github ♥️ https://github.com/lmcsu/qq-neural-anime-tg',
            },
            {
                type: 'video',
                media: {
                    source: videoData,
                },
            },
        ], {
            reply_to_message_id: replyMessageId,
        });
        console.log('Files sent to ' + userId);
    } catch (e) {
        ctx.reply('Some nasty error has occurred\n\n' + (e as Error).toString()).catch(e => e);
        console.log('Error has occurred for ' + userId);
        console.error(e);
    }

    const currentSessionIndex = userSessions.findIndex((session) => session.userId === userId);
    userSessions.splice(currentSessionIndex, 1);
    console.log('Sessions length decreased: ' + userSessions.length);
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

const bot = new Telegraf(process.env.BOT_TOKEN || '');
const throttler = telegrafThrottler();
bot.use(throttler);

bot.start((ctx) => ctx.reply('Send me the picture you want to convert').catch((e) => e));

bot.on('photo', (ctx) => {
    const userId = ctx.update.message.from.id;
    console.log('Received photo from ' + userId);

    const photoId = [...ctx.update.message.photo].pop()?.file_id || '';
    addUserSession(ctx, userId, photoId, ctx.update.message.message_id).catch(e => e);
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

    bot.stop(reason);
};

process.once('unhandledRejection', () => shutDown('unhandledRejection'));
process.once('uncaughtException', () => shutDown('uncaughtException'));
process.once('SIGINT', () => shutDown('SIGINT'));
process.once('SIGTERM', () => shutDown('SIGTERM'));
