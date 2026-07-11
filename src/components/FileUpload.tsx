import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, FileText, CheckCircle, Loader2, ImageIcon } from 'lucide-react';

interface FileUploadProps {
  bucket: string;
  path: string;
  label: string;
  accept?: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
}

export function FileUpload({
  bucket,
  path,
  label,
  accept = 'image/*,.pdf',
  currentUrl,
  onUploaded,
  onRemove,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${path}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError('Error al subir el archivo');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      setPreview(urlData.publicUrl);
      onUploaded(urlData.publicUrl);
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
    onRemove?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = preview && (preview.match(/\.(jpeg|jpg|png|webp|gif)$/i) || !preview.endsWith('.pdf'));

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
          className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-brand-400 hover:bg-brand-50/30 transition-all"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-slate-400">Clic o arrastra un archivo</span>
        </button>
      )}

      {uploading && (
        <div className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-brand-200 rounded-xl bg-brand-50/30">
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
            <span className="text-xs text-emerald-600 truncate block">{label}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}
    </div>
  );
}
