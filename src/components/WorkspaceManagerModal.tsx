import React, { useState, useRef } from 'react';
import {
  School,
  FileCheck,
  Download,
  Upload,
  KeyRound,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  Sparkles,
  Share2,
  Copy,
  Info,
  Calendar,
  Layers,
  FolderDown,
  FileCode2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { SchoolWorkspaceProfile } from '../types';
import { formatRupiah } from '../utils/terbilang';

interface WorkspaceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'switcher' | 'upload' | 'download' | 'pin';
}

export const WorkspaceManagerModal: React.FC<WorkspaceManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'switcher',
}) => {
  const {
    workspaces,
    activeNpsn,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
    updateWorkspaceProfile,
    getWorkspaceStats,
    exportProjectFile,
    importProjectFile,
    hasUnsavedExportChanges,
    lastExportedAt,
    projectInfo,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'switcher' | 'upload' | 'download' | 'pin'>(initialTab);

  // Switcher state & PIN challenge
  const [pinChallengeTarget, setPinChallengeTarget] = useState<SchoolWorkspaceProfile | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [switchSuccessMsg, setSwitchSuccessMsg] = useState<string>('');

  // Add School Form
  const [isAddingSchool, setIsAddingSchool] = useState<boolean>(false);
  const [newNpsn, setNewNpsn] = useState<string>('');
  const [newNamaSekolah, setNewNamaSekolah] = useState<string>('');
  const [newJenjang, setNewJenjang] = useState<'SD' | 'SMP' | 'SMA' | 'SMK' | 'SLB'>('SD');
  const [newKabupaten, setNewKabupaten] = useState<string>('Kabupaten Bogor');
  const [newPagu, setNewPagu] = useState<number>(150000000);
  const [newPin, setNewPin] = useState<string>('1234');
  const [newTemplate, setNewTemplate] = useState<'sd_lengkap' | 'smp_rehab' | 'blank'>('sd_lengkap');
  const [newTheme, setNewTheme] = useState<string>('emerald');

  // File Upload State
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<{
    fileName: string;
    npsn: string;
    namaSekolah: string;
    jenjang: string;
    paguAnggaran: number;
    rawContent: string;
    transactionsCount: number;
    kwitansiCount: number;
    exportedAt: string;
    format: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active School PIN settings
  const [currentSchoolPin, setCurrentSchoolPin] = useState<string>(activeWorkspace?.pin || '');
  const [isPinProtectedToggle, setIsPinProtectedToggle] = useState<boolean>(activeWorkspace?.isPinProtected || false);
  const [pinSavedToast, setPinSavedToast] = useState<boolean>(false);

  React.useEffect(() => {
    if (activeWorkspace) {
      setCurrentSchoolPin(activeWorkspace.pin || '');
      setIsPinProtectedToggle(activeWorkspace.isPinProtected || false);
    }
  }, [activeWorkspace]);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSelectWorkspace = (ws: SchoolWorkspaceProfile) => {
    if (ws.npsn === activeNpsn) return;

    if (ws.isPinProtected && ws.pin && ws.pin.trim() !== '') {
      setPinChallengeTarget(ws);
      setPinInput('');
      setPinError('');
    } else {
      const res = switchWorkspace(ws.npsn);
      if (res.success) {
        setSwitchSuccessMsg(res.message || 'Berhasil beralih sekolah');
        setTimeout(() => setSwitchSuccessMsg(''), 3000);
      }
    }
  };

  const handleConfirmPinSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinChallengeTarget) return;

    const res = switchWorkspace(pinChallengeTarget.npsn, pinInput);
    if (res.success) {
      setSwitchSuccessMsg(res.message || 'Berhasil beralih sekolah');
      setPinChallengeTarget(null);
      setPinInput('');
      setPinError('');
      setTimeout(() => setSwitchSuccessMsg(''), 3500);
    } else {
      setPinError(res.message || 'PIN salah!');
    }
  };

  const handleCreateNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpsn.trim() || !newNamaSekolah.trim()) {
      alert('Mohon lengkapi NPSN dan Nama Sekolah.');
      return;
    }

    const success = createWorkspace(
      {
        npsn: newNpsn.trim(),
        namaSekolah: newNamaSekolah.trim(),
        jenjang: newJenjang,
        kabupatenKota: newKabupaten.trim(),
        paguAnggaran: newPagu,
        pin: newPin.trim(),
        isPinProtected: Boolean(newPin.trim()),
        warnaTema: newTheme,
        catatanFasilitator: `Dibuat pada ${new Date().toLocaleDateString('id-ID')}`,
      },
      newTemplate
    );

    if (success) {
      setIsAddingSchool(false);
      setSwitchSuccessMsg(`Profil Sekolah ${newNamaSekolah} (NPSN ${newNpsn}) berhasil dibuat dan diaktifkan!`);
      setNewNpsn('');
      setNewNamaSekolah('');
      setTimeout(() => setSwitchSuccessMsg(''), 4000);
    } else {
      alert(`NPSN ${newNpsn} sudah terdaftar di browser ini. Silakan gunakan NPSN lain.`);
    }
  };

  const handleDeleteSchool = (ws: SchoolWorkspaceProfile) => {
    if (confirm(`Yakin ingin menghapus profil sekolah ${ws.namaSekolah} (${ws.npsn}) beserta seluruh data BKU dan kwitansinya dari browser ini? Tindakan ini tidak dapat dibatalkan.`)) {
      const ok = deleteWorkspace(ws.npsn);
      if (ok) {
        setSwitchSuccessMsg(`Profil ${ws.namaSekolah} berhasil dihapus.`);
        setTimeout(() => setSwitchSuccessMsg(''), 3000);
      }
    }
  };

  const handleFileProcess = (file: File) => {
    setUploadError('');
    setUploadSuccess('');
    setParsedPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.projectInfo && !parsed.school && !parsed.transactions) {
          setUploadError('Berkas yang dipilih tidak valid. Pastikan memilih file proyek .revita atau .json dari SIAP-Revita.');
          return;
        }

        const npsn = parsed.school?.npsn || parsed.projectInfo?.dataSekolah?.npsn || '2020XXXX';
        const nama = parsed.school?.namaSekolah || parsed.projectInfo?.dataSekolah?.namaSekolah || parsed.projectInfo?.namaInstansi || 'Sekolah Revitalisasi';
        const jenjang = parsed.school?.jenjang || parsed.projectInfo?.dataSekolah?.jenjang || 'SD';
        const pagu = parsed.projectInfo?.totalPaguAnggaran || 0;
        const txCount = Array.isArray(parsed.transactions) ? parsed.transactions.length : 0;
        const kwCount = Array.isArray(parsed.kwitansiList) ? parsed.kwitansiList.length : 0;
        const expDate = parsed.exportedAt || new Date().toISOString();

        setParsedPreview({
          fileName: file.name,
          npsn,
          namaSekolah: nama,
          jenjang,
          paguAnggaran: pagu,
          rawContent: text,
          transactionsCount: txCount,
          kwitansiCount: kwCount,
          exportedAt: expDate,
          format: file.name.endsWith('.revita') ? 'SIAP-Revita (.revita)' : 'Berkas JSON (.json)',
        });
      } catch (err: any) {
        setUploadError(`Gagal membaca berkas: ${err.message || 'Format tidak valid'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    const res = importProjectFile(parsedPreview.rawContent);
    if (res.success) {
      setUploadSuccess(`Berkas sekolah "${res.namaSekolah}" (NPSN: ${res.npsn}) berhasil dibuka dan disimpan ke browser!`);
      setParsedPreview(null);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setUploadError(res.error || 'Gagal mengimpor berkas');
    }
  };

  const handleSaveActivePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;

    updateWorkspaceProfile(activeWorkspace.npsn, {
      pin: currentSchoolPin.trim(),
      isPinProtected: isPinProtectedToggle && currentSchoolPin.trim().length > 0,
    });

    setPinSavedToast(true);
    setTimeout(() => setPinSavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Manajemen Sekolah & Berkas Proyek</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Multi-Workspace & Portabel
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Ganti profil sekolah aktif (NPSN + PIN) atau buka & simpan berkas proyek mandiri (.revita / .json)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('switcher')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'switcher'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Ganti Profil Sekolah ({workspaces.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'download'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderDown className="w-4 h-4 text-emerald-600" />
            <span>Simpan / Unduh Berkas Proyek (.revita)</span>
            {hasUnsavedExportChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Ada perubahan baru" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Buka Berkas Sekolah (.revita / .json)</span>
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pin'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Kunci Akses / PIN Sekolah</span>
          </button>
        </div>

        {/* Global Toast Success Message */}
        {switchSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{switchSuccessMsg}</span>
            </div>
            <button onClick={() => setSwitchSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SWITCHER & MULTI-WORKSPACE */}
          {activeTab === 'switcher' && (
            <div className="space-y-6">
              {/* Active Workspace Banner */}
              <div className="bg-linear-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400/30">
                      Sekolah Aktif Saat Ini
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      Prefix: <code className="text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded">sekolah_{activeNpsn}_*</code>
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>{projectInfo.dataSekolah?.namaSekolah || activeWorkspace?.namaSekolah || 'Sekolah'}</span>
                    <span className="text-xs font-normal text-slate-300">({activeWorkspace?.jenjang || 'SD'})</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    NPSN: <span className="font-mono font-bold text-emerald-300">{activeNpsn}</span> | Lokasi: {projectInfo.alamatLengkap?.kabupatenKota || activeWorkspace?.kabupatenKota || 'Kabupaten Bogor'} | Pagu: <span className="font-mono font-semibold">{formatRupiah(projectInfo.totalPaguAnggaran)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                  <button
                    onClick={() => setActiveTab('download')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>Simpan Berkas .revita</span>
                  </button>
                </div>
              </div>

              {/* PIN Challenge Dialog if active */}
              {pinChallengeTarget && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl animate-in zoom-in-95">
                  <form onSubmit={handleConfirmPinSwitch} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>Kunci Akses Diperlukan: {pinChallengeTarget.namaSekolah}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPinChallengeTarget(null)}
                        className="text-xs text-amber-800 hover:text-amber-950 underline"
                      >
                        Batal
                      </button>
                    </div>
                    <p className="text-xs text-amber-800">
                      Profil sekolah dengan NPSN <span className="font-mono font-bold">{pinChallengeTarget.npsn}</span> diproteksi dengan PIN 4-digit untuk mencegah tertukar data.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="password"
                        maxLength={8}
                        autoFocus
                        placeholder="Masukkan 4-digit PIN..."
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="p-2 border border-amber-300 bg-white rounded-lg text-sm font-mono tracking-widest text-center w-48 focus:ring-2 focus:ring-amber-500 outline-hidden"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Buka & Ganti Sekolah</span>
                      </button>
                    </div>
                    {pinError && <p className="text-xs font-semibold text-rose-600">{pinError}</p>}
                  </form>
                </div>
              )}

              {/* List of School Profiles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Daftar Sekolah Terdaftar di Browser Ini</h4>
                    <p className="text-xs text-slate-500">
                      Setiap sekolah memiliki database terisolasi (<code className="text-emerald-700 bg-emerald-50 px-1 rounded">sekolah_[NPSN]_*</code>) tanpa risiko data bercampur.
                    </p>
                  </div>
                  {!isAddingSchool && (
                    <button
                      onClick={() => setIsAddingSchool(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Sekolah Baru</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {workspaces.map((ws) => {
                    const stats = getWorkspaceStats(ws.npsn);
                    const isActive = ws.npsn === activeNpsn;

                    return (
                      <div
                        key={ws.npsn}
                        className={`rounded-2xl border p-4 transition-all ${
                          isActive
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isActive
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {ws.jenjang || 'SD'}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm leading-tight">{ws.namaSekolah}</h5>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono text-emerald-800 font-semibold">NPSN: {ws.npsn}</span>
                                <span>•</span>
                                <span>{ws.kabupatenKota || 'Bogor'}</span>
                              </div>
                            </div>
                          </div>

                          {ws.isPinProtected ? (
                            <span
                              className="p-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-medium flex items-center gap-1"
                              title="Diproteksi PIN"
                            >
                              <Lock className="w-3 h-3 text-amber-700" />
                              <span>PIN</span>
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-slate-100 text-slate-500 text-[10px] flex items-center gap-1">
                              <Unlock className="w-3 h-3" />
                              <span>Bebas</span>
                            </span>
                          )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl text-xs mb-3 border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Pagu Anggaran</span>
                            <span className="font-semibold text-slate-800 font-mono text-[11px]">
                              {formatRupiah(ws.paguAnggaran)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Transaksi BKU</span>
                            <span className="font-semibold text-slate-800 font-mono">{stats.bkuCount} Bkt</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Progres Fisik</span>
                            <span className="font-semibold text-emerald-700 font-mono">
                              {stats.progressPersen.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">
                            Prefix: <code className="font-mono text-slate-600">sekolah_{ws.npsn}_bku</code>
                          </span>

                          <div className="flex items-center gap-2">
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSchool(ws)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus sekolah ini dari browser"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isActive ? (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sedang Aktif</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSelectWorkspace(ws)}
                                className="px-3 py-1 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Ganti ke Sekolah Ini</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Tambah Sekolah Baru */}
              {isAddingSchool && (
                <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50 shadow-xs space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-bold text-slate-900 text-sm">Tambah Profil Sekolah / Workspace Baru</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingSchool(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Tutup
                    </button>
                  </div>

                  <form onSubmit={handleCreateNewSchool} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          NPSN Sekolah (8 Digit) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          placeholder="misal: 20205511"
                          value={newNpsn}
                          onChange={(e) => setNewNpsn(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                        />
                        <span className="text-[10px] text-slate-400">Digunakan sebagai ID prefix database</span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nama Lengkap Sekolah <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="misal: SD Negeri 02 Sukamaju"
                          value={newNamaSekolah}
                          onChange={(e) => setNewNamaSekolah(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Jenjang</label>
                        <select
                          value={newJenjang}
                          onChange={(e) => setNewJenjang(e.target.value as any)}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="SD">SD (Sekolah Dasar)</option>
                          <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                          <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                          <option value="SMK">SMK (Kejuruan)</option>
                          <option value="SLB">SLB (Luar Biasa)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                        <input
                          type="text"
                          value={newKabupaten}
                          onChange={(e) => setNewKabupaten(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Total Pagu Anggaran (Rp)</label>
                        <input
                          type="number"
                          step="1000000"
                          value={newPagu}
                          onChange={(e) => setNewPagu(parseInt(e.target.value) || 0)}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono font-bold text-emerald-900"
                        />
                        <span className="text-[10px] text-emerald-700 font-medium font-mono">{formatRupiah(newPagu)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Kunci Akses / PIN Lokal (Opsional 4-Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="misal: 1234"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono tracking-widest"
                        />
                        <span className="text-[10px] text-slate-400">PIN untuk mencegah operator lain sengaja membuka data sekolah ini</span>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Template Awal Data</label>
                        <select
                          value={newTemplate}
                          onChange={(e) => setNewTemplate(e.target.value as any)}
                          className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="sd_lengkap">Contoh Lengkap Revitalisasi SD (Pondasi, Dinding, Atap)</option>
                          <option value="smp_rehab">Contoh Rehab Sarpras SMP / Lab & Sanitasi</option>
                          <option value="blank">Mulai Kosong Bersih (Input Sendiri dari 0)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingSchool(false)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Simpan & Buka Workspace Baru</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOWNLOAD & SIMPAN BERKAS PORTABEL */}
          {activeTab === 'download' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FolderDown className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Sistem Berkas Proyek Mandiri (Metode Portabel & Bebas Risiko)
                    </h4>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Setiap sekolah dapat menyimpan 1 file basis data mandiri berformat khusus (<code className="bg-emerald-200/60 font-mono px-1 rounded">.revita</code>).
                      File ini dapat dikirim lewat WhatsApp, disimpan di Google Drive, atau dipindah via Flashdisk tanpa takut data hilang saat ganti laptop atau cache browser dibersihkan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status File Info */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Profil Sekolah yang akan Diunduh:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {projectInfo.dataSekolah?.namaSekolah || activeWorkspace?.namaSekolah} (NPSN: {activeNpsn})
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 block">Terakhir Disimpan/Unduh:</span>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      {lastExportedAt ? new Date(lastExportedAt).toLocaleString('id-ID') : 'Belum pernah diunduh sesi ini'}
                    </span>
                  </div>
                </div>

                {hasUnsavedExportChanges && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Terdapat perubahan transaksi atau progres baru yang belum disimpan ke berkas .revita terbaru.</span>
                  </div>
                )}
              </div>

              {/* Download Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: .revita Format */}
                <div className="border-2 border-emerald-600/60 hover:border-emerald-600 bg-white rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                        Format Resmi Rekomendasi
                      </span>
                      <span className="font-mono text-xs text-emerald-700 font-bold">.revita</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-base">Berkas Proyek SIAP-Revita (.revita)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Format khusus terenkapsulasi yang menyimpan seluruh struktur data sekolah: BKU, Buku Bank, Kwitansi Material, SPJ Honor Tukang, Kurva S, WBS, RAB & AHSP, serta susunan 9 Tim P2SP.
                    </p>
                  </div>

                  <button
                    onClick={() => exportProjectFile('revita')}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Berkas .revita ({activeNpsn})</span>
                  </button>
                </div>

                {/* Card 2: .json Format */}
                <div className="border border-slate-200 hover:border-slate-300 bg-white rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                        Format Universal
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-bold">.json</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-base">Cadangan Standar JSON (.json)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Format JSON standar untuk kebutuhan backup universal atau audit teknis database program revitalisasi.
                    </p>
                  </div>

                  <button
                    onClick={() => exportProjectFile('json')}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Download Cadangan JSON</span>
                  </button>
                </div>
              </div>

              {/* Instructions on Portability */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>Cara Mudah Berbagi Berkas dengan Fasilitator / Tim Sekolah:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-600">
                  <li>Download berkas <code className="text-emerald-800 font-mono">.revita</code> setelah selesai mencatat BKU atau progres fisik.</li>
                  <li>Kirimkan file tersebut melalui WhatsApp Web ke Fasilitator Lapangan atau Kepala Sekolah.</li>
                  <li>Fasilitator cukup membuka web ini dan klik menu <strong>"Buka Berkas Sekolah"</strong> untuk melihat laporan sekolah secara lengkap tanpa login.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD & BUKA BERKAS SEKOLAH */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-600">
                Pilih file <code className="text-emerald-800 font-mono bg-emerald-50 px-1 rounded">.revita</code> atau <code className="text-slate-800 font-mono bg-slate-100 px-1 rounded">.json</code> yang tersimpan di komputer/HP Anda untuk langsung membuka seluruh data pembukuan & LPJ sekolah tersebut.
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileProcess(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-emerald-600 bg-emerald-50 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".revita,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Tarik & Lepaskan Berkas Sekolah di Sini, atau <span className="text-emerald-700 underline">Klik untuk Pilih File</span>
                </h4>
                <p className="text-xs text-slate-500">Mendukung format resmi: .revita dan .json</p>
              </div>

              {uploadError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Preview Card before applying */}
              {parsedPreview && (
                <div className="border-2 border-emerald-500 bg-emerald-50/40 rounded-2xl p-5 space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Pratinjau Berkas: {parsedPreview.fileName}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      {parsedPreview.format}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block">Nama Sekolah</span>
                      <span className="font-bold text-slate-900 block truncate">{parsedPreview.namaSekolah}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block">NPSN</span>
                      <span className="font-mono font-bold text-emerald-800">{parsedPreview.npsn}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block">Pagu Anggaran</span>
                      <span className="font-mono font-semibold text-slate-800">{formatRupiah(parsedPreview.paguAnggaran)}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 block">Isi Dokumen</span>
                      <span className="font-medium text-slate-800">{parsedPreview.transactionsCount} BKU, {parsedPreview.kwitansiCount} Kwt</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setParsedPreview(null)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Buka & Simpan ke Browser Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PIN & KEAMANAN LOKAL */}
          {activeTab === 'pin' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-950 text-sm">
                      Kunci Sandi & PIN Lokal Sekolah (Anti Tertukar Data)
                    </h4>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      PIN ini disimpan secara lokal di browser Anda untuk mengamankan data sekolah <strong className="text-slate-900">{projectInfo.dataSekolah?.namaSekolah || activeWorkspace?.namaSekolah}</strong>.
                      Saat rekan kerja atau fasilitator lain membuka laptop Anda dan ingin beralih ke sekolah ini, sistem akan meminta PIN 4-digit.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveActivePin} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-700" />
                  <span>Pengaturan PIN untuk: {projectInfo.dataSekolah?.namaSekolah} ({activeNpsn})</span>
                </h4>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="pinToggle"
                    checked={isPinProtectedToggle}
                    onChange={(e) => setIsPinProtectedToggle(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="pinToggle" className="font-semibold text-slate-800 cursor-pointer">
                    Aktifkan Kunci Sandi / PIN saat beralih ke profil sekolah ini
                  </label>
                </div>

                {isPinProtectedToggle && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-700">
                      PIN Akses Sekolah (4 - 8 Karakter / Angka)
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      required={isPinProtectedToggle}
                      placeholder="misal: 1234 atau 2026"
                      value={currentSchoolPin}
                      onChange={(e) => setCurrentSchoolPin(e.target.value)}
                      className="w-64 p-2.5 border border-slate-300 rounded-xl font-mono text-center tracking-widest text-base font-bold bg-white"
                    />
                    <p className="text-[11px] text-slate-500">
                      Catat PIN ini baik-baik. Jika lupa, Anda tetap dapat membuka data menggunakan berkas cadangan <code className="text-emerald-800 font-mono">.revita</code>.
                    </p>
                  </div>
                )}

                {pinSavedToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pengaturan PIN sekolah berhasil diperbarui!</span>
                  </div>
                )}

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Simpan Pengaturan PIN
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span>Penyimpanan Lokal Browser Aktif: <strong className="font-mono text-slate-800">sekolah_{activeNpsn}_*</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
