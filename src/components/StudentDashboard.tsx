import { useState } from 'react';
import { Application, Institution } from '../types';
import { EduConnetLogo } from './EduConnetLogo';
import {
  Search,
  Bell,
  Home,
  FileText,
  Settings,
  Clock,
  MapPin,
  Bookmark,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Calendar,
  Mail,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  Building2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface StudentDashboardProps {
  onApply: () => void;
  onViewInstitution: () => void;
  onMyApplications: () => void;
  onSettings: () => void;
  onMessages: () => void;
  onNotifications: () => void;
  onExit: () => void;
  institution: Institution | null;
  applications: Application[];
  unreadMessages?: number;
  unreadNotifications?: number;
  onAppMessages?: (id: string) => void;
  studentName?: string;
}

type Tab = 'home' | 'explore' | 'applications' | 'messages' | 'notifications' | 'settings';

export function StudentDashboard({
  onApply,
  onViewInstitution,
  onMyApplications,
  onSettings,
  onMessages,
  onNotifications,
  onExit,
  institution,
  applications,
  unreadMessages = 0,
  unreadNotifications = 0,
  onAppMessages,
  studentName = 'Postulante',
}: StudentDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const studentInitials = studentName.charAt(0).toUpperCase() || 'P';

  const pending  = applications.filter((a) => a.status === 'pendiente').length;
  const accepted = applications.filter((a) => a.status === 'aceptada').length;
  const rejected = applications.filter((a) => a.status === 'rechazada').length;
  const recent   = applications.slice(0, 3);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setAccountMenuOpen(false);
    if (tab === 'applications') onMyApplications();
    else if (tab === 'settings') onSettings();
    else if (tab === 'explore') onViewInstitution();
    else if (tab === 'messages') onMessages();
    else if (tab === 'notifications') onNotifications();
  };

  const handleLogout = () => {
    onExit();
  };

  const navItems = [
    { id: 'home'         as Tab, label: 'Inicio',        icon: Home },
    { id: 'explore'      as Tab, label: 'Explorar',      icon: Search },
    { id: 'applications' as Tab, label: 'Postulaciones', icon: FileText,      badge: applications.length },
    { id: 'messages'     as Tab, label: 'Mensajes',      icon: MessageSquare, badge: unreadMessages },
    { id: 'notifications' as Tab, label: 'Notificaciones', icon: Bell,          badge: unreadNotifications },
    { id: 'settings'     as Tab, label: 'Ajustes',       icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <EduConnetLogo size="md" variant="dark" />
      </div>

      {/* Student chip */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white text-xs font-bold">
            {studentInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{studentName}</p>
            <p className="text-brand-300 text-[10px]">Postulante</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              style={{ animationDelay: `${i * 0.05}s` }}
              className={`animate-slide-in-left w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-spring ${
                active
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                  active ? 'bg-white/25 text-white' : 'bg-brand-600/80 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats mini */}
      {applications.length > 0 && (
        <div className="mx-3 mb-3 p-4 rounded-xl bg-white/8 border border-white/10">
          <p className="text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3">Mis Postulaciones</p>
          <div className="grid grid-cols-3 text-center gap-1">
            {[
              { v: pending,  label: 'Pend', c: 'text-amber-400' },
              { v: accepted, label: 'Acept', c: 'text-emerald-400' },
              { v: rejected, label: 'Rech', c: 'text-red-400' },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account */}
      <div className="px-3 pb-4 relative">
        <button
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 border border-white/10 hover:bg-white/15 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white text-xs font-bold">
            {studentInitials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">Mi Cuenta</p>
            <p className="text-xs text-white/50 truncate">{studentName}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${accountMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {accountMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-brand-900 border border-white/10 rounded-xl shadow-2xl py-1 z-10 animate-scale-in">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesion
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col z-40">
        <div
          className="flex grow flex-col overflow-hidden"
          style={{ background: 'linear-gradient(165deg, #1E293B 0%, #0F172A 60%, #0F172A 100%)' }}
        >
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors btn-spring">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <EduConnetLogo size="sm" variant="light" />
          <button className="relative p-2 -mr-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-6 h-6 text-slate-700" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-scale-in" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(165deg, #1E293B 0%, #0F172A 60%, #0F172A 100%)' }}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Main */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">

          {/* Welcome */}
          <div className="mb-8 animate-fade-in">
            <p className="text-sm text-brand-600 font-semibold mb-1">Hola, bienvenido de nuevo</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{studentName}</h1>
            <p className="text-slate-500 mt-1 text-sm">Gestiona tus postulaciones y descubre nuevas oportunidades.</p>
          </div>

          {/* Search */}
          <div className="relative mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar instituciones, programas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-brand-600 transition-all shadow-sm"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { title: 'Total',      value: applications.length, icon: FileText,     color: 'blue' },
              { title: 'Pendientes', value: pending,             icon: Clock,        color: 'amber',  onClick: () => handleTabChange('applications') },
              { title: 'Aceptadas',  value: accepted,            icon: CheckCircle,  color: 'green',  onClick: () => handleTabChange('applications') },
              { title: 'Rechazadas', value: rejected,            icon: XCircle,      color: 'red',    onClick: () => handleTabChange('applications') },
            ].map((s, i) => (
              <div
                key={s.title}
                onClick={s.onClick}
                style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                className={`animate-slide-up bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm spring-hover ${s.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    s.color === 'blue'  ? 'bg-brand-600/10' :
                    s.color === 'amber' ? 'bg-amber-100'    :
                    s.color === 'green' ? 'bg-emerald-100'  : 'bg-red-100'
                  }`}>
                    <s.icon className={`w-5 h-5 ${
                      s.color === 'blue'  ? 'text-brand-600'    :
                      s.color === 'amber' ? 'text-amber-600'    :
                      s.color === 'green' ? 'text-emerald-600'  : 'text-red-500'
                    }`} />
                  </div>
                  {s.color === 'blue' && applications.length > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Activo
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{s.title}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Institution card */}
            <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.28s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Institucion Disponible</h2>
                {institution && (
                  <button onClick={onViewInstitution} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
                    Ver detalles <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              {institution ? (
                <InstitutionCard institution={institution} onApply={onApply} onViewDetails={onViewInstitution} />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-brand-600/40" />
                  </div>
                  <p className="text-slate-500 font-medium">Sin instituciones disponibles</p>
                  <p className="text-slate-400 text-sm mt-1">Pronto encontraras nuevas oportunidades</p>
                </div>
              )}
            </div>

            {/* Recent applications */}
            <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Postulaciones</h2>
                {applications.length > 0 && (
                  <button onClick={() => handleTabChange('applications')} className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                    Ver todas
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {recent.length > 0 ? (
                  recent.map((app, i) => (
                    <div key={app.id} style={{ animationDelay: `${0.4 + i * 0.06}s` }} className="animate-fade-in">
                      <ApplicationCard
                        application={app}
                        onMessages={() => onAppMessages?.(app.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-7 h-7 text-brand-600/40" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">Sin postulaciones</p>
                    <p className="text-slate-400 text-xs mt-1">Comienza tu proceso hoy</p>
                    <button
                      onClick={onApply}
                      className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all btn-spring shadow-lg shadow-brand-600/20"
                    >
                      Postularme ahora
                    </button>
                  </div>
                )}
              </div>

              {/* Apply button when has applications */}
              {applications.length > 0 && (
                <button
                  onClick={onApply}
                  className="mt-3 w-full py-3 bg-brand-600 hover:from-brand-600 hover:to-brand-700 text-white text-sm font-semibold rounded-xl transition-all btn-spring shadow-lg shadow-brand-600/20"
                >
                  Nueva Postulacion
                </button>
              )}
            </div>
          </div>

          {/* Status overview */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.45s' }}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Estado de mis Postulaciones</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: 'Pendientes',  count: pending,  status: 'pendiente' as const,  desc: 'En proceso de revision',  icon: Clock,         iconBg: 'bg-amber-100',   iconC: 'text-amber-600',   bg: 'from-amber-50 to-white border-amber-200', badge: 'bg-amber-500' },
                { title: 'Aceptadas',   count: accepted, status: 'aceptada' as const,   desc: 'Admitido',                icon: CheckCircle,   iconBg: 'bg-emerald-100', iconC: 'text-emerald-600', bg: 'from-emerald-50 to-white border-emerald-200', badge: 'bg-emerald-500' },
                { title: 'Rechazadas',  count: rejected, status: 'rechazada' as const,  desc: 'Sigue intentando',        icon: XCircle,       iconBg: 'bg-red-100',     iconC: 'text-red-500',     bg: 'from-red-50 to-white border-red-200', badge: 'bg-red-500' },
              ].map((s, i) => (
                <div key={s.title} style={{ animationDelay: `${0.5 + i * 0.07}s` }} className={`animate-fade-in bg-gradient-to-br ${s.bg} rounded-2xl p-5 border spring-hover cursor-pointer`} onClick={() => handleTabChange('applications')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                      <s.icon className={`w-6 h-6 ${s.iconC}`} />
                    </div>
                    <span className={`w-10 h-10 ${s.badge} text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg`}>
                      {s.count}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="mt-6 grid md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.55s' }}>
            <div className="bg-brand-50 rounded-2xl p-5 border border-brand-200/40 spring-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-600/20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Proceso de Admision</h3>
                  <p className="text-sm text-slate-600 mt-1">El tiempo de respuesta promedio es de 3-5 dias habiles. Recibiras notificaciones por correo electronico.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200 spring-hover">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Notificaciones</h3>
                  <p className="text-sm text-slate-600 mt-1">Te notificaremos cuando haya actualizaciones en tus postulaciones. Revisa tu correo regularmente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/50 z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all btn-spring ${active ? 'text-violet-600' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-violet-600/10' : ''}`}>
                  <item.icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-semibold leading-tight ${active ? 'text-violet-600' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function InstitutionCard({
  institution,
  onApply,
  onViewDetails,
}: {
  institution: Institution;
  onApply: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm spring-hover">
      {institution.cover_image && (
        <div className="relative h-44 lg:h-52 overflow-hidden">
          <img src={institution.cover_image} alt={institution.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {institution.logo_url ? (
            <img src={institution.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-brand-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {institution.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-slate-900">{institution.name}</h3>
            {institution.institution_type && (
              <p className="text-sm text-brand-600 font-medium mt-0.5">{institution.institution_type}</p>
            )}
            {institution.location && (
              <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />{institution.location}
              </div>
            )}
          </div>
        </div>
        {institution.description && (
          <p className="mt-4 text-slate-600 text-sm leading-relaxed line-clamp-2">{institution.description}</p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onApply}
            className="flex-1 py-3 bg-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl transition-all btn-spring shadow-lg shadow-brand-600/20"
          >
            Postularme Ahora
          </button>
          <button
            onClick={onViewDetails}
            className="px-5 py-3 bg-brand-50 hover:bg-brand-100 text-brand-600 font-semibold rounded-xl transition-all btn-spring flex items-center justify-center gap-2"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplicationCard({ application, onMessages }: { application: Application; onMessages?: () => void }) {
  const statusConfig = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Pendiente', dot: 'bg-amber-500' },
    aceptada:  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Aceptada', dot: 'bg-emerald-500' },
    rechazada: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', label: 'Rechazada', dot: 'bg-red-500' },
  };
  const style = statusConfig[application.status];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/60 spring-hover shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">
                {application.name.charAt(0)}{application.last_name?.charAt(0) || ''}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{application.name} {application.last_name || ''}</p>
              <p className="text-xs text-slate-500">{application.educational_level}</p>
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(application.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-2">
          {application.institutions?.name && (
            <p className="text-xs text-slate-500 font-medium truncate max-w-[100px]">{application.institutions.name}</p>
          )}
          {onMessages && (
            <button
              onClick={onMessages}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-semibold rounded-lg transition-all btn-spring"
            >
              <MessageSquare className="w-3 h-3" />
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
