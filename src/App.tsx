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
} from 'lucide-react';

type View = 'home' | 'institution' | 'student';

function App() {
  const [view, setView] = useState<View>('home');
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-blue-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <EduConnetLogo size="md" variant="light" />
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#como-funciona" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">
                Como funciona
              </a>
              <a href="#beneficios" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">
                Beneficios
              </a>
              <a href="#instituciones" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">
                Instituciones
              </a>
              <a href="#contacto" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">
                Contacto
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                Iniciar Sesion
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <EduConnetLogo size="md" variant="light" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            {['Como funciona', 'Beneficios', 'Instituciones', 'Contacto'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <button
            onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25"
          >
            Iniciar Sesion
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 lg:pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-100" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <Zap className="w-4 h-4 text-blue-200" />
                <span className="text-sm font-medium text-blue-100">Plataforma educativa #1</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Conecta tu futuro
                <br />
                <span className="text-blue-200">academico</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-blue-100 leading-relaxed max-w-xl mx-auto lg:mx-0">
                EduConnet conecta instituciones educativas de excelencia con postulantes talentosos. Simplifica el proceso de admision y encuentra tu oportunidad.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/30 hover:-translate-y-1 text-lg"
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

              {/* Direct Access Buttons */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-blue-200 text-sm mb-3 text-center lg:text-left">Acceso directo a paneles:</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => {
                      localStorage.setItem('edu_institution', JSON.stringify({
                        id: 'demo-inst-1',
                        name: 'Liceo Demo',
                        dea_code: 'LICEO2025',
                        institution_id: 'demo-inst-1'
                      }));
                      setView('institution');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
                  >
                    <Building2 className="w-5 h-5" />
                    Panel Institucion
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('edu_student', JSON.stringify({
                        id: 'demo-student-1',
                        name: 'Postulante',
                        last_name: 'Demo',
                        email: 'postulante@demo.ec'
                      }));
                      setStudentEmail('postulante@demo.ec');
                      setView('student');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
                  >
                    <GraduationCap className="w-5 h-5" />
                    Panel Postulante
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-sm font-medium">Gratis para postulantes</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-sm font-medium">Respuesta en 24-48h</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-sm font-medium">100% seguro</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Panel de Control</p>
                      <p className="text-blue-200 text-sm">Gestion en tiempo real</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Postulaciones', value: '248', color: 'bg-blue-500/20 text-blue-100' },
                      { label: 'Aceptados', value: '187', color: 'bg-emerald-500/20 text-emerald-200' },
                      { label: 'Pendientes', value: '41', color: 'bg-amber-500/20 text-amber-200' },
                      { label: 'Revisados', value: '98%', color: 'bg-purple-500/20 text-purple-200' },
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
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{item.name[0]}</span>
                          </div>
                          <span className="text-white text-sm">{item.name}</span>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating badges */}
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
                        <div key={l} className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
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
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Instituciones Registradas', value: '50+', icon: Building2, color: 'text-blue-600' },
              { label: 'Postulantes Activos', value: '1,200+', icon: Users, color: 'text-blue-700' },
              { label: 'Admisiones Exitosas', value: '800+', icon: Award, color: 'text-blue-600' },
              { label: 'Satisfaccion del Usuario', value: '98%', icon: Star, color: 'text-blue-700' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
              Proceso Simple
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Como funciona EduConnet
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              En tres pasos sencillos conecta instituciones educativas con los mejores postulantes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {[
              {
                step: '01',
                icon: Search,
                title: 'Explora Instituciones',
                description: 'Descubre instituciones educativas de calidad y encuentra la que mejor se adapta a tus objetivos academicos y profesionales.',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
              },
              {
                step: '02',
                icon: BookOpen,
                title: 'Envia tu Postulacion',
                description: 'Completa el formulario de postulacion con tus datos academicos y personales. El proceso es rapido y completamente en linea.',
                color: 'from-blue-600 to-blue-700',
                bg: 'bg-blue-50',
              },
              {
                step: '03',
                icon: Bell,
                title: 'Recibe Respuesta',
                description: 'La institucion revisara tu postulacion y recibiras una notificacion con la decision. Todo en un plazo de 24 a 48 horas habiles.',
                color: 'from-blue-700 to-blue-900',
                bg: 'bg-blue-50',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 group-hover:-translate-y-1 transition-transform`}>
                    <item.icon className="w-9 h-9 text-white" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Paso {item.step}</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
                Beneficios
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                La plataforma que necesitabas para tu educacion
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                Disenhada para hacer el proceso de admision mas eficiente, transparente y accesible para todos.
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: Zap,
                    title: 'Proceso rapido y sencillo',
                    desc: 'Postula a tu institucion favorita en menos de 5 minutos desde cualquier dispositivo.',
                  },
                  {
                    icon: Bell,
                    title: 'Notificaciones en tiempo real',
                    desc: 'Recibe actualizaciones instantaneas sobre el estado de tus postulaciones.',
                  },
                  {
                    icon: Shield,
                    title: 'Datos seguros y protegidos',
                    desc: 'Tu informacion personal esta protegida con los mas altos estandares de seguridad.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Panel de control intuitivo',
                    desc: 'Las instituciones gestionan todas sus postulaciones desde un panel moderno y facil de usar.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: GraduationCap, title: 'Para Postulantes', desc: 'Encuentra instituciones de calidad y gestiona tus postulaciones facilmente.', color: 'from-blue-500 to-blue-600', light: 'bg-blue-50' },
                { icon: Building2, title: 'Para Instituciones', desc: 'Recibe y gestiona postulaciones desde un panel profesional y completo.', color: 'from-blue-700 to-blue-900', light: 'bg-blue-50' },
                { icon: MessageSquare, title: 'Comunicacion Clara', desc: 'Estado de postulaciones siempre visible. Sin incertidumbre para el postulante.', color: 'from-blue-600 to-blue-700', light: 'bg-blue-50' },
                { icon: Globe, title: 'Acceso Universal', desc: 'Desde cualquier dispositivo, en cualquier momento. Mobile-first.', color: 'from-blue-500 to-blue-700', light: 'bg-blue-50' },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-lg transition-shadow group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-lg shadow-blue-500/20`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1.5">{card.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Institutions Section */}
      <section id="instituciones" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
              Instituciones
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Conectate con instituciones de excelencia
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Universidades, institutos tecnicos y escuelas de negocios confian en EduConnet para gestionar sus admisiones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                type: 'Universidad',
                count: '20+',
                desc: 'Universidades publicas y privadas con procesos de admision digitalizados.',
                icon: Building2,
              },
              {
                type: 'Institutos Tecnicos',
                count: '15+',
                desc: 'Institutos tecnicos y tecnologicos con programas de alta demanda laboral.',
                icon: BookOpen,
              },
              {
                type: 'Escuelas de Negocios',
                count: '10+',
                desc: 'Programas de especializacion y MBA para profesionales en crecimiento.',
                icon: BarChart3,
              },
            ].map((item) => (
              <div key={item.type} className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-blue-700 mb-1">{item.count}</p>
                <p className="font-semibold text-slate-900 mb-2">{item.type}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: 'EduConnet nos permitio digitalizar completamente nuestro proceso de admision. Ahora gestionamos el triple de postulantes con la mitad del tiempo.',
                author: 'Directora Academica',
                role: 'Universidad Nacional',
              },
              {
                quote: 'Gracias a EduConnet pude postularme a 3 instituciones diferentes desde mi celular en menos de 30 minutos. El proceso fue increiblemente sencillo.',
                author: 'Postulante',
                role: 'Admision Pregrado 2025',
              },
            ].map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-blue-200 text-blue-200" />
                  ))}
                </div>
                <p className="text-blue-100 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-blue-200 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comienza tu proceso de admision hoy
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unete a miles de postulantes e instituciones que ya confian en EduConnet para gestionar sus procesos educativos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLoginOpen(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-2xl text-lg hover:-translate-y-1"
            >
              Iniciar Sesion
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Globe, label: 'Sitio Web', value: 'www.educonnet.com' },
              { icon: MessageSquare, label: 'Soporte', value: 'soporte@educonnet.com' },
              { icon: Bell, label: 'Disponibilidad', value: 'Lun - Vie, 8am - 6pm' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">{item.label}</p>
                  <p className="text-slate-700 font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="mb-4"><EduConnetLogo size="lg" variant="dark" /></div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                La plataforma educativa que conecta instituciones de excelencia con postulantes talentosos. Digitaliza y simplifica tu proceso de admision.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2">
                {['Como funciona', 'Instituciones', 'Postulantes', 'Precios'].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                {['Centro de Ayuda', 'Politica de Privacidad', 'Terminos de Uso', 'Contacto'].map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 EduConnet. Todos los derechos reservados.
            </p>
            <p className="text-slate-500 text-sm">
              Hecho con dedicacion para la educacion latinoamericana
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSelectInstitution={() => { setLoginOpen(false); setView('institution'); }}
          onSelectStudent={(email) => { setStudentEmail(email); setLoginOpen(false); setView('student'); }}
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
}: {
  onClose: () => void;
  onSelectInstitution: () => void;
  onSelectStudent: (email: string) => void;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-md" />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-8 pt-8 pb-6">
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
          <p className="text-blue-200 text-center text-sm mt-1">
            {step === 'select' ? 'Selecciona tu tipo de acceso' : 'Ingresa tus credenciales'}
          </p>
        </div>

        <div className="p-6">
          {/* Type Select */}
          {step === 'select' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('student')}
                className="group w-full flex items-center gap-4 p-5 border-2 border-slate-200 hover:border-blue-500 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/10 text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-slate-900">Soy Postulante</p>
                  <p className="text-slate-500 text-sm mt-0.5">Explora instituciones y gestiona tus postulaciones</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => setStep('institution')}
                className="group w-full flex items-center gap-4 p-5 border-2 border-slate-200 hover:border-blue-900 rounded-2xl transition-all hover:shadow-lg hover:shadow-slate-500/10 text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-slate-900">Soy Institucion</p>
                  <p className="text-slate-500 text-sm mt-0.5">Gestiona postulaciones y el perfil de tu institucion</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
              </button>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center mb-2">Acceso rapido</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      setError('');
                      const { data } = await supabase.rpc('verify_student_password', {
                        p_email: 'estudiante@educonnet.com',
                        p_password: 'test123',
                      });
                      setLoading(false);
                      if (!data || data.length === 0) {
                        setError('Error al entrar como estudiante demo.');
                        return;
                      }
                      localStorage.setItem('edu_student', JSON.stringify(data[0]));
                      onSelectStudent(data[0].email);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Entrar Estudiante
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      setError('');
                      const { data } = await supabase.rpc('verify_institution_password', {
                        p_dea_code: 'LICEO2025',
                        p_password: 'admin2025',
                      });
                      setLoading(false);
                      if (!data || data.length === 0) {
                        setError('Error al entrar como institucion demo.');
                        return;
                      }
                      localStorage.setItem('edu_institution', JSON.stringify(data[0]));
                      onSelectInstitution();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Entrar Liceo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Student Login Form */}
          {step === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electronico</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contrasena</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ingresar'}
              </button>
              <button type="button" onClick={back} className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
                Volver
              </button>
            </form>
          )}

          {/* Institution Login Form */}
          {step === 'institution' && (
            <form onSubmit={handleInstitutionLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Codigo DEA</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={deaCode}
                    onChange={(e) => setDeaCode(e.target.value)}
                    placeholder="DEA-XXXX-XXXX"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-700 transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contrasena</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showInstPass ? 'text' : 'password'}
                    value={instPassword}
                    onChange={(e) => setInstPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-700 transition-all"
                  />
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ingresar'}
              </button>
              <button type="button" onClick={back} className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors">
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
