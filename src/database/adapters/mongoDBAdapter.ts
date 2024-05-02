import { MongoClient } from 'mongodb';
import { DatabaseAdapter } from './databaseAdapter';

export class MongoDBAdapter implements DatabaseAdapter {

    private client: MongoClient;

    constructor(uri: string) {
        this.client = new MongoClient(uri);
    }

    connect(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    insert(collection: string, document: object): Promise<void> {
        throw new Error('Method not implemented.');
    }
    findOne(collection: string, query: object): Promise<object | null> {
        throw new Error('Method not implemented.');
    }
    // Add other methods as needed...
}