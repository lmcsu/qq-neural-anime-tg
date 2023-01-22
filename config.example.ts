const config: Config = {
    mode: 'NO_LIMITS', // 'CHINA' | 'WORLD' | 'NO_LIMITS'
    botToken: 'put_your_token_here',
    keepFiles: {
        compared: true,
        input: true,
        single: true,
        video: true,
    },
    messages: {
        blocked: 'The Chinese website has blocked the bot, too bad 🤷‍♂️',
        bye:
            'Thank you for using this bot 👍\n' +
            'Please rate and fork it on [Github](https://github.com/lmcsu/qq-neural-anime-tg) ♥️',
        hello: 'Hi 👋 Send me a photo to convert it into a 2D anime art',
        media: '@qq\\_neural\\_anime\\_bot',
        received: 'Photo has been received, please wait',
    },
    sendMedia: {
        compared: true,
        single: true, // doesn't work with mode=WORLD
        video: true, // doesn't work with mode=WORLD
    },
    // proxyUrl: 'socks5://user:password@11.22.33.44:1234',
};

export default config;
