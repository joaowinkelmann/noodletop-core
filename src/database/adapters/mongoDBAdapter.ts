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
        // throw new Error('Method not implemented.');
        console.log('Connecting to MongoDB...');
        // console.log(this.client.connect());
        return this.client.connect().then(() => {
            console.log('Connected to MongoDB');
        }).catch((err) => {
            console.error(err);
        }
    );
    console.log('Connected to MongoDB');
    }
    disconnect(): Promise<void> {
        // throw new Error('Method not implemented.');
        console.log('Disconnecting from MongoDB...');
        return this.client.close();
    }
    insOne(collection: string, document: object): Promise<any> {
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
    getOne(collection: string, query: object): Promise<any> {
        // throw new Error('Method not implemented.');
        return this.client.db(this.database).collection(collection).findOne(query).then((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    getMany(collection: string, query: object): Promise<any> {
        // throw new Error('Method not implemented.');
        return this.client.db(this.database).collection(collection).find(query).toArray().then((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }


    // Update
    // example db.modOne('test', { name: 'test3' }, { $set: { name: 'test4' } });
    modOne(collection: string, query: object, update: object): Promise<any> {
        return this.client.db(this.database).collection(collection).updateOne(query, update).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    modMany(collection: string, query: object, update: object): Promise<any> {
        return this.client.db(this.database).collection(collection).updateMany(query, update).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    remOne(collection: string, query: object): Promise<any> {
        return this.client.db(this.database).collection(collection).deleteOne(query).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    remMany(collection: string, query: object): Promise<any> {
        return this.client.db(this.database).collection(collection).deleteMany(query).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }
}