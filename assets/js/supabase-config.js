// assets/js/supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ============================================
// YOUR SUPABASE CREDENTIALS - REPLACE THESE
// ============================================
const SUPABASE_URL = "https://gqhhvbnbbmstfrhtegsl.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaGh2Ym5iYm1zdGZyaHRlZ3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzkwOTcsImV4cCI6MjA5MTc1NTA5N30.cSjwB9V-jY3yekNz0wS8EdlKG79lQr-SYPRj20eGicg";
  // ← PASTE YOUR ACTUAL ANON KEY HERE

// Create single supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function requireAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return session;
}

export async function checkAdmin() {
    const session = await checkAuth();
    if (!session) return false;

    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

    if (error || !data) return false;
    return true;
}

export async function requireAdmin() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        // Check if Swal is available (SweetAlert)
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Access Denied',
                text: 'You do not have permission to access the admin panel.',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            alert('Access Denied: You do not have admin permissions.');
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

export async function signOut() {
    await supabase.auth.signOut();
    window.location.href = 'admin-login.html';
}

console.log('✅ Supabase client initialized for:', SUPABASE_URL)