import { useState } from 'react';
import Head from 'next/head';
import { Cpu, Zap, Shield, Globe, Send, CheckCircle, AlertCircle } from 'lucide-react';
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
    // Validasi
    if (!phoneNumber || phoneNumber.length < 6) {
      toast.error('Masukkan nomor telepon yang valid');
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

    // Simulasi progress di client
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
        toast.success('Email banding berhasil dikirim!');
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
        <title>SMTP.BANDING - WhatsApp Account Appeal</title>
        <meta name="description" content="Secure SMTP mailer for WhatsApp account appeals" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-cyber-900 via-cyber-800 to-cyber-900 flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          {/* Hero */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-cyber-100 mb-4">
              <span className="text-cyber-300">SMTP</span> BANDING
            </h1>
            <p className="text-cyber-400 text-sm tracking-wider max-w-md mx-auto">
              Secure email gateway untuk pengajuan banding akun WhatsApp
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
            <div className="bg-cyber-800 border border-cyber-600 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-cyber-300 flex-shrink-0" />
              <span className="text-cyber-400 text-xs tracking-wider">ENKRIPSI END-TO-END</span>
            </div>
            <div className="bg-cyber-800 border border-cyber-600 rounded-lg p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyber-300 flex-shrink-0" />
              <span className="text-cyber-400 text-xs tracking-wider">PENGIRIMAN INSTAN</span>
            </div>
            <div className="bg-cyber-800 border border-cyber-600 rounded-lg p-4 flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyber-300 flex-shrink-0" />
              <span className="text-cyber-400 text-xs tracking-wider">ROTASI OTOMATIS</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-cyber-800 border border-cyber-600 rounded-2xl p-6 md:p-8 space-y-6 animate-slide-up">
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

            {/* Divider */}
            <div className="border-t border-cyber-600" />

            {/* Submit */}
            <SubmitButton
              isLoading={isLoading}
              disabled={!phoneNumber || !token || phoneNumber.length < 6}
              onClick={handleSubmit}
            />

            {/* Progress */}
            {showProgress && (
              <ProgressBar progress={progress} isComplete={isComplete} />
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-cyber-800/50 border border-cyber-600/50 rounded-xl p-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-cyber-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-cyber-200 text-sm font-semibold tracking-wider mb-2">INFORMASI</h3>
                <p className="text-cyber-500 text-xs leading-relaxed">
                  Tools ini digunakan untuk mengirim email banding ke WhatsApp Support secara otomatis. 
                  Nomor Anda akan diproses melalui gateway SMTP yang aman dengan rotasi akun Gmail otomatis.
                  Pastikan nomor yang dimasukkan benar dan token akses valid.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a2332',
            color: '#93c5fd',
            border: '1px solid #2d4a6b',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}
