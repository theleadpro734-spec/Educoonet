import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { EduConnetLogo } from './EduConnetLogo';
import { supabase } from '../lib/supabase';
import { Building2, Lock, AtSign, Eye, EyeOff, AlertCircle, ArrowLeft, Mail, KeyRound } from 'lucide-react';

export function InstitutionAccessPage() {
  const { signInInstitution } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signInInstitution(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + '/instituciones/acceso',
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setForgotSent(true);
  };

  const handleTestLogin = () => {
    setEmail('liceo.romero.garcia@educonnet.com');
    setPassword('RomeroGarcia2026');
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const inputClass = 'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-brand-600/20 focus:border-brand-600';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-brand-50">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={goHome} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <EduConnetLogo size="sm" variant="light" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/25">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Acceso para instituciones</h1>
            <p className="text-slate-500 text-sm mt-1">
              {forgotMode ? 'Recupera tu acceso' : 'Ingresa con las credenciales de tu institucion'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
            {forgotMode ? (
              forgotSent ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Correo enviado</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Revisa tu correo {email} para restablecer tu contrasena.
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setForgotSent(false); }}
                    className="mt-5 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Volver a iniciar sesion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">Correo electronico</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@institucion.edu" required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enviar enlace de recuperacion'}
                  </button>
                  <button type="button" onClick={() => setForgotMode(false)} className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Volver a iniciar sesion
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Correo electronico</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@institucion.edu" required className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Contrasena</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required className={`${inputClass} pl-10 pr-10`} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ingresar'}
                </button>
                <button type="button" onClick={() => { setForgotMode(true); setError(''); }} className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  Olvidaste tu contrasena?
                </button>
              </form>
            )}
          </div>

          {/* Test credentials hint */}
          {!forgotMode && (
            <div className="mt-5 p-4 bg-brand-50 border border-brand-200/40 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-brand-600" />
                <p className="text-sm font-semibold text-brand-700">Cuenta de prueba - Liceo Romero Garcia</p>
              </div>
              <p className="text-xs text-slate-600 mb-1">
                <span className="text-slate-400">Correo:</span> liceo.romero.garcia@educonnet.com
              </p>
              <p className="text-xs text-slate-600 mb-3">
                <span className="text-slate-400">Clave:</span> RomeroGarcia2026
              </p>
              <button
                onClick={handleTestLogin}
                className="w-full py-2 bg-white hover:bg-slate-50 text-brand-600 text-xs font-semibold rounded-lg border border-brand-200/40 transition-colors"
              >
                Autocompletar credenciales
              </button>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Acceso exclusivo para instituciones registradas en EduConnet.
          </p>
        </div>
      </div>
    </div>
  );
}
