import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;

  const bg = toast.type === 'success'
    ? 'bg-[#182210] border-[#2d5c1a] text-[#7ec84e]'
    : 'bg-[#221010] border-[#5c1a1a] text-[#e05454]';

  return (
    <div className={`fixed bottom-6 right-6 border px-5 py-3 rounded-lg text-sm z-[9999] shadow-lg animate-slide-in ${bg}`}>
      {toast.msg}
    </div>
  );
}
