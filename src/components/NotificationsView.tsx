import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Notification } from '../types';
import {
  ArrowLeft,
  Bell,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  CheckCheck,
  Trash2,
} from 'lucide-react';

interface NotificationsViewProps {
  onBack: () => void;
  onNavigate?: (notification: Notification) => void;
}

const typeConfig = {
  new_application: {
    icon: FileText,
    bg: 'bg-brand-50',
    iconBg: 'bg-brand-600',
    text: 'text-brand-700',
  },
  status_changed: {
    icon: CheckCircle,
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-500',
    text: 'text-amber-700',
  },
  new_message: {
    icon: MessageSquare,
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    text: 'text-blue-700',
  },
};

export function NotificationsView({ onBack, onNavigate }: NotificationsViewProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Notification;
          if (newNotif.user_id === userId) {
            setNotifications((prev) =>
              prev.some((n) => n.id === newNotif.id) ? prev : [newNotif, ...prev]
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHr < 24) return `Hace ${diffHr}h`;
    if (diffDay < 7) return `Hace ${diffDay}d`;
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-slate-900">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="w-20 flex justify-end">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                title="Marcar todas como leidas"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Leer todas</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { id: 'all' as const, label: 'Todas', count: notifications.length },
            { id: 'unread' as const, label: 'No leidas', count: unreadCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium text-lg">
              {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Las notificaciones sobre tus postulaciones y mensajes apareceran aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.new_message;
              const Icon = config.icon;

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md cursor-pointer group ${
                    notif.read ? 'border-slate-200' : 'border-brand-300 ring-1 ring-brand-200'
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    onNavigate?.(notif);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`text-sm font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${notif.read ? 'text-slate-500' : 'text-slate-600'}`}>
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 mt-3">
                        {!notif.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Marcar como leida
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-brand-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
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
