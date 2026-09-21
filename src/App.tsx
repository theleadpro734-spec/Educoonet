import { useState, useEffect } from 'react';
import { InstitutionPanel } from './components/InstitutionPanel';
import { StudentPanel } from './components/StudentPanel';
import { AdminPanel } from './components/AdminPanel';
import { InstitutionAccessPage } from './components/InstitutionAccessPage';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { EduConnetLogo } from './components/EduConnetLogo';
import { useAuth } from './lib/auth';
import { X, Building2, GraduationCap, ArrowRight, FlaskConical } from 'lucide-react';

type View = 'institution' | 'student' | 'admin' | 'role-select';

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const { loading, isInstitution, signOut } = useAuth();
  const [view, setView] = useState<View>('role-select');
  const [showBetaBanner, setShowBetaBanner] = useState(
    () => localStorage.getItem('educonnet_beta_dismissed') !== 'true'
  );

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const urlParams = new URLSearchParams(window.location.search);
  const isPwaLaunch = isStandalone || urlParams.get('source') === 'pwa';
  const [showTutorial, setShowTutorial] = useState(() => {
    if (!isPwaLaunch) return false;
    return localStorage.getItem('educonnet_tutorial_done') !== 'true';
  });

  const dismissTutorial = () => {
    localStorage.setItem('educonnet_tutorial_done', 'true');
    setShowTutorial(false);
  };

  const dismissBetaBanner = () => {
    localStorage.setItem('educonnet_beta_dismissed', 'true');
    setShowBetaBanner(false);
  };

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!loading && isInstitution) {
      setView('institution');
    }
  }, [loading, isInstitution]);

  if (route === '/instituciones/acceso') {
    return <InstitutionAccessPage />;
  }

  if (showTutorial) {
    return <OnboardingTutorial onComplete={dismissTutorial} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-[#0D9488] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando EduConnet...</p>
        </div>
      </div>
    );
  }

  if (view === 'institution' && isInstitution) {
    return (
      <div>
        {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}
        <InstitutionPanel onExit={async () => { await signOut(); setView('role-select'); }} />
      </div>
    );
  }

  if (view === 'student') {
    return (
      <div>
        {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}
        <StudentPanel onExit={() => setView('role-select')} />
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div>
        {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}
        <AdminPanel onExit={() => setView('role-select')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#134E4A] via-[#0D9488] to-[#14B8A6] flex items-center justify-center p-4">
      {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#5EEAD4]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-5">
              <EduConnetLogo size="lg" variant="dark" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5EEAD4]/20 border border-[#5EEAD4]/30 rounded-full mb-4">
              <FlaskConical className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span className="text-xs font-semibold text-[#99F6E4]">Version Beta</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Bienvenido a EduConnet</h1>
            <p className="text-[#99F6E4] text-sm leading-relaxed max-w-xs">
              Conecta instituciones educativas de excelencia con postulantes talentosos.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setView('student')}
              className="w-full flex items-center gap-4 p-5 bg-white hover:bg-[#F0FDFA] text-[#0D9488] font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-bold">Soy Postulante</p>
                <p className="text-xs text-slate-500 font-normal">Explora y postula a instituciones</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#0D9488] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                window.history.pushState({}, '', '/instituciones/acceso');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="w-full flex items-center gap-4 p-5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/20 hover:border-white/30 group"
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-base font-bold">Soy Institucion</p>
                <p className="text-xs text-[#99F6E4] font-normal">Gestiona postulaciones recibidas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-center text-[#5EEAD4]/60 text-xs mt-6">
            Al continuar aceptas usar una version en desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
}

function BetaBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
      <FlaskConical className="w-4 h-4 flex-shrink-0" />
      <span className="text-center">
        Estas usando la version Beta de EduConnet — algunas funciones pueden no estar terminadas.
      </span>
      <button
        onClick={onDismiss}
        className="ml-2 p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0"
        aria-label="Cerrar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default App;
