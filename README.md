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

# Mode and proxies
In some countries the AI doesn't work at all so if it is your case you have to use some proxy.

In China it works even another way and lets you generate videos and single images that have better quality than combined ones.

For the Chinese way you have to set `mode` in your config to `'CHINA'`, otherwise it must be `'WORLD'`

For `mode: 'CHINA'` you obviously need Chinese proxy if you don't live there. So in that case:
- Your proxy must be exactly Chinese, but not from Taiwan or Hong Kong, try Beijing for example.
- Seems like it's impossible to find FREE alive proxies. Don't waste your time searching and just buy it somewhere.

## IMPORTANT
Since v3.5.0 there's a new special mode `'NO_LIMITS'` which allows to use the bot **WITHOUT PROXIES AND RATE LIMITS AT ALL**.
Obviously this tiny cheat is gonna be banned soon, so just use it as long as it works. It will be removed when it's dead.
Thanks to @nevzra for sharing this hack.

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
