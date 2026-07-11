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

type View = 'dashboard' | 'apply' | 'messages' | 'notifications';

export function StudentPanel({ onExit, studentEmail }: StudentPanelProps) {
  const [view, setView] = useState<View>('dashboard');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>(undefined);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const storedStudent = (() => {
    try {
      return JSON.parse(localStorage.getItem('edu_student') || '{}');
    } catch {
      return {};
    }
  })();
  const studentName = [storedStudent.name, storedStudent.last_name].filter(Boolean).join(' ') || 'Postulante';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('student_unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'application_messages' },
        () => fetchData()
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
        () => fetchUnreadNotifications()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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
    }

    await fetchUnreadNotifications();

    setLoading(false);
  };

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
          setView('dashboard');
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
          setView('dashboard');
        }}
      />
    );
  }

  return (
    <StudentDashboard
      onApply={() => setView('apply')}
      onViewInstitution={() => {}}
      onMyApplications={() => {}}
      onSettings={() => {}}
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
