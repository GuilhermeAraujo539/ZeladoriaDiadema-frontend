interface Props {
  pill:      string;
  pillColor?: string;
  title:     string;
  subtitle?: string;
  center?:   boolean;
}

export function SectionHeader({
  pill,
  pillColor = 'bg-brand-50 text-brand-700',
  title,
  subtitle,
  center = true,
}: Props) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${pillColor}`}>
        {pill}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{title}</h2>
      {subtitle && (
        <p className={`text-slate-500 text-base ${center ? 'max-w-lg mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
