interface Props {
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}


export function Logo({ variant = 'full', className = '' }: Props) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {variant !== 'text' && (
        <img
          src="/logo.png"
          alt="Brasão da Prefeitura de Diadema"
          className="h-10 w-auto object-contain flex-shrink-0"
        />
      )}
      {variant !== 'icon' && (
        <div className="leading-none">
          <p className="text-white/60 text-[9px] font-semibold tracking-[0.2em] uppercase">
            Prefeitura de
          </p>
          <p className="text-white font-extrabold text-[18px] tracking-tight leading-tight">
            DIADEMA
          </p>
          <p className="text-gold text-[9px] font-semibold tracking-[0.15em] uppercase">
            Trabalhando por Diadema
          </p>
        </div>
      )}
    </div>
  );
}
