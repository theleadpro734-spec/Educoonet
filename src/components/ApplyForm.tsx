import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { FileUpload } from './FileUpload';
import { ArrowLeft, FileText, User, MapPin, Heart, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface ApplyFormProps {
  institutionId: string;
  studentEmail: string;
  institutionName?: string;
  prefillName?: string;
  prefillLastName?: string;
  prefillPhone?: string;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  last_name: string;
  phone: string;
  email: string;
  educational_level: string;
  identity_document: string;
  birth_date: string;
  birth_place: string;
  birth_center: string;
  blood_type: string;
  address: string;
  province: string;
  city: string;
  sector: string;
  representative_name: string;
  representative_cedula: string;
  cedula_url: string;
  birth_certificate_url: string;
  residence_letter_url: string;
  cedula_rep_url: string;
}

const emptyForm: FormData = {
  name: '',
  last_name: '',
  phone: '',
  email: '',
  educational_level: 'Bachillerato',
  identity_document: '',
  birth_date: '',
  birth_place: '',
  birth_center: '',
  blood_type: '',
  address: '',
  province: '',
  city: '',
  sector: '',
  representative_name: '',
  representative_cedula: '',
  cedula_url: '',
  birth_certificate_url: '',
  residence_letter_url: '',
  cedula_rep_url: '',
};

export function ApplyForm({
  institutionId,
  studentEmail,
  institutionName,
  prefillName,
  prefillLastName,
  prefillPhone,
  onBack,
  onSuccess,
}: ApplyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  const [form, setForm] = useState<FormData>({
    ...emptyForm,
    name: prefillName || '',
    last_name: prefillLastName || '',
    phone: prefillPhone || '',
    email: studentEmail,
  });

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadPath = useMemo(() => `apps/${institutionId}/${Date.now()}`, [institutionId]);

  const steps = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Ubicacion', icon: MapPin },
    { num: 3, label: 'Representante', icon: Heart },
    { num: 4, label: 'Documentos', icon: Upload },
  ];

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!form.name.trim()) return 'Nombre es obligatorio';
      if (!form.last_name.trim()) return 'Apellido es obligatorio';
      if (!form.phone.trim()) return 'Telefono es obligatorio';
      if (!form.identity_document.trim()) return 'Cedula es obligatoria';
      if (!form.birth_date) return 'Fecha de nacimiento es obligatoria';
    }
    if (step === 2) {
      if (!form.province.trim()) return 'Provincia es obligatoria';
      if (!form.city.trim()) return 'Ciudad es obligatoria';
    }
    if (step === 3) {
      if (!form.representative_name.trim()) return 'Nombre del representante es obligatorio';
      if (!form.representative_cedula.trim()) return 'Cedula del representante es obligatoria';
    }
    if (step === 4) {
      if (!form.cedula_url) return 'Sube la cedula del estudiante';
      if (!form.birth_certificate_url) return 'Sube la partida de nacimiento';
      if (!form.residence_letter_url) return 'Sube la carta de residencia';
      if (!form.cedula_rep_url) return 'Sube la cedula del representante';
    }
    return null;
  };

  const goToStep = (target: number) => {
    if (target > currentStep) {
      let firstBad: string | null = null;
      for (let s = currentStep; s < target; s++) {
        const err = validateStep(s);
        if (err) { firstBad = err; break; }
      }
      if (firstBad) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: firstBad! }));
        return;
      }
    }
    setStepErrors({});
    setCurrentStep(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    for (let s = 1; s <= 4; s++) {
      const err = validateStep(s);
      if (err) {
        setCurrentStep(s);
        setStepErrors((prev) => ({ ...prev, [s]: err! }));
        return;
      }
    }

    setSubmitting(true);

    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('institution_id', institutionId)
      .eq('email', form.email.trim().toLowerCase())
      .in('status', ['pendiente', 'aceptada'])
      .maybeSingle();

    if (existing) {
      setSubmitting(false);
      setError('Ya tienes una postulacion activa en esta institucion. Revisa el estado en tu panel.');
      return;
    }

    const { data: insertedApp, error: dbError } = await supabase.from('applications').insert({
      institution_id: institutionId,
      status: 'pendiente',
      name: form.name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      educational_level: form.educational_level,
      identity_document: form.identity_document.trim() || null,
      birth_date: form.birth_date || null,
      birth_place: form.birth_place.trim() || null,
      birth_center: form.birth_center.trim() || null,
      blood_type: form.blood_type || null,
      address: form.address.trim() || null,
      province: form.province.trim() || null,
      city: form.city.trim() || null,
      sector: form.sector.trim() || null,
      representative_name: form.representative_name.trim() || null,
      representative_cedula: form.representative_cedula.trim() || null,
      cedula_url: form.cedula_url || null,
      birth_certificate_url: form.birth_certificate_url || null,
      residence_letter_url: form.residence_letter_url || null,
      cedula_rep_url: form.cedula_rep_url || null,
    }).select('id').single();

    if (dbError || !insertedApp) {
      const msg = dbError?.message || '';
      let friendly = 'Error al enviar la postulacion. Intenta de nuevo.';
      if (msg.includes('policy') || msg.includes('row-level') || msg.includes('permission')) {
        friendly = 'No tienes permiso para enviar. Recarga la pagina e intenta de nuevo.';
      } else if (msg.includes('duplicate') || msg.includes('unique')) {
        friendly = 'Ya existe una postulacion con esos datos.';
      }
      setSubmitting(false);
      setError(friendly);
      return;
    }

    await supabase.rpc('notify_new_application', { p_application_id: insertedApp.id });

    setSubmitting(false);
    setCompleted(true);
    setTimeout(onSuccess, 1600);
  };

  const inputClass = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';
  const sectionTitleClass = 'text-base font-semibold text-slate-900 flex items-center gap-2';
  const stepErrorBox = (step: number) =>
    stepErrors[step] ? (
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{stepErrors[step]}</span>
      </div>
    ) : null;

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Postulacion Enviada</h2>
          <p className="text-slate-500 mt-2">Tu postulacion ha sido enviada correctamente.</p>
          <p className="text-slate-400 text-sm mt-1">Redirigiendo al panel...</p>
        </div>
      </div>
    );
  }

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
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map((step, i) => {
            const done = currentStep > step.num;
            const active = currentStep === step.num;
            return (
              <div key={step.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    done ? 'bg-emerald-500 text-white' :
                    active ? 'bg-[#0D9488] text-white shadow-lg shadow-[#0D9488]/25' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? 'text-[#0F766E]' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          {/* Step 1: Personal */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className={sectionTitleClass}>
                <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-[#0D9488]" />
                </div>
                Datos Personales
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombres *</label>
                  <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className={labelClass}>Apellidos *</label>
                  <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className={inputClass} placeholder="Tu apellido" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Cedula *</label>
                  <input type="text" value={form.identity_document} onChange={(e) => update('identity_document', e.target.value)} className={inputClass} placeholder="12345678" />
                </div>
                <div>
                  <label className={labelClass}>Telefono *</label>
                  <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} placeholder="+593 99 999 9999" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Nivel Educativo *</label>
                <select value={form.educational_level} onChange={(e) => update('educational_level', e.target.value)} className={inputClass}>
                  <option value="Bachillerato">Bachillerato</option>
                  <option value="Tecnico">Tecnico</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Postgrado">Postgrado</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Fecha de Nacimiento *</label>
                  <input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tipo de Sangre</label>
                  <select value={form.blood_type} onChange={(e) => update('blood_type', e.target.value)} className={inputClass}>
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Lugar de Nacimiento</label>
                  <input type="text" value={form.birth_place} onChange={(e) => update('birth_place', e.target.value)} className={inputClass} placeholder="Ciudad, Pais" />
                </div>
                <div>
                  <label className={labelClass}>Centro de Nacimiento</label>
                  <input type="text" value={form.birth_center} onChange={(e) => update('birth_center', e.target.value)} className={inputClass} placeholder="Hospital / Clinica" />
                </div>
              </div>

              {stepErrorBox(1)}

              <button
                type="button"
                onClick={() => goToStep(2)}
                className="w-full py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className={sectionTitleClass}>
                <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#0D9488]" />
                </div>
                Ubicacion
              </h2>

              <div>
                <label className={labelClass}>Direccion</label>
                <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} placeholder="Calle, numero, referencias" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Provincia *</label>
                  <input type="text" value={form.province} onChange={(e) => update('province', e.target.value)} className={inputClass} placeholder="Carabobo" />
                </div>
                <div>
                  <label className={labelClass}>Ciudad *</label>
                  <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} placeholder="Valencia" />
                </div>
                <div>
                  <label className={labelClass}>Sector</label>
                  <input type="text" value={form.sector} onChange={(e) => update('sector', e.target.value)} className={inputClass} placeholder="Sector" />
                </div>
              </div>

              {stepErrorBox(2)}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStepErrors({}); setCurrentStep(1); }} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all">
                  Atras
                </button>
                <button type="button" onClick={() => goToStep(3)} className="flex-1 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Representative */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className={sectionTitleClass}>
                <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[#0D9488]" />
                </div>
                Representante Legal
              </h2>
              <p className="text-sm text-slate-500 -mt-2">Datos del representante legal (obligatorio)</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombres del Representante *</label>
                  <input type="text" value={form.representative_name} onChange={(e) => update('representative_name', e.target.value)} className={inputClass} placeholder="Nombre completo" />
                </div>
                <div>
                  <label className={labelClass}>Cedula del Representante *</label>
                  <input type="text" value={form.representative_cedula} onChange={(e) => update('representative_cedula', e.target.value)} className={inputClass} placeholder="12345678" />
                </div>
              </div>

              {stepErrorBox(3)}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStepErrors({}); setCurrentStep(2); }} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all">
                  Atras
                </button>
                <button type="button" onClick={() => goToStep(4)} className="flex-1 py-3.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/20">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className={sectionTitleClass}>
                <div className="w-8 h-8 bg-[#F0FDFA] rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-[#0D9488]" />
                </div>
                Documentos Requeridos
              </h2>
              <p className="text-sm text-slate-500 -mt-2">Sube los 4 documentos obligatorios (JPG, PNG o PDF, max 15MB)</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <FileUpload
                  bucket="documents"
                  path={uploadPath}
                  label="Cedula del Estudiante"
                  required
                  currentUrl={form.cedula_url || null}
                  onUploaded={(url) => update('cedula_url', url)}
                  onRemove={() => update('cedula_url', '')}
                />
                <FileUpload
                  bucket="documents"
                  path={uploadPath}
                  label="Partida de Nacimiento"
                  required
                  currentUrl={form.birth_certificate_url || null}
                  onUploaded={(url) => update('birth_certificate_url', url)}
                  onRemove={() => update('birth_certificate_url', '')}
                />
                <FileUpload
                  bucket="documents"
                  path={uploadPath}
                  label="Carta de Residencia"
                  required
                  currentUrl={form.residence_letter_url || null}
                  onUploaded={(url) => update('residence_letter_url', url)}
                  onRemove={() => update('residence_letter_url', '')}
                />
                <FileUpload
                  bucket="documents"
                  path={uploadPath}
                  label="Cedula del Representante"
                  required
                  currentUrl={form.cedula_rep_url || null}
                  onUploaded={(url) => update('cedula_rep_url', url)}
                  onRemove={() => update('cedula_rep_url', '')}
                />
              </div>

              {stepErrorBox(4)}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStepErrors({}); setCurrentStep(3); }} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all">
                  Atras
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#0D9488]/25 disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
