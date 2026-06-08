import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL!;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export async function adminLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Credenciais inválidas');
  return data.session!.access_token;
}

export async function adminLogout() {
  await supabase.auth.signOut();
}

export function getStoredToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('admin_token');
}
