export interface DatabaseAdapter {
    // Connection methods
    connect(): Promise<any>;
    disconnect(): Promise<any>;


    // Create
    insOne(collection: string, document: object): Promise<boolean>;
    insMany?(collection: string, documents: object[]): Promise<boolean>;

    // Read
    //                                         Promise<object | null>;
    getOne(collection: string, query: object): Promise<any>;
    getMany(collection: string, query: object): Promise<any>;

    // Update
    modOne(collection: string, query: object, update: object): Promise<any>;
    modMany?(collection: string, query: object, update: object[]): Promise<any>;

    // Upsert
    upsOne?(collection: string, query: object, update: object): Promise<boolean>;
    upsMany?(collection: string, query: object, update: object[]): Promise<boolean>;


    // Delete
    remOne(collection: string, query: object): Promise<any>;
    remMany(collection: string, query: object[]): Promise<any>;


    // Misc
    setup?(): void;
}