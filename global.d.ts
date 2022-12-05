import type { Context } from 'telegraf';

declare global {
    type Config = {
        botToken: string;
        keepFiles: boolean;
    };

    type UserSession = {
        ctx: Context;
        userId: number;
        photoId: string;
        replyMessageId: number;
    };
}
