import { MessageCircle, Zap, ClipboardCheck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/StatCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { StepCard } from '@/components/ui/StepCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ChatBot } from '@/components/chatbot/ChatBot';

const STATS = [
  { value: '4.2k+', label: 'Chamados registrados' },
  { value: '87%', label: 'Taxa de resolução' },
  { value: '1.8k', label: 'Cidadãos atendidos' },
  { value: '<48h', label: 'Tempo médio de resp.' },
] as const;

const CATEGORIAS = [
  { emoji: '🕳️', nome: 'Buraco', desc: 'Pavimentação danificada em ruas e calçadas' },
  { emoji: '💡', nome: 'Iluminação', desc: 'Postes apagados ou com defeito' },
  { emoji: '💧', nome: 'Vazamento', desc: 'Água ou esgoto a céu aberto' },
  { emoji: '🗑️', nome: 'Lixo', desc: 'Descarte irregular e acúmulo de entulho' },
  { emoji: '🌳', nome: 'Árvore', desc: 'Galhos perigosos, árvores caídas ou raízes' },
  { emoji: '⚠️', nome: 'Outro', desc: 'Outros problemas de infraestrutura urbana' },
] as const;

const STEPS = [
  {
    number: '01',
    icon: <MessageCircle className="text-brand-600" size={28} />,
    iconBg: 'bg-brand-50',
    title: 'Relate pelo Chatbot',
    desc: 'Informe seu nome, WhatsApp e descreva o problema encontrado no município.',
  },
  {
    number: '02',
    icon: <Zap className="text-purple-600" size={28} />,
    iconBg: 'bg-purple-50',
    title: 'IA Classifica Automaticamente',
    desc: 'Nossa IA analisa a descrição e categoriza o problema em segundos.',
  },
  {
    number: '03',
    icon: <ClipboardCheck className="text-emerald-600" size={28} />,
    iconBg: 'bg-emerald-50',
    title: 'Protocolo + WhatsApp',
    desc: 'Receba um número de protocolo único e atualizações direto no WhatsApp.',
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        links={[
          { label: 'Como funciona', href: '#como-funciona', isAnchor: true },
          { label: 'Categorias', href: '#categorias', isAnchor: true },
        ]}
        rightSlot={
          <Link
            to="/admin"
            className="text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg
                       transition font-medium text-sm whitespace-nowrap"
          >
            Painel Admin
          </Link>
        }
      />

      <section className="relative pt-[calc(4rem+4px)] overflow-hidden bg-brand-900">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                          text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap size={14} className="text-gold" />
            Sistema Oficial de Zeladoria Urbana — Diadema
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Reporte problemas urbanos{' '}
            <span className="bg-gradient-to-r from-gold via-gold-light to-gold
                             bg-clip-text text-transparent">
              com agilidade
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            O chatbot inteligente da Prefeitura de Diadema para registrar ocorrências!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#chatbot-area"
              className="inline-flex items-center justify-center gap-2
             bg-blue-600 hover:bg-blue-700
             text-white font-bold px-8 py-3.5
             rounded-xl transition shadow-lg shadow-black/30 text-base"
            >
              <MessageCircle size={18} />
              Registrar uma Ocorrência
            </a>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 border border-white/20
                         text-white/80 hover:text-white hover:border-white/40 px-8 py-3.5
                         rounded-xl font-semibold transition text-base"
            >
              Painel Administrativo →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl
                          overflow-hidden mt-16 border border-white/10">
            {STATS.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionHeader
            pill="Como Funciona"
            pillColor="bg-emerald-50 text-emerald-700"
            title="Simples, rápido e eficiente"
            subtitle="Em menos de 2 minutos você registra o chamado e recebe um protocolo."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(s => <StepCard key={s.number} {...s} />)}
          </div>
        </div>
      </section>

      <section id="categorias" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionHeader
            pill="Categorias de Ocorrência"
            pillColor="bg-brand-50 text-brand-700"
            title="O que você pode reportar?"
            subtitle="Todas as necessidades de zeladoria urbana do município de Diadema."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIAS.map(c => (
              <CategoryCard
                key={c.nome}
                {...c}
                onClick={() => document.getElementById('chatbot-area')?.scrollIntoView({ behavior: 'smooth' })}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="chatbot-area" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <SectionHeader
              pill="Registre Agora"
              pillColor="bg-gold/10 text-yellow-700"
              title="Diadema merece uma cidade cuidada."
              subtitle="Clique no botão no canto inferior direito para abrir o chatbot e registrar sua ocorrência em menos de 2 minutos."
              center={false}
            />
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-500 leading-relaxed">
                Seus dados são usados exclusivamente para acompanhamento e notificações
                de status do chamado, em conformidade com a LGPD.
              </p>
            </div>
          </div>

          <div className="bg-brand-900 rounded-2xl p-8 text-center w-full max-w-xs flex-shrink-0
                          border border-white/10 shadow-xl">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">Assistente Online</h3>
            <p className="text-white/50 text-sm mb-6">
              Clique no botão azul no canto inferior direito da tela.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-emerald-300
                            bg-emerald-900/40 px-4 py-2 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Disponível 24h
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot />
    </div>
  );
}
