import { Mail, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 rounded-lg p-1.5">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">
            SMTP<span className="text-brand-500">.BANDING</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-brand-500 text-xs font-medium bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
          <Zap className="w-3.5 h-3.5" />
          <span>SECURE MAILER</span>
        </div>
      </div>
    </header>
  );
}
