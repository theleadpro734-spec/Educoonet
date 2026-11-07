import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, FileText, CheckCircle, Loader2, ImageIcon, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  bucket: string;
  path: string;
  label: string;
  accept?: string;
  required?: boolean;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function FileUpload({
  bucket,
  path,
  label,
  accept = 'image/*,.pdf',
  required = false,
  currentUrl,
  onUploaded,
  onRemove,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 15) {
      setError('El archivo pesa mas de 15MB. Usa uno mas pequeño.');
      return;
    }

    setUploading(true);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
    const base = sanitizeName(file.name.replace(/\.[^.]+$/, '')) || 'archivo';
    const filePath = `${path}/${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      const msg = uploadError.message || '';
      let friendly = 'No se pudo subir el archivo. Intenta de nuevo.';
      if (msg.includes('policy') || msg.includes('row-level')) {
        friendly = 'Sin permiso para subir. Avisanos si persiste.';
      } else if (msg.includes('size') || msg.includes('too large')) {
        friendly = 'El archivo es muy grande (max 15MB).';
      } else if (msg.includes('mime') || msg.includes('format')) {
        friendly = 'Formato no permitido. Usa JPG, PNG o PDF.';
      }
      setError(friendly);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      setPreview(urlData.publicUrl);
      setFileName(file.name);
      onUploaded(urlData.publicUrl);
    } else {
      setError('No se pudo obtener la URL del archivo.');
    }

    setUploading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage =
    preview &&
    (preview.match(/\.(jpeg|jpg|png|webp|gif)$/i) ||
      (fileName && /\.(jpeg|jpg|png|webp|gif)$/i.test(fileName)));

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {!preview && !uploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-xl transition-all text-left"
          style={{
            borderColor: required ? '#BFDBFE' : '#cbd5e1',
          }}
        >
          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-brand-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
          <span className="text-xs text-slate-400">Toca o arrastra - JPG, PNG o PDF (max 15MB)</span>
        </button>
      )}

      {uploading && (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-brand-200 rounded-xl bg-brand-50/50">
          <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
          <span className="text-sm text-brand-700 font-medium">Subiendo...</span>
        </div>
      )}

      {preview && !uploading && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          {isImage ? (
            <img
              src={preview}
              alt={label}
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-800 truncate">Archivo subido</span>
            </div>
            <span className="text-xs text-emerald-600 truncate block">{fileName || label}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
              title="Reemplazar"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Quitar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
