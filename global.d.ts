import type { Context } from 'telegraf';

declare global {
    type UserSession = {
        ctx: Context;
        userId: number;
        photoId: string;
        replyMessageId: number;
    };
}
