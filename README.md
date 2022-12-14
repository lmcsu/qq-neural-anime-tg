# What is this
A Telegram bot for making anime-styled pictures and videos from your source.

It's a simple bridge between Telegram and https://h5.tu.qq.com/web/ai-2d/cartoon/index

Demo: https://t.me/qq_neural_anime_bot

![Example](example.jpg)

# Running your own bot
You need to have Node.js and NPM installed.

Create your bot with https://t.me/BotFather and obtain its token.

Clone this repo and:

- run `npm install`
- copy `config.example.ts` to `config.ts`
- put your bot's token from BotFather into `config.ts`
- run `npm start`

# What the hell is with proxies?
From December 6 to December 15 the AI had been available only in China or with Chinese proxies.

Since December 15 the AI works ~~for the rest of the world~~ (UPD: still doesn't work in some countries) again so using proxies is not needed anymore, but it's limited and allows you to generate only one type of media.

If you want to generate videos and single images you still have to find Chinese proxies somewhere.

- Your proxy must be exactly Chinese, but not from Taiwan or Hong Kong, try Beijing for example.
- Seems like it's impossible to find FREE alive proxies. Don't waste your time searching and just buy it somewhere.

# Notes
- Probably the whole thing is going to break soon anyway.
- Fork it and make your own version, because I don't think that I'm going to support it in the future.
- Contact me at Telegram: https://t.me/royvolkov

# Upgrading
Don't forget to always run `npm install`

### from 2.x to 3.x
- `config.ts` file structure has been changed completely, update it according to the new `config.example.ts`

### from 1.x to 2.x
- support for `.env` files dropped, you have to move to the `config.ts` file
