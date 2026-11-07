import { useState } from 'react';
import { Application } from '../types';
import { supabase } from '../lib/supabase';
import {
  X,
  User,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Building2,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  Phone,
  GraduationCap,
  Droplet,
  Home,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onMessage?: (applicationId: string) => void;
  updating?: boolean;
}

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', icon: Clock, accent: 'amber' },
  aceptada:  { label: 'Aceptada',  color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: CheckCircle, accent: 'emerald' },
  rechazada: { label: 'Rechazada', color: 'text-red-700',     bg: 'bg-red-100',     border: 'border-red-200',     icon: XCircle, accent: 'red' },
};

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-900 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function DocCard({ label, url }: { label: string; url?: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-brand-400 hover:shadow-md transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
        <FileText className="w-5 h-5 text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{label}</p>
        <p className="text-xs text-slate-400">Click para ver documento</p>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
    </a>
  );
}

function SectionCard({ title, icon: Icon, iconColor, children }: { title: string; icon: typeof User; iconColor: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export function ApplicationDetailModal({
  application: app,
  onClose,
  onUpdateStatus,
  onMessage,
  updating = false,
}: ApplicationDetailModalProps) {
  const [confirmAction, setConfirmAction] = useState<'aceptada' | 'rechazada' | null>(null);
  const [optionalMessage, setOptionalMessage] = useState('');

  const st = statusConfig[app.status] ?? statusConfig.pendiente;
  const StatusIcon = st.icon;

  const hasDocuments = app.cedula_url || app.birth_certificate_url || app.residence_letter_url || app.cedula_rep_url;

  const handleConfirm = () => {
    if (!confirmAction || !onUpdateStatus) return;
    onUpdateStatus(app.id, confirmAction);
    if (optionalMessage.trim() && onMessage) {
      supabase.from('application_messages').insert({
        application_id: app.id,
        sender_type: 'institution',
        sender_name: 'Institucion',
        content: optionalMessage.trim(),
        read_by_student: false,
        read_by_institution: true,
      });
    }
    setConfirmAction(null);
    setOptionalMessage('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

      <div className="relative bg-brand-50/40 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header con gradiente */}
        <div className={`relative px-6 pt-6 pb-5 ${st.bg} ${st.border} border-b`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/60 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-4 pr-12">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-slate-800">
                {app.name.charAt(0)}{app.last_name?.charAt(0) ?? ''}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {app.name} {app.last_name ?? ''}
              </h2>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-lg text-xs font-bold ${st.color} bg-white/80`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {st.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(app.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {app.educational_level && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {app.educational_level}
              </span>
            )}
          </div>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Datos del Estudiante */}
          <SectionCard title="Datos del Estudiante" icon={User} iconColor="bg-brand-100">
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InfoRow icon={User} label="Nombres" value={app.name} />
              <InfoRow icon={User} label="Apellidos" value={app.last_name} />
              <InfoRow icon={FileText} label="Cedula" value={app.identity_document} />
              <InfoRow icon={GraduationCap} label="Nivel Educativo" value={app.educational_level} />
              <InfoRow icon={Calendar} label="Fecha de Nacimiento" value={app.birth_date} />
              <InfoRow icon={Droplet} label="Tipo de Sangre" value={app.blood_type} />
              <InfoRow icon={MapPin} label="Lugar de Nacimiento" value={app.birth_place} />
              <InfoRow icon={Building2} label="Centro de Nacimiento" value={app.birth_center} />
            </div>
          </SectionCard>

          {/* Contacto */}
          <SectionCard title="Contacto" icon={Mail} iconColor="bg-emerald-100">
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InfoRow icon={Mail} label="Correo Electronico" value={app.email} />
              <InfoRow icon={Phone} label="Telefono" value={app.phone} />
              <div className="sm:col-span-2">
                <InfoRow icon={Home} label="Direccion" value={app.address} />
              </div>
            </div>
          </SectionCard>

          {/* Ubicacion */}
          {(app.province || app.city || app.sector) && (
            <SectionCard title="Ubicacion" icon={MapPin} iconColor="bg-amber-100">
              <div className="grid sm:grid-cols-3 gap-x-4">
                <InfoRow icon={MapPin} label="Provincia" value={app.province} />
                <InfoRow icon={MapPin} label="Ciudad" value={app.city} />
                <InfoRow icon={MapPin} label="Sector" value={app.sector} />
              </div>
            </SectionCard>
          )}

          {/* Representante */}
          {(app.representative_name || app.representative_cedula) && (
            <SectionCard title="Representante Legal" icon={Heart} iconColor="bg-rose-100">
              <div className="grid sm:grid-cols-2 gap-x-4">
                <InfoRow icon={User} label="Nombres" value={app.representative_name} />
                <InfoRow icon={FileText} label="Cedula" value={app.representative_cedula} />
              </div>
            </SectionCard>
          )}

          {/* Documentos */}
          {hasDocuments && (
            <SectionCard title="Documentos Adjuntos" icon={FileText} iconColor="bg-slate-100">
              <div className="grid sm:grid-cols-2 gap-3">
                <DocCard label="Cedula del Estudiante" url={app.cedula_url} />
                <DocCard label="Partida de Nacimiento" url={app.birth_certificate_url} />
                <DocCard label="Carta de Residencia" url={app.residence_letter_url} />
                <DocCard label="Cedula del Representante" url={app.cedula_rep_url} />
              </div>
            </SectionCard>
          )}
        </div>

        {/* Action Bar */}
        {onUpdateStatus && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white">
            {confirmAction ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <AlertCircle className={`w-4 h-4 ${confirmAction === 'aceptada' ? 'text-emerald-600' : 'text-red-600'}`} />
                  Confirmar: {confirmAction === 'aceptada' ? 'Aceptar' : 'Rechazar'} postulacion de {app.name}
                </div>
                <textarea
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
                  placeholder={`Mensaje opcional para ${app.name}...`}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-brand-50/40 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 transition-all resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setConfirmAction(null); setOptionalMessage(''); }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={updating}
                    className={`flex-1 py-2.5 font-semibold rounded-xl text-white transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                      confirmAction === 'aceptada'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirmar {confirmAction === 'aceptada' ? 'aceptacion' : 'rechazo'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {onMessage && (
                  <button
                    onClick={() => onMessage(app.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Mensaje
                  </button>
                )}
                {app.status !== 'aceptada' && (
                  <button
                    onClick={() => setConfirmAction('aceptada')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aceptar
                  </button>
                )}
                {app.status !== 'rechazada' && (
                  <button
                    onClick={() => setConfirmAction('rechazada')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-red-600/20"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                )}
                {app.status === 'aceptada' && (
                  <span className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Postulacion aceptada
                  </span>
                )}
                {app.status === 'rechazada' && (
                  <span className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-xl text-sm">
                    <XCircle className="w-4 h-4" />
                    Postulacion rechazada
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
