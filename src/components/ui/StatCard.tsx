interface Props {
  value: string;
  label: string;
}

export function StatCard({ value, label }: Props) {
  return (
    <div className="bg-white/5 hover:bg-white/10 transition px-6 py-5 text-center">
      <p className="text-2xl md:text-3xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-white/40 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
