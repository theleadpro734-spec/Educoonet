import { useState, useEffect } from 'react';
import { InstitutionPanel } from './components/InstitutionPanel';
import { StudentPanel } from './components/StudentPanel';
import { AdminPanel } from './components/AdminPanel';
import { TeamAdminLogin } from './components/TeamAdminLogin';
import { InstitutionAccessPage } from './components/InstitutionAccessPage';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { LandingPage } from './components/LandingPage';
import { EduConnetLogo } from './components/EduConnetLogo';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/auth';
import { X, GraduationCap, ArrowRight, FlaskConical } from 'lucide-react';
import { AdminAccount } from './types';

type View = 'institution' | 'student' | 'admin' | 'role-select' | 'landing';

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const { loading, isInstitution, signOut } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [adminUser, setAdminUser] = useState<AdminAccount | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);
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

  // Verify admin session server-side when the /equipo-admin route is accessed
  useEffect(() => {
    if (route !== '/equipo-admin' || adminChecked) return;
    const stored = localStorage.getItem('edu_admin');
    if (!stored) {
      setAdminChecked(true);
      return;
    }
    void (async () => {
      try {
        const parsed = JSON.parse(stored) as { id?: string };
        if (!parsed.id) throw new Error('Invalid admin session');
        const { data } = await supabase.rpc('verify_admin_session', { p_admin_id: parsed.id });
        if (data && data.length > 0) {
          setAdminUser(data[0] as AdminAccount);
        } else {
          localStorage.removeItem('edu_admin');
        }
      } catch {
        localStorage.removeItem('edu_admin');
      } finally {
        setAdminChecked(true);
      }
    })();
  }, [route, adminChecked]);

  const handleAdminLogin = (admin: AdminAccount) => {
    setAdminUser(admin);
    setAdminChecked(true);
  };

  const handleAdminExit = () => {
    localStorage.removeItem('edu_admin');
    setAdminUser(null);
    setAdminChecked(false);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Secret institution access via URL
  if (route === '/instituciones/acceso') {
    return <InstitutionAccessPage />;
  }

  // Private team admin panel via URL — not in public navigation
  if (route === '/equipo-admin') {
    if (!adminChecked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50/40">
          <div className="text-center">
            <div className="w-12 h-12 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-500">Verificando acceso...</p>
          </div>
        </div>
      );
    }
    if (!adminUser) {
      return <TeamAdminLogin onSuccess={handleAdminLogin} />;
    }
    return (
      <AdminPanel admin={adminUser} onExit={handleAdminExit} />
    );
  }

  if (showTutorial) {
    return <OnboardingTutorial onComplete={dismissTutorial} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50/40">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando EduConnet...</p>
        </div>
      </div>
    );
  }

  if (view === 'institution' && isInstitution) {
    return (
      <div>
        {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}
        <InstitutionPanel onExit={async () => { await signOut(); setView('landing'); }} />
      </div>
    );
  }

  if (view === 'student') {
    return (
      <div>
        {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}
        <StudentPanel onExit={() => setView('landing')} />
      </div>
    );
  }

  if (view === 'role-select') {
    return (
      <div className="min-h-screen bg-brand-800 flex items-center justify-center p-4">
        {showBetaBanner && <BetaBanner onDismiss={dismissBetaBanner} />}

        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-md animate-scale-in">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-5">
                <EduConnetLogo size="lg" variant="dark" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-300/20 border border-brand-300/30 rounded-full mb-4">
                <FlaskConical className="w-3.5 h-3.5 text-brand-300" />
                <span className="text-xs font-semibold text-brand-200">Version Beta</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Selecciona tu rol</h1>
              <p className="text-brand-200 text-sm leading-relaxed max-w-xs">
                Elige como quieres continuar en EduConnet.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setView('student')}
                className="w-full flex items-center gap-4 p-5 bg-white hover:bg-brand-50 text-brand-600 font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
              >
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold">Soy Postulante</p>
                  <p className="text-xs text-slate-500 font-normal">Postula a instituciones</p>
                </div>
                <ArrowRight className="w-5 h-5 text-brand-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setView('landing')}
                className="w-full py-3 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LandingPage onEnterStudent={() => setView('student')} />
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
