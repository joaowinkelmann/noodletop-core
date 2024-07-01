export interface DatabaseAdapterInterface {
    // Connection methods
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;

    // Create
    insOne(collection: string, document: Record<string, any>): Promise<boolean>;
    insMany?(collection: string, documents: Record<string, any>[]): Promise<boolean[]>;

    // Read
    getOne(collection: string, query: Record<string, any>): Promise<Record<string, any> | null>;
    getMany(collection: string, query: Record<string, any>): Promise<Record<string, any>[]>;

    // Update
    modOne(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<boolean>;
    modMany?(collection: string, query: Record<string, any>, update: Record<string, any>[]): Promise<boolean[]>;

    // Upsert
    upsOne(collection: string, query: Record<string, any>, update: Record<string, any>): Promise<boolean>;
    upsMany(collection: string, query: Record<string, any>, update: Record<string, any>[]): Promise<boolean[]>;

    // Delete
    remOne(collection: string, query: Record<string, any>): Promise<boolean>;
    remMany(collection: string, query: Record<string, any>[]): Promise<boolean>;

    // Misc
    setup?(): Promise<boolean>;
}