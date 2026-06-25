import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { INSTITUTION_ID } from '../lib/constants';
import { Institution, Application } from '../types';
import { StudentDashboard } from './StudentDashboard';
import { MessagingView } from './MessagingView';
import { ArrowLeft, FileText, User } from 'lucide-react';

interface StudentPanelProps {
  onExit: () => void;
  studentEmail: string;
}

type View = 'dashboard' | 'apply' | 'messages' | 'settings';

export function StudentPanel({ onExit, studentEmail }: StudentPanelProps) {
  const [view, setView] = useState<View>('dashboard');
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

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
          <div className="w-12 h-12 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (view === 'messages' && selectedApplicationId) {
    return (
      <MessagingView
        applicationId={selectedApplicationId}
        isInstitution={false}
        onBack={() => {
          setView('dashboard');
          setSelectedApplicationId(null);
        }}
      />
    );
  }

  if (view === 'apply') {
    return (
      <ApplyForm
        institutionId={INSTITUTION_ID}
        studentEmail={studentEmail}
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
      onMessages={() => {}}
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
  onBack,
  onSuccess,
}: {
  institutionId: string;
  studentEmail: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    phone: '',
    educational_level: 'Bachillerato',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('applications').insert({
      institution_id: institutionId,
      email: studentEmail,
      status: 'pendiente',
      ...formData,
    });

    setSubmitting(false);

    if (!error) {
      onSuccess();
    } else {
      console.error('Error submitting application:', error);
      alert('Error al enviar la postulacion. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Nueva Postulacion</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombres
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Telefono
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="+593 99 999 9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nivel Educativo
            </label>
            <select
              required
              value={formData.educational_level}
              onChange={(e) => setFormData({ ...formData, educational_level: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Bachillerato">Bachillerato</option>
              <option value="Tecnico">Tecnico</option>
              <option value="Universitario">Universitario</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
