import postgres from 'postgres';
import { DatabaseAdapterInterface } from './databaseAdapterInterface';

export class PostgreSQLAdapter implements DatabaseAdapterInterface {
    private client: postgres.Sql = postgres();
    private database: string;

    constructor(uri: string, database: string, username: string, password: string) {
        this.client = postgres(
            {
                host: uri,
                // port: 5432,
                database: database,
                username: username || 'postgres',
                password: password || ''
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
        global.log("upsOne")
        return this.client.begin(async (sql) => {
            try {
                // const result = await sql`
                //     INSERT INTO ${tableName} (${columnName}) 
                //     VALUES (${sql.json(newData)}) 
                //     ON CONFLICT (${conflictTarget}) 
                //     DO UPDATE SET ${columnName} = ${sql.json(newData)}
                // `;

                // Instead, use dynamic table and column names based on newData, collection
                const tableName = collection;
                console.log(query);
                console.log(Object.keys(query)[0]);
                // console.log(query);
                // console.log(query);
                // console.log(query);
                // console.log(query);
                // const queryTarget = query[Object.keys(query)[0].valueOf];
                // get the value from {key: value} in query
                const conflictTarget = Object.keys(query)[0];
                global.log(conflictTarget);

                // iterate the keys in newData to get the column names
                for (const key in newData) {
                    const columnName = key;
                    const conflictTarget = key;
                    const result = await sql`
                        INSERT INTO ${tableName} (${columnName}) 
                        VALUES (${newData[columnName]}) 
                        WHERE 
                        ON CONFLICT (${conflictTarget}) 
                        DO UPDATE SET ${columnName} = ${newData[columnName]}
                    `;
                    console.log(JSON.stringify(result));
                }
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
                global.log('All operations completed successfully');
                return true;
            } catch (error) {
                global.log(JSON.stringify(error));
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