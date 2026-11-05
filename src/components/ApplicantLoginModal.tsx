import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { X, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';

interface ApplicantLoginModalProps {
  onClose: () => void;
}

export function ApplicantLoginModal({ onClose }: ApplicantLoginModalProps) {
  const { signInApplicant, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signInApplicant(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-[#2563EB]/20 focus:border-[#2563EB]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] px-8 pt-8 pb-6">
          <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <LogIn className="w-6 h-6 text-[#93C5FD]" />
            <h2 className="text-xl font-bold text-white">Iniciar sesion</h2>
          </div>
          <p className="text-[#BFDBFE] text-sm">
            Entra a tu cuenta para ver tus postulaciones desde cualquier dispositivo.
          </p>
        </div>

        <div className="p-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-3 mb-5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">o</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contrasena" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            {error && (
              <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Iniciar sesion'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            Si postulaste como invitado en este navegador, vincula primero tu cuenta para no perder esas postulaciones.
          </p>
        </div>
      </div>
    </div>
  );
}
