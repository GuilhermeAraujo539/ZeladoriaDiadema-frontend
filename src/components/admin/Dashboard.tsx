import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import type { Chamado } from '@/types';

const CAT_COLORS: Record<string, string> = {
  Buraco: '#ef4444',
  Iluminação: '#f59e0b',
  Vazamento: '#3b82f6',
  Lixo: '#10b981',
  Árvore: '#059669',
  Outro: '#8b5cf6',
};

const STATUS_COLORS: Record<string, string> = {
  'Aberto': '#3b82f6',
  'Em andamento': '#f59e0b',
  'Resolvido': '#10b981',
};

interface Props { chamados: Chamado[] }

export function Dashboard({ chamados }: Props) {
  const total = chamados.length;
  const aberto = chamados.filter(c => c.status === 'Aberto').length;
  const andamento = chamados.filter(c => c.status === 'Em andamento').length;
  const resolvido = chamados.filter(c => c.status === 'Resolvido').length;

  const byCategoria = chamados.reduce<Record<string, number>>((acc, c) => {
    acc[c.categoria] = (acc[c.categoria] || 0) + 1;
    return acc;
  }, {});
  const categoriaData = Object.entries(byCategoria).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Aberto', value: aberto },
    { name: 'Em andamento', value: andamento },
    { name: 'Resolvido', value: resolvido },
  ];

  const tendenciaData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const count = chamados.filter(c => {
      const cd = new Date(c.created_at);
      return (
        cd.getDate() === d.getDate() &&
        cd.getMonth() === d.getMonth() &&
        cd.getFullYear() === d.getFullYear()
      );
    }).length;
    return { label, Chamados: count };
  });

  const STAT_CARDS = [
    { label: 'Total', value: total, color: 'text-slate-800', bg: 'bg-slate-100' },
    { label: 'Abertos', value: aberto, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Em andamento', value: andamento, color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'Resolvidos', value: resolvido, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Por Categoria</h3>
          {categoriaData.length === 0
            ? <p className="text-slate-400 text-sm text-center py-8">Sem dados</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoriaData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoriaData.map(entry => (
                      <Cell key={entry.name} fill={CAT_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} chamados`, '']} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Por Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v} chamados`, '']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map(entry => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Chamados nos últimos 14 dias</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={tendenciaData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="Chamados"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#grad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
