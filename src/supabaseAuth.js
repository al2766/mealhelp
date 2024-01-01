// SupabaseAuth.js
import { supabase } from './supabaseClient';

export async function signUpNewUser(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://example.com/welcome'
    }
  });
}

export async function signInWithEmail(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function signInWithMagicLink(email) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      // You can specify additional options here if needed
    }
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}
