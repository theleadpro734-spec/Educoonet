import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { INSTITUTION_ID } from '../lib/constants';
import { useAuth } from '../lib/auth';
import { useUnreadNotifications } from '../lib/useUnreadNotifications';
import { Institution, Application } from '../types';
import { StudentDashboard } from './StudentDashboard';
import { MessagingView } from './MessagingView';
import { ApplyForm } from './ApplyForm';
import { NotificationsView } from './NotificationsView';
import { LinkAccountModal } from './LinkAccountModal';

interface StudentPanelProps {
  onExit: () => void;
}

type View =
  | 'dashboard'
  | 'apply'
  | 'messages'
  | 'notifications'
  | 'applications'
  | 'institution'
  | 'settings';

export function StudentPanel({ onExit }: StudentPanelProps) {
  const { user, isAnonymous, isLocalUser, signOut } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>(undefined);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | undefined>(undefined);

  const userId = user?.id;
  const studentEmail = user?.email || '';
  const isLocal = isLocalUser;
  const unreadNotifications = useUnreadNotifications({ userId, userEmail: studentEmail, isLocal });

  const fetchData = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const [instRes, appsRes] = await Promise.all([
      supabase
        .from('institutions')
        .select('*')
        .eq('id', INSTITUTION_ID)
        .maybeSingle(),
      isLocal
        ? supabase
            .from('applications')
            .select('*, institutions(name)')
            .eq('email', studentEmail)
            .is('archived_at', null)
            .order('created_at', { ascending: false })
        : supabase
            .from('applications')
            .select('*, institutions(name)')
            .eq('user_id', userId)
            .is('archived_at', null)
            .order('created_at', { ascending: false }),
    ]);

    if (instRes.data) setInstitution(instRes.data);
    if (appsRes.data) setApplications(appsRes.data as Application[]);

    const appIds = (appsRes.data || []).map((a: Application) => a.id);
    if (appIds.length > 0) {
      const { count } = await supabase
        .from('application_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'institution')
        .eq('read_by_student', false)
        .in('application_id', appIds);
      setUnreadMessages(count || 0);
    } else {
      setUnreadMessages(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, userId]);

  useEffect(() => {
    const channel = supabase
      .channel('student_unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'application_messages' },
        () => setRefreshKey((k) => k + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('student_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => setRefreshKey((k) => k + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const studentName = user?.user_metadata?.full_name || 'Postulante';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (view === 'messages') {
    return (
      <MessagingView
        mode="student"
        applications={applications}
        selectedApplicationId={selectedApplicationId}
        senderName={studentName}
        onBack={() => {
          setView('dashboard');
          setSelectedApplicationId(undefined);
        }}
        onRefresh={fetchData}
      />
    );
  }

  if (view === 'notifications') {
    return (
      <NotificationsView
        onBack={() => setView('dashboard')}
        onNavigate={(notif) => {
          if (notif.type === 'new_message' && notif.related_id) {
            const app = applications.find((a) => a.id === notif.related_id);
            if (app) {
              setSelectedApplicationId(app.id);
              setView('messages');
              return;
            }
          }
          setView('applications');
        }}
      />
    );
  }

  if (view === 'apply') {
    return (
      <ApplyForm
        institutionId={INSTITUTION_ID}
        studentEmail={studentEmail}
        institutionName={institution?.name}
        application={editingApplication}
        onBack={() => {
          setEditingApplication(undefined);
          setView('applications');
        }}
        onSuccess={() => {
          setEditingApplication(undefined);
          fetchData();
          setView('applications');
        }}
      />
    );
  }

  if (view === 'applications') {
    return (
      <ApplicationsListView
        applications={applications}
        onBack={() => setView('dashboard')}
        onApply={() => {
          setEditingApplication(undefined);
          setView('apply');
        }}
        onEdit={(application) => {
          setEditingApplication(application);
          setView('apply');
        }}
        onDelete={async (application) => {
          if (!window.confirm('¿Quieres retirar esta postulación?')) return;
          const { error } = await supabase.from('applications').delete().eq('id', application.id);
          if (error) {
            window.alert('No se pudo retirar la postulación. Intenta de nuevo.');
            return;
          }
          await fetchData();
        }}
        onMessages={(id) => {
          setSelectedApplicationId(id);
          setView('messages');
        }}
      />
    );
  }

  if (view === 'institution') {
    return (
      <InstitutionDetailView
        institution={institution}
        onBack={() => setView('dashboard')}
        onApply={() => setView('apply')}
      />
    );
  }

  if (view === 'settings') {
    return (
      <StudentSettingsView
        studentName={studentName}
        studentEmail={studentEmail}
        isAnonymous={isAnonymous}
        isLocal={isLocal}
        onBack={() => setView('dashboard')}
        onExit={async () => { await signOut(); onExit(); }}
        onLinkAccount={() => setShowLinkModal(true)}
      />
    );
  }

  return (
    <>
      <StudentDashboard
        onApply={() => setView('apply')}
        onViewInstitution={() => setView('institution')}
        onMyApplications={() => setView('applications')}
        onSettings={() => setView('settings')}
        onMessages={() => setView('messages')}
        onNotifications={() => setView('notifications')}
        onExit={async () => { await signOut(); onExit(); }}
        institution={institution}
        applications={applications}
        studentName={studentName}
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications}
        onAppMessages={(id: string) => {
          setSelectedApplicationId(id);
          setView('messages');
        }}
      />
      {showLinkModal && (
        <LinkAccountModal onClose={() => setShowLinkModal(false)} />
      )}
    </>
  );
}

function ApplicationsListView({
  applications,
  onBack,
  onApply,
  onMessages,
  onEdit,
  onDelete,
}: {
  applications: Application[];
  onBack: () => void;
  onApply: () => void;
  onMessages: (id: string) => void;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered =
    filterStatus === 'all'
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'pendiente').length;
  const accepted = applications.filter((a) => a.status === 'aceptada').length;
  const rejected = applications.filter((a) => a.status === 'rechazada').length;

  const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente', dot: 'bg-amber-500' },
    aceptada: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aceptada', dot: 'bg-emerald-500' },
    rechazada: { bg: 'bg-red-100', text: 'text-red-600', label: 'Rechazada', dot: 'bg-red-500' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Volver</span>
          </button>
          <span className="font-semibold text-slate-900">Mis Postulaciones</span>
          <button onClick={onApply} className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
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
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filterStatus === filter.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <p className="text-slate-600 font-medium text-lg">
              {filterStatus === 'all' ? 'No tienes postulaciones aun' : 'No hay postulaciones con este filtro'}
            </p>
            {filterStatus === 'all' && (
              <button onClick={onApply} className="mt-5 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl">
                Postularme Ahora
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const style = statusConfig[app.status] || statusConfig.pendiente;
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm">{app.name.charAt(0)}{app.last_name?.charAt(0) || ''}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{app.name} {app.last_name || ''}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(app.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 flex-shrink-0 ${style.bg} ${style.text} border-transparent`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                    {app.status === 'pendiente' && (
                      <>
                        <button onClick={() => onEdit(app)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all">
                          Editar
                        </button>
                        <button onClick={() => onDelete(app)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-all">
                          Retirar
                        </button>
                      </>
                    )}
                    <button onClick={() => onMessages(app.id)} className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-semibold rounded-lg transition-all">
                      Ver Mensajes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function InstitutionDetailView({ institution, onBack, onApply }: { institution: Institution | null; onBack: () => void; onApply: () => void; }) {
  if (!institution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No hay institucion disponible</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl">Volver</button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline">Volver</span>
          </button>
          <span className="font-semibold text-slate-900 truncate max-w-[200px]">{institution.name}</span>
          <div className="w-16" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {institution.cover_image && (
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img src={institution.cover_image} alt={institution.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {institution.logo_url ? (
                <img src={institution.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-600 to-[#134E4A] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  {institution.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{institution.name}</h1>
                {institution.location && <p className="text-sm text-slate-500 mt-1">{institution.location}</p>}
              </div>
            </div>
            {institution.description && <p className="mt-4 text-slate-600 text-sm leading-relaxed">{institution.description}</p>}
            <button onClick={onApply} className="mt-6 w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/25">
              Postularme Ahora
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StudentSettingsView({
  studentName,
  studentEmail,
  isAnonymous,
  isLocal,
  onBack,
  onExit,
  onLinkAccount,
}: {
  studentName: string;
  studentEmail: string;
  isAnonymous: boolean;
  isLocal: boolean;
  onBack: () => void;
  onExit: () => void;
  onLinkAccount: () => void;
}) {
  const initials = studentName.charAt(0).toUpperCase() || 'P';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span>Volver</span>
          </button>
          <span className="font-semibold text-slate-900">Ajustes</span>
          <div className="w-16" />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">{studentName}</h2>
              <p className="text-sm text-slate-500 truncate">{studentEmail || 'Sesion anonima'}</p>
              <p className="text-xs text-brand-600 font-medium mt-1">
                {isAnonymous || isLocal ? 'Postulante (sin cuenta vinculada)' : 'Postulante'}
              </p>
            </div>
          </div>
        </div>

        {(isAnonymous || isLocal) && (
          <div className="bg-gradient-to-br from-brand-600 to-[#134E4A] rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Guarda tu cuenta</h3>
                <p className="text-sm text-cyan-300 mt-1">
                  Estás usando una sesion de invitado. Vincula tu correo o Google para no perder tus postulaciones al cambiar de dispositivo.
                </p>
              </div>
            </div>
            <button
              onClick={onLinkAccount}
              className="w-full py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
            >
              Vincular mi cuenta
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">Sesion</h3>
          <p className="text-sm text-slate-500 mb-4">
            Tu sesion se mantiene activa en este navegador. Si cierras sesion, se creara una nueva sesion anonima.
          </p>
          <button
            onClick={onExit}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesion
          </button>
        </div>
      </main>
    </div>
  );
}
