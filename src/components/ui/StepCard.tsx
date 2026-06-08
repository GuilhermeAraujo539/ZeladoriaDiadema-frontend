interface Props {
  number:  string;
  icon:    React.ReactNode;
  iconBg:  string;
  title:   string;
  desc:    string;
}

export function StepCard({ number, icon, iconBg, title, desc }: Props) {
  return (
    <div className="relative group">
      <div className="absolute -top-3 left-6 bg-brand-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full z-10">
        {number}
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 pt-10 text-center
                      hover:border-brand-300 hover:shadow-md transition h-full">
        <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mx-auto mb-5
                         group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-slate-900 font-bold text-lg mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
