import postgres from 'postgres';
import { DatabaseAdapterInterface } from './databaseAdapterInterface';
import { $ } from 'bun';
import { shCss } from '../../utils/common';

export class PostgreSQLAdapter implements DatabaseAdapterInterface {
    private client: postgres.Sql = postgres();
    private database: string;

    constructor(uri: string, database: string) {
        this.client = postgres(
            {
                host: uri,
                database: database,
                username: 'postgres',
                password: 'password'
            }
        );
        this.database = database;
    }

    async connect(): Promise<boolean> {
        if (!(await this.isPostgresRunning())) {
            return false;
        }
        console.log('Connecting to PostgreSQL...');
        // return this.client.connect().then(() => {
        //     return true;
        // }).catch((err) => {
        //     console.error(err);
        //     return false;
        // });
        // return this.client.begin(async (sql) => {
        // return this.client.begin()

        return true;
    }

    async disconnect(): Promise<boolean> {
        console.log('Disconnecting from PostgreSQL...');
        this.client.end();
        return true;
    }

    async insOne(collection: string, newData: Record<string, any>): Promise<boolean> {
        return this.client.begin(async (sql) => {
            try {
                const result = await sql`INSERT INTO ${collection} (name) VALUES (${newData.name})`;
                console.log(JSON.stringify(result));
                return true;
            } catch (error) {
                console.log(JSON.stringify(error));
                return false;
            }
        });
    }

    async getOne(collection: string, query: Record<string, any>): Promise<Record<string, any> | null> {
        return this.client.begin(async (sql) => {
            try {
                const result = await sql`SELECT * FROM ${collection} WHERE name = ${query.name}`;
                console.log(JSON.stringify(result));
                return result;
            } catch (error) {
                console.log(JSON.stringify(error));
                return null;
            }
        });
    }

    async getMany(collection: string, query: Record<string, any>): Promise<Record<string, any>[]> {
        return this.client.begin(async (sql): Promise<Record<string, any>[]> => {
            try {
                const result: Record<string, any>[] = await sql`SELECT * FROM ${collection} WHERE name = ${query.name}`;
                console.log(JSON.stringify(result));
                return result;
            } catch (error) {
                console.log(JSON.stringify(error));
                return [];
            }
        });
    }    

    async modOne(collection: string, query: Record<string, any>, newData: Record<string, any>): Promise<boolean> {
        return this.client.begin(async (sql) => {
            try {
                const result = await sql`UPDATE ${collection} SET name = ${newData.name} WHERE name = ${query.name}`;
                console.log(JSON.stringify(result));
                return true;
            } catch (error) {
                console.log(JSON.stringify(error));
                return false;
            }
        });
    }

    async upsOne(collection: string, query: Record<string, any>, newData: Record<string, any>): Promise<boolean> {
        return this.client.begin(async (sql) => {
            try {
                const result = await sql`INSERT INTO ${collection} (name) VALUES (${newData.name}) ON CONFLICT (name) DO UPDATE SET name = ${newData.name}`;
                console.log(JSON.stringify(result));
                return true;
            } catch (error) {
                console.log(JSON.stringify(error));
                return false;
            }
        });
    }

    async upsMany(collection: string, query: Record<string, any>, newData: Record<string, any>[]): Promise<boolean> {
        return this.client.begin(async (sql) => {
            try {
                for (const data of newData) {
                    await sql`INSERT INTO ${collection} (name) VALUES (${data.name}) ON CONFLICT (name) DO UPDATE SET name = ${data.name}`;
                }
                console.log('All operations completed successfully');
                return true;
            } catch (error) {
                console.log(JSON.stringify(error));
                return false;
            }
        });
    }

    async remOne(collection: string, query: Record<string, any>): Promise<boolean> {
        return this.client.begin(async (sql) => {
            try {
                const result = await sql`DELETE FROM ${collection} WHERE name = ${query.name} LIMIT 1`;
                console.log(JSON.stringify(result));
                return true;
            } catch (error) {
                console.log(JSON.stringify(error));
                return false;
            }
        });
    }

    async remMany(collection: string, query: Record<string, any>[]): Promise<boolean> {
        return this.client.begin(async (sql) => {
            try {
                for (const data of query) {
                    await sql`DELETE FROM ${collection} WHERE name = ${data.name}`;
                }
                console.log('All operations completed successfully');
                return true;
            } catch (error) {
                console.log(JSON.stringify(error));
                return false;
            }
        });
    }

    private async isPostgresRunning(): Promise<boolean> {
        return this.client`SELECT 1`.then(() => {
            return true;
        }).catch((err) => {
            console.error(err);
            return false;
        });
    }
}