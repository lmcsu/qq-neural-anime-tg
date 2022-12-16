import type { Context } from 'telegraf';

declare global {
    type Config = {
        mode?: 'CHINA' | 'WORLD';
        botToken: string;
        keepFiles: {
            compared: boolean;
            input: boolean;
            single: boolean;
            video: boolean;
        };
        messages: {
            blocked: string;
            bye: string;
            hello: string;
            media: string;
            received: string;
        };
        proxyUrl?:
            `socks5://${string}:${string}@${string}:${number}` |
            `socks5://${string}:${number}` |
            `http://${string}:${string}@${string}:${number}` |
            `http://${string}:${number}`;
        sendMedia: {
            compared: boolean;
            single: boolean;
            video: boolean;
        };
    };

    type UserSession = {
        ctx: Context;
        userId: number;
        photoId: string;
        replyMessageId: number;
    };
}
