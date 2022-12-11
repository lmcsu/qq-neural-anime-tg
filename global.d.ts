import type { Context } from 'telegraf';

declare global {
    type Config = {
        botToken: string;
        botUsername: `@${string}`;
        blockedMessage?: string;
        byeMessage?: string;
        helloMessage: string;
        receivedMessage?: string;
        keepFiles: boolean;
        sendComparedImg?: boolean;
        sendSingleImg?: boolean;
        sendVideo?: boolean;
        httpsProxy?: string;
        socksProxy?: string;
    };

    type UserSession = {
        ctx: Context;
        userId: number;
        photoId: string;
        replyMessageId: number;
    };
}
