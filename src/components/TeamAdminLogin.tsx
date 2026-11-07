import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AdminAccount } from '../types';
import { EduConnetLogo } from './EduConnetLogo';
import { Shield, Lock, AtSign, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface TeamAdminLoginProps {
  onSuccess: (admin: AdminAccount) => void;
}

export function TeamAdminLogin({ onSuccess }: TeamAdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: rpcError } = await supabase.rpc('verify_admin_login', {
      p_username: username.trim(),
      p_password: password,
    });

    if (rpcError || !data || data.length === 0) {
      setLoading(false);
      setError('Credenciales invalidas. Verifica tu usuario y clave.');
      return;
    }

    const admin = data[0] as AdminAccount;
    localStorage.setItem('edu_admin', JSON.stringify(admin));
    setLoading(false);
    onSuccess(admin);
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const inputClass =
    'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-slate-400/30 focus:border-slate-500';

  return (
    <div className="min-h-screen flex flex-col bg-brand-900">
      {/* Top bar */}
      <header className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>
          <EduConnetLogo size="sm" variant="dark" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/50 border border-slate-600/50">
              <Shield className="w-8 h-8 text-slate-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">Acceso Equipo EduConnet</h1>
            <p className="text-slate-400 text-sm mt-1">
              Panel privado del equipo de administracion
            </p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">
                  Usuario
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    autoFocus
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">
                  Contrasena
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-sm text-red-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-200 hover:bg-white disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  'Ingresar al panel'
                )}
              </button>
            </form>
          </div>

          <div className="mt-5 p-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-300">
                Acceso restringido al equipo EduConnet
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Esta area esta protegida por autenticacion verificada en el servidor.
              Solo cuentas de administrador autorizadas pueden acceder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
