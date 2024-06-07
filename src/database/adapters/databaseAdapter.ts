export interface DatabaseAdapter {
    // Connection methods
    connect(): Promise<any>;
    disconnect(): Promise<any>;


    // Create
    insOne(collection: string, document: Record<string, any>): Promise<boolean>;
    insMany?(collection: string, documents: Record<string, any>[]): Promise<boolean>;

    // Read
    //                                         Promise<object | null>;
    getOne(collection: string, query: Record<string, any>): Promise<any>;
    getMany(collection: string, query: Record<string, any>): Promise<any>;

    // Update
    modOne(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<any>;
    modMany?(collection: string, query: Record<string, any>, update: Record<string, any>[]): Promise<any>;

    // Upsert
    upsOne(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<boolean>;
    upsMany(collection: string, query: Record<string, any>, update: Record<string, any>[]): Promise<boolean>;

    // Delete
    remOne(collection: string, query: Record<string, any>): Promise<any>;
    remMany(collection: string, query: Record<string, any>[]): Promise<any>;


    // Misc
    setup?(): void;
}