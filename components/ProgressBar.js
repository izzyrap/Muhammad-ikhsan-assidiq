import { CheckCircle } from 'lucide-react';

export default function ProgressBar({ progress, isComplete }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-medium">
        <span className={isComplete ? 'text-green-600' : 'text-brand-500'}>
          {isComplete ? '✅ Semua email terkirim!' : 'Mengirim email...'}
        </span>
        <span className={isComplete ? 'text-green-600' : 'text-brand-500'}>
          {progress}%
        </span>
      </div>
      <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-brand-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {isComplete && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-2">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">
            Email banding berhasil dikirim dari semua akun!
          </p>
        </div>
      )}
    </div>
  );
}
