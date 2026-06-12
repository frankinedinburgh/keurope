export interface Migration {
    version: string;
    name: string;
    appliedAt?: string;
}
export declare function runMigrations(): Promise<void>;
//# sourceMappingURL=migrations.d.ts.map