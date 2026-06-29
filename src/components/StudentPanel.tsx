import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { INSTITUTION_ID } from '../lib/constants';
import { Institution, Application } from '../types';
import { StudentDashboard } from './StudentDashboard';
import { MessagingView } from './MessagingView';
import { ArrowLeft, FileText } from 'lucide-react';

interface StudentPanelProps {
  onExit: () => void;
  studentEmail: string;
}

type View = 'dashboard' | 'apply' | 'messages';

export function StudentPanel({ onExit, studentEmail }: StudentPanelProps) {
  const [view, setView] = useState<View>('dashboard');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>(undefined);

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
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-[#0082F0] rounded-full animate-spin mx-auto" />
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

  if (view === 'apply') {
    return (
      <ApplyForm
        institutionId={INSTITUTION_ID}
        studentEmail={studentEmail}
        institutionName={institution?.name}
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
      onExit={onExit}
      institution={institution}
      applications={applications}
      unreadMessages={0}
      onAppMessages={(id: string) => {
        setSelectedApplicationId(id);
        setView('messages');
      }}
    />
  );
}

function ApplyForm({
  institutionId,
  studentEmail,
  institutionName,
  onBack,
  onSuccess,
}: {
  institutionId: string;
  studentEmail: string;
  institutionName?: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    phone: '',
    educational_level: 'Bachillerato',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const { error: dbError } = await supabase.from('applications').insert({
      institution_id: institutionId,
      email: studentEmail,
      status: 'pendiente',
      ...formData,
    });

    setSubmitting(false);

    if (dbError) {
      setError('Error al enviar la postulacion. Intenta de nuevo.');
    } else {
      onSuccess();
    }
  };

  const inputClass = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0082F0]/20 focus:border-[#0082F0] transition-all';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Nueva Postulacion</h1>
            {institutionName && <p className="text-sm text-slate-500">{institutionName}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">Completando postulacion para <span className="font-semibold text-slate-800">{institutionName || 'institucion'}</span></p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombres</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Apellidos</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className={inputClass}
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefono</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass}
              placeholder="+593 99 999 9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nivel Educativo</label>
            <select
              required
              value={formData.educational_level}
              onChange={(e) => setFormData({ ...formData, educational_level: e.target.value })}
              className={inputClass}
            >
              <option value="Bachillerato">Bachillerato</option>
              <option value="Tecnico">Tecnico</option>
              <option value="Universitario">Universitario</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#0082F0] hover:bg-[#006ACC] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0082F0]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Enviar Postulacion
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
