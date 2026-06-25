import { Key, Lock } from 'lucide-react';
import { useState } from 'react';

export default function TokenInput({ token, setToken, isValid, setIsValid }) {
  const [showToken, setShowToken] = useState(false);

  const handleTokenChange = (value) => {
    setToken(value);
    if (value === '') {
      setIsValid(null);
    }
  };

  const handleVerify = () => {
    // Verifikasi token (akan dicek juga di server)
    if (token.trim().length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="space-y-3 animate-slide-up">
      <label className="flex items-center gap-2 text-cyber-300 text-sm tracking-wider">
        <Key className="w-4 h-4" />
        ACCESS TOKEN
      </label>
      
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 bg-cyber-700 border border-cyber-500 rounded-lg px-3 py-3 focus-within:border-cyber-300 transition-colors">
            <Lock className="w-4 h-4 text-cyber-400" />
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="Masukkan token akses"
              className="flex-1 bg-transparent text-cyber-100 placeholder-cyber-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-cyber-500 hover:text-cyber-300 text-xs"
            >
              {showToken ? 'HIDE' : 'SHOW'}
            </button>
          </div>
        </div>
        <button
          onClick={handleVerify}
          className="px-4 py-3 bg-cyber-600 border border-cyber-500 rounded-lg text-cyber-200 hover:bg-cyber-500 transition-colors text-sm tracking-wider"
        >
          VERIFY
        </button>
      </div>
      
      {isValid === true && (
        <p className="text-green-400 text-xs flex items-center gap-1">● Token valid</p>
      )}
      {isValid === false && (
        <p className="text-red-400 text-xs flex items-center gap-1">● Token tidak valid</p>
      )}
    </div>
  );
}