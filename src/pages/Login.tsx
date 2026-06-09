import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { adminLogin, setStoredToken } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';
import { Footer } from '@/components/layout/Footer';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = await adminLogin(email, password);
      setStoredToken(token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">


      <header className="bg-brand-900 py-5 px-6 flex justify-center">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 mb-4"
            >
              <img
                src="/IconeDiadema.png"
                alt="Prefeitura de Diadema"
                className="h-10 w-auto object-contain flex-shrink-0"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Acesso Restrito
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Sistema de Zeladoria Urbana — Diadema
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-700 to-brand-500" />

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  E-mail institucional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="admin@diadema.sp.gov.br"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-600/30
                             focus:border-brand-600 transition bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm pr-10
                               focus:outline-none focus:ring-2 focus:ring-brand-600/30
                               focus:border-brand-600 transition bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                               hover:text-slate-600 transition"
                    aria-label={showPwd ? 'Esconder senha' : 'Mostrar senha'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-900 hover:bg-brand-800 text-white py-3 rounded-xl
                           font-bold text-sm transition disabled:opacity-50
                           flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Acesso exclusivo para servidores da Prefeitura de Diadema
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
