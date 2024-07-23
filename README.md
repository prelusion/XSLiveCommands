
<div align="center">
<br>
<img src="./mkdocs/docs/imgs/xslc_logo_wide.png" alt="XSLC logo">
<br>
<br>
</div>

---

## Overview

This application allows running triggers/XS functions in live AoE2:DE custom map (RMS/CS) games, on request, externally. Think of it something like [Choice Chamber](https://store.steampowered.com/app/359960/Choice_Chamber/) or T90's overlords, but without the overlord needing to be in the game itself!

> Note: This application is not a hack, a special map (Custom Scenario or RMS) needs to be made in order to use this application

You can head over to the [XSLC website](https://prelusion.github.io/XSLiveCommands) to find out more about the application and how to use it!

## Development

Clone the repository

### Client

1. `cd` into `./Client`
2. Install npm packages with `npm i .`
3. Copy the `./env/.env.example` file to `./env/.env`
4. Run `npm run dev` - this will run the client with hot reloading

### Server

1. `cd` into `./Server` 
2. Install npm packages with `npm i .`
3. Acquire a steam developer api key from [here](https://steamcommunity.com/dev/apikey)
4. Copy the `./.env.example` file to `./.env`
5. In the `./.env` file, fill in the value for the `STEAM_DEVELOPER_API_KEY=`. Note: do not add spaces around the `=` or it will not work.
6. Run `npm run dev` - this will run the client with hot reloading

## Building from Source

[//]: # (TODO:@MrKirby)