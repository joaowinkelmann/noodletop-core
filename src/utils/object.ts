import { State, rooms } from "./state.js"
import { broadcastMessage } from "./message.js"

export type RoomObject = {
  id: string
  // Add other properties as needed
}

export class RoomObjects {
  private objects: Map<string, RoomObject[]>

  constructor() {
    this.objects = new Map<string, RoomObject[]>()
  }

  createObject(state: State, object: Partial<RoomObject>): RoomObject {
    const roomObjects = this.objects.get(state.roomCode) || []
    const newObject: RoomObject = {
      id: this.uniqId(),
      ...object
    }
    roomObjects.push(newObject)
    this.objects.set(state.roomCode, roomObjects)
    broadcastMessage(`Object created: ${newObject.id}`, state)
    return newObject
  }

  getObject(state: State, objectId: string): RoomObject {
    const roomObjects = this.objects.get(state.roomCode) || []
    const object = roomObjects.find(obj => obj.id === objectId)
    if (!object) {
      throw new Error('Object not found');
    }
    return object;
  }

  updateObject(state: State, objectId: string, updatedFields: Partial<RoomObject>): RoomObject {
    const roomObjects = this.objects.get(state.roomCode) || []
    const objectIndex = roomObjects.findIndex(obj => obj.id === objectId)
    if (objectIndex === -1) {
      throw new Error('Object not found')
    }
    const updatedObject = { ...roomObjects[objectIndex], ...updatedFields }
    roomObjects[objectIndex] = updatedObject
    this.objects.set(state.roomCode, roomObjects)
    broadcastMessage(`Object updated: ${updatedObject.id}`, state)
    return updatedObject
  }

  deleteObject(state: State, objectId: string): void {
    const roomObjects = this.objects.get(state.roomCode) || []
    const objectIndex = roomObjects.findIndex(obj => obj.id === objectId)
    if (objectIndex === -1) {
      throw new Error('Object not found')
    }
    roomObjects.splice(objectIndex, 1)
    this.objects.set(state.roomCode, roomObjects)
    broadcastMessage(`Object deleted: ${objectId}`, state)
  }

  // returns a random 8 character alphanumeric string
  private uniqId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    do {
      for (let i = 8; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    } while (this.objects.get(result))

    return result
  }

}