import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Download, CheckCircle2, Loader2 } from 'lucide-react';

const UPDATE_INTERVAL = 60 * 60 * 1000;

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, UPDATE_INTERVAL);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const close = useCallback(() => {
    setDismissed(true);
    setNeedRefresh(false);
    setOfflineReady(false);
  }, [setNeedRefresh, setOfflineReady]);

  const update = useCallback(() => {
    setUpdating(true);
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  if (dismissed) return null;

  if (needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[200] flex justify-center pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="pointer-events-auto max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
              {updating ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">Nueva version disponible</h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                {updating
                  ? 'Actualizando... La app se reiniciara automaticamente en un momento.'
                  : 'Hemos mejorado EduConnet. Actualiza para tener la ultima version con mejoras y correcciones.'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={update}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all btn-spring disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                  {updating ? 'Actualizando...' : 'Actualizar ahora'}
                </button>
                {!updating && (
                  <button
                    onClick={close}
                    className="px-3 py-2 text-slate-400 hover:text-slate-600 text-sm font-medium rounded-xl transition-colors"
                  >
                    Mas tarde
                  </button>
                )}
              </div>
            </div>
            {!updating && (
              <button onClick={close} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[200] flex justify-center pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="pointer-events-auto max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">App lista para usar sin conexion</h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                EduConnet ahora funciona offline. Puedes explorar instituciones y revisar tus postulaciones sin internet.
              </p>
              <button
                onClick={close}
                className="mt-3 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all btn-spring"
              >
                Entendido
              </button>
            </div>
            <button onClick={close} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
