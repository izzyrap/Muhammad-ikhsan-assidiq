import { CheckCircle, Loader } from 'lucide-react';

export default function ProgressBar({ progress, isComplete }) {
  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex justify-between items-center">
        <span className="text-cyber-300 text-xs tracking-wider">
          {isComplete ? 'TERKIRIM' : 'MENGIRIM...'}
        </span>
        <span className="text-cyber-400 text-sm font-mono">{progress}%</span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-cyber-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete 
              ? 'bg-green-500 animate-glow' 
              : 'bg-gradient-to-r from-cyber-300 to-blue-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Detail Bar */}
      <div className="w-full h-1 bg-cyber-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyber-500 rounded-full transition-all duration-1000"
          style={{ 
            width: `${progress}%`,
            animation: 'pulse 1.5s infinite'
          }}
        />
      </div>
      
      {isComplete && (
        <div className="flex items-center gap-2 text-green-400 animate-slide-up">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Email berhasil dikirim ke WhatsApp Support</span>
        </div>
      )}
    </div>
  );
}