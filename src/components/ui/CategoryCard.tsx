interface Props {
  emoji:    string;
  nome:     string;
  desc:     string;
  onClick?: () => void;
}

export function CategoryCard({ emoji, nome, desc, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 flex items-start gap-4
                 hover:border-brand-600 hover:shadow-md transition text-left w-full group"
    >
      <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-slate-900 mb-0.5 text-sm md:text-base">{nome}</p>
        <p className="text-xs md:text-sm text-slate-500 leading-snug">{desc}</p>
      </div>
    </button>
  );
}
