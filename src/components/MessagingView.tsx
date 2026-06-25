import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Application, ApplicationMessage } from '../types';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Building2,
  GraduationCap,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface MessagingViewProps {
  mode: 'institution' | 'student';
  applications: Application[];
  selectedApplicationId?: string;
  senderName: string;
  onBack: () => void;
  onRefresh?: () => void;
}

export function MessagingView({
  mode,
  applications,
  selectedApplicationId,
  senderName,
  onBack,
  onRefresh,
}: MessagingViewProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [messages, setMessages] = useState<ApplicationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedApplicationId) {
      const app = applications.find((a) => a.id === selectedApplicationId);
      if (app) setSelectedApp(app);
    } else if (applications.length > 0 && !selectedApp) {
      setSelectedApp(applications[0]);
    }
  }, [selectedApplicationId, applications]);

  useEffect(() => {
    if (selectedApp) {
      fetchMessages(selectedApp.id);
    }
  }, [selectedApp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (applicationId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('application_messages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      // Mark messages as read
      await supabase
        .from('application_messages')
        .update(
          mode === 'student'
            ? { read_by_student: true }
            : { read_by_institution: true }
        )
        .eq('application_id', applicationId)
        .neq('sender_type', mode);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedApp) return;

    setSending(true);
    const { error } = await supabase.from('application_messages').insert({
      application_id: selectedApp.id,
      sender_type: mode,
      sender_name: senderName,
      content: newMessage.trim(),
      read_by_student: mode === 'student',
      read_by_institution: mode === 'institution',
    });

    if (!error) {
      setNewMessage('');
      await fetchMessages(selectedApp.id);
      onRefresh?.();
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusStyles = {
    pendiente: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock, label: 'Pendiente' },
    aceptada: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle, label: 'Aceptada' },
    rechazada: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, label: 'Rechazada' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-slate-900">
              {mode === 'institution' ? 'Mensajes a Postulantes' : 'Mis Mensajes'}
            </span>
          </div>
          <button
            onClick={() => selectedApp && fetchMessages(selectedApp.id)}
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 pb-24 flex gap-4 lg:h-[calc(100vh-80px)]">
        {/* Conversation List */}
        <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col ${selectedApp ? 'hidden lg:flex lg:w-80 lg:flex-shrink-0' : 'w-full'}`}>
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">
              {mode === 'institution' ? 'Postulantes' : 'Conversaciones'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {applications.length} {applications.length === 1 ? 'postulacion' : 'postulaciones'}
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Sin conversaciones</p>
                <p className="text-sm text-slate-400 mt-1">
                  {mode === 'institution'
                    ? 'Las postulaciones apareceran aqui'
                    : 'Envia tu primera postulacion para comunicarte'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {applications.map((app) => {
                const st = statusStyles[app.status];
                const StatusIcon = st.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-4 hover:bg-blue-50/50 transition-colors ${
                      selectedApp?.id === app.id ? 'bg-blue-50 border-l-3 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                        {app.name.charAt(0)}{app.last_name?.charAt(0) || ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate text-sm">
                          {app.name} {app.last_name || ''}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{app.email}</p>
                        <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {st.label}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Thread */}
        {selectedApp ? (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="lg:hidden p-1 text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {selectedApp.name.charAt(0)}{selectedApp.last_name?.charAt(0) || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">
                    {selectedApp.name} {selectedApp.last_name || ''}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{selectedApp.email}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500">{selectedApp.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mode === 'institution' && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-medium text-blue-700">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {selectedApp.educational_level}
                    </div>
                  )}
                  {mode === 'student' && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5" />
                      Institucion
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Ninguna conversacion aun</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {mode === 'institution'
                      ? 'Escribe el primer mensaje al postulante'
                      : 'La institucion te enviara mensajes aqui'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_type === mode;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.sender_type === 'institution'
                              ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                              : 'bg-gradient-to-br from-blue-500 to-blue-700'
                          }`}>
                            {msg.sender_type === 'institution'
                              ? <Building2 className="w-4 h-4 text-white" />
                              : <GraduationCap className="w-4 h-4 text-white" />
                            }
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{msg.sender_name}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1">
                          {new Date(msg.created_at).toLocaleString('es-EC', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === 'institution'
                      ? `Escribe un mensaje a ${selectedApp.name}...`
                      : 'Escribe tu respuesta...'
                  }
                  rows={2}
                  className="flex-1 resize-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Presiona Enter para enviar, Shift+Enter para nueva linea
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-blue-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">Selecciona una conversacion</p>
              <p className="text-slate-400 text-sm mt-1">
                Elige un postulante de la lista para ver o enviar mensajes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
