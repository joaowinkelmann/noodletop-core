// @bun
// src/utils/randomizer.ts
import crypto from "crypto";

class Rand {
  static int(min = 0, max) {
    return crypto.getRandomValues(new Uint32Array(1))[0] % (max - min) + min;
  }
  static roll(diceNotation, showRolls) {
    if (!/^(\d*d\d+)([-+]\d+)*$/.test(diceNotation)) {
      return "Invalid dice notation";
    }
    const matches = diceNotation.match(/(\d*)d(\d+)([-+]\d+)*/);
    const numDice = parseInt(matches[1]) || 1;
    const diceSides = parseInt(matches[2]);
    const modifiers = matches[0].match(/[-+]\d+/g) || [];
    const rolls = [];
    let total = 0;
    for (let i = 0;i < numDice; i++) {
      const roll = this.int(1, diceSides + 1);
      rolls.push(roll);
      total += roll;
    }
    modifiers.forEach((modifier) => {
      const modifierSign = modifier[0];
      const modifierValue = parseInt(modifier.slice(1));
      if (modifierSign === "+") {
        total += modifierValue;
      } else if (modifierSign === "-") {
        total -= Math.abs(modifierValue);
      }
    });
    if (showRolls) {
      return `${total} (${rolls.join(", ")})${modifiers.join("")}`;
    } else {
      return total;
    }
  }
  static id(len = 8) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0;i < len; i++) {
      result += characters.charAt(this.int(0, charactersLength));
    }
    return result;
  }
}

// src/objects/user.ts
class User {
  socket;
  username;
  id = Rand.id();
  constructor(socket, username) {
    this.socket = socket;
    this.username = username;
  }
  changeUsername(newUsername) {
    let currentUsername = this.username;
    this.username = newUsername;
    return `Username changed from ${currentUsername} to ${newUsername}`;
  }
}

// src/utils/state.ts
var newState = (socket) => ({
  status: "ROOM",
  roomCode: null,
  user: new User(socket, "")
});
var rooms = new Map;

// src/utils/log.ts
function ask(socket, item, error) {
  if (error) {
    socket.send(`${green}Minimum length is 3 characters ${blue}>${reset}`);
  }
  socket.send(`${green}Enter ${item} ${blue}>${reset}`);
}
var blue = ">";
var green = ">>";
var reset = "";
var info = (roomCode, room) => `${green}Connected to room ${blue}${roomCode}${green} with ${playerCount(room.getUsers().size)} ${blue}>${reset}`;
var logState = () => console.table(Object.fromEntries([...rooms.entries()].map(([code, room]) => [
  code,
  room.getUsers().size
])));
var playerCount = (count) => `${blue}${count > 0 ? count : "no"}${green} user${count !== 1 ? "s" : ""}`;

// src/objects/object.ts
class ObjectManager {
  objects;
  constructor() {
    this.objects = new Map;
  }
  create(properties) {
    const id = this.uniqId();
    const object = {
      id,
      props: null
    };
    if (properties) {
      object.props = properties;
    }
    this.objects.set(id, object);
    return JSON.stringify(object);
  }
  get(id) {
    return JSON.stringify(this.objects.get(id));
  }
  getAll() {
    return JSON.stringify(Array.from(this.objects.values()));
  }
  update(id, properties) {
    const object = this.objects.get(id);
    if (object) {
      object.props = { ...object.props, ...properties };
      this.objects.set(id, object);
      return JSON.stringify(object);
    } else {
      throw new Error("Object not found");
    }
  }
  delete(id) {
    return this.objects.delete(id);
  }
  uniqId() {
    let id = Rand.id(8);
    while (this.objects.has(id)) {
      id = Rand.id(8);
    }
    return id;
  }
}

// src/objects/room.ts
class Room {
  users;
  roomCode;
  capacity;
  isPublic;
  objects = new ObjectManager;
  constructor(roomCode, isPublic = true, capacity = undefined) {
    this.roomCode = roomCode;
    this.users = new Set;
    this.isPublic = isPublic;
    this.capacity = capacity;
  }
  addUser(user2) {
    this.users.add(user2);
  }
  removeUser(user2) {
    this.users.delete(user2);
  }
  getUsers() {
    return this.users;
  }
  getRoomCode() {
    return this.roomCode;
  }
  createObj(properties) {
    return this.objects.create(properties);
  }
  getObj(id) {
    return this.objects.get(id);
  }
  getAllObj() {
    return this.objects.getAll();
  }
  updateObj(id, properties) {
    return this.objects.update(id, properties);
  }
  deleteObj(id) {
    return this.objects.delete(id);
  }
}

