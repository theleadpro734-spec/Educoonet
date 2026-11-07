import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useUnreadNotifications } from '../lib/useUnreadNotifications';
import { Application } from '../types';
import { InstitutionDashboard } from './InstitutionDashboard';
import { InstitutionProfile } from './InstitutionProfile';
import { QuotasView } from './QuotasView';
import { MessagingView } from './MessagingView';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import { NotificationsView } from './NotificationsView';
import { ArrowLeft, RefreshCw, Building2, Users, Bell, LogOut, Shield, HelpCircle, Eye, MessageSquare, Trash2 } from 'lucide-react';

interface InstitutionPanelProps {
  onExit: () => void;
}

type View = 'dashboard' | 'profile' | 'applications' | 'quotas' | 'settings' | 'messages' | 'notifications';

interface MessageState {
  selectedApplicationId?: string;
}

export function InstitutionPanel({ onExit }: InstitutionPanelProps) {
  const { institution, user, signOut } = useAuth();
  const unreadNotifications = useUnreadNotifications({ userId: user?.id, userEmail: user?.email, isLocal: false });
  const [view, setView] = useState<View>('dashboard');
  const [messageState, setMessageState] = useState<MessageState>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const institutionId = institution?.id;

  useEffect(() => {
    fetchData();
  }, [reloadKey, institutionId]);

  useEffect(() => {
    const channel = supabase
      .channel('institution_unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'application_messages' },
        () => setReloadKey((k) => k + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('institution_applications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => setReloadKey((k) => k + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    if (!institutionId) { setLoading(false); return; }
    setLoading(true);
    const [appsRes] = await Promise.all([
      supabase
        .from('applications')
        .select('*')
        .eq('institution_id', institutionId)
        .is('archived_at', null)
        .order('created_at', { ascending: false }),
    ]);

    if (appsRes.data) setApplications(appsRes.data);

    const appIds = (appsRes.data || []).map((a: Application) => a.id);
    if (appIds.length > 0) {
      const { count } = await supabase
        .from('application_messages')
        .select('*', { count: 'exact', head: true })
        .in('application_id', appIds)
        .eq('sender_type', 'student')
        .eq('read_by_institution', false);
      setUnreadMessages(count || 0);
    } else {
      setUnreadMessages(0);
    }

    setLoading(false);
  };

  const handleRefresh = () => {
    setReloadKey((k) => k + 1);
  };

  const handleDeleteApplication = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) {
      setActionError('No se pudo eliminar la postulacion. Intenta de nuevo.');
      return;
    }
    setActionError(null);
    await fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.rpc('institution_set_application_status', {
      p_application_id: id,
      p_new_status: status,
    });
    if (error) {
      setUpdatingId(null);
      setActionError(error.message.includes('archivada')
        ? 'Esta postulacion ya fue rechazada y no se puede volver a aceptar.'
        : 'No se pudo actualizar la postulacion. Intenta de nuevo.');
      return;
    }
    setActionError(null);
    await fetchData();
    setUpdatingId(null);
  };

  if (loading || !institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50/40">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (view === 'profile') {
    return (
      <InstitutionProfile
        onExit={() => setView('dashboard')}
      />
    );
  }

  if (view === 'quotas') {
    return (
      <QuotasView
        institutionId={institutionId!}
        applications={applications}
        onBack={() => setView('dashboard')}
      />
    );
  }

  if (view === 'applications') {
    return (
      <ApplicationsListView
        onBack={() => setView('dashboard')}
        applications={applications}
        onUpdateStatus={updateStatus}
        onDelete={handleDeleteApplication}
        updatingId={updatingId}
        actionError={actionError}
        onRefresh={handleRefresh}
        institutionName={institution.name}
        onMessage={(appId) => {
          setMessageState({ selectedApplicationId: appId });
          setView('messages');
        }}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsView
        onBack={() => setView('dashboard')}
        onExit={async () => { await signOut(); onExit(); }}
        institutionName={institution.name}
      />
    );
  }

  if (view === 'messages') {
    return (
      <MessagingView
        mode="institution"
        applications={applications}
        selectedApplicationId={messageState.selectedApplicationId}
        senderName={institution.name}
        onBack={() => setView('dashboard')}
        onRefresh={handleRefresh}
        key={`inst-msg-${reloadKey}`}
      />
    );
  }

  if (view === 'notifications') {
    return (
      <NotificationsView
        onBack={() => setView('dashboard')}
        onNavigate={(notif) => {
          if (notif.type === 'new_application' && notif.related_id) {
            const app = applications.find((a) => a.id === notif.related_id);
            if (app) {
              setMessageState({ selectedApplicationId: app.id });
              setView('messages');
              return;
            }
          }
          setView('dashboard');
        }}
      />
    );
  }

  return (
    <InstitutionDashboard
      applications={applications}
      institutionName={institution.name}
      onViewAllApplications={() => setView('applications')}
      onUpdateStatus={updateStatus}
      onProfile={() => setView('profile')}
      onQuotas={() => setView('quotas')}
      onSettings={() => setView('settings')}
      onMessages={(appId) => {
        setMessageState({ selectedApplicationId: appId });
        setView('messages');
      }}
      onNotifications={() => setView('notifications')}
      onExit={async () => { await signOut(); onExit(); }}
      updatingId={updatingId}
      unreadMessages={unreadMessages}
      unreadNotifications={unreadNotifications}
    />
  );
}

function ApplicationsListView({
  onBack,
  applications,
  onUpdateStatus,
  onDelete,
  updatingId,
  actionError,
  onRefresh,
  institutionName,
  onMessage,
}: {
  onBack: () => void;
  applications: Application[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  updatingId: string | null;
  actionError: string | null;
  onRefresh: () => void;
  institutionName: string;
  onMessage: (appId: string) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const statusStyles = {
    pendiente: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: 'Pendiente',
    },
    aceptada: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      label: 'Aceptada',
    },
    rechazada: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Rechazada',
    },
  };

  const total = applications.length;
  const pending = applications.filter(a => a.status === 'pendiente').length;
  const accepted = applications.filter(a => a.status === 'aceptada').length;
  const rejected = applications.filter(a => a.status === 'rechazada').length;

  return (
    <div className="min-h-screen bg-brand-50/40">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-900 text-sm truncate max-w-[150px]">
              {institutionName}
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="text-slate-500 hover:text-slate-900 transition-colors p-2 -mr-2"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'Todas', count: total },
            { id: 'pendiente', label: 'Pendientes', count: pending },
            { id: 'aceptada', label: 'Aceptadas', count: accepted },
            { id: 'rechazada', label: 'Rechazadas', count: rejected },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterStatus(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === filter.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  filterStatus === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {actionError && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium text-lg">
              {filterStatus === 'all'
                ? 'No hay postulaciones aun'
                : `No hay postulaciones ${filterStatus === 'pendiente' ? 'pendientes' : filterStatus === 'aceptada' ? 'aceptadas' : 'rechazadas'}`}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Las nuevas postulaciones apareceran aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-2">
              Mostrando {filteredApplications.length} de {total} postulaciones
            </p>
            {filteredApplications.map((app) => {
              const style = statusStyles[app.status];
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {app.name.charAt(0)}
                        {app.last_name?.charAt(0) || ''}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold text-slate-900">
                            {app.name} {app.last_name || ''}
                          </h3>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span className="font-medium">Email:</span>
                              <a href={`mailto:${app.email}`} className="text-brand-600 hover:underline">
                                {app.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span className="font-medium">Telefono:</span>
                              <a href={`tel:${app.phone}`} className="text-brand-600 hover:underline">
                                {app.phone}
                              </a>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-lg text-xs font-medium text-brand-700">
                              {app.educational_level}
                            </span>
                            {app.identity_document && (
                              <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                Doc: {app.identity_document}
                              </span>
                            )}
                            {app.address && (
                              <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                {app.address}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 text-xs text-slate-400">
                            Enviada: {new Date(app.created_at).toLocaleString('es-EC', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col items-start sm:items-end gap-3">
                          <span
                            className={`px-4 py-2 rounded-xl text-sm font-semibold ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setDetailApp(app)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalle
                            </button>
                            <button
                              onClick={() => onMessage(app.id)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Mensaje
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('¿Eliminar esta postulacion? Esta accion no se puede deshacer.')) {
                                  onDelete(app.id);
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {detailApp && (
        <ApplicationDetailModal
          application={detailApp}
          onClose={() => setDetailApp(null)}
          onUpdateStatus={onUpdateStatus}
          onMessage={onMessage}
          updating={updatingId === detailApp.id}
        />
      )}
    </div>
  );
}

function SettingsView({
  onBack,
  onExit,
  institutionName,
}: {
  onBack: () => void;
  onExit: () => void;
  institutionName: string;
}) {
  return (
    <div className="min-h-screen bg-brand-50/40">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <span className="font-semibold text-slate-900">Ajustes</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              Institucion
            </h2>
            <div className="p-4 bg-brand-50/40 rounded-xl">
              <p className="font-semibold text-slate-900 text-lg">{institutionName}</p>
              <p className="text-sm text-slate-500 mt-1">Panel de administracion activo</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-400" />
              Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Nuevas postulaciones</p>
                  <p className="text-sm text-slate-500">Recibe alertas de nuevas solicitudes</p>
                </div>
                <div className="w-12 h-7 bg-brand-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="font-medium text-slate-900">Cambios de estado</p>
                  <p className="text-sm text-slate-500">Notificaciones al cambiar estado</p>
                </div>
                <div className="w-12 h-7 bg-brand-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              Seguridad
            </h2>
            <p className="text-sm text-slate-500">La sesion es segura y los datos estan protegidos por autenticacion de Supabase.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-400" />
              Ayuda
            </h2>
            <p className="text-sm text-slate-500">
              Si tienes problemas, contacta al soporte tecnico de EduConnet.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Cerrar Sesion</h2>
            <p className="text-sm text-slate-500 mb-4">
              Termina tu sesion actual en el panel de institucion.
            </p>
            <button
              onClick={onExit}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Salir del Panel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
