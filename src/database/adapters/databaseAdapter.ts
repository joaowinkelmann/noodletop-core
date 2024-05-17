export interface DatabaseAdapter {
    // Connection methods
    connect(): Promise<any>;
    disconnect(): Promise<any>;


    // Create
    insOne(collection: string, document: object): Promise<any>;
    insMany?(collection: string, documents: object[]): Promise<any>;

    // Read
    //                                         Promise<object | null>;
    getOne(collection: string, query: object): Promise<any>;
    getMany(collection: string, query: object): Promise<any>;

    // Update
    modOne(collection: string, query: object, update: object): Promise<any>;
    modMany?(collection: string, query: object, update: object[]): Promise<any>;


    // Delete
    remOne(collection: string, query: object): Promise<any>;
    remMany(collection: string, query: object[]): Promise<any>;


    // Misc
    setup?(): void;
}