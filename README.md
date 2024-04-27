# Noodletop WebSocket

A WebSocket server for the Noodletop tabletop engine.

 Meant to be used alongside ([Noodletop Front-end](https://github.com/joaowinkelmann/noodletop-front))

### Documentation
See the full documentation over at https://t.ly/daGAP

### Testing

To test the WebSocket server, you can use wscat, as follows:
```npx wscat -c ws://localhost:3000```


### Debugging mode

Run ```bun run dev:debug``` to start the debugging server. Then, copy the generated debugging WebSocket from the terminal and attatch it to the ```.vscode/launch.json``` file.