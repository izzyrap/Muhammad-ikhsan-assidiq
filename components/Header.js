import { Cpu, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-cyber-600 bg-cyber-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyber-300 animate-pulse-slow" />
          <span className="text-xl font-bold tracking-widest text-cyber-200">
            SMTP<span className="text-cyber-300">.BANDING</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-cyber-400 text-sm">
          <Zap className="w-4 h-4" />
          <span className="tracking-wider">SECURE MAILER</span>
        </div>
      </div>
    </header>
  );
}