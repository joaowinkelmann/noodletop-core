import { DatabaseAdapter } from './adapters/databaseAdapter';
import { MongoDBAdapter } from './adapters/mongoDBAdapter';

/**
 * Exposes the database to the rest of the application.
 */
export class Db {
    private adapter: DatabaseAdapter;

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

    async connect() {
        await this.adapter.connect();
    }

    async disconnect() {
        await this.adapter.disconnect();
    }

    // create
    async insOne(collection: string, document: object) {
        await this.adapter.insOne(collection, document);
    }

    // read
    async getOne(collection: string, query: object) {
        return this.adapter.getOne(collection, query);
    }

    async getMany(collection: string, query: object) {
        return this.adapter.getMany(collection, query);
    }

    // update
    async modOne(collection: string, query: object, update: object) {
        return this.adapter.modOne(collection, query, update);
    }

    // delete
    async remOne(collection: string, query: object) {
        return this.adapter.remOne(collection, query);
    }

    // Expose other methods as needed...
}