import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface NavLink {
  label:     string;
  href:      string;
  isAnchor?: boolean; 
}

interface Props {
  links?:      NavLink[];
  rightSlot?:  React.ReactNode;
  fixed?:      boolean;
}


export function Navbar({ links = [], rightSlot, fixed = true }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`${fixed ? 'fixed top-0 inset-x-0 z-30' : 'relative'} bg-brand-900 border-b border-white/10`}>
      <div className="h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Logo />

        {links.length > 0 && (
          <div className="hidden md:flex items-center gap-6">
            {links.map(({ label, href, isAnchor }) =>
              isAnchor ? (
                <a
                  key={label}
                  href={href}
                  className="text-white/60 hover:text-white text-sm font-medium transition"
                >
                  {label}
                </a>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="text-white/60 hover:text-white text-sm font-medium transition"
                >
                  {label}
                </a>
              ),
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {rightSlot}

          {links.length > 0 && (
            <button
              onClick={() => setOpen(v => !v)}
              className="md:hidden p-2 text-white/70 hover:text-white transition"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {open && links.length > 0 && (
        <div className="md:hidden bg-brand-950/98 border-t border-white/10 px-4 py-3 space-y-1 animate-fade-in">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white text-sm py-2.5 border-b border-white/5 last:border-0"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
