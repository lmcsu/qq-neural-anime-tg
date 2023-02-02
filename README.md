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

Uhhm..

It's too hard to explain everything right now, **I'm going to update this text in minutes, just wait.**

# Notes
- Probably the whole thing is going to break soon anyway.
- Fork it and make your own version, because I don't think that I'm going to support it in the future.
- Contact me at Telegram: https://t.me/royvolkov

# Upgrading
Don't forget to always run `npm install`

### from 3.x to 4.x
- change your `'mode'` in `config.ts` to a new one

### from 2.x to 3.x
- `config.ts` file structure has been changed completely, update it according to the new `config.example.ts`

### from 1.x to 2.x
- support for `.env` files dropped, you have to move to the `config.ts` file
