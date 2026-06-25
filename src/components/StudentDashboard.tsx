import { useState } from 'react';
import { Application, Institution } from '../types';
import { EduConnetLogo } from './EduConnetLogo';
import {
  Search,
  Bell,
  User,
  Home,
  FileText,
  Settings,
  Clock,
  MapPin,
  Award,
  Bookmark,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

interface StudentDashboardProps {
  onApply: () => void;
  onViewInstitution: () => void;
  onMyApplications: () => void;
  onSettings: () => void;
  onMessages: () => void;
  onExit: () => void;
  institution: Institution | null;
  applications: Application[];
  unreadMessages?: number;
}

type Tab = 'home' | 'explore' | 'applications' | 'messages' | 'settings';

export function StudentDashboard({
  onApply,
  onViewInstitution,
  onMyApplications,
  onSettings,
  onMessages,
  onExit,
  institution,
  applications,
  unreadMessages = 0,
  onAppMessages,
}: StudentDashboardProps & { onAppMessages?: (id: string) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const pendingCount = applications.filter((a) => a.status === 'pendiente').length;
  const acceptedCount = applications.filter((a) => a.status === 'aceptada').length;
  const rejectedCount = applications.filter((a) => a.status === 'rechazada').length;

  const recentApplications = applications.slice(0, 3);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setAccountMenuOpen(false);

    if (tab === 'applications') {
      onMyApplications();
    } else if (tab === 'settings') {
      onSettings();
    } else if (tab === 'explore') {
      onViewInstitution();
    } else if (tab === 'messages') {
      onMessages();
    }
  };

  const navItems = [
    { id: 'home' as Tab, label: 'Inicio', icon: Home },
    { id: 'explore' as Tab, label: 'Explorar', icon: Search },
    { id: 'applications' as Tab, label: 'Postulaciones', icon: FileText, badge: applications.length },
    { id: 'messages' as Tab, label: 'Mensajes', icon: MessageSquare, badge: unreadMessages },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white border-r border-slate-200 px-5 pb-6">
          {/* Logo */}
          <div className="flex items-center py-5 border-b border-slate-100">
            <EduConnetLogo size="md" variant="light" />
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-5">
            <ul className="flex flex-1 flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* User Profile */}
            <div className="mt-auto space-y-3">
                {/* Mi Cuenta Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-900 truncate">Mi Cuenta</p>
                    <p className="text-xs text-slate-500 truncate">Postulante</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-10">
                    <button
                      onClick={onExit}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <EduConnetLogo size="sm" variant="light" />
          <button className="relative p-2 -mr-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-6 h-6 text-slate-700" />
            {applications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <EduConnetLogo size="sm" variant="light" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 -mr-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeTab === item.id ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Mi Cuenta</p>
                <p className="text-xs text-slate-500">Postulante</p>
              </div>
            </div>
            <button
              onClick={() => { setSidebarOpen(false); onExit(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-1">Hola, bienvenido de nuevo</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Panel de Postulante
            </h1>
            <p className="text-slate-500 mt-2">
              Gestiona tus postulaciones y descubre nuevas oportunidades educativas.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar instituciones, programas, becas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Postulaciones"
              value={applications.length}
              icon={FileText}
              color="blue"
              trend={applications.length > 0}
            />
            <StatCard
              title="Pendientes"
              value={pendingCount}
              icon={Clock}
              color="yellow"
              onClick={() => handleTabChange('applications')}
            />
            <StatCard
              title="Aceptadas"
              value={acceptedCount}
              icon={Award}
              color="green"
              onClick={() => handleTabChange('applications')}
            />
            <StatCard
              title="Rechazadas"
              value={rejectedCount}
              icon={TrendingUp}
              color="red"
              onClick={() => handleTabChange('applications')}
            />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured Institution */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Institucion Disponible</h2>
                <button
                  onClick={onViewInstitution}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  Ver detalles <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {institution ? (
                <InstitutionCard
                  institution={institution}
                  onApply={onApply}
                  onViewDetails={onViewInstitution}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No hay instituciones disponibles</p>
                </div>
              )}
            </div>

            {/* Applications Sidebar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Postulaciones Recientes</h2>
                {applications.length > 0 && (
                  <button
                    onClick={() => handleTabChange('applications')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Ver todas
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <ApplicationCard key={app.id} application={app} onMessages={() => onAppMessages?.(app.id)} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-7 h-7 text-blue-400" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">Sin postulaciones</p>
                    <p className="text-slate-400 text-xs mt-1">Comienza tu proceso hoy</p>
                    <button
                      onClick={onApply}
                      className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      Postularme ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Estado de Postulaciones</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <StatusCard
                title="Pendientes"
                count={pendingCount}
                status="pendiente"
                description="En proceso de revision"
                icon={Clock}
              />
              <StatusCard
                title="Aceptadas"
                count={acceptedCount}
                status="aceptada"
                description="Felicitaciones"
                icon={Award}
              />
              <StatusCard
                title="Rechazadas"
                count={rejectedCount}
                status="rechazada"
                description="Continua intentando"
                icon={TrendingUp}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Proceso de Admision</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    El tiempo de respuesta promedio es de 3-5 dias habiles. Recibiras notificaciones por correo electronico.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Notificaciones</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Te notificaremos cuando haya actualizaciones en tus postulaciones. Revisa tu correo regularmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/50 z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-colors ${
                activeTab === item.id ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'yellow' | 'green' | 'red';
  trend?: boolean;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    yellow: 'bg-amber-100',
    green: 'bg-emerald-100',
    red: 'bg-red-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgClasses[color]}`}>
          <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
        </div>
        {trend && value > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            Activo
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
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
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-lg transition-shadow">
      {institution.cover_image && (
        <div className="relative h-44 lg:h-52 overflow-hidden">
          <img
            src={institution.cover_image}
            alt={institution.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {institution.logo_url ? (
            <img
              src={institution.logo_url}
              alt=""
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {institution.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-slate-900">
              {institution.name}
            </h3>
            {institution.institution_type && (
              <p className="text-sm text-slate-500 font-medium">{institution.institution_type}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{institution.location}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-slate-600 text-sm leading-relaxed line-clamp-2">{institution.description}</p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onApply}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Postularme Ahora
          </button>
          <button
            onClick={onViewDetails}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
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
    pendiente: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Pendiente',
    },
    aceptada: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Aceptada',
    },
    rechazada: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Rechazada',
    },
  };

  const style = statusConfig[application.status];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/60 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {application.name.charAt(0)}
                {application.last_name?.charAt(0) || ''}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {application.name} {application.last_name || ''}
              </p>
              <p className="text-xs text-slate-500">{application.educational_level}</p>
            </div>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${style.bg} ${style.text} ${style.border}`}
        >
          {style.label}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {new Date(application.created_at).toLocaleDateString('es-EC', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
        <div className="flex items-center gap-2">
          {application.institutions?.name && (
            <p className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
              {application.institutions.name}
            </p>
          )}
          {onMessages && (
            <button
              onClick={onMessages}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              Mensajes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  count,
  status,
  description,
  icon: Icon,
}: {
  title: string;
  count: number;
  status: 'pendiente' | 'aceptada' | 'rechazada';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const styles = {
    pendiente: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      badge: 'bg-amber-500',
    },
    aceptada: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badge: 'bg-emerald-500',
    },
    rechazada: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      badge: 'bg-red-500',
    },
  };

  const style = styles[status];

  return (
    <div className={`rounded-2xl p-5 border ${style.bg} hover:shadow-lg transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg}`}>
          <Icon className={`w-6 h-6 ${style.iconColor}`} />
        </div>
        <span
          className={`w-10 h-10 ${style.badge} text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg`}
        >
          {count}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </div>
  );
}
