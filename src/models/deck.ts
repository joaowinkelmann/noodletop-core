import { ObjectManager } from './object';
import { User } from './user';

export class Deck {
    private objects: ObjectManager = new ObjectManager();

    addToDeck(creator: User['id'], type?: string, props?: Record<string, any>): void {
        this.objects.create(type, props, creator);
    }

    getDeck(): string {
        return this.objects.getAll();
    }
}