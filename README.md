<div align="center">

<img src="frontend/public/logo.png" alt="Prefeitura de Diadema" width="300" />

# Plataforma de Zeladoria Urbana

**Sistema de registro e gestão de ocorrências urbanas com Inteligência Artificial**

*Prefeitura Municipal de Diadema — Trabalhando por Diadema*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3-FF6B35?style=flat-square)](https://groq.com)
[![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-F22F46?style=flat-square&logo=twilio&logoColor=white)](https://twilio.com)

Link do projeto: https://zeladoria-diadema.vercel.app/#como-funciona

</div>

---

## 🎥 Apresentação

> 📹 **[Assista ao vídeo de apresentação](https://youtu.be/88z4EPcw2tE?si=qk5uNIqFAc8tNq7m)**

---

## Sobre o projeto

Plataforma web que permite que cidadãos de Diadema registrem problemas urbanos diretamente pela Landing Page através de um chatbot inteligente. A IA classifica o chamado automaticamente, gera um protocolo único e notifica o cidadão via WhatsApp. O time da prefeitura acompanha e gerencia tudo em um painel administrativo com dashboard, mapa interativo e atualizações em tempo real.

## Funcionalidades

**Para o cidadão**
- Chatbot integrado na Landing Page com respostas em streaming
- Captura automática de geolocalização
- Upload de foto do problema
- Classificação automática por IA (Groq · Llama 3.3)
- Notificação de protocolo e atualizações via WhatsApp

**Para o administrador**
- Dashboard com métricas e gráficos (Recharts)
- Mapa interativo com todos os chamados geolocalizados (Leaflet)
- Tabela com busca e filtros por categoria, status e data
- Histórico completo de alterações por chamado
- Atualizações em tempo real sem refresh (Socket.IO)
- Automação de fluxos via n8n

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 · Vite · TailwindCSS |
| Backend | Node.js · Express |
| Banco de dados | Supabase (PostgreSQL + Storage) |
| Autenticação | Supabase Auth |
| Inteligência Artificial | Groq (llama-3.3-70b-versatile) |
| Notificações | Twilio WhatsApp |
| Tempo real | Socket.IO |
| Deploy | Vercel (frontend) · Render (backend) |

## Estrutura do projeto

```
zeladoria-diadema/
├── frontend/                  # React + Vite + TailwindCSS
│   └── src/
│       ├── components/
│       │   ├── ui/            # Componentes atômicos reutilizáveis
│       │   ├── layout/        # Navbar e Footer
│       │   ├── admin/         # Dashboard, Mapa, Modal, StatusBadge
│       │   └── chatbot/       # ChatBot com streaming SSE
│       ├── pages/             # Home, Admin, Login
│       └── lib/               # API client, Socket.IO, Supabase auth
│
├── backend/                   # Node.js + Express
│   └── src/
│       ├── routes/            # chamados, classify (Groq), upload, auth
│       ├── services/          # WhatsApp (Twilio), n8n webhook
│       ├── middleware/        # Autenticação JWT
│       └── lib/               # Supabase client
│
└── supabase/
    └── schema.sql             # Tabelas, constraints e triggers
```

## Diferenciais implementados

- **Streaming de resposta** — chatbot responde token a token via SSE
- **Responsividade** — funciona em desktop, tablet e mobile
- **Dashboard** — métricas e gráficos com Recharts
- **Geolocalização** — captura automática de coordenadas + mapa com Leaflet
- **Classificação automática por IA** — Groq com fallback por palavras-chave
- **WebSocket** — painel admin atualiza em tempo real com Socket.IO
- **Automação com n8n** — webhook disparado em cada evento do sistema

## Variáveis de ambiente

**`backend/.env`**
```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GROQ_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
N8N_WEBHOOK_URL=
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Rodando localmente

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (outro terminal)
cd frontend && npm install && npm run dev
```

Acesse `http://localhost:5173`

## Licença

Desenvolvido por - Guilherme de Araujo Souza
