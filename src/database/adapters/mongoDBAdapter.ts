import { MongoClient } from 'mongodb';
import { DatabaseAdapterInterface } from './databaseAdapterInterface';
import { $ } from 'bun';
import { shCss } from '../../utils/common';

export class MongoDBAdapter implements DatabaseAdapterInterface {

    private client: MongoClient;
    private database: string;

    constructor(uri: string, database: string) {
        this.client = new MongoClient(uri);
        this.database = database;
    }

    // create the database and the collection if needed
    // async setup(): Promise<any> {
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
    // }

    async connect(): Promise<boolean> {
        // if (!(await this.isMongodRunning())) {
        //     return;
        // }
        // console.log('Connecting to MongoDB...');
        // return this.client.connect().then(() => {
        //     console.log('Connected to MongoDB');

        // }).catch((err) => {
        //     console.error(err);
        // }

        if (!(await this.isMongodRunning())) {
            return false;
        }
        console.log('Connecting to MongoDB...');
        return this.client.connect().then(() => {
            return true;
        }).catch((err) => {
            console.error(err);
            return false;
        }
    );
    }

    disconnect(): Promise<boolean> {
        // throw new Error('Method not implemented.');
        console.log('Disconnecting from MongoDB...');
        this.client.close();
        return Promise.resolve(true);
    }

    // Create
    insOne(collection: string, newData: Record<string, any>): Promise<any> {
        // throw new Error('Method not implemented.');
        console.log('Inserting document into MongoDB...');
        // return this.client.db().collection(collection).insertOne(document);
        return this.client.db(this.database).collection(collection).insertOne(newData).then((result) => {
            console.log('Document inserted');
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    // Upsert
    upsOne(collection: string, query: Record<string, any>, newData: Record<string, any>): Promise<boolean> {
        return this.client.db(this.database).collection(collection).updateOne(query, { $set: newData }, { upsert: true }).then((result) => {
            // return result.modifiedCount > 0;
            // se adicionou ou modificou algo, retorna true
            // se simplesmente encontrou o objeto, mas não teve que alterar nada, retorna true também, pois na prática, concluímos a operação
            // global.log(`result object: ${JSON.stringify(result)}`);
            // global.log("result.upsertedCount: " + result.upsertedCount);
            // global.log("result.modifiedCount: " + result.modifiedCount);

            return result.modifiedCount > 0 || result.upsertedCount > 0 || result.matchedCount > 0;
        }).catch((err) => {
            global.log("deu ruim familia");
            console.error(err);
            return false;
        });
    }
    upsMany(collection: string, query: Record<string, any>, newData: Record<string, any>[]): Promise<boolean> {
        return this.client.db(this.database).collection(collection).updateMany(query, { $set: newData }, { upsert: true }).then((result) => {
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
    modOne(collection: string, query: Record<string, any>, newData: Record<string, any>): Promise<any> {
        return this.client.db(this.database).collection(collection).updateOne(query, newData).then
        ((result) => {
            return result;
        }).catch((err) => {
            console.error(err);
        });
    }

    modMany(collection: string, query: Record<string, any>, newData: Record<string, any>): Promise<any> {
        return this.client.db(this.database).collection(collection).updateMany(query, newData).then
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

    private async isMongodRunning(): Promise<boolean> {
        // check if mongod is running
        const check = $`ps aux | grep mongod | grep -v grep`;
        let shRet = '';
        shRet = await check.text();

        if (shRet === '') {
            global.log(`${shCss.red}${shCss.bold}CRITICAL: Loaded DB manager MongoDB (service mongod) is not running. Read/write operations will remain pending.${shCss.end}`);
            return false;
        }
        return true;
    }
}