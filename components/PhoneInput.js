import { Phone, Globe } from 'lucide-react';

const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+62', country: 'ID' },
  { code: '+91', country: 'IN' },
  { code: '+55', country: 'BR' },
  { code: '+7', country: 'RU' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+82', country: 'KR' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+39', country: 'IT' },
  { code: '+34', country: 'ES' },
  { code: '+52', country: 'MX' },
  { code: '+54', country: 'AR' },
  { code: '+61', country: 'AU' },
  { code: '+64', country: 'NZ' },
  { code: '+65', country: 'SG' },
  { code: '+60', country: 'MY' },
  { code: '+63', country: 'PH' },
  { code: '+66', country: 'TH' },
  { code: '+84', country: 'VN' },
];

export default function PhoneInput({ selectedCode, setSelectedCode, phoneNumber, setPhoneNumber }) {
  return (
    <div className="space-y-3 animate-slide-up">
      <label className="flex items-center gap-2 text-cyber-300 text-sm tracking-wider">
        <Phone className="w-4 h-4" />
        NOMOR TELEPON
      </label>
      
      <div className="flex gap-3">
        {/* Country Code Select */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-cyber-700 border border-cyber-500 rounded-lg px-3 py-3 cursor-pointer hover:border-cyber-300 transition-colors">
            <Globe className="w-4 h-4 text-cyber-400" />
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="bg-transparent text-cyber-100 outline-none cursor-pointer appearance-none pr-4"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code} className="bg-cyber-800">
                  {c.code} ({c.country})
                </option>
              ))}
            </select>
            <span className="absolute right-2 pointer-events-none text-cyber-400">▾</span>
          </div>
        </div>

        {/* Phone Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="81234567890"
          maxLength={15}
          className="flex-1 bg-cyber-700 border border-cyber-500 rounded-lg px-4 py-3 text-cyber-100 placeholder-cyber-500 outline-none focus:border-cyber-300 focus:ring-1 focus:ring-cyber-300 transition-all"
        />
      </div>
    </div>
  );
}