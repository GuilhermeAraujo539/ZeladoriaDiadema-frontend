import { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Clock } from 'lucide-react';
import { StatusBadge }  from './StatusBadge';
import { updateStatus, getHistorico } from '@/lib/api';
import type { Chamado, ChamadoStatus, HistoricoAlteracao } from '@/types';

const STATUSES: ChamadoStatus[] = ['Aberto', 'Em andamento', 'Resolvido'];

const CAT_EMOJI: Record<string, string> = {
  Buraco:'🕳️', Iluminação:'💡', Vazamento:'💧',
  Lixo:'🗑️', Árvore:'🌳', Outro:'⚠️',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit',
  });

interface Props {
  chamado:   Chamado;
  onClose:   () => void;
  onUpdated: (c: Chamado) => void;
}

export function ChamadoModal({ chamado, onClose, onUpdated }: Props) {
  const [status,    setStatus]    = useState<ChamadoStatus>(chamado.status);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [historico, setHistorico] = useState<HistoricoAlteracao[]>([]);

  useEffect(() => {
    getHistorico(chamado.id).then(setHistorico).catch(() => {});
  }, [chamado.id]);

  async function handleSave() {
    if (status === chamado.status) { onClose(); return; }
    setSaving(true); setError('');
    try {
      const updated = await updateStatus(chamado.id, status);
      onUpdated(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 z-10">
          <div>
            <code className="text-sm font-mono font-bold text-slate-800">{chamado.protocolo}</code>
            <div className="mt-1"><StatusBadge status={chamado.status} size="sm" /></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <span className="text-2xl">{CAT_EMOJI[chamado.categoria] ?? '⚠️'}</span>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Categoria</p>
              <p className="font-semibold text-slate-800">{chamado.categoria}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Nome',       value: chamado.nome },
              { label: 'WhatsApp',   value: chamado.contato },
              { label: 'Aberto em',  value: fmt(chamado.created_at) },
              { label: 'Atualizado', value: fmt(chamado.updated_at) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
                <p className="text-slate-800 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {chamado.latitude != null && chamado.longitude != null && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <MapPin size={14} className="text-blue-500 flex-shrink-0" />
              <span>Lat: <strong>{chamado.latitude.toFixed(5)}</strong> &nbsp; Lng: <strong>{chamado.longitude.toFixed(5)}</strong></span>
              <a href={`https://www.google.com/maps?q=${chamado.latitude},${chamado.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="ml-auto text-blue-600 hover:underline text-xs whitespace-nowrap">
                Ver no mapa ↗
              </a>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Descrição</p>
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">{chamado.descricao}</p>
          </div>

          {chamado.imagem_url && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Foto</p>
              <img src={chamado.imagem_url} alt="Foto do chamado" className="w-full h-48 object-cover rounded-xl border border-slate-100" />
              <a href={chamado.imagem_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Ver imagem completa ↗</a>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Alterar status</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                    status === s ? 'bg-brand-900 text-white border-brand-900' : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}>{s}</button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-brand-900 hover:bg-blue-900 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          {historico.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                <Clock size={13} /> Histórico de alterações
              </p>
              <div className="space-y-2">
                {historico.map(h => (
                  <div key={h.id} className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 rounded-xl px-4 py-2.5">
                    <div className="flex-1">
                      {h.status_anterior
                        ? <><span className="text-slate-400">{h.status_anterior}</span> → <strong>{h.status_novo}</strong></>
                        : <><strong>{h.status_novo}</strong> <span className="text-slate-400">(criado)</span></>}
                    </div>
                    <div className="text-slate-400 whitespace-nowrap">
                      {new Date(h.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
