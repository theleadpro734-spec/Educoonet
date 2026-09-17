import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Download } from 'lucide-react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(url) {
      console.log('SW registered', url);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [dismissed, setDismissed] = useState(false);

  const close = useCallback(() => {
    setDismissed(true);
    setNeedRefresh(false);
    setOfflineReady(false);
  }, [setNeedRefresh, setOfflineReady]);

  const update = useCallback(() => {
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">Nueva version disponible</h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                Hemos mejorado EduConnet. Actualiza para tener la ultima version con mejoras y correcciones.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={update}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all btn-spring"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar ahora
                </button>
                <button
                  onClick={close}
                  className="px-3 py-2 text-slate-400 hover:text-slate-600 text-sm font-medium rounded-xl transition-colors"
                >
                  Mas tarde
                </button>
              </div>
            </div>
            <button onClick={close} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">App lista para usar sin conexion</h3>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                EduConnet ahora funciona offline. Puedes explorar instituciones y revisar tus postulaciones sin internet.
              </p>
              <button
                onClick={close}
                className="mt-3 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-all btn-spring"
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
