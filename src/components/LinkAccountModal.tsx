import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { X, Mail, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';

interface LinkAccountModalProps {
  onClose: () => void;
  onLinked?: () => void;
}

export function LinkAccountModal({ onClose, onLinked }: LinkAccountModalProps) {
  const { linkToEmail, linkToGoogle, isAnonymous } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await linkToEmail(email.trim().toLowerCase(), password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      onLinked?.();
      onClose();
    }, 2000);
  };

  const handleGoogleLink = async () => {
    setLoading(true);
    setError('');
    const { error: err } = await linkToGoogle();
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-cyan-500/25 focus:border-brand-600';

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Cuenta vinculada</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Tu cuenta anonima ahora esta asociada a {email}. Podras acceder desde cualquier dispositivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-brand-800 px-8 pt-8 pb-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-brand-300" />
            <h2 className="text-xl font-bold text-white">Guardar mi cuenta</h2>
          </div>
          <p className="text-brand-200 text-sm">
            Vincula tu sesion anonima con un correo o Google para no perder tus postulaciones y mensajes.
          </p>
        </div>

        <div className="p-6">
          {!isAnonymous && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Tu cuenta ya esta vinculada.
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLink}
            disabled={loading || !isAnonymous}
            className="w-full py-3 border border-slate-200 hover:bg-brand-50/40 disabled:opacity-50 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-3 mb-5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Vincular con Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">o</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleEmailLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Correo electronico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Nueva contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" required className={`${inputClass} pl-10`} />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || !isAnonymous} className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Vincular cuenta'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            Tus postulaciones, mensajes y favoritos existentes se conservaran automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
