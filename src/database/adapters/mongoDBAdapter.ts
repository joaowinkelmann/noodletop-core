import { MongoClient } from 'mongodb';
import { DatabaseAdapter } from './databaseAdapter';

export class MongoDBAdapter implements DatabaseAdapter {

    private client: MongoClient;
    private database: string;

    constructor(uri: string, database: string) {
        this.client = new MongoClient(uri);
        this.database = database;
    }

    // create the database and the collection if needed
    setup() {
        // console.log('Setting up MongoDB...');
        // this.client.connect().
        //     then(() => {
        //         // this.client.db().createCollection('test');
        //         this.client.db().createCollection('test').then(() => {
        //             console.log('Collection created');
        //         }).catch((err) => {
        //             console.error(err);
        //         });
        //     }
        //     ).catch((err) => {
        //         console.error(err);
        //     });
    }

    connect(): Promise<any> {
        console.log('Connecting to MongoDB...');
        return this.client.connect().then(() => {
            console.log('Connected to MongoDB');
        }).catch((err) => {
            console.error(err);
        }
    );
    }
    disconnect(): Promise<void> {
        // throw new Error('Method not implemented.');
        console.log('Disconnecting from MongoDB...');
        return this.client.close();
    }

    // Create
    insOne(collection: string, document: Record<string, any>): Promise<any> {
        // throw new Error('Method not implemented.');
        console.log('Inserting document into MongoDB...');
        // return this.client.db().collection(collection).insertOne(document);
        return this.client.db(this.database).collection(collection).insertOne(document).then((result) => {
            console.log('Document inserted');
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    // Upsert
    upsOne(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<boolean> {
        return this.client.db(this.database).collection(collection).updateOne(query, { $set: update }, { upsert: true }).then((result) => {
            // return result.modifiedCount > 0;
            // se adicionou ou modificou algo, retorna true
            return result.modifiedCount > 0 || result.upsertedCount > 0;
        }).catch((err) => {
            console.error(err);
            return false;
        });
    }
    upsMany(collection: string, query: Record<string, any>, update: Record<string, any>[]): Promise<boolean> {
        return this.client.db(this.database).collection(collection).updateMany(query, { $set: update }, { upsert: true }).then((result) => {
            return result.modifiedCount > 0 || result.upsertedCount > 0;
        }).catch((err) => {
            console.error(err);
            return false;
        });
    }


    getOne(collection: string, query: Record<string, any>): Promise<any> {
        // throw new Error('Method not implemented.');
        return this.client.db(this.database).collection(collection).findOne(query).then((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    getMany(collection: string, query: Record<string, any>): Promise<any> {
        // throw new Error('Method not implemented.');
        return this.client.db(this.database).collection(collection).find(query).toArray().then((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }


    // Update
    // example db.modOne('test', { name: 'test3' }, { $set: { name: 'test4' } });
    modOne(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<any> {
        return this.client.db(this.database).collection(collection).updateOne(query, update).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    modMany(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<any> {
        return this.client.db(this.database).collection(collection).updateMany(query, update).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    remOne(collection: string, query: Record<string, any>): Promise<any> {
        return this.client.db(this.database).collection(collection).deleteOne(query).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    remMany(collection: string, query: Record<string, any>): Promise<any> {
        return this.client.db(this.database).collection(collection).deleteMany(query).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }
}