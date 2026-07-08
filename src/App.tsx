import { useState, useEffect } from 'react';
import { InstitutionPanel } from './components/InstitutionPanel';
import { StudentPanel } from './components/StudentPanel';
import { EduConnetLogo } from './components/EduConnetLogo';
import { supabase } from './lib/supabase';
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
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  AtSign,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react';

type View = 'home' | 'institution' | 'student';

function App() {
  const [view, setView] = useState<View>('home');
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);

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
    if (loginOpen || mobileMenuOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [loginOpen, mobileMenuOpen]);

  if (view === 'institution') {
    return <InstitutionPanel onExit={() => setView('home')} />;
  }

  if (view === 'student') {
    return <StudentPanel onExit={() => setView('home')} studentEmail={studentEmail} />;
  }

  const enterInstitutionDemo = () => {
    localStorage.setItem('edu_institution', JSON.stringify({
      id: 'demo-inst-1',
      name: 'Liceo Demo',
      dea_code: 'LICEO2025',
      institution_id: 'demo-inst-1',
    }));
    setView('institution');
  };

  const enterStudentDemo = () => {
    localStorage.setItem('edu_student', JSON.stringify({
      id: 'demo-student-1',
      name: 'Postulante',
      last_name: 'Demo',
      email: 'postulante@demo.ve',
    }));
    setStudentEmail('postulante@demo.ve');
    setView('student');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0B1426] text-white' : 'bg-[#FEFEFF] text-slate-900'} transition-colors duration-300`}>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${darkMode ? 'bg-[#112035]/95 border-[#1E3352]' : 'bg-white/95 border-slate-100'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <EduConnetLogo size="md" variant={darkMode ? 'dark' : 'light'} />

            <div className="hidden lg:flex items-center gap-8">
              {[['Como funciona', '#como-funciona'], ['Beneficios', '#beneficios'], ['Instituciones', '#instituciones'], ['Contacto', '#contacto']].map(([label, href]) => (
                <a key={label} href={href} className={`font-medium transition-colors text-sm ${darkMode ? 'text-slate-300 hover:text-[#88C6FC]' : 'text-slate-600 hover:text-[#0082F0]'}`}>
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-colors ${darkMode ? 'bg-[#1E3352] text-[#88C6FC] hover:bg-[#2A4A70]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#0082F0] hover:bg-[#006ACC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0082F0]/25 hover:-translate-y-0.5"
              >
                Iniciar Sesion
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#1E3352]' : 'hover:bg-slate-100'}`}
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
      <div className={`fixed inset-y-0 right-0 z-50 w-72 shadow-2xl transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${darkMode ? 'bg-[#112035]' : 'bg-white'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <EduConnetLogo size="md" variant={darkMode ? 'dark' : 'light'} />
            <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-[#1E3352]' : 'hover:bg-slate-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            {['Como funciona', 'Beneficios', 'Instituciones', 'Contacto'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${darkMode ? 'text-slate-300 hover:text-white hover:bg-[#1E3352]' : 'text-slate-700 hover:text-[#0082F0] hover:bg-[#EFF8FF]'}`}>
                {item}
              </a>
            ))}
          </nav>
          <button
            onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}
            className="w-full py-3.5 bg-[#0082F0] hover:bg-[#006ACC] text-white font-semibold rounded-xl shadow-lg shadow-[#0082F0]/25"
          >
            Iniciar Sesion
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 lg:pt-20 overflow-hidden">
        <div className={`absolute inset-0 ${darkMode
          ? 'bg-gradient-to-br from-[#0B1426] via-[#0A2463] to-[#112035]'
          : 'bg-gradient-to-br from-[#0A2463] via-[#0082F0] to-[#199EF3]'
        }`} />
        {/* Soft grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        {/* Accent orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#199EF3]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#88C6FC]/15 rounded-full blur-2xl" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-[#FEFEFF] to-transparent" style={{ display: darkMode ? 'none' : 'block' }} />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-[#0B1426] to-transparent" style={{ display: darkMode ? 'block' : 'none' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <Zap className="w-4 h-4 text-[#88C6FC]" />
                <span className="text-sm font-medium text-[#B9DEFE]">Plataforma educativa #1 en Venezuela</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                Conecta tu futuro
                <br />
                <span className="text-[#88C6FC]">academico</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[#B9DEFE] leading-relaxed max-w-xl mx-auto lg:mx-0">
                EduConnet conecta instituciones educativas de excelencia con postulantes talentosos. Simplifica el proceso de admision y encuentra tu oportunidad.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0082F0] font-bold rounded-2xl hover:bg-[#EFF8FF] transition-all shadow-2xl shadow-[#0A2463]/30 hover:-translate-y-1 text-lg"
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

              {/* Demo access */}
              <div className="mt-8 pt-6 border-t border-white/15">
                <p className="text-[#88C6FC] text-xs font-semibold uppercase tracking-wider mb-4 text-center lg:text-left">Acceso directo para demo</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button
                    onClick={enterInstitutionDemo}
                    className="flex items-center justify-center gap-2.5 px-6 py-3 bg-[#0A2463]/60 hover:bg-[#0A2463]/80 text-white font-semibold rounded-xl border border-white/15 transition-all shadow-lg hover:-translate-y-0.5 backdrop-blur-sm"
                  >
                    <Building2 className="w-4 h-4 text-[#88C6FC]" />
                    Panel Institucion
                  </button>
                  <button
                    onClick={enterStudentDemo}
                    className="flex items-center justify-center gap-2.5 px-6 py-3 bg-[#199EF3]/20 hover:bg-[#199EF3]/30 text-white font-semibold rounded-xl border border-[#199EF3]/30 transition-all shadow-lg hover:-translate-y-0.5 backdrop-blur-sm"
                  >
                    <GraduationCap className="w-4 h-4 text-[#88C6FC]" />
                    Panel Postulante
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                {['Gratis para postulantes', 'Respuesta en 24-48h', '100% seguro'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[#B9DEFE]">
                    <CheckCircle className="w-4 h-4 text-[#88C6FC]" />
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
                    <div className="w-10 h-10 bg-gradient-to-br from-[#199EF3] to-[#0082F0] rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Panel de Control</p>
                      <p className="text-[#88C6FC] text-xs">Gestion en tiempo real</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[#88C6FC] text-xs">En vivo</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Postulaciones', value: '248', color: 'bg-[#0082F0]/20 text-[#88C6FC]' },
                      { label: 'Aceptados', value: '187', color: 'bg-emerald-500/20 text-emerald-300' },
                      { label: 'Pendientes', value: '41', color: 'bg-amber-500/20 text-amber-300' },
                      { label: 'Revisados', value: '98%', color: 'bg-[#199EF3]/20 text-[#B9DEFE]' },
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
                          <div className="w-7 h-7 rounded-full bg-[#0082F0]/30 flex items-center justify-center">
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
                        <div key={l} className="w-6 h-6 bg-[#0082F0] rounded-full border-2 border-white flex items-center justify-center">
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
      <section className={`py-10 border-b ${darkMode ? 'bg-[#112035] border-[#1E3352]' : 'bg-white border-slate-100'}`}>
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
                  <stat.icon className="w-6 h-6 text-[#0082F0]" />
                </div>
                <p className={`text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className={`py-20 lg:py-28 ${darkMode ? 'bg-[#0B1426]' : 'bg-[#FEFEFF]'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 ${darkMode ? 'bg-[#0082F0]/20 text-[#88C6FC]' : 'bg-[#EFF8FF] text-[#0082F0]'}`}>
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
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:-translate-y-1 transition-transform ${darkMode ? 'bg-gradient-to-br from-[#0082F0] to-[#0A2463]' : 'bg-gradient-to-br from-[#199EF3] to-[#0082F0]'}`} style={{ boxShadow: '0 8px 24px rgba(0,130,240,0.25)' }}>
                    <item.icon className="w-9 h-9 text-white" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-[#0082F0] rounded-full text-xs font-bold flex items-center justify-center shadow-md">{i + 1}</span>
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
      <section id="beneficios" className={`py-20 lg:py-28 ${darkMode ? 'bg-[#112035]' : 'bg-gradient-to-br from-slate-50 to-[#EFF8FF]/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 ${darkMode ? 'bg-[#0082F0]/20 text-[#88C6FC]' : 'bg-[#B9DEFE]/40 text-[#0082F0]'}`}>
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
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-[#0082F0]/20' : 'bg-[#EFF8FF]'}`}>
                      <item.icon className="w-6 h-6 text-[#0082F0]" />
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
                <div key={card.title} className={`rounded-2xl p-5 border transition-shadow group card-hover ${darkMode ? 'bg-[#0B1426] border-[#1E3352] hover:border-[#0082F0]/40' : 'bg-white border-[#B9DEFE]/40 hover:border-[#199EF3]/40 shadow-sm hover:shadow-lg'}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#199EF3] to-[#0082F0] rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-lg shadow-[#0082F0]/20">
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
      <section id="instituciones" className={`py-20 lg:py-28 ${darkMode ? 'bg-[#0B1426]' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-4 ${darkMode ? 'bg-[#0082F0]/20 text-[#88C6FC]' : 'bg-[#EFF8FF] text-[#0082F0]'}`}>
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
              <div key={item.type} className={`border rounded-2xl p-6 text-center transition-shadow card-hover ${darkMode ? 'bg-[#112035] border-[#1E3352]' : 'bg-gradient-to-br from-[#EFF8FF] to-white border-[#B9DEFE]/40 hover:shadow-lg'}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#199EF3] to-[#0082F0] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0082F0]/20">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#0082F0] mb-1">{item.count}</p>
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
              <div key={i} className={`rounded-2xl p-6 ${darkMode ? 'bg-gradient-to-br from-[#0A2463] to-[#112035] border border-[#1E3352]' : 'bg-gradient-to-br from-[#0082F0] to-[#0A2463]'} text-white`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[#88C6FC] text-[#88C6FC]" />)}
                </div>
                <p className="text-[#B9DEFE] leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-[#88C6FC] text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 lg:py-24 relative overflow-hidden ${darkMode ? 'bg-[#0A2463]' : 'bg-gradient-to-br from-[#0A2463] via-[#0082F0] to-[#199EF3]'}`}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comienza tu proceso de admision hoy
          </h2>
          <p className="text-xl text-[#B9DEFE] mb-10 max-w-2xl mx-auto leading-relaxed">
            Unete a miles de postulantes e instituciones que ya confian en EduConnet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLoginOpen(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0082F0] font-bold rounded-2xl hover:bg-[#EFF8FF] transition-all shadow-2xl text-lg hover:-translate-y-1"
            >
              Iniciar Sesion
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={enterStudentDemo}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/25 font-semibold rounded-2xl hover:bg-white/20 transition-all text-lg"
            >
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className={`py-16 border-t ${darkMode ? 'bg-[#112035] border-[#1E3352]' : 'bg-white border-slate-100'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Globe, label: 'Sitio Web', value: 'www.educonnet.com' },
              { icon: MessageSquare, label: 'Soporte', value: 'soporte@educonnet.com' },
              { icon: Bell, label: 'Disponibilidad', value: 'Lun - Vie, 8am - 6pm' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-[#0082F0]/20' : 'bg-[#EFF8FF]'}`}>
                  <item.icon className="w-6 h-6 text-[#0082F0]" />
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
      <footer className={`${darkMode ? 'bg-[#0B1426] border-t border-[#1E3352]' : 'bg-slate-900'} text-white`}>
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
                  <li key={l}><a href="#" className="text-slate-400 hover:text-[#88C6FC] transition-colors text-sm">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                {['Centro de Ayuda', 'Privacidad', 'Terminos de Uso', 'Contacto'].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-[#88C6FC] transition-colors text-sm">{l}</a></li>
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

      {/* Login Modal */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSelectInstitution={() => { setLoginOpen(false); setView('institution'); }}
          onSelectStudent={(email) => { setStudentEmail(email); setLoginOpen(false); setView('student'); }}
          darkMode={darkMode}
          onEnterInstDemo={() => { setLoginOpen(false); enterInstitutionDemo(); }}
          onEnterStudentDemo={() => { setLoginOpen(false); enterStudentDemo(); }}
        />
      )}
    </div>
  );
}

type LoginStep = 'select' | 'student' | 'institution';

function LoginModal({
  onClose,
  onSelectInstitution,
  onSelectStudent,
  darkMode,
  onEnterInstDemo,
  onEnterStudentDemo,
}: {
  onClose: () => void;
  onSelectInstitution: () => void;
  onSelectStudent: (email: string) => void;
  darkMode: boolean;
  onEnterInstDemo: () => void;
  onEnterStudentDemo: () => void;
}) {
  const [step, setStep] = useState<LoginStep>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deaCode, setDeaCode] = useState('');
  const [instPassword, setInstPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showInstPass, setShowInstPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data } = await supabase.rpc('verify_student_password', {
      p_email: email.trim().toLowerCase(),
      p_password: password,
    });
    setLoading(false);
    if (!data || data.length === 0) {
      setError('Correo o contrasena incorrectos.');
      return;
    }
    const student = data[0];
    localStorage.setItem('edu_student', JSON.stringify(student));
    onSelectStudent(student.email);
  };

  const handleInstitutionLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data } = await supabase.rpc('verify_institution_password', {
      p_dea_code: deaCode.trim(),
      p_password: instPassword,
    });
    setLoading(false);
    if (!data || data.length === 0) {
      setError('Codigo DEA o contrasena incorrectos.');
      return;
    }
    const institution = data[0];
    localStorage.setItem('edu_institution', JSON.stringify(institution));
    onSelectInstitution();
  };

  const back = () => { setStep('select'); setError(''); };

  const inputClass = `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
    darkMode
      ? 'bg-[#0B1426] border-[#1E3352] text-white placeholder:text-slate-500 focus:ring-[#0082F0]/20 focus:border-[#0082F0]'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-[#0082F0]/20 focus:border-[#0082F0]'
  }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-[#0A2463]/60 backdrop-blur-md" />

      <div className={`relative rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ${darkMode ? 'bg-[#112035]' : 'bg-white'}`}>
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0082F0] to-[#0A2463] px-8 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center mb-4">
            <EduConnetLogo size="lg" variant="dark" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            {step === 'select' ? 'Iniciar Sesion' : step === 'student' ? 'Acceso Postulante' : 'Acceso Institucion'}
          </h2>
          <p className="text-[#B9DEFE] text-center text-sm mt-1">
            {step === 'select' ? 'Selecciona tu tipo de acceso' : 'Ingresa tus credenciales'}
          </p>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('student')}
                className={`group w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all text-left ${darkMode ? 'border-[#1E3352] hover:border-[#0082F0] hover:bg-[#0082F0]/10' : 'border-slate-200 hover:border-[#0082F0] hover:shadow-lg hover:shadow-[#0082F0]/10'}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#199EF3] to-[#0082F0] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#0082F0]/25">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Soy Postulante</p>
                  <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Explora instituciones y gestiona tus postulaciones</p>
                </div>
                <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${darkMode ? 'text-slate-500 group-hover:text-[#0082F0]' : 'text-slate-400 group-hover:text-[#0082F0]'}`} />
              </button>

              <button
                onClick={() => setStep('institution')}
                className={`group w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all text-left ${darkMode ? 'border-[#1E3352] hover:border-[#0A2463] hover:bg-[#0A2463]/40' : 'border-slate-200 hover:border-[#0A2463] hover:shadow-lg hover:shadow-slate-500/10'}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-[#0A2463] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Soy Institucion</p>
                  <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gestiona postulaciones y el perfil de tu institucion</p>
                </div>
                <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${darkMode ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-700'}`} />
              </button>

              <div className={`pt-2 border-t ${darkMode ? 'border-[#1E3352]' : 'border-slate-100'}`}>
                <p className={`text-xs text-center mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Acceso rapido demo</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onEnterStudentDemo}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors ${darkMode ? 'bg-[#0082F0]/20 hover:bg-[#0082F0]/30 text-[#88C6FC]' : 'bg-[#EFF8FF] hover:bg-[#DBEEFF] text-[#0082F0]'}`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Demo Estudiante
                  </button>
                  <button
                    type="button"
                    onClick={onEnterInstDemo}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors ${darkMode ? 'bg-[#1E3352] hover:bg-[#2A4A70] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Demo Liceo
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Correo electronico</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contrasena</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={`${inputClass} pl-10 pr-10`} />
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
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#0082F0] hover:bg-[#006ACC] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ingresar'}
              </button>
              <button type="button" onClick={back} className={`w-full text-sm transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>
                Volver
              </button>
            </form>
          )}

          {step === 'institution' && (
            <form onSubmit={handleInstitutionLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Codigo DEA</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={deaCode} onChange={(e) => setDeaCode(e.target.value)} placeholder="DEA-XXXX-XXXX" required className={`${inputClass} pl-10 font-mono`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contrasena</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showInstPass ? 'text' : 'password'} value={instPassword} onChange={(e) => setInstPassword(e.target.value)} placeholder="••••••••" required className={`${inputClass} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowInstPass(!showInstPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showInstPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#0A2463] hover:bg-[#0082F0] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ingresar'}
              </button>
              <button type="button" onClick={back} className={`w-full text-sm transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}>
                Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
