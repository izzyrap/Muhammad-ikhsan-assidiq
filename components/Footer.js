import { MessageCircle, Shield, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cyber-600 mt-16 py-8">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <Terminal className="w-5 h-5 text-cyber-400" />
          <span className="text-cyber-400 text-sm tracking-wider">© 2024 SMTP.BANDING</span>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <a href="https://t.me/your_support_username" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-2 text-cyber-400 hover:text-cyber-200 transition-colors text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>Support</span>
          </a>
        </div>
        
        <div className="flex items-center justify-center md:justify-end gap-2">
          <Shield className="w-4 h-4 text-cyber-500" />
          <span className="text-cyber-500 text-xs">Encrypted Connection</span>
        </div>
      </div>
    </footer>
  );
}
