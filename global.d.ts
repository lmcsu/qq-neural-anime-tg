import type { Context } from 'telegraf';

declare global {
    type Config = {
        botToken: string;
        botUsername: `@${string}`;
        helloMessage: string;
        keepFiles: boolean;
    };

    type UserSession = {
        ctx: Context;
        userId: number;
        photoId: string;
        replyMessageId: number;
    };
}
