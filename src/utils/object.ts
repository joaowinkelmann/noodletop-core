import { State, rooms } from "./state.js"
import { broadcastMessage } from "./message.js"

export type RoomObject = {
	id: string
	// Add other properties as needed
}

export const objects = new Map<string, RoomObject[]>()

export function createObject(state: State): RoomObject {
	const roomObjects = objects.get(state.roomCode) || []

	const newObject: RoomObject = {
		id: getObjectId(),
		// Add other properties as needed
	}
	roomObjects.push(newObject)
	objects.set(state.roomCode, roomObjects)
	broadcastMessage(`Object created: ${newObject.id}`, state)
	return newObject
}

export function updateObject(state: State, objectId: string, updatedFields: Partial<RoomObject>): RoomObject {
	const roomObjects = objects.get(state.roomCode) || []
	const objectIndex = roomObjects.findIndex(obj => obj.id === objectId)
	if (objectIndex === -1) {
		throw new Error('Object not found')
	}
	const updatedObject = { ...roomObjects[objectIndex], ...updatedFields }
	roomObjects[objectIndex] = updatedObject
	objects.set(state.roomCode, roomObjects)
	broadcastMessage(`Object updated: ${updatedObject.id}`, state)
	return updatedObject
}

export function deleteObject(state: State, objectId: string): void {
	const roomObjects = objects.get(state.roomCode) || []
	const objectIndex = roomObjects.findIndex(obj => obj.id === objectId)
	if (objectIndex === -1) {
		throw new Error('Object not found')
	}
	roomObjects.splice(objectIndex, 1)
	objects.set(state.roomCode, roomObjects)
	broadcastMessage(`Object deleted: ${objectId}`, state)
}

/**
 * Get a unique object id when a new object is created
 */
function getObjectId(): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let objectId = '';
	for (let i = 0; i < 8; i++) {
			objectId += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	// check if the id is already in use
	if (objects.get(objectId)) {
			return getObjectId();
	}

	return objectId;
}