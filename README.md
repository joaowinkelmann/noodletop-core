# Noodletop Core

Core server and manager for the Noodletop engine.

Meant to be used alongside [Noodletop Client](https://github.com/joaowinkelmann/noodletop-client)

### Documentation

Default WebSocket server port is ```3000```.

Default RESTful server port is ```3001```.

Please refer to the ```.env.template``` file for the environment variables that can be set under the ```.env``` file.

See the full documentation over at [Noodletop Core Docs](https://winkels7.notion.site/Noodletop-Core-Docs-a6f02baf48e54c9a906d45eae8378c83?pvs=74)

### Requirements

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/)

### Running the application

After cloning the repository, run ```bun install``` from within it to install the dependencies.

Then, run ```bun run dev``` to start the application in development mode.

Run ```bun run build``` to build the application. Start the built application with ```bun run start```.

<!-- ### Testing - @todo Add testing instructions here -->

### Connecting to the WebSocket server

To connect the WebSocket server locally, you can use wscat, as follows:
```npx wscat -c localhost:3000```

### Debugging mode

Run ```bun run dev:debug``` to start the debugging server. Then, copy the generated debugging WebSocket from the terminal and attatch it to the ```.vscode/launch.json``` file.