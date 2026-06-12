import 'dotenv/config';
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
/**
 * Verify JWT token from Supabase Auth
 * Returns user data if valid, throws error if invalid
 */
export declare function verifySupabaseToken(token: string): Promise<import("@supabase/auth-js").User>;
/**
 * Get user by email (using listUsers and filtering)
 */
export declare function getUserByEmail(email: string): Promise<import("@supabase/auth-js").User | null>;
/**
 * Create user in Supabase Auth
 */
export declare function createUser(email: string, password: string): Promise<{
    user: import("@supabase/auth-js").User;
}>;
//# sourceMappingURL=supabase.d.ts.map