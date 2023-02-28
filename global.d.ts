export {};

declare global {
    type Config = {
        mode: 'AI_PAINTING_SPRING' | 'DIFFERENT_DIMENSION_ME' | 'AI_PAINTING_ANIME' | 'AIGCSDK_AI_PAINTING_ANIME';
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
        parallelRequests: number;
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
}
