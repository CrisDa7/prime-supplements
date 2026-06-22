export default function Topbar({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between px-7 pl-14 md:pl-7 py-4 border-b border-[#1f1f1f] bg-[#111] shrink-0">
      <div>
        <h1 className="text-lg font-bold text-[#e8e8e8]">{title}</h1>
        <p className="text-xs text-[#555] mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="bg-prime-blue text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wide">
          PRO
        </span>
      </div>
    </header>
  );
}
