import { Key, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function TokenInput({ token, setToken, isValid, setIsValid }) {
  const [showToken, setShowToken] = useState(false);

  const handleTokenChange = (value) => {
    setToken(value);
    if (value === '') setIsValid(null);
  };

  const handleVerify = () => {
    if (token.trim().length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Key className="w-4 h-4 text-brand-500" />
        Access Token
      </label>

      <div className="flex gap-2">
        {/* Token Field */}
        <div className={`flex-1 flex items-center gap-2 bg-surface-50 border rounded-xl px-3 py-3 transition-all
          ${isValid === true  ? 'border-green-400 ring-2 ring-green-100' :
            isValid === false ? 'border-red-400 ring-2 ring-red-100' :
            'border-surface-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100'}`}>
          <Lock className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="Masukkan token akses"
            className="flex-1 min-w-0 bg-transparent text-gray-800 text-sm placeholder-gray-400 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="text-xs text-brand-500 hover:text-brand-700 font-medium flex-shrink-0"
          >
            {showToken ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
        >
          VERIFY
        </button>
      </div>

      {isValid === true && (
        <p className="text-green-600 text-xs flex items-center gap-1 font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> Token valid
        </p>
      )}
      {isValid === false && (
        <p className="text-red-500 text-xs flex items-center gap-1 font-medium">
          <XCircle className="w-3.5 h-3.5" /> Token tidak valid
        </p>
      )}
    </div>
  );
}
