# Noodletop Core

Core server and manager for Noodletop.

Meant to be used alongside [Noodletop Native](https://github.com/joaowinkelmann/noodletop-native)

### Documentation

Default application server port is ```3000```.

Please refer to the ```.env.template``` file for the environment variables that can be set under the ```.env``` file.

See the full documentation over at [Noodletop Core Docs](https://winkels7.notion.site/Noodletop-Core-Docs-a6f02baf48e54c9a906d45eae8378c83?pvs=74)

### Requirements

- [Bun](https://bun.sh/)
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/)

### Running the application

After cloning the repository, run ```bun install``` from within it to install the dependencies.

Run ```bun run start``` to run the app with the Bun runtime.

Run ```bun run build``` to build the application. Start the compiled binary by issuing ```bun run start-comp```, or simply ```./dist/core```.

For active development, run ```bun run dev``` to start the application in development mode with hot reloading.

<!-- ### Testing - @todo Add testing instructions here -->

### Connecting to the WebSocket server

To connect the WebSocket server locally, you can use wscat, as follows:

```npx wscat -c ws://localhost:3000/ws/```

Check the console output for the available WebSocket commands.

### Making requests to the REST API

Requests to the REST API can be made using cURL, here's an example:

```curl http://localhost:3000/api/room/export/123```

See the output in the console to visualize the currently available routes.

### Debugging mode

Run ```bun run dev:debug``` to start the debugging server. Then, copy the generated debugging WebSocket from the terminal and attatch it to the ```.vscode/launch.json``` file.
