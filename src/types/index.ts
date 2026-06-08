export type ChamadoStatus    = 'Aberto' | 'Em andamento' | 'Resolvido';
export type ChamadoCategoria = 'Buraco' | 'Iluminação' | 'Vazamento' | 'Lixo' | 'Árvore' | 'Outro';

export interface Chamado {
  id:         string;
  protocolo:  string;
  nome:       string;
  contato:    string;
  descricao:  string;
  categoria:  ChamadoCategoria;
  imagem_url: string | null;
  status:     ChamadoStatus;
  latitude:   number | null;
  longitude:  number | null;
  created_at: string;
  updated_at: string;
}

export interface HistoricoAlteracao {
  id:              string;
  chamado_id:      string;
  status_anterior: string | null;
  status_novo:     string;
  alterado_por:    string;
  created_at:      string;
}

// ── Chatbot ──────────────────────────────────────────────────
export type ChatStep = 'welcome' | 'nome' | 'contato' | 'descricao' | 'imagem' | 'processando' | 'concluido';

export interface ChatMessage {
  id:           string;
  role:         'bot' | 'user';
  type:         'text' | 'quick_replies' | 'image' | 'result';
  content:      string;
  quickReplies?: string[];
  imageSrc?:    string;
  result?: {
    protocolo: string;
    categoria: ChamadoCategoria;
  };
}
