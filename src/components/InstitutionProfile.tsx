import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { INSTITUTION_ID } from '../lib/constants';
import { Institution } from '../types';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Target,
  Eye,
  Edit3,
  Save,
  Camera,
  Upload,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface InstitutionProfileProps {
  onExit: () => void;
}

export function InstitutionProfile({ onExit }: InstitutionProfileProps) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    institution_type: '',
    mission: '',
    vision: '',
  });

  useEffect(() => {
    fetchInstitution();
  }, []);

  const fetchInstitution = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', INSTITUTION_ID)
      .single();

    if (data) {
      setInstitution(data);
      setForm({
        name: data.name || '',
        location: data.location || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || '',
        institution_type: data.institution_type || '',
        mission: data.mission || '',
        vision: data.vision || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('institutions')
      .update({
        name: form.name,
        location: form.location,
        description: form.description,
        email: form.email,
        phone: form.phone,
        website: form.website,
        address: form.address,
        institution_type: form.institution_type,
        mission: form.mission,
        vision: form.vision,
      })
      .eq('id', INSTITUTION_ID);

    setSaving(false);
    if (!error) {
      setSavedMsg(true);
      setEditMode(false);
      setTimeout(() => setSavedMsg(false), 2500);
      fetchInstitution();
    }
  };

  const handleCancel = () => {
    if (institution) {
      setForm({
        name: institution.name || '',
        location: institution.location || '',
        description: institution.description || '',
        email: institution.email || '',
        phone: institution.phone || '',
        website: institution.website || '',
        address: institution.address || '',
        institution_type: institution.institution_type || '',
        mission: institution.mission || '',
        vision: institution.vision || '',
      });
    }
    setEditMode(false);
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    const ext = file.name.split('.').pop();
    const path = `covers/${INSTITUTION_ID}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path);
      if (urlData?.publicUrl) {
        await supabase.from('institutions').update({ cover_image: urlData.publicUrl }).eq('id', INSTITUTION_ID);
        setInstitution((prev) => prev ? { ...prev, cover_image: urlData.publicUrl } : prev);
      }
    }
    setUploadingCover(false);
  };

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const path = `logos/${INSTITUTION_ID}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      if (urlData?.publicUrl) {
        await supabase.from('institutions').update({ logo_url: urlData.publicUrl }).eq('id', INSTITUTION_ID);
        setInstitution((prev) => prev ? { ...prev, logo_url: urlData.publicUrl } : prev);
      }
    }
    setUploadingLogo(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-56 lg:h-72 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
        {institution?.cover_image && (
          <img
            src={institution.cover_image}
            alt=""
            className="w-full h-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
          className="hidden"
        />

        {/* Change Cover Button */}
        {editMode && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 font-medium rounded-xl transition-colors shadow-lg disabled:opacity-60"
          >
            {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {uploadingCover ? 'Subiendo...' : 'Cambiar Portada'}
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 lg:px-6 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden mb-6">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Logo */}
              <div className="relative flex-shrink-0">
                {institution?.logo_url ? (
                  <img
                    src={institution.logo_url}
                    alt=""
                    className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white font-bold text-4xl">
                      {institution?.name.charAt(0)}
                    </span>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }}
                  className="hidden"
                />
                {editMode && (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="text-2xl lg:text-3xl font-bold text-slate-900 w-full bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <input
                      type="text"
                      value={form.institution_type}
                      onChange={(e) => setForm({ ...form, institution_type: e.target.value })}
                      placeholder="Tipo de institucion"
                      className="text-lg text-slate-500 w-full bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                      {institution?.name}
                    </h1>
                    {institution?.institution_type && (
                      <p className="text-lg text-slate-500 mt-1">
                        {institution.institution_type}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {institution?.location}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Descripcion
              </h2>
              {editMode ? (
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed">
                  {institution?.description}
                </p>
              )}
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-600" />
                  Mision
                </h3>
                {editMode ? (
                  <textarea
                    value={form.mission}
                    onChange={(e) => setForm({ ...form, mission: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                ) : institution?.mission ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {institution.mission}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No definida
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  Vision
                </h3>
                {editMode ? (
                  <textarea
                    value={form.vision}
                    onChange={(e) => setForm({ ...form, vision: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                ) : institution?.vision ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {institution.vision}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No definida
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Contacto
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    ) : (
                      <>
                        <p className="text-xs text-slate-400 font-medium">
                          Correo
                        </p>
                        <p className="text-sm text-slate-700 mt-0.5 truncate">
                          {institution?.email || 'No especificado'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    ) : (
                      <>
                        <p className="text-xs text-slate-400 font-medium">
                          Telefono
                        </p>
                        <p className="text-sm text-slate-700 mt-0.5">
                          {institution?.phone || 'No especificado'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <input
                        type="text"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className="w-full bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    ) : (
                      <>
                        <p className="text-xs text-slate-400 font-medium">
                          Sitio Web
                        </p>
                        <p className="text-sm text-slate-700 mt-0.5 truncate">
                          {institution?.website || 'No especificado'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Direccion
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFEFF] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div className="flex-1">
                    {editMode ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
placeholder="Carabobo, Venezuela"
                          className="w-full bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
placeholder="Dirección, Carabobo, Venezuela"
                          className="w-full bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-700">
                          {institution?.location}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {institution?.address || 'Direccion no especificada'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Toast */}
      {savedMsg && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20">
            <Save className="w-5 h-5" />
            Perfil guardado correctamente
          </div>
        </div>
      )}
    </div>
  );
}
