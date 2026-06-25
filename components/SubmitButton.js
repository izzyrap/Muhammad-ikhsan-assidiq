import { Send, Loader2 } from 'lucide-react';

export default function SubmitButton({ isLoading, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all
        ${disabled || isLoading
          ? 'bg-surface-200 text-gray-400 cursor-not-allowed'
          : 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white shadow-md shadow-brand-100'
        }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          MENGIRIM...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          KIRIM BANDING
        </>
      )}
    </button>
  );
}
