import { EduConnetLogo } from './EduConnetLogo';
import {
  GraduationCap,
  Building2,
  MessageSquare,
  Bell,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onEnterStudent: () => void;
}

export function LandingPage({ onEnterStudent }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <EduConnetLogo size="sm" variant="light" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-[#2563EB] transition-colors">Funcionalidades</a>
              <a href="#how" className="text-sm font-medium text-slate-600 hover:text-[#2563EB] transition-colors">Como funciona</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-[#2563EB] transition-colors">Acerca de</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onEnterStudent}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#2563EB]/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                Comenzar ahora
              </button>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 animate-fade-in">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-600 hover:text-[#2563EB]">Funcionalidades</a>
            <a href="#how" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-600 hover:text-[#2563EB]">Como funciona</a>
            <a href="#about" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-600 hover:text-[#2563EB]">Acerca de</a>
            <button
              onClick={() => { setMenuOpen(false); onEnterStudent(); }}
              className="w-full px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl"
            >
              Comenzar ahora
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#93C5FD]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE]/40 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#1D4ED8]">Plataforma educativa digital</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Conecta talento con{' '}
                <span className="text-[#2563EB]">instituciones</span> de excelencia
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                EduConnet digitaliza el proceso de admision. Postula a instituciones educativas, gestiona tus documentos y recibe respuestas en tiempo real, todo desde un solo lugar.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onEnterStudent}
                  className="px-7 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-2xl transition-all shadow-xl shadow-[#2563EB]/25 hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  Soy Postulante
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#how"
                  className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  Ver como funciona
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2563EB]" />
                  Sin costos ocultos
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2563EB]" />
                  100% digital
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">Liceo Romero Garcia</p>
                          <p className="text-[#BFDBFE] text-xs">Inscripcion abierta</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 text-xs font-bold rounded-lg">Activo</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { icon: FileText, label: 'Formulario digital', status: 'Completo' },
                        { icon: MessageSquare, label: 'Mensajes', status: '2 nuevos' },
                        { icon: Bell, label: 'Notificaciones', status: 'En vivo' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-white text-sm font-medium flex-1">{item.label}</p>
                          <span className="text-[#93C5FD] text-xs font-semibold">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 w-56 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Postulacion aceptada</p>
                      <p className="text-xs text-slate-400">Hace 2 minutos</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-[#3B82F6] to-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '500+', label: 'Postulantes activos' },
              { icon: Building2, value: '1', label: 'Institucion partner' },
              { icon: FileText, value: '1,200+', label: 'Postulaciones gestionadas' },
              { icon: Clock, value: '3-5 dias', label: 'Tiempo de respuesta' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-12 h-12 mx-auto bg-[#2563EB]/20 rounded-2xl flex items-center justify-center mb-3">
                  <s.icon className="w-6 h-6 text-[#93C5FD]" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Todo lo que necesitas en un solo lugar</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Una plataforma completa que simplifica el proceso de admision para postulantes e instituciones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Postulacion digital', desc: 'Completa tu formulario con datos personales, documentos y representantes en un proceso guiado paso a paso.', color: 'bg-[#2563EB]' },
              { icon: MessageSquare, title: 'Mensajeria directa', desc: 'Comunica con la institucion en tiempo real. Resuelve dudas y recibe actualizaciones sin intermediarios.', color: 'bg-blue-600' },
              { icon: Bell, title: 'Notificaciones en vivo', desc: 'Entero al instante cuando cambie el estado de tu postulacion o recibas un nuevo mensaje.', color: 'bg-emerald-600' },
              { icon: ShieldCheck, title: 'Datos seguros', desc: 'Tu informacion esta protegida con encriptacion de nivel bancario y politicas de acceso estrictas.', color: 'bg-slate-700' },
              { icon: Clock, title: 'Seguimiento en tiempo real', desc: 'Visualiza el estado de tus postulaciones: pendiente, aceptada o rechazada, en cualquier momento.', color: 'bg-amber-600' },
              { icon: Building2, title: 'Gestion institucional', desc: 'Las instituciones reciben, revisan y gestionan postulaciones desde un panel de control dedicado.', color: 'bg-rose-600' },
            ].map((f, i) => (
              <div
                key={f.title}
                style={{ animationDelay: `${i * 0.08}s` }}
                className="animate-slide-up group bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Como funciona</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Tres pasos simples para iniciar tu proceso de admision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Crea tu cuenta', desc: 'Ingresa como postulante sin necesidad de registrarte. Tu informacion se guarda automaticamente.' },
              { step: '02', title: 'Completa el formulario', desc: 'Sube tus datos personales, documentos y informacion de tu representante en un proceso guiado.' },
              { step: '03', title: 'Recibe respuesta', desc: 'La institucion revisa tu postulacion y te notifica al instante el resultado, con mensajeria directa.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#2563EB]/30 to-transparent" />
                )}
                <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                    <span className="text-white font-bold text-lg">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onEnterStudent}
              className="px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-2xl transition-all shadow-xl shadow-[#2563EB]/25 hover:shadow-2xl hover:-translate-y-0.5 inline-flex items-center gap-2 group"
            >
              Iniciar mi postulacion
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE]/40 rounded-full mb-6">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-xs font-semibold text-[#1D4ED8]">Institucion partner</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Liceo Romero Garcia</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Nuestra primera institucion asociada. El Liceo Romero Garcia utiliza EduConnet para digitalizar
            su proceso de admision, ofreciendo a los postulantes una experiencia moderna, transparente y eficiente.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { icon: FileText, label: 'Postulaciones online' },
              { icon: MessageSquare, label: 'Comunicacion directa' },
              { icon: CheckCircle, label: 'Respuestas rapidas' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="w-12 h-12 bg-[#2563EB]/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#2563EB]" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#93C5FD]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Comienza tu postulacion hoy
          </h2>
          <p className="text-lg text-[#BFDBFE] mb-8 max-w-2xl mx-auto">
            Unete a la plataforma que esta transformando el proceso de admision educativa.
          </p>
          <button
            onClick={onEnterStudent}
            className="px-8 py-4 bg-white text-[#2563EB] font-bold rounded-2xl transition-all shadow-2xl hover:-translate-y-0.5 inline-flex items-center gap-2 group"
          >
            Entrar como postulante
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <EduConnetLogo size="sm" variant="dark" />
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
              <a href="#how" className="hover:text-white transition-colors">Como funciona</a>
              <a href="#about" className="hover:text-white transition-colors">Acerca de</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="w-4 h-4" />
              <span>contacto@educonnet.com</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} EduConnet. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
