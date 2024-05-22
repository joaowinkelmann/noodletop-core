import { Rand } from '../utils/randomizer';

export type rObject = {
    id: string;
    props: { [key: string]: any } | null;
    owner?: string;
};

// Class instanced by a Room to manage objects within that room.
export class ObjectManager {
    private objects: Map<string, rObject>;

    constructor() {
        this.objects = new Map<string, rObject>();
    }

    // create
    /**
     * Creates an object and adds it to the manager's list of objects.
     * @param properties - If provided, a JSON object containing the properties of the object to be created. Ex: "{type: 'circle', radius: 5, color: 'red'}"
     * @param creator - If provided, the id of the user who created the object -> User.id
     * @returns The created object as a JSON string
     */
    create(type?: string, properties?: object, creator?: string): string {
        const id = Rand.id();
        const object: rObject = {
            id,
            props: null,
            owner: creator || undefined
        };

        // if properties are provided, add them to the object
        if (properties) {
            object.props = properties;
        }

        this.objects.set(id, object);

        return JSON.stringify(object);
    }

    /**
     * Retrieves an object from the manager. If the object is not found, returns undefined.
     * @param id - The id of the object to be retrieved
     */
    get(id: string): string | undefined {
        // return this.objects.get(id);
        return JSON.stringify(this.objects.get(id));
    }
    /**
     * Returns all objects from the manager.
     */
    getAll(): string {
        return JSON.stringify(Array.from(this.objects.values()));
    }

    /**
     * Updates the properties of an object in the manager.
     * @param id - The id of the object to be updated
     * @param properties - A JSON object containing the properties to be updated. Ex: "{radius: 10, color: 'blue'}"
     * @returns The object, with the updated properties.
     */
    update(id: string, properties: object): string {
        // try to get the object
        const object = this.objects.get(id);

        if (object) {
            // update the object's properties, merging them with the new properties provided, while keeping the old ones
            object.props = { ...object.props, ...properties };

            // update the object in the manager
            this.objects.set(id, object);

            // return object;
            return JSON.stringify(object);
        } else {
            throw new Error('Object not found');
        }
    }

    /**
     * Deletes an object from the manager.
     * @param id - The id of the object to be deleted
     * @returns True if the object was deleted, false if it was not found
     */
    delete(id: string): boolean {
        return this.objects.delete(id);
    }

    // Transfers all objects from an owner to another
    yieldOwnership(oldOwner: string, newOwner: string): void {
        this.objects.forEach((obj) => {
            if (obj.owner === oldOwner) {
                obj.owner = newOwner;
            }
        });
    }
}
