import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  School,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  FolderArchive,
  RefreshCw,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah } from '../utils/terbilang';
import { MultiSchoolBackupBundle, RevitaProjectFile } from '../types';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkspaceSwitcher?: () => void;
}

export const ImportProjectModal: React.FC<ImportProjectModalProps> = ({
  isOpen,
  onClose,
  onOpenWorkspaceSwitcher,
}) => {
  const {
    activeWorkspaceMeta,
    parseUploadedFile,
    importProjectFile,
    importAllSchoolsBundle,
  } = useProject();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsedProject, setParsedProject] = useState<RevitaProjectFile | null>(null);
  const [parsedBundle, setParsedBundle] = useState<MultiSchoolBackupBundle | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setSelectedFileName(file.name);
    setErrorMessage(null);
    setParsedProject(null);
    setParsedBundle(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMessage('Berkas kosong.');
          return;
        }

        // Try checking if it is a Multi-School Bundle
        try {
          const json = JSON.parse(text);
          if (json.fileSignature === 'SIAP_REVITA_MULTI_SCHOOL_BUNDLE' && json.workspaces) {
            setParsedBundle(json as MultiSchoolBackupBundle);
            return;
          }
        } catch {
          // not bundle, proceed to standard parser
        }

        const res = parseUploadedFile(text);
        if (res.valid && res.data) {
          setParsedProject(res.data);
        } else {
          setErrorMessage(res.error || 'Format berkas tidak valid.');
        }
      } catch (err: any) {
        setErrorMessage(`Gagal membaca berkas: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteImport = (mode: 'OVERWRITE_ACTIVE' | 'CREATE_NEW_WORKSPACE') => {
    if (!parsedProject) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = importProjectFile(parsedProject, mode);
      setIsProcessing(false);
      if (res.success) {
        alert(res.message);
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    }, 100);
  };

  const handleExecuteBundleRestore = () => {
    if (!parsedBundle) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = importAllSchoolsBundle(parsedBundle);
      setIsProcessing(false);
      if (res.success) {
        alert(res.message);
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    }, 100);
  };

  const resetSelection = () => {
    setSelectedFileName(null);
    setParsedProject(null);
    setParsedBundle(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Buka & Impor Berkas Proyek Sekolah (Pilihan 2)
              </h3>
              <p className="text-xs text-slate-500">
                Unggah file dokumen data mandiri (<code className="text-emerald-700 font-mono font-bold">.revita</code> atau <code className="text-emerald-700 font-mono font-bold">.json</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Upload Drop Zone */}
          {!parsedProject && !parsedBundle && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".revita,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Pilih atau Tarik Berkas Proyek ke Sini
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
                Mendukung berkas portabel <span className="font-mono text-emerald-700 font-semibold">.revita</span> dan file arsip JSON dari SIAP-Revita.
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg">
                <Upload className="w-3.5 h-3.5" />
                <span>Jelajahi File di Laptop / Komputer</span>
              </span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-semibold">Gagal Membuka Berkas</strong>
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={resetSelection}
                className="text-rose-700 hover:text-rose-900 font-semibold underline text-xs ml-2"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* SMART PREVIEW CARD: SINGLE SCHOOL PROJECT (.revita) */}
          {parsedProject && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Berkas Terverifikasi Siap Dimuat</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{selectedFileName}</span>
                  </div>
                </div>
                <button
                  onClick={resetSelection}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Ganti File
                </button>
              </div>

              {/* School Information */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800 font-mono">
                    NPSN: {parsedProject.npsn}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {parsedProject.namaSekolah}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Total Pagu</span>
                    <span className="font-bold text-slate-800">{formatRupiah(parsedProject.paguAnggaran)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transaksi Kas</span>
                    <span className="font-bold text-slate-800">{parsedProject.transactions?.length || 0} Entri</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Kwitansi Material</span>
                    <span className="font-bold text-slate-800">{parsedProject.kwitansiList?.length || 0} Berkas</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SPJ Honor Tukang</span>
                    <span className="font-bold text-slate-800">{parsedProject.payrollHarian?.length || 0} Minggu</span>
                  </div>
                </div>
              </div>

              {/* Import Choice Actions */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-slate-800">Pilih Metode Pemuatan Data:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Create New Workspace */}
                  <button
                    onClick={() => handleExecuteImport('CREATE_NEW_WORKSPACE')}
                    disabled={isProcessing}
                    className="p-3 text-left rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50/80 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <School className="w-4 h-4 text-emerald-700" />
                        <span>Buka Sebagai Sekolah Baru</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Menambahkan sekolah ini ke daftar multi-workspace tanpa mengubah data sekolah lain.
                    </p>
                  </button>

                  {/* Option 2: Overwrite Current Active School */}
                  <button
                    onClick={() => handleExecuteImport('OVERWRITE_ACTIVE')}
                    disabled={isProcessing}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 text-slate-600" />
                        <span>Timpa Profil Aktif Saat Ini</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Menggantikan data di profil ({activeWorkspaceMeta?.namaSekolah}) dengan isi berkas ini.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SMART PREVIEW CARD: MULTI SCHOOL BUNDLE */}
          {parsedBundle && (
            <div className="border border-purple-200 bg-purple-50/40 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-purple-700" />
                  <div>
                    <h4 className="text-xs font-bold text-purple-950">Arsip Bundle Multi-Sekolah Terdeteksi</h4>
                    <span className="text-[11px] text-slate-500">{parsedBundle.workspaces?.length || 0} Profil Sekolah</span>
                  </div>
                </div>
                <button
                  onClick={resetSelection}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Ganti File
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-2 text-xs">
                <p className="font-semibold text-slate-800">Daftar Sekolah di Dalam Arsip Ini:</p>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-[11px]">
                  {parsedBundle.workspaces.map((w) => (
                    <div key={w.npsn} className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="font-medium text-slate-900">{w.namaSekolah}</span>
                      <span className="font-mono text-slate-500 text-[10px]">NPSN: {w.npsn}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExecuteBundleRestore}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Pulihkan & Impor Seluruh ({parsedBundle.workspaces.length}) Profil Sekolah</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Berkas disimpan dan dibaca secara lokal di peramban Anda.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
