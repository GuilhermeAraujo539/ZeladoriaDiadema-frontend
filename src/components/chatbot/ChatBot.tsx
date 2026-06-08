import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, Camera, CheckCircle,
  Loader2, Bot, User, Copy, Check, MapPin,
} from 'lucide-react';
import { classifyProblem, uploadImage, createChamado } from '@/lib/api';
import type { ChatMessage, ChatStep, ChamadoCategoria } from '@/types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const CAT_META: Record<ChamadoCategoria, { emoji: string; color: string; bg: string }> = {
  Buraco:     { emoji: '🕳️', color: 'text-red-700',     bg: 'bg-red-50'     },
  Iluminação: { emoji: '💡', color: 'text-yellow-700',  bg: 'bg-yellow-50'  },
  Vazamento:  { emoji: '💧', color: 'text-blue-700',    bg: 'bg-blue-50'    },
  Lixo:       { emoji: '🗑️', color: 'text-green-700',   bg: 'bg-green-50'   },
  Árvore:     { emoji: '🌳', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  Outro:      { emoji: '⚠️', color: 'text-purple-700',  bg: 'bg-purple-50'  },
};

const uid  = () => Math.random().toString(36).slice(2, 10);
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

interface UserData { nome: string; contato: string; descricao: string }

async function streamBotSSE(
  step: string,
  mensagem: string,
  nome: string,
  onChunk: (c: string) => void,
) {
  const res = await fetch(`${API}/api/classify/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, mensagem, nome }),
  });
  if (!res.body) return;
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') return;
      try {
        const { content } = JSON.parse(raw) as { content?: string };
        if (content) onChunk(content);
      } catch { /* chunk mal-formado */ }
    }
  }
}

function getGeo(): Promise<{ lat: number; lng: number } | null> {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => res(null),
      { timeout: 6000 },
    );
  });
}

export function ChatBot() {
  const [isOpen,  setIsOpen]  = useState(false);
  const [messages,setMessages]= useState<ChatMessage[]>([]);
  const [step,    setStep]    = useState<ChatStep>('welcome');
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [uData,   setUData]   = useState<Partial<UserData>>({});
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPrev, setImgPrev] = useState<string | null>(null);
  const [geo,     setGeo]     = useState<{ lat: number; lng: number } | null>(null);
  const [geoOk,   setGeoOk]   = useState<boolean | null>(null);
  const [copied,  setCopied]  = useState(false);
  const [started, setStarted] = useState(false);

  const endRef  = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inpRef  = useRef<HTMLTextAreaElement>(null);

  const uDataRef = useRef<Partial<UserData>>({});
  useEffect(() => { uDataRef.current = uData; }, [uData]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const push = useCallback((msg: Omit<ChatMessage, 'id'>) =>
    setMessages(prev => [...prev, { ...msg, id: uid() }]), []);

  const botStream = useCallback(async (s: ChatStep, userMsg = '') => {
    const msgId = uid();
    setLoading(true);
    setMessages(prev => [...prev, { id: msgId, role: 'bot', type: 'text', content: '' }]);
    try {
      await streamBotSSE(s, userMsg, uDataRef.current.nome ?? '', content =>
        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, content: m.content + content } : m),
        ),
      );
    } catch {
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inpRef.current?.focus(), 300);
    if (started) return;
    setStarted(true);
    (async () => {
      const loc = await getGeo();
      setGeo(loc);
      setGeoOk(loc !== null);
      await botStream('welcome', 'Olá');
      await wait(200);
      setStep('nome');
    })();
  }, [isOpen, started, botStream]);

  const finalizar = useCallback(async (imgUrl: string | null) => {
    const snap = uDataRef.current;

    if (!snap.descricao) {
      push({ role: 'bot', type: 'text', content: '⚠️ Dados incompletos. Tente novamente.' });
      setStep('descricao');
      setLoading(false);
      return;
    }

    try {
      const categoria = await classifyProblem(snap.descricao);
      const chamado   = await createChamado({
        nome:       snap.nome      ?? '',
        contato:    snap.contato   ?? '',
        descricao:  snap.descricao ?? '',
        categoria,
        imagem_url: imgUrl,
        latitude:   geo?.lat ?? null,
        longitude:  geo?.lng ?? null,
      });

      setMessages(prev => [
        ...prev,
        {
          id: uid(), role: 'bot', type: 'result', content: '',
          result: { protocolo: chamado.protocolo, categoria },
        },
      ]);
      setStep('concluido');
    } catch (err) {
      console.error('[ZeladurIA] Erro ao registrar chamado:', err);
      push({
        role: 'bot', type: 'text',
        content: '⚠️ Erro ao registrar o chamado. Verifique sua conexão e tente novamente.',
      });
      setStep('descricao');
    } finally {
      setLoading(false);
    }
  }, [geo, push]);

  const processStep = useCallback(async (val: string) => {
    if (step === 'nome') {
      setUData(p => ({ ...p, nome: val }));
      setStep('contato');
      await botStream('nome', val);

    } else if (step === 'contato') {
      setUData(p => ({ ...p, contato: val }));
      setStep('descricao');
      await botStream('contato', val);

    } else if (step === 'descricao') {
      if (val.length < 10) {
        push({ role: 'bot', type: 'text', content: 'Pode detalhar um pouco mais? Quanto mais detalhes, melhor! 📝' });
        return;
      }
      setUData(p => ({ ...p, descricao: val }));
      setStep('imagem');
      await botStream('descricao', val);
      await wait(300);
      push({
        role: 'bot', type: 'quick_replies', content: '',
        quickReplies: ['📷 Enviar foto', '➡️ Continuar sem foto'],
      });
    }
  }, [step, botStream, push]);

  const handleSend = useCallback(async () => {
    if (imgFile && step === 'imagem') {
      const fileToUpload = imgFile;            
      push({ role: 'user', type: 'image', content: 'Foto enviada', imageSrc: imgPrev! });
      setImgFile(null);
      setImgPrev(null);
      setStep('processando');
      await botStream('imagem', 'foto');
      setLoading(true);
      try {
        const url = await uploadImage(fileToUpload);
        await finalizar(url);
      } catch {
        await finalizar(null);
      }
      return;
    }

    const val = input.trim();
    if (!val || loading || step === 'processando' || step === 'concluido') return;
    setInput('');
    push({ role: 'user', type: 'text', content: val });
    await processStep(val);
  }, [input, loading, step, imgFile, imgPrev, processStep, push, botStream, finalizar]);

  const handleQuickReply = useCallback(async (reply: string) => {
    if (step !== 'imagem') return;

    setMessages(prev => prev.filter(m => m.type !== 'quick_replies'));
    push({ role: 'user', type: 'text', content: reply });

    if (reply.startsWith('📷')) {
      fileRef.current?.click();
    } else {
      setStep('processando');
      await botStream('imagem', 'sem foto');
      setLoading(true);
      await finalizar(null);
    }
  }, [step, push, botStream, finalizar]);

  const isDisabled =
    loading || step === 'processando' || step === 'concluido' || step === 'imagem';

  return (
    <>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-40 w-[375px] max-w-[calc(100vw-32px)] flex flex-col rounded-2xl shadow-2xl bg-white border border-slate-200 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{ maxHeight: '580px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-brand-900 rounded-t-2xl flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Bot size={17} className="text-blue-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Assistente de Zeladoria</p>
            <p className="text-blue-300 text-xs flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Online agora
            </p>
          </div>
          {geoOk !== null && (
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              geoOk ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400'
            }`}>
              <MapPin size={11} />{geoOk ? 'GPS ✓' : 'Sem GPS'}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 chat-scrollbar min-h-0">
          {messages.map(msg => (
            <MsgBubble
              key={msg.id}
              msg={msg}
              onQuickReply={handleQuickReply}
              onCopy={p => {
                navigator.clipboard.writeText(p).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              copied={copied}
            />
          ))}
          {loading && <TypingDots />}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl flex-shrink-0">
          {imgPrev && step === 'imagem' && (
            <div className="mb-2 flex items-center gap-2">
              <img src={imgPrev} alt="Preview" className="h-12 w-auto rounded-lg border border-slate-200 object-cover" />
              <button
                className="text-xs text-slate-400 hover:text-red-500 transition"
                onClick={() => { setImgFile(null); setImgPrev(null); }}
              >
                Remover
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inpRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={isDisabled}
              placeholder={
                step === 'concluido'   ? 'Chamado registrado ✓' :
                step === 'imagem'      ? 'Use os botões acima...' :
                step === 'processando' ? 'Processando...' :
                'Digite sua mensagem...'
              }
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 disabled:bg-slate-50 disabled:text-slate-400 transition max-h-20 min-h-[38px]"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={step !== 'imagem' || !!imgFile}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-brand-600 hover:text-brand-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Enviar foto"
            >
              <Camera size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={isDisabled && !(imgFile && step === 'imagem')}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              aria-label="Enviar"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (!f) return;
          setImgFile(f);
          setImgPrev(URL.createObjectURL(f));
          e.target.value = '';
        }}
      />
    </>
  );
}


function MsgBubble({ msg, onQuickReply, onCopy, copied }: {
  msg: ChatMessage;
  onQuickReply: (r: string) => void;
  onCopy: (p: string) => void;
  copied: boolean;
}) {
  if (msg.type === 'result' && msg.result) {
    const meta = CAT_META[msg.result.categoria];
    return (
      <div className="animate-slide-up flex gap-2 items-start">
        <Av isBot />
        <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-2xl rounded-tl-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={17} className="text-emerald-600" />
            <span className="text-emerald-800 font-semibold text-sm">Chamado registrado!</span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Protocolo</p>
          <div className="flex items-center gap-2 mb-3">
            <code className="text-lg font-bold text-slate-800 tracking-wider">{msg.result.protocolo}</code>
            <button
              onClick={() => onCopy(msg.result!.protocolo)}
              className="p-1 hover:bg-emerald-100 rounded text-slate-400 hover:text-emerald-700 transition"
              aria-label="Copiar protocolo"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
            {meta.emoji} {msg.result.categoria}
          </span>
          <p className="text-xs text-slate-500 mt-3">📱 Você receberá notificação no WhatsApp!</p>
        </div>
      </div>
    );
  }

  if (msg.type === 'image') {
    return (
      <div className="flex gap-2 justify-end animate-slide-up">
        <div className="max-w-[70%]">
          <img src={msg.imageSrc} alt="Foto enviada" className="rounded-2xl rounded-tr-sm border border-slate-200 max-h-40 object-cover" />
        </div>
        <Av isBot={false} />
      </div>
    );
  }

  if (msg.type === 'quick_replies') {
    return (
      <div className="animate-slide-up space-y-2">
        {msg.content && (
          <div className="flex gap-2 items-start">
            <Av isBot /><Bubble isBot>{msg.content}</Bubble>
          </div>
        )}
        {msg.quickReplies && (
          <div className="flex flex-wrap gap-2 ml-9">
            {msg.quickReplies.map(r => (
              <button
                key={r}
                onClick={() => onQuickReply(r)}
                className="px-3 py-1.5 rounded-full border border-brand-600 text-brand-600 text-xs font-medium hover:bg-brand-50 transition"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-2 items-start animate-slide-up ${isBot ? '' : 'flex-row-reverse'}`}>
      <Av isBot={isBot} />
      <Bubble isBot={isBot}>
        {msg.content || <span className="opacity-0">.</span>}
      </Bubble>
    </div>
  );
}

function Av({ isBot }: { isBot: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-blue-100' : 'bg-slate-200'}`}>
      {isBot ? <Bot size={13} className="text-blue-600" /> : <User size={13} className="text-slate-500" />}
    </div>
  );
}

function Bubble({ isBot, children }: { isBot: boolean; children: React.ReactNode }) {
  return (
    <div className={`max-w-[80%] px-4 py-2.5 text-sm rounded-2xl shadow-sm whitespace-pre-line leading-relaxed ${
      isBot
        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
        : 'bg-brand-900 text-white rounded-tr-sm'
    }`}>
      {children}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
        <Bot size={13} className="text-blue-600" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 shadow-sm">
        {[0, 150, 300].map(d => (
          <span
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce3"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
