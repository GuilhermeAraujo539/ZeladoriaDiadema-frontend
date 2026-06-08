import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw, Search, ChevronUp, ChevronDown,
  LogOut, LayoutDashboard, List, Map, Wifi, WifiOff,
} from 'lucide-react';

import { getChamados } from '@/lib/api';
import { clearStoredToken } from '@/lib/supabase';
import { socket } from '@/lib/socket';

import { Logo } from '@/components/ui/Logo';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ChamadoModal } from '@/components/admin/ChamadoModal';
import { Dashboard } from '@/components/admin/Dashboard';
import { ChamadoMap } from '@/components/admin/ChamadoMap';

import type { Chamado, ChamadoStatus, ChamadoCategoria } from '@/types';

type Tab = 'dashboard' | 'chamados' | 'mapa';
type SortKey = 'created_at' | 'nome' | 'categoria' | 'status';

const CAT_EMOJI: Record<string, string> = {
  Buraco: '🕳️', Iluminação: '💡', Vazamento: '💧',
  Lixo: '🗑️', Árvore: '🌳', Outro: '⚠️',
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { id: 'chamados', label: 'Chamados', icon: <List size={15} /> },
  { id: 'mapa', label: 'Mapa', icon: <Map size={15} /> },
];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ChevronUp size={13} className="text-slate-300" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="text-brand-600" />
    : <ChevronDown size={13} className="text-brand-600" />;
}

export default function Admin() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ChamadoStatus | 'Todos'>('Todos');
  const [filterCat, setFilterCat] = useState<ChamadoCategoria | 'Todas'>('Todas');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Chamado | null>(null);
  const [wsOn, setWsOn] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setChamados(await getChamados());
    } catch {
      setError('Não foi possível carregar os chamados. Backend online?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setWsOn(true));
    socket.on('disconnect', () => setWsOn(false));
    socket.on('chamado:novo', (c: Chamado) => setChamados(p => [c, ...p]));
    socket.on('chamado:atualizado', (c: Chamado) => {
      setChamados(p => p.map(x => x.id === c.id ? c : x));
      setSelected(s => (s?.id === c.id ? c : s));
    });
    return () => { socket.disconnect(); };
  }, []);

  function handleLogout() {
    clearStoredToken();
    navigate('/admin/login');
  }

  const filtered = useMemo(() => {
    let r = [...chamados];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        c.protocolo.toLowerCase().includes(q) ||
        c.contato.toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q),
      );
    }
    if (filterStatus !== 'Todos') r = r.filter(c => c.status === filterStatus);
    if (filterCat !== 'Todas') r = r.filter(c => c.categoria === filterCat);

    r.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [chamados, search, filterStatus, filterCat, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-brand-900 border-b border-white/10 sticky top-0 z-30">
        <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Logo />

          <div className="flex items-center gap-2 md:gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${wsOn
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-slate-500/15 text-slate-400'
              }`}>
              {wsOn ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{wsOn ? 'Tempo real' : 'Offline'}</span>
            </div>

            <Link
              to="/"
              className="hidden md:block text-slate-400 hover:text-white text-sm transition"
            >
              Ver site
            </Link>

            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm
                         border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg
                         transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-300 hover:text-red-400 text-sm
                         border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg
                         transition"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-6 w-fit shadow-sm">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.id
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <Dashboard chamados={chamados} />}

        {tab === 'chamados' && (
          <div className="space-y-4">

            <div className="bg-white rounded-2xl border border-slate-200 p-4
                            flex flex-wrap gap-3 items-center shadow-sm">
              <div className="flex-1 min-w-[180px] flex items-center gap-2
                              border border-slate-200 rounded-xl px-3 py-2">
                <Search size={15} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar nome, protocolo, contato..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent
                             text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as ChamadoStatus | 'Todos')}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm
                           text-slate-700 outline-none focus:ring-2 focus:ring-brand-200
                           bg-white"
              >
                <option>Todos</option>
                <option>Aberto</option>
                <option>Em andamento</option>
                <option>Resolvido</option>
              </select>

              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value as ChamadoCategoria | 'Todas')}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm
                           text-slate-700 outline-none focus:ring-2 focus:ring-brand-200
                           bg-white"
              >
                <option>Todas</option>
                {['Buraco', 'Iluminação', 'Vazamento', 'Lixo', 'Árvore', 'Outro'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {error && (
                <div className="p-8 text-center text-red-500 text-sm">{error}</div>
              )}

              {loading && !chamados.length ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Carregando chamados...
                </div>
              ) : !filtered.length ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Nenhum chamado encontrado para os filtros aplicados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50">
                        {([
                          { label: 'Protocolo', k: null },
                          { label: 'Nome', k: 'nome' },
                          { label: 'Categoria', k: 'categoria' },
                          { label: 'Status', k: 'status' },
                          { label: 'Data', k: 'created_at' },
                        ] as const).map(col => (
                          <th
                            key={col.label}
                            className="px-5 py-3.5 text-xs font-semibold text-slate-500
                                       uppercase tracking-wider whitespace-nowrap"
                          >
                            {col.k ? (
                              <button
                                onClick={() => handleSort(col.k as SortKey)}
                                className="flex items-center gap-1 hover:text-slate-800 transition"
                              >
                                {col.label}
                                <SortIcon
                                  active={sortKey === col.k}
                                  dir={sortDir}
                                />
                              </button>
                            ) : col.label}
                          </th>
                        ))}
                        <th className="px-5 py-3.5" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(c => (
                        <tr
                          key={c.id}
                          onClick={() => setSelected(c)}
                          className="hover:bg-slate-50 transition cursor-pointer"
                        >
                          <td className="px-5 py-4">
                            <code className="text-xs font-mono font-bold text-slate-700
                                             bg-slate-100 px-2 py-1 rounded">
                              {c.protocolo}
                            </code>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-800">{c.nome}</p>
                            <p className="text-xs text-slate-400">{c.contato}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5">
                              <span>{CAT_EMOJI[c.categoria]}</span>
                              <span className="text-slate-700">{c.categoria}</span>
                              {c.latitude != null && (
                                <span title="Com localização" className="text-brand-400">📍</span>
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={c.status} size="sm" />
                          </td>
                          <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: '2-digit', year: '2-digit',
                            })}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-brand-600 text-xs font-semibold hover:underline">
                              Ver detalhes →
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">
              {filtered.length} chamado{filtered.length !== 1 ? 's' : ''}
              {chamados.length !== filtered.length
                ? ` de ${chamados.length} total`
                : ''}
            </p>
          </div>
        )}

        {tab === 'mapa' && <ChamadoMap chamados={chamados} />}
      </div>

      {selected && (
        <ChamadoModal
          chamado={selected}
          onClose={() => setSelected(null)}
          onUpdated={updated => {
            setChamados(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
