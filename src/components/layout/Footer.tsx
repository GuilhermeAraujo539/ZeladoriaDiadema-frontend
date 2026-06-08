import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 border-t border-white/5">
      <div className="h-0.5 bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row
                      justify-between items-center gap-8">
        <Logo />

        <div className="text-center md:text-right text-xs text-white/40 space-y-1.5">
          <p className="text-white/60 font-medium">Prefeitura Municipal de Diadema</p>
          <p>Av. Antônio Piranga, 477 — Centro, Diadema — SP</p>
          <p>CEP 09911-220 &nbsp;·&nbsp; (11) 4056-9000</p>
          <p className="pt-1 text-white/25">&copy; {year} — Sistema de Zeladoria Urbana</p>
        </div>
      </div>
    </footer>
  );
}
