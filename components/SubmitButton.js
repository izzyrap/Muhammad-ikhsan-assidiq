import { Send, Loader } from 'lucide-react';

export default function SubmitButton({ isLoading, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-4 rounded-lg font-bold tracking-wider text-sm flex items-center justify-center gap-3 transition-all ${
        disabled || isLoading
          ? 'bg-cyber-700 text-cyber-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-cyber-500 to-cyber-400 text-white hover:from-cyber-400 hover:to-cyber-300 shadow-lg hover:shadow-cyber-300/20'
      }`}
    >
      {isLoading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>MENGIRIM...</span>
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          <span>KIRIM BANDING</span>
        </>
      )}
    </button>
  );
}