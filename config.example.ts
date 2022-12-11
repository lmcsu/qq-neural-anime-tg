const config: Config = {
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
        media: '@qq_neural_anime_bot',
        received: 'Photo has been received, please wait',
    },
    proxyUrl: 'socks5://user:password@11.22.33.44:1234',
    sendMedia: {
        compared: true,
        single: true,
        video: true,
    },
};

export default config;
