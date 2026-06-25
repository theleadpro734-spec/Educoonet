import { Application } from '../types';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Building2,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: Application;
  onClose: () => void;
}

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  aceptada:  { label: 'Aceptada',  color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: 'text-red-700',     bg: 'bg-red-100',     icon: XCircle },
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-900 font-medium">{value}</p>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url?: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-medium text-blue-700 transition-colors"
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
    </a>
  );
}

export function ApplicationDetailModal({ application: app, onClose }: ApplicationDetailModalProps) {
  const st = statusConfig[app.status] ?? statusConfig.pendiente;
  const StatusIcon = st.icon;

  const hasDocuments = app.cedula_url || app.birth_certificate_url || app.residence_letter_url || app.cedula_rep_url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-lg">
                {app.name.charAt(0)}{app.last_name?.charAt(0) ?? ''}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {app.name} {app.last_name ?? ''}
              </h2>
              <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {st.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Datos del Estudiante */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Datos del Estudiante</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Nombres" value={app.name} />
              <Field label="Apellidos" value={app.last_name} />
              <Field label="Cedula" value={app.identity_document} />
              <Field label="Nivel Educativo" value={app.educational_level} />
              <Field label="Fecha de Nacimiento" value={app.birth_date} />
              <Field label="Tipo de Sangre" value={app.blood_type} />
              <Field label="Lugar de Nacimiento" value={app.birth_place} />
              <Field label="Centro de Nacimiento" value={app.birth_center} />
            </div>
          </section>

          {/* Contacto */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Contacto</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Correo Electronico" value={app.email} />
              <Field label="Telefono" value={app.phone} />
              <div className="col-span-2">
                <Field label="Direccion" value={app.address} />
              </div>
            </div>
          </section>

          {/* Ubicacion */}
          {(app.province || app.city || app.sector) && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Ubicacion</h3>
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <Field label="Provincia" value={app.province} />
                <Field label="Ciudad" value={app.city} />
                <Field label="Sector" value={app.sector} />
              </div>
            </section>
          )}

          {/* Representante */}
          {(app.representative_name || app.representative_cedula) && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Representante</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Nombres" value={app.representative_name} />
                <Field label="Cedula" value={app.representative_cedula} />
              </div>
            </section>
          )}

          {/* Documentos */}
          {hasDocuments && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Documentos</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DocLink label="Cedula del Estudiante" url={app.cedula_url} />
                <DocLink label="Partida de Nacimiento" url={app.birth_certificate_url} />
                <DocLink label="Carta de Residencia" url={app.residence_letter_url} />
                <DocLink label="Cedula del Representante" url={app.cedula_rep_url} />
              </div>
            </section>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
            <Calendar className="w-3.5 h-3.5" />
            Postulacion enviada el{' '}
            {new Date(app.created_at).toLocaleString('es-EC', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
