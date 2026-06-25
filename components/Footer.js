import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white mt-8">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
        <Shield className="w-3.5 h-3.5" />
        <span>SMTP.BANDING — Secure WhatsApp Appeal Gateway</span>
      </div>
    </footer>
  );
}