// src/utils/message.ts
function leaveRoom(state3) {
  if (!state3) {
    throw new Error("State is undefined");
  }
  const { roomCode, user: user2 } = state3;
  const room2 = rooms.get(roomCode);
  if (!room2)
    return;
  if (user2.socket.readyState === WebSocket.OPEN) {
    state3.roomCode = null;
    state3.status = "ROOM";
    ask(user2.socket, "Room Code");
  }
  room2.removeUser(user2);
  if (room2.getUsers().size === 0)
    rooms.delete(roomCode);
  else
    room2.getUsers().forEach(({ socket }) => socket.send(`${blue}${user2.username} ${green}left the room${blue}>${reset}`));
  logState();
}
function chooseRoom(message, state3) {
  state3.roomCode = message.trim().toUpperCase();
  if (state3.roomCode.length < 3)
    return ask(state3.user.socket, "Room Code", true);
  state3.status = "NICKNAME";
  ask(state3.user.socket, "your Nickname");
}
function chooseNickname(message, state3) {
  const { roomCode, user: user2 } = state3;
  const username = message.trim();
  if (username.length < 3)
    return ask(user2.socket, "your Nickname", true);
  user2.changeUsername(username);
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, new Room(roomCode));
  }
  const room2 = rooms.get(roomCode);
  room2.addUser(user2);
  room2.getUsers().forEach(({ socket }) => {
    if (socket !== user2.socket) {
      socket.send(`${blue}${user2.username}${green} joined the room ${blue}>${reset}`);
    } else {
      socket.send(info(roomCode, room2));
    }
  });
  state3.status = "CONNECTED";
  logState();
}
function broadcastMessage(message, state3) {
  if (message.startsWith("/") && message.length > 1) {
    const command = message.split(" ")[0];
    const commandArgs = message.slice(command.length + 1);
    if (commands.hasOwnProperty(command)) {
      commands[command].command(state3, commandArgs);
      return;
    }
  }
  rooms.get(state3.roomCode).getUsers().forEach(({ socket }) => {
    socket.send(`${blue}${state3.user.username} >${reset} ${message}`);
  });
}
var isJSON = function(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
var commands = {
  "/help": {
    desc: "Command list",
    command({ user: user2 }) {
      user2.socket.send(`${green}Available commands: \r\n\t${blue}${Object.entries(commands).map(([k, v]) => [k, v.desc].join(` ${green}\t`)).join(`\r\n\t${blue}`)} \r\n${blue}>`);
    }
  },
  "/info": {
    desc: "Room information",
    command({ roomCode, user: user2 }) {
      user2.socket.send(info(roomCode, rooms.get(roomCode)));
    }
  },
  "/list": {
    desc: "Room user list",
    command({ roomCode, user: user2 }) {
      const room2 = rooms.get(roomCode);
      user2.socket.send(`${playerCount(room2.getUsers().size)}: ${blue}${[
        ...room2.getUsers()
      ].map((user3) => user3.username).join(`${green}, ${blue}`)} >`);
    }
  },
  "/quit": {
    desc: "Leave the room",
    command(state3) {
      leaveRoom(state3);
    }
  },
  "/broadcast": {
    desc: "Send a message to all connected sockets",
    command(state3, message) {
      rooms.forEach((room2) => {
        room2.getUsers().forEach(({ socket }) => {
          socket.send(`${blue}${state3.user.username} >${reset} ${message}`);
        });
      });
    }
  },
  "/obj": {
    desc: 'Perform operations with objects. Usage: /obj [read|create|update|delete] [id] [{"property": "value"}]',
    command(state3, operation) {
      const room2 = rooms.get(state3.roomCode);
      if (!room2)
        return;
      let response = null;
      const [op, ...args] = operation.split(" ");
      switch (op) {
        case "read":
          response = room2.getObj(args[0]);
          break;
        case "readall":
          response = room2.getAllObj();
          break;
        case "update":
          let id = args.shift();
          let properties = null;
          if (isJSON(args.join(" ")) === false) {
            response = "Invalid JSON properties";
            break;
          } else {
            properties = JSON.parse(args.join(" "));
          }
          console.log(args.join(" "));
          console.log("properties", properties);
          response = room2.updateObj(id, properties);
          break;
        case "delete":
          response = room2.deleteObj(args[0]);
          break;
        case "create":
        default:
          response = room2.createObj();
          break;
      }
      room2.getUsers().forEach(({ socket }) => {
        socket.send(`${blue}${state3.user.username} >${reset} ${response}`);
      });
    }
  },
  "/roll": {
    desc: "Roll dice. Usage: /roll [dice notation (2d6+3)] [show rolls (true|false)]",
    command(state3, operation) {
      let diceNotation = operation.split(" ")[0];
      let showRolls = operation.split(" ")[1] === "false" ? false : true;
      let result = Rand.roll(diceNotation, showRolls);
      state3.user.socket.send(`${blue}${state3.user.username} >${reset} ${result}`);
    }
  },
  "/usr": {
    desc: "Perform operations with your own user. Usage: /usr [changeUsername] [newUsername]",
    command(state3, operation) {
      const room2 = rooms.get(state3.roomCode);
      if (!room2)
        return;
      let response = null;
      const [op, ...args] = operation.split(" ");
      switch (op) {
        case "changeUsername":
          response = state3.user.changeUsername(args[0]);
          break;
        default:
          response = "Invalid operation";
          break;
      }
      room2.getUsers().forEach(({ socket }) => {
        socket.send(`${blue}${state3.user.username} >${reset} ${response}`);
      });
    }
  }
};

// src/index.ts
import {WebSocketServer} from "ws";
var wss = new WebSocketServer({ port: Number(process.env.PORT || 34567) });
var stateMap = new Map;
var lastPingMap = new Map;
Bun.serve({
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response;
  },
  websocket: {
    open(ws) {
      const state4 = newState(ws);
      stateMap.set(ws, state4);
      ws.send("Enter a room code");
      lastPingMap.set(ws, Date.now());
    },
    message(ws, message2) {
      const state4 = stateMap.get(ws);
      const messageString = message2.toString();
      switch (state4.status) {
        case "ROOM":
          return chooseRoom(messageString, state4);
        case "NICKNAME":
          return chooseNickname(messageString, state4);
        default:
          return broadcastMessage(messageString, state4);
      }
    },
    ping(ws, data) {
      lastPingMap.set(ws, Date.now());
    },
    close(ws, code, message2) {
      let state4 = stateMap.get(ws);
      leaveRoom(state4);
      stateMap.delete(ws);
      lastPingMap.delete(ws);
    },
    drain(ws) {
    }
  },
  port: Number(process.env.PORT || 3000)
});
