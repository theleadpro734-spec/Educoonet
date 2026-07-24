import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { INSTITUTION_ID } from '../lib/constants';
import { Institution, Application } from '../types';
import { StudentDashboard } from './StudentDashboard';
import { MessagingView } from './MessagingView';
import { ApplyForm } from './ApplyForm';
import { NotificationsView } from './NotificationsView';

interface StudentPanelProps {
  onExit: () => void;
  studentEmail: string;
}

type View =
  | 'dashboard'
  | 'apply'
  | 'messages'
  | 'notifications'
  | 'applications'
  | 'institution'
  | 'settings';

export function StudentPanel({ onExit, studentEmail }: StudentPanelProps) {
  const [view, setView] = useState<View>('dashboard');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | undefined
  >(undefined);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const storedStudent = (() => {
    try {
      return JSON.parse(localStorage.getItem('edu_student') || '{}');
    } catch {
      return {};
    }
  })();
  const studentName =
    [storedStudent.name, storedStudent.last_name].filter(Boolean).join(' ') ||
    'Postulante';

  const fetchUnreadNotifications = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', studentEmail)
      .eq('read', false);
    setUnreadNotifications(count || 0);
  };

  const fetchData = async () => {
    setLoading(true);
    const [instRes, appsRes] = await Promise.all([
      supabase
        .from('institutions')
        .select('*')
        .eq('id', INSTITUTION_ID)
        .maybeSingle(),
      supabase
        .from('applications')
        .select('*, institutions(name)')
        .eq('institution_id', INSTITUTION_ID)
        .eq('email', studentEmail)
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

    await fetchUnreadNotifications();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

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
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => setRefreshKey((k) => k + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-[#0D9488] rounded-full animate-spin mx-auto" />
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
        userEmail={studentEmail}
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
        prefillName={storedStudent.name}
        prefillLastName={storedStudent.last_name}
        prefillPhone={storedStudent.phone}
        onBack={() => setView('dashboard')}
        onSuccess={() => {
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
        institutionName={institution?.name || ''}
        onBack={() => setView('dashboard')}
        onApply={() => setView('apply')}
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
        onBack={() => setView('dashboard')}
        onExit={onExit}
      />
    );
  }

  return (
    <StudentDashboard
      onApply={() => setView('apply')}
      onViewInstitution={() => setView('institution')}
      onMyApplications={() => setView('applications')}
      onSettings={() => setView('settings')}
      onMessages={() => setView('messages')}
      onNotifications={() => setView('notifications')}
      onExit={onExit}
      institution={institution}
      applications={applications}
      unreadMessages={unreadMessages}
      unreadNotifications={unreadNotifications}
      onAppMessages={(id: string) => {
        setSelectedApplicationId(id);
        setView('messages');
      }}
    />
  );
}

function ApplicationsListView({
  applications,
  institutionName,
  onBack,
  onApply,
  onMessages,
}: {
  applications: Application[];
  institutionName: string;
  onBack: () => void;
  onApply: () => void;
  onMessages: (id: string) => void;
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

  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string; dot: string }
  > = {
    pendiente: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      label: 'Pendiente',
      dot: 'bg-amber-500',
    },
    aceptada: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      label: 'Aceptada',
      dot: 'bg-emerald-500',
    },
    rechazada: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      label: 'Rechazada',
      dot: 'bg-red-500',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Volver</span>
          </button>
          <span className="font-semibold text-slate-900">Mis Postulaciones</span>
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold rounded-xl transition-colors"
          >
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
                  ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  filterStatus === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#F0FDFA] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0D9488]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-lg">
              {filterStatus === 'all'
                ? 'No tienes postulaciones aun'
                : `No hay postulaciones ${filterStatus === 'pendiente' ? 'pendientes' : filterStatus === 'aceptada' ? 'aceptadas' : 'rechazadas'}`}
            </p>
            <p className="text-sm text-slate-400 mt-2 mb-5">
              {filterStatus === 'all'
                ? `Comienza tu postulacion a ${institutionName}`
                : 'Cambia el filtro para ver otras postulaciones'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={onApply}
                className="px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/25"
              >
                Postularme Ahora
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-2">
              Mostrando {filtered.length} de {total} postulaciones
            </p>
            {filtered.map((app) => {
              const style = statusConfig[app.status] || statusConfig.pendiente;
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {app.name.charAt(0)}
                          {app.last_name?.charAt(0) || ''}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {app.name} {app.last_name || ''}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {app.educational_level}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(app.created_at).toLocaleDateString('es-EC', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 flex-shrink-0 ${style.bg} ${style.text} border-transparent`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onMessages(app.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] text-xs font-semibold rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
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

function InstitutionDetailView({
  institution,
  onBack,
  onApply,
}: {
  institution: Institution | null;
  onBack: () => void;
  onApply: () => void;
}) {
  if (!institution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No hay institucion disponible</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-[#0D9488] text-white rounded-xl"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Volver</span>
          </button>
          <span className="font-semibold text-slate-900 truncate max-w-[200px]">
            {institution.name}
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {institution.cover_image && (
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src={institution.cover_image}
                alt={institution.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {institution.logo_url ? (
                <img
                  src={institution.logo_url}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#134E4A] flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  {institution.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {institution.name}
                </h1>
                {institution.institution_type && (
                  <p className="text-sm text-[#0D9488] font-medium mt-0.5">
                    {institution.institution_type}
                  </p>
                )}
                {institution.location && (
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {institution.location}
                  </div>
                )}
              </div>
            </div>

            {institution.description && (
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                {institution.description}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {institution.phone && (
                <a
                  href={`tel:${institution.phone}`}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-[#0D9488] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="truncate">{institution.phone}</span>
                </a>
              )}
              {institution.email && (
                <a
                  href={`mailto:${institution.email}`}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-[#0D9488] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{institution.email}</span>
                </a>
              )}
            </div>

            {institution.mission && (
              <div className="mt-5 p-4 bg-[#F0FDFA] rounded-xl border border-[#99F6E4]/40">
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Mision</h3>
                <p className="text-sm text-slate-600">{institution.mission}</p>
              </div>
            )}
            {institution.vision && (
              <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-slate-900 text-sm mb-1">Vision</h3>
                <p className="text-sm text-slate-600">{institution.vision}</p>
              </div>
            )}

            <button
              onClick={onApply}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/25"
            >
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
  onBack,
  onExit,
}: {
  studentName: string;
  studentEmail: string;
  onBack: () => void;
  onExit: () => void;
}) {
  const initials =
    [studentName.charAt(0), studentName.split(' ')[1]?.charAt(0) || '']
      .join('')
      .toUpperCase() || 'P';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver</span>
          </button>
          <span className="font-semibold text-slate-900">Ajustes</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {studentName}
              </h2>
              <p className="text-sm text-slate-500 truncate">{studentEmail}</p>
              <p className="text-xs text-[#0D9488] font-medium mt-1">Postulante</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificaciones
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 text-sm">
                  Cambios de estado
                </p>
                <p className="text-xs text-slate-500">
                  Te avisamos cuando cambie el estado de tu postulacion
                </p>
              </div>
              <div className="w-11 h-6 bg-[#0D9488] rounded-full relative flex-shrink-0">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="font-medium text-slate-900 text-sm">Mensajes</p>
                <p className="text-xs text-slate-500">
                  Recibe alertas de nuevos mensajes
                </p>
              </div>
              <div className="w-11 h-6 bg-[#0D9488] rounded-full relative flex-shrink-0">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Seguridad
          </h3>
          <p className="text-sm text-slate-500">
            Tu sesion esta protegida. Tus datos se almacenan de forma segura en
            la plataforma.
          </p>
        </div>

        <button
          onClick={onExit}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesion
        </button>
      </main>
    </div>
  );
}
