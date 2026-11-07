import { EduConnetLogo } from './EduConnetLogo';
import {
  GraduationCap,
  Building2,
  MessageSquare,
  Bell,
  FileText,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface LandingPageProps {
  onEnterStudent: () => void;
}

const NAV_LINKS = [
  { href: '#features', label: 'Funcionalidades' },
  { href: '#how', label: 'Como funciona' },
  { href: '#about', label: 'Institucion' },
];

const FEATURES = [
  { icon: FileText, title: 'Postulacion digital', desc: 'Completa tu formulario con datos personales, documentos y representantes en un proceso guiado paso a paso.' },
  { icon: MessageSquare, title: 'Mensajeria directa', desc: 'Comunica con la institucion en tiempo real. Resuelve dudas y recibe actualizaciones sin intermediarios.' },
  { icon: Bell, title: 'Notificaciones en vivo', desc: 'Entérate al instante cuando cambie el estado de tu postulacion o recibas un nuevo mensaje.' },
  { icon: ShieldCheck, title: 'Datos protegidos', desc: 'Tu informacion se guarda con politicas de acceso estrictas: solo tu y la institucion pueden verla.' },
  { icon: Clock, title: 'Seguimiento claro', desc: 'Revisa en cualquier momento si tu postulacion esta pendiente, aceptada o rechazada.' },
  { icon: Building2, title: 'Gestion institucional', desc: 'Las instituciones reciben, revisan y responden postulaciones desde un panel de control dedicado.' },
];

const STEPS = [
  { step: '01', title: 'Entra como postulante', desc: 'Empieza sin registrarte. Tu informacion se guarda automaticamente y puedes vincular tu correo despues.' },
  { step: '02', title: 'Completa tu formulario', desc: 'Sube tus datos personales, documentos e informacion de tu representante en un proceso guiado.' },
  { step: '03', title: 'Recibe tu respuesta', desc: 'La institucion revisa tu postulacion y te notifica el resultado al instante, con mensajeria directa.' },
];

const STATS = [
  { icon: Users, value: '500+', label: 'Postulantes activos' },
  { icon: FileText, value: '1,200+', label: 'Postulaciones gestionadas' },
  { icon: Clock, value: '3-5 dias', label: 'Tiempo de respuesta' },
  { icon: Building2, value: '1', label: 'Institucion asociada' },
];

export function LandingPage({ onEnterStudent }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-brand-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <EduConnetLogo size="sm" variant={scrolled ? 'light' : 'dark'} />

            <div className="hidden md:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? 'text-slate-600 hover:text-brand-600' : 'text-brand-100 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onEnterStudent}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-brand-900 text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5"
              >
                Comenzar ahora
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
              className={`md:hidden p-2 rounded-xl transition-colors ${scrolled ? 'hover:bg-brand-50' : 'hover:bg-white/10'}`}
            >
              {menuOpen
                ? <X className={`w-5 h-5 ${scrolled ? 'text-slate-700' : 'text-white'}`} />
                : <Menu className={`w-5 h-5 ${scrolled ? 'text-slate-700' : 'text-white'}`} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-brand-100 shadow-lg px-5 py-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-brand-600"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onEnterStudent(); }}
              className="w-full mt-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Comenzar ahora
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative bg-brand-900 text-white overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] bg-brand-600/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-36 pb-40 lg:pt-44 lg:pb-52 grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/15 rounded-full text-xs font-semibold tracking-wide text-brand-100">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Admision educativa digital
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight">
              Tu admision, <span className="text-cyan-300">simple</span> y en un solo lugar
            </h1>
            <p className="mt-6 text-lg text-brand-200 leading-relaxed max-w-xl">
              Postula a tu institucion, sube tus documentos y sigue cada etapa en tiempo real. Sin filas, sin papeleo y sin esperar a que te llamen.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onEnterStudent}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-cyan-400 hover:bg-cyan-300 text-brand-900 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/25 hover:-translate-y-0.5"
              >
                Soy postulante
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#how"
                className="inline-flex items-center justify-center px-7 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-2xl transition-colors"
              >
                Ver como funciona
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-brand-200">
              <span className="inline-flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-300" />Sin costos ocultos</span>
              <span className="inline-flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-300" />100% digital</span>
              <span className="inline-flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-300" />Respuestas en tiempo real</span>
            </div>
          </div>

          <div className="lg:col-span-6 relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src="https://images.pexels.com/photos/27910975/pexels-photo-27910975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Estudiantes caminando por el pasillo de su institucion"
                className="w-full h-[420px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-8 -left-4 sm:-left-8 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl p-5 border border-brand-100 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">Liceo Romero Garcia</p>
                  <p className="text-xs text-slate-500">Inscripcion abierta</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  Postulacion aceptada
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-20 z-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-brand-900/10 border border-brand-100 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-brand-100">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 sm:p-8 text-center">
              <s.icon className="w-5 h-5 mx-auto text-cyan-600 mb-3" />
              <p className="text-2xl sm:text-3xl font-bold text-brand-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Funcionalidades</p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-brand-900 leading-tight">Todo lo necesario para postular, en un solo lugar</h2>
            <p className="mt-4 text-lg text-slate-600">Una plataforma pensada para que postulantes e instituciones avancen sin complicaciones.</p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{ animationDelay: `${i * 0.06}s` }}
                className="animate-slide-up group relative bg-white rounded-2xl p-7 border border-brand-100 hover:border-cyan-300 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-brand-600/20">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-brand-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative bg-brand-700 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Como funciona</p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold leading-tight">Tres pasos para iniciar tu admision</h2>
          </div>

          <ol className="mt-16 grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <li key={s.step} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-8">
                <span className="text-5xl font-bold text-cyan-300/90">{s.step}</span>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-sm text-brand-100 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14">
            <button
              onClick={onEnterStudent}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-brand-900 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/20 hover:-translate-y-0.5"
            >
              Iniciar mi postulacion
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/32292157/pexels-photo-32292157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Estudiantes conversando en el pasillo de la institucion"
              className="w-full h-[380px] lg:h-[460px] object-cover rounded-3xl"
            />
            <div className="absolute -top-5 -right-5 hidden sm:flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-brand-100 px-5 py-4">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-900">Acceso seguro</p>
                <p className="text-xs text-slate-500">Datos solo para tu institucion</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Institucion asociada</p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-brand-900 leading-tight">Liceo Romero Garcia</h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Nuestra primera institucion asociada utiliza EduConnet para digitalizar su proceso de admision, ofreciendo a los postulantes una experiencia moderna, transparente y eficiente.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: FileText, label: 'Postulaciones en linea' },
                { icon: MessageSquare, label: 'Comunicacion directa con la institucion' },
                { icon: CheckCircle, label: 'Respuestas rapidas y claras' },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-brand-600" />
                  </span>
                  <span className="font-medium text-slate-700">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[32px] bg-brand-900 px-8 py-16 sm:px-16 text-center shadow-2xl">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[480px] h-[240px] bg-cyan-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Comienza tu postulacion hoy</h2>
            <p className="mt-4 text-lg text-brand-200 max-w-2xl mx-auto">
              Crea tu espacio de postulante en segundos y sigue tu proceso desde cualquier dispositivo.
            </p>
            <button
              onClick={onEnterStudent}
              className="group mt-10 inline-flex items-center gap-2 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-brand-900 font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/25 hover:-translate-y-0.5"
            >
              Entrar como postulante
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <EduConnetLogo size="sm" variant="light" />
            <nav className="flex items-center gap-8 text-sm font-medium text-slate-600">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-brand-600 transition-colors">{link.label}</a>
              ))}
            </nav>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="w-4 h-4 text-cyan-600" />
              <span>contacto@educonnet.com</span>
            </div>
          </div>
          <p className="mt-10 pt-8 border-t border-brand-100 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} EduConnet. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
