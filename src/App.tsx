import { useState, useEffect } from 'react';
import { InstitutionPanel } from './components/InstitutionPanel';
import { StudentPanel } from './components/StudentPanel';
import { AdminPanel } from './components/AdminPanel';
import { InstitutionAccessPage } from './components/InstitutionAccessPage';
import { EduConnetLogo } from './components/EduConnetLogo';
import { useAuth } from './lib/auth';
import {
  Building2,
  GraduationCap,
  ChevronRight,
  X,
  Users,
  Award,
  Globe,
  CheckCircle,
  Star,
  ArrowRight,
  BookOpen,
  Search,
  Bell,
  Shield,
  Menu,
  Zap,
  BarChart3,
  MessageSquare,
  Moon,
  Sun,
  ArrowLeft,
} from 'lucide-react';

type View = 'home' | 'institution' | 'student' | 'admin';

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const { loading, isInstitution, isRepresentative, institution, signOut } = useAuth();
  const [view, setView] = useState<View>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [mobileMenuOpen]);

  // Institution access route
  if (route === '/instituciones/acceso') {
    return <InstitutionAccessPage />;
  }

  // Auto-route: if logged in as institution, show institution panel
  useEffect(() => {
    if (!loading && isInstitution && view === 'home') {
      setView('institution');
    }
  }, [loading, isInstitution, view]);

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
    return <InstitutionPanel onExit={async () => { await signOut(); setView('home'); }} />;
  }

  if (view === 'student') {
    return <StudentPanel onExit={() => setView('home')} />;
  }

  if (view === 'admin') {
    return <AdminPanel onExit={() => setView('home')} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0F172A] text-white' : 'bg-[#FEFEFF] text-slate-900'} transition-colors duration-300`}>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'bg-[#1E293B]/95 border-[#334155]' : 'bg-white/95 border-slate-100'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <EduConnetLogo size="md" variant={darkMode ? 'dark' : 'light'} />

            <div className="hidden lg:flex items-center gap-8">
              {[['Como funciona', '#como-funciona'], ['Beneficios', '#beneficios'], ['Instituciones', '#instituciones'], ['Contacto', '#contacto']].map(([label, href]) => (
                <a key={label} href={href} className={`font-medium transition-colors text-sm ${darkMode ? 'text-slate-300 hover:text-[#5EEAD4]' : 'text-slate-600 hover:text-[#0D9488]'}`}>
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'bg-[#334155] text-[#5EEAD4] hover:bg-[#475569]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setView('student')}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/25 hover:-translate-y-0.5"
              >
                Comenzar Ahora
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#334155]' : 'hover:bg-slate-100'}`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`fixed inset-y-0 right-0 z-50 w-72 shadow-2xl transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${darkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <EduConnetLogo size="md" variant={darkMode ? 'dark' : 'light'} />
            <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-[#334155]' : 'hover:bg-slate-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            {['Como funciona', 'Beneficios', 'Instituciones', 'Contacto'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${darkMode ? 'text-slate-300 hover:text-white hover:bg-[#334155]' : 'text-slate-700 hover:text-[#0D9488] hover:bg-[#F0FDFA]'}`}>
                {item}
              </a>
            ))}
          </nav>
          <button
            onClick={() => { setMobileMenuOpen(false); setView('student'); }}
            className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl shadow-lg shadow-[#0D9488]/25"
          >
            Comenzar Ahora
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 lg:pt-20 overflow-hidden">
        <div className={`absolute inset-0 ${darkMode
          ? 'bg-gradient-to-br from-[#0F172A] via-[#134E4A] to-[#1E293B]'
          : 'bg-gradient-to-br from-[#134E4A] via-[#0D9488] to-[#14B8A6]'
        }`} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#5EEAD4]/15 rounded-full blur-2xl" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-[#FEFEFF] to-transparent" style={{ display: darkMode ? 'none' : 'block' }} />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-[#0F172A] to-transparent" style={{ display: darkMode ? 'block' : 'none' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <Zap className="w-4 h-4 text-[#5EEAD4]" />
                <span className="text-sm font-medium text-[#99F6E4]">Plataforma educativa #1 en Venezuela</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                Conecta tu futuro
                <br />
                <span className="text-[#5EEAD4]">academico</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[#99F6E4] leading-relaxed max-w-xl mx-auto lg:mx-0">
                EduConnet conecta instituciones educativas de excelencia con postulantes talentosos. Simplifica el proceso de admision y encuentra tu oportunidad.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setView('student')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0D9488] font-bold rounded-2xl hover:bg-[#F0FDFA] transition-all shadow-2xl shadow-[#134E4A]/30 hover:-translate-y-1 text-lg"
                >
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#como-funciona"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/25 font-semibold rounded-2xl hover:bg-white/20 transition-all text-lg"
                >
                  Como funciona
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                {['Gratis para postulantes', 'Respuesta en 24-48h', '100% seguro'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[#99F6E4]">
                    <CheckCircle className="w-4 h-4 text-[#5EEAD4]" />
                    <span className="text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md animate-float">
                <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Panel de Control</p>
                      <p className="text-[#5EEAD4] text-xs">Gestion en tiempo real</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[#5EEAD4] text-xs">En vivo</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Postulaciones', value: '248', color: 'bg-[#0D9488]/20 text-[#5EEAD4]' },
                      { label: 'Aceptados', value: '187', color: 'bg-emerald-500/20 text-emerald-300' },
                      { label: 'Pendientes', value: '41', color: 'bg-amber-500/20 text-amber-300' },
                      { label: 'Revisados', value: '98%', color: 'bg-[#14B8A6]/20 text-[#99F6E4]' },
                    ].map((stat) => (
                      <div key={stat.label} className={`rounded-xl p-3 ${stat.color}`}>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs opacity-80 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Carlos M.', status: 'Aceptado', color: 'bg-emerald-500' },
                      { name: 'Maria L.', status: 'Pendiente', color: 'bg-amber-500' },
                      { name: 'Juan P.', status: 'Aceptado', color: 'bg-emerald-500' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0D9488]/30 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{item.name[0]}</span>
                          </div>
                          <span className="text-white text-sm">{item.name}</span>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-3 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-800 text-sm font-semibold">Postulacion enviada</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-3 py-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {['B', 'C', 'A'].map((l) => (
                        <div key={l} className="w-6 h-6 bg-[#0D9488] rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{l}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-slate-800 text-sm font-semibold">+200 postulantes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className={`py-10 border-b ${darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-100'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Instituciones Registradas', value: '50+', icon: Building2 },
              { label: 'Postulantes Activos', value: '1,200+', icon: Users },
              { label: 'Admisiones Exitosas', value: '800+', icon: Award },
              { label: 'Satisfaccion del Usuario', value: '98%', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-[#0D9488]" />
                </div>
                <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className={`py-20 lg:py-28 ${darkMode ? 'bg-[#0F172A]' : 'bg-[#FEFEFF]'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 ${darkMode ? 'bg-[#0D9488]/20 text-[#5EEAD4]' : 'bg-[#F0FDFA] text-[#0D9488]'}`}>
              Proceso Simple
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Como funciona EduConnet
            </h2>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              En tres pasos conecta instituciones educativas con los mejores postulantes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: '01', icon: Search, title: 'Explora Instituciones', description: 'Descubre instituciones educativas de calidad y encuentra la que mejor se adapta a tus objetivos.' },
              { step: '02', icon: BookOpen, title: 'Envia tu Postulacion', description: 'Completa el formulario con tus datos academicos y personales. Rapido y completamente en linea.' },
              { step: '03', icon: Bell, title: 'Recibe Respuesta', description: 'La institucion revisara tu postulacion y recibiras una notificacion en 24 a 48 horas habiles.' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                <div className="flex flex-col items-center">
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:-translate-y-1 transition-transform ${darkMode ? 'bg-gradient-to-br from-[#0D9488] to-[#134E4A]' : 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488]'}`} style={{ boxShadow: '0 8px 24px rgba(13,148,136,0.25)' }}>
                    <item.icon className="w-9 h-9 text-white" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-[#0D9488] rounded-full text-xs font-bold flex items-center justify-center shadow-md">{i + 1}</span>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className={`leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className={`py-20 lg:py-28 ${darkMode ? 'bg-[#1E293B]' : 'bg-gradient-to-br from-slate-50 to-[#F0FDFA]/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 ${darkMode ? 'bg-[#0D9488]/20 text-[#5EEAD4]' : 'bg-[#99F6E4]/40 text-[#0D9488]'}`}>
                Beneficios
              </span>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                La plataforma que necesitabas para tu educacion
              </h2>
              <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Disenada para hacer el proceso de admision mas eficiente, transparente y accesible para todos.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Zap, title: 'Proceso rapido y sencillo', desc: 'Postula a tu institucion favorita en menos de 5 minutos desde cualquier dispositivo.' },
                  { icon: Bell, title: 'Notificaciones en tiempo real', desc: 'Recibe actualizaciones instantaneas sobre el estado de tus postulaciones.' },
                  { icon: Shield, title: 'Datos seguros y protegidos', desc: 'Tu informacion personal esta protegida con los mas altos estandares de seguridad.' },
                  { icon: MessageSquare, title: 'Comunicacion directa', desc: 'Chat en tiempo real entre instituciones y postulantes desde la plataforma.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-[#0D9488]/20' : 'bg-[#F0FDFA]'}`}>
                      <item.icon className="w-6 h-6 text-[#0D9488]" />
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, title: 'Para Postulantes', desc: 'Encuentra instituciones de calidad y gestiona tus postulaciones facilmente.' },
                { icon: Building2, title: 'Para Instituciones', desc: 'Recibe y gestiona postulaciones desde un panel profesional y completo.' },
                { icon: MessageSquare, title: 'Comunicacion Clara', desc: 'Estado de postulaciones siempre visible. Sin incertidumbre para el postulante.' },
                { icon: Globe, title: 'Acceso Universal', desc: 'Desde cualquier dispositivo, en cualquier momento. Mobile-first.' },
              ].map((card) => (
                <div key={card.title} className={`rounded-2xl p-5 border transition-shadow group card-hover ${darkMode ? 'bg-[#0F172A] border-[#334155] hover:border-[#0D9488]/40' : 'bg-white border-[#99F6E4]/40 hover:border-[#14B8A6]/40 shadow-sm hover:shadow-lg'}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-lg shadow-[#0D9488]/20">
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className={`font-semibold mb-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{card.title}</h4>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Institutions Section */}
      <section id="instituciones" className={`py-20 lg:py-28 ${darkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 ${darkMode ? 'bg-[#0D9488]/20 text-[#5EEAD4]' : 'bg-[#F0FDFA] text-[#0D9488]'}`}>
              Instituciones
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Conectate con instituciones de excelencia
            </h2>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Universidades, institutos tecnicos y escuelas de negocios confian en EduConnet.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { type: 'Universidad', count: '20+', desc: 'Universidades publicas y privadas con procesos de admision digitalizados.', icon: Building2 },
              { type: 'Institutos Tecnicos', count: '15+', desc: 'Institutos tecnicos y tecnologicos con programas de alta demanda laboral.', icon: BookOpen },
              { type: 'Escuelas de Negocios', count: '10+', desc: 'Programas de especializacion y MBA para profesionales en crecimiento.', icon: BarChart3 },
            ].map((item) => (
              <div key={item.type} className={`border rounded-2xl p-6 text-center transition-shadow card-hover ${darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-gradient-to-br from-[#F0FDFA] to-white border-[#99F6E4]/40 hover:shadow-lg'}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0D9488]/20">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#0D9488] mb-1">{item.count}</p>
                <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.type}</p>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { quote: 'EduConnet nos permitio digitalizar completamente nuestro proceso de admision. Ahora gestionamos el triple de postulantes con la mitad del tiempo.', author: 'Directora Academica', role: 'Universidad Nacional' },
              { quote: 'Gracias a EduConnet pude postularme a 3 instituciones desde mi celular en menos de 30 minutos. El proceso fue increiblemente sencillo.', author: 'Postulante', role: 'Admision Pregrado 2025' },
            ].map((t, i) => (
              <div key={i} className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-[#134E4A] to-[#1E293B] border border-[#334155]' : 'bg-gradient-to-br from-[#0D9488] to-[#134E4A]'} text-white`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#5EEAD4] text-[#5EEAD4]" />)}
                </div>
                <p className="text-[#99F6E4] leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-[#5EEAD4] text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 lg:py-24 relative overflow-hidden ${darkMode ? 'bg-[#134E4A]' : 'bg-gradient-to-br from-[#134E4A] via-[#0D9488] to-[#14B8A6]'}`}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comienza tu proceso de admision hoy
          </h2>
          <p className="text-xl text-[#99F6E4] mb-10 max-w-2xl mx-auto leading-relaxed">
            Unete a miles de postulantes e instituciones que ya confian en EduConnet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setView('student')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0D9488] font-bold rounded-2xl hover:bg-[#F0FDFA] transition-all shadow-2xl text-lg hover:-translate-y-1"
            >
              Comenzar Ahora
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="/instituciones/acceso"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/25 font-semibold rounded-2xl hover:bg-white/20 transition-all text-lg"
            >
              <Building2 className="w-5 h-5" />
              Acceso Instituciones
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className={`py-16 border-t ${darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-100'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Globe, label: 'Sitio Web', value: 'www.educonnet.com' },
              { icon: MessageSquare, label: 'Soporte', value: 'soporte@educonnet.com' },
              { icon: Bell, label: 'Disponibilidad', value: 'Lun - Vie, 8am - 6pm' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-[#0D9488]/20' : 'bg-[#F0FDFA]'}`}>
                  <item.icon className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-[#0F172A] border-t border-[#334155]' : 'bg-slate-900'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="mb-4"><EduConnetLogo size="lg" variant="dark" /></div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                La plataforma educativa que conecta instituciones de excelencia con postulantes talentosos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2">
                {['Como funciona', 'Instituciones', 'Postulantes', 'Precios'].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-[#5EEAD4] transition-colors text-sm">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                {['Centro de Ayuda', 'Privacidad', 'Terminos de Uso', 'Contacto'].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-[#5EEAD4] transition-colors text-sm">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2025 EduConnet. Todos los derechos reservados.</p>
            <p className="text-slate-500 text-sm">Hecho con dedicacion para la educacion latinoamericana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
