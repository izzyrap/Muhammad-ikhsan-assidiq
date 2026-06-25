import { useState } from 'react';
import Head from 'next/head';
import { Shield, Zap, Globe, Info } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PhoneInput from '../components/PhoneInput';
import TokenInput from '../components/TokenInput';
import ProgressBar from '../components/ProgressBar';
import SubmitButton from '../components/SubmitButton';

export default function Home() {
  const [selectedCode, setSelectedCode] = useState('+62');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handleSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 6) {
      toast.error('Masukkan nomor whatsapp yang valid');
      return;
    }
    if (!token || token.trim() === '') {
      toast.error('Masukkan access token');
      return;
    }

    setIsLoading(true);
    setShowProgress(true);
    setProgress(0);
    setIsComplete(false);

    let clientProgress = 0;
    const progressInterval = setInterval(() => {
      clientProgress += Math.floor(Math.random() * 10) + 3;
      if (clientProgress > 85) {
        clientProgress = 85;
        clearInterval(progressInterval);
      }
      setProgress(Math.min(clientProgress, 85));
    }, 400);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, countryCode: selectedCode, token }),
      });

      const data = await res.json();
      clearInterval(progressInterval);

      if (data.success) {
        setProgress(100);
        setIsComplete(true);
        toast.success(data.message || 'Eksekusi Nomor WhatsApp Berhasil');
        setPhoneNumber('');
      } else {
        setShowProgress(false);
        setProgress(0);
        toast.error(data.message || 'Gagal mengirim email');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setShowProgress(false);
      setProgress(0);
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>FIX MERAH - RAINE OFFC</title>
        <meta name="description" content="Fix Merah Akun WhatsApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-surface-100 flex flex-col">
        <Header />

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">

          {/* Badge cards */}
          <div className="grid grid-cols-3 gap-2 animate-fade-in">
            <div className="bg-white border border-surface-200 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center shadow-sm">
              <Shield className="w-5 h-5 text-brand-500" />
              <span className="text-gray-600 text-xs font-medium leading-tight">Privasi Terjamin Aman</span>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center shadow-sm">
              <Zap className="w-5 h-5 text-brand-500" />
              <span className="text-gray-600 text-xs font-medium leading-tight">Mudah Digunakan</span>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center shadow-sm">
              <Globe className="w-5 h-5 text-brand-500" />
              <span className="text-gray-600 text-xs font-medium leading-tight">Allways Update</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-5 shadow-sm animate-slide-up">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Fix Merah <span className="text-brand-500">WhatsApp</span>
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Isi Nomor WhatsApp Dibawah Lalu Isi Token Yang Sudah Dikasih Admin Dan Klik "Eksekusi"
              </p>
            </div>

            <div className="h-px bg-surface-100" />

            <PhoneInput
              selectedCode={selectedCode}
              setSelectedCode={setSelectedCode}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
            />

            <TokenInput
              token={token}
              setToken={setToken}
              isValid={isValid}
              setIsValid={setIsValid}
            />

            <div className="h-px bg-surface-100" />

            <SubmitButton
              isLoading={isLoading}
              disabled={!phoneNumber || !token || phoneNumber.length < 6}
              onClick={handleSubmit}
            />

            {showProgress && (
              <ProgressBar progress={progress} isComplete={isComplete} />
            )}
          </div>

          {/* Info */}
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex gap-3 animate-fade-in">
            <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-brand-700 text-xs leading-relaxed">
              Jika Tidak Berhasil Atau Akun WhatsApp Masih Merah Silakan Langsung Hubungi
              Admin Melalui Telegram Yang Sudah Tertera.
            </p>
          </div>

        </main>

        <Footer />
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}
