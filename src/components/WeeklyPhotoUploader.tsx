import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Printer,
  Maximize2,
  X,
  FileCheck2,
} from 'lucide-react';
import { ProgressPhotoItem } from '../types';
import { createProgressPhotoItem, createDemoProgressPhotos } from '../utils/photoStorageEngine';

interface WeeklyPhotoUploaderProps {
  mingguKe: number;
  photos: ProgressPhotoItem[];
  onPhotosChange: (newPhotos: ProgressPhotoItem[]) => void;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
}

export const WeeklyPhotoUploader: React.FC<WeeklyPhotoUploaderProps> = ({
  mingguKe,
  photos,
  onPhotosChange,
  title = 'Dokumentasi Foto Progres Fisik Mingguan (Lampiran SPJ)',
  subtitle = 'Upload foto-foto realisasi pekerjaan di lapangan (bisa pilih beberapa foto sekaligus). Foto otomatis terlampir dan ikut tercetak pada berkas SPJ Upah & LPJ.',
  readOnly = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<ProgressPhotoItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Multiple File Upload
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newItems: ProgressPhotoItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const item = await createProgressPhotoItem(file, mingguKe);
          newItems.push(item);
        }
      }

      if (newItems.length > 0) {
        onPhotosChange([...photos, ...newItems]);
      }
    } catch (err: any) {
      alert('Gagal memproses gambar: ' + (err?.message || 'Format tidak didukung'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string) => {
    if (readOnly) return;
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    if (readOnly) return;
    onPhotosChange(
      photos.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const handleLoadDemo = () => {
    if (readOnly) return;
    const demo = createDemoProgressPhotos(mingguKe);
    onPhotosChange([...photos, ...demo]);
  };

  const filteredPhotos = photos.filter((p) => p.mingguKe === mingguKe || !p.mingguKe);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Camera className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredPhotos.length} Foto Terlampir
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">{subtitle}</p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              id={`photo-input-w${mingguKe}`}
            />

            <label
              htmlFor={`photo-input-w${mingguKe}`}
              className="cursor-pointer px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Foto (Bisa Banyak)</span>
            </label>

            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors"
              title="Tambahkan 2 contoh foto fisik proyek"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Contoh Foto (Demo)</span>
            </button>
          </div>
        )}
      </div>

      {/* Drag & Drop Area if empty or uploading */}
      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            isDragOver
              ? 'border-emerald-600 bg-emerald-50/80 scale-[1.005]'
              : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <span>
                Tarik & letakkan foto di sini, atau gunakan tombol di atas.
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              (Format JPG, PNG, WEBP didukung · Otomatis dikompres)
            </span>
          </div>
          {isUploading && (
            <div className="mt-2 text-xs font-semibold text-emerald-800 animate-pulse">
              Memproses dan mengompres foto...
            </div>
          )}
        </div>
      )}

      {/* Photo Gallery Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs hover:shadow-xs transition-all flex flex-col"
            >
              {/* Photo Preview Container */}
              <div className="relative aspect-4/3 bg-slate-200 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Badge Number */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-mono text-[10px] font-bold">
                  Foto #{idx + 1}
                </div>

                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(photo)}
                    className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md transition-colors"
                    title="Perbesar Foto"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id)}
                      className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Caption input / display */}
              <div className="p-2.5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100 text-xs">
                {readOnly ? (
                  <p className="font-medium text-slate-800 text-[11px] leading-snug">
                    {photo.caption}
                  </p>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Keterangan Foto (Tercetak di SPJ):
                    </label>
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                      placeholder="Contoh: Pengecoran sloof kolom..."
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-medium text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                  <span>Minggu Ke-{photo.mingguKe}</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <FileCheck2 className="w-3 h-3" />
                    <span>Siap Cetak di SPJ</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p className="font-semibold text-slate-600">Belum ada foto progres yang diunggah untuk Minggu Ke-{mingguKe}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Klik tombol <strong>"+ Upload Foto"</strong> atau <strong>"Contoh Foto (Demo)"</strong> agar foto ikut tercetak di lembar SPJ.
          </p>
        </div>
      )}

      {/* Modal Zoom Preview */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in-95">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between px-4">
              <span className="text-xs font-bold truncate">{previewPhoto.caption}</span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto bg-slate-950 flex items-center justify-center p-2">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-3 bg-slate-50 text-xs text-slate-600 flex items-center justify-between border-t border-slate-200 px-4">
              <span>{previewPhoto.caption}</span>
              <span className="font-mono text-[11px]">Minggu Ke-{previewPhoto.mingguKe}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
