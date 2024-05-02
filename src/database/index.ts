import { DatabaseAdapter } from './adapters/databaseAdapter';
import { MongoDBAdapter } from './adapters/mongoDBAdapter';

/**
 * Exposes the database to the rest of the application.
 */
export class Db {
    private adapter: DatabaseAdapter;

    constructor() {
        this.adapter = new MongoDBAdapter('mongodb://localhost:27017');
    }

    async connect() {
        await this.adapter.connect();
    }

    async disconnect() {
        await this.adapter.disconnect();
    }

    async insert(collection: string, document: object) {
        await this.adapter.insert(collection, document);
    }

    async findOne(collection: string, query: object) {
        return this.adapter.findOne(collection, query);
    }

    // Expose other methods as needed...
}