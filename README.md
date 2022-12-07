# What is this
A Telegram bot for making anime-styled pictures and videos from your source.

It's a simple bridge between Telegram and https://h5.tu.qq.com/web/ai-2d/cartoon/index

Demo: https://t.me/qq_neural_anime_bot

![Example](example.jpg)

# Running your own bot
You need to have Node.js and NPM installed
- run `npm install`
- copy `config.example.ts` to `config.ts`
- put your bot's token from BotFather into `config.ts`
- run `npm start`

# Upgraging
- don't forget to run `npm install`

### from 1.x to 2.x
- support for `.env` files dropped, you have to move to the `config.ts` file

# Notes
- You need to have some good Chinese proxies to make it work. Puth them into your `config.ts`
- Probably the whole thing is going to break soon anyway
- Fork it and make your own version, because I don't think that I'm going to support it in the future
- If you want to keep image files, set `keepFiles: true` in your `config.ts` file
- Contact me at Telegram: https://t.me/royvolkov
