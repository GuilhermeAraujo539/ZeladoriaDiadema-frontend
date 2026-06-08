import type { Chamado, ChamadoCategoria, ChamadoStatus } from '@/types';
import { getStoredToken } from './supabase';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Erro ${res.status}`);
  return json as T;
}

export const classifyProblem = (descricao: string) =>
  req<{ categoria: ChamadoCategoria }>('/api/classify', { method: 'POST', body: JSON.stringify({ descricao }) })
    .then(d => d.categoria);

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const token = getStoredToken();
  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json() as { url?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Upload falhou');
  return json.url!;
}

export const createChamado = (payload: {
  nome: string; contato: string; descricao: string;
  categoria: ChamadoCategoria; imagem_url?: string | null;
  latitude?: number | null; longitude?: number | null;
}) => req<Chamado>('/api/chamados', { method: 'POST', body: JSON.stringify(payload) });

export const getChamados      = ()          => req<Chamado[]>('/api/chamados');
export const getChamado       = (id: string)=> req<Chamado>(`/api/chamados/${id}`);
export const getHistorico     = (id: string)=> req<{ id:string; status_anterior:string; status_novo:string; alterado_por:string; created_at:string }[]>(`/api/chamados/${id}/historico`);
export const updateStatus     = (id: string, status: ChamadoStatus) =>
  req<Chamado>(`/api/chamados/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
