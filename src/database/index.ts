import { DatabaseAdapterInterface } from './adapters/databaseAdapterInterface';
import { MongoDBAdapter } from './adapters/mongoDBAdapter';

/**
 * Exposes the database to the rest of the application.
 */
export class Db {
    private adapter: DatabaseAdapterInterface;

    constructor() {
        switch (process.env.DB_SYSTEM || 'mongodb') {
            case 'mongodb':
                this.adapter = new MongoDBAdapter('mongodb://localhost:27017', process.env.DB_DATABASE || 'noodletop');
                break;
            // add other cases for other database systems...
            default:
                // throw new Error('Unsupported database system');
                global.log('WARN: Unsupported database system, defaulting to MongoDB');
                this.adapter = new MongoDBAdapter('mongodb://localhost:27017', process.env.DB_DATABASE || 'noodletop');
        }

        // if there's a setup method, call it
        if (this.adapter.setup) {
            this.adapter.setup();
        }
    }

    async connect(): Promise<boolean> {
        return await this.adapter.connect();
    }

    async disconnect(): Promise<boolean> {
        return await this.adapter.disconnect();
    }

    // create
    async insOne(collection: string, document: Record<string, any>): Promise<boolean> {
        return await this.adapter.insOne(collection, document);
    }

    // read
    async getOne(collection: string, query: Record<string, any>) {
        return await this.adapter.getOne(collection, query);
    }

    async getMany(collection: string, query: Record<string, any>) {
        return await this.adapter.getMany(collection, query);
    }

    // update
    async modOne(collection: string, query: Record<string, any>, update: Record<string, any>) {
        return await this.adapter.modOne(collection, query, update);
    }

    // upsert
    async upsOne(collection: string, query: Record<string, any>, update: Record<string, any>) {
        return await this.adapter.upsOne(collection, query, update);
    }

    // delete
    async remOne(collection: string, query: Record<string, any>) {
        return await this.adapter.remOne(collection, query);
    }

    // Expose other methods as needed...
}