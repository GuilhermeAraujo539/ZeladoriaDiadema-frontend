import type { ChamadoStatus } from '@/types';

const STYLE: Record<ChamadoStatus, string> = {
  'Aberto':       'bg-blue-50   text-blue-700   border-blue-200',
  'Em andamento': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Resolvido':    'bg-emerald-50 text-emerald-700 border-emerald-200',
};
const DOT: Record<ChamadoStatus, string> = {
  'Aberto':       'bg-blue-500',
  'Em andamento': 'bg-yellow-500',
  'Resolvido':    'bg-emerald-500',
};

interface Props { status: ChamadoStatus; size?: 'sm' | 'md' }

export function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${STYLE[status]} ${
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[status]}`} />
      {status}
    </span>
  );
}
