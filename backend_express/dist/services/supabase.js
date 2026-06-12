import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials. Check .env file.');
}
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
/**
 * Verify JWT token from Supabase Auth
 * Returns user data if valid, throws error if invalid
 */
export async function verifySupabaseToken(token) {
    try {
        const { data: { user }, error, } = await supabase.auth.getUser(token);
        if (error)
            throw error;
        if (!user)
            throw new Error('No user found');
        return user;
    }
    catch (err) {
        console.error('Token verification failed:', err);
        throw err;
    }
}
/**
 * Get user by email (using listUsers and filtering)
 */
export async function getUserByEmail(email) {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error)
            throw error;
        const user = data.users.find((u) => u.email === email);
        return user || null;
    }
    catch (err) {
        console.error('Error fetching user:', err);
        return null;
    }
}
/**
 * Create user in Supabase Auth
 */
export async function createUser(email, password) {
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (error)
            throw error;
        return data;
    }
    catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}
//# sourceMappingURL=supabase.js.map