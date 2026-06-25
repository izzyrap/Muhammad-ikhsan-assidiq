import { Phone, Globe } from 'lucide-react';

const countryCodes = [
  { code: '+62', country: 'ID' },
  { code: '+1',  country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+55', country: 'BR' },
  { code: '+60', country: 'MY' },
  { code: '+65', country: 'SG' },
  { code: '+63', country: 'PH' },
  { code: '+66', country: 'TH' },
  { code: '+84', country: 'VN' },
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
  { code: '+7',  country: 'RU' },
];

export default function PhoneInput({ selectedCode, setSelectedCode, phoneNumber, setPhoneNumber }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Phone className="w-4 h-4 text-brand-500" />
        Nomor Telepon
      </label>

      <div className="flex gap-2">
        {/* Country Code */}
        <div className="relative flex items-center bg-surface-50 border border-surface-200 rounded-xl px-3 py-3 gap-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <Globe className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer appearance-none pr-5 min-w-0"
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.country})
              </option>
            ))}
          </select>
          <span className="absolute right-2 pointer-events-none text-gray-400 text-xs">▾</span>
        </div>

        {/* Phone Number */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="81234567890"
          maxLength={15}
          className="flex-1 min-w-0 bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
        />
      </div>
    </div>
  );
}
