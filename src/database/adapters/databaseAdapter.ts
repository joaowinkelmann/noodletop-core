export interface DatabaseAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    insert(collection: string, document: object): Promise<void>;
    findOne(collection: string, query: object): Promise<object | null>;
    // Add other methods as needed...
}