import React, { useState } from 'react';
import {
  School,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Trash2,
  KeyRound,
  Download,
  Upload,
  Search,
  Building2,
  Calendar,
  AlertTriangle,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah } from '../utils/terbilang';
import { SchoolWorkspaceMeta } from '../types';

interface WorkspaceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportModal: () => void;
}

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenImportModal,
}) => {
  const {
    workspaces,
    activeWorkspaceNpsn,
    switchWorkspace,
    createNewWorkspace,
    deleteWorkspace,
    setWorkspacePin,
    exportProjectFile,
    exportAllSchoolsBundle,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  
  // PIN Entry state for switching
  const [selectedForSwitch, setSelectedForSwitch] = useState<SchoolWorkspaceMeta | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Manage PIN state
  const [managingPinFor, setManagingPinFor] = useState<SchoolWorkspaceMeta | null>(null);
  const [newPinValue, setNewPinValue] = useState('');

  // Form state for creating new school
  const [formData, setFormData] = useState({
    npsn: '',
    namaSekolah: '',
    jenjang: 'SD' as 'SD' | 'SMP' | 'SMA' | 'SMK' | 'SLB' | 'Lainnya',
    paguAnggaran: 185000000,
    tahunAnggaran: '2026',
    kabupaten: 'Kabupaten Bogor',
    namaPimpinan: '',
    namaBendahara: '',
    pin: '',
    useDefaultTemplate: true,
  });
  const [createError, setCreateError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.namaSekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.npsn.includes(searchQuery) ||
      w.kabupaten?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (workspace: SchoolWorkspaceMeta) => {
    if (workspace.npsn === activeWorkspaceNpsn) {
      onClose();
      return;
    }

    if (workspace.hasPin) {
      setSelectedForSwitch(workspace);
      setPinInput('');
      setPinError(null);
    } else {
      const result = switchWorkspace(workspace.npsn);
      if (result.success) {
        onClose();
      }
    }
  };

  const handleConfirmPinSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForSwitch) return;

    const result = switchWorkspace(selectedForSwitch.npsn, pinInput);
    if (result.success) {
      setSelectedForSwitch(null);
      setPinInput('');
      onClose();
    } else {
      setPinError(result.message || 'PIN salah!');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!formData.npsn.trim() || !formData.namaSekolah.trim()) {
      setCreateError('NPSN dan Nama Sekolah wajib diisi.');
      return;
    }

    const res = createNewWorkspace({
      npsn: formData.npsn,
      namaSekolah: formData.namaSekolah,
      jenjang: formData.jenjang,
      paguAnggaran: Number(formData.paguAnggaran),
      tahunAnggaran: formData.tahunAnggaran,
      kabupaten: formData.kabupaten,
      pin: formData.pin,
      useDefaultTemplate: formData.useDefaultTemplate,
      namaPimpinan: formData.namaPimpinan,
      namaBendahara: formData.namaBendahara,
    });

    if (res.success) {
      // Reset form and switch
      setFormData({
        npsn: '',
        namaSekolah: '',
        jenjang: 'SD',
        paguAnggaran: 185000000,
        tahunAnggaran: '2026',
        kabupaten: 'Kabupaten Bogor',
        namaPimpinan: '',
        namaBendahara: '',
        pin: '',
        useDefaultTemplate: true,
      });
      setActiveTab('LIST');
      onClose();
    } else {
      setCreateError(res.message || 'Gagal membuat profil sekolah baru.');
    }
  };

  const handleDelete = (workspace: SchoolWorkspaceMeta) => {
    if (
      window.confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus profil sekolah '${workspace.namaSekolah}' (NPSN: ${workspace.npsn}) dari sistem ini? Seluruh data kas dan kwitansi sekolah ini akan dihapus dari penyimpanan browser.`
      )
    ) {
      const res = deleteWorkspace(workspace.npsn);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingPinFor) return;

    setWorkspacePin(managingPinFor.npsn, newPinValue.trim() ? newPinValue.trim() : null);
    setManagingPinFor(null);
    setNewPinValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Kelola Profil Sekolah & Multi-Workspace
              </h3>
              <p className="text-xs text-slate-500">
                Pindah sekolah aktif dengan NPSN & Kupon Sandi (Pilihan 1) atau Impor/Ekspor Berkas (Pilihan 2)
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

        {/* Tab Selector */}
        <div className="flex items-center justify-between mt-4 pb-2 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('LIST');
                setSelectedForSwitch(null);
                setManagingPinFor(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'LIST'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Sekolah Terdaftar ({workspaces.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('CREATE');
                setSelectedForSwitch(null);
                setManagingPinFor(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'CREATE'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Sekolah Baru</span>
            </button>
          </div>

          {/* Quick File Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onOpenImportModal();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Buka atau Unggah Berkas Proyek (.revita / .json)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Buka Berkas</span>
            </button>
            <button
              onClick={() => exportProjectFile('revita')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Simpan & Download Berkas Sekolah Aktif (.revita)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Unduh Berkas .revita</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* TAB 1: LIST WORKSPACES */}
          {activeTab === 'LIST' && !selectedForSwitch && !managingPinFor && (
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama sekolah, NPSN, atau kabupaten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              {/* Workspace cards */}
              <div className="space-y-2.5">
                {filteredWorkspaces.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Tidak ada profil sekolah yang sesuai dengan pencarian.
                  </div>
                ) : (
                  filteredWorkspaces.map((ws) => {
                    const isActive = ws.npsn === activeWorkspaceNpsn;
                    return (
                      <div
                        key={ws.npsn}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 text-slate-800 font-mono">
                                NPSN: {ws.npsn}
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-800">
                                {ws.jenjang}
                              </span>
                              {ws.hasPin && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-900 border border-amber-200">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>PIN Sandi Aktif</span>
                                </span>
                              )}
                              {isActive && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-700 text-white">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Sedang Aktif</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">
                              {ws.namaSekolah}
                            </h4>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span>Pagu: <strong className="text-slate-700 font-semibold">{formatRupiah(ws.paguAnggaran)}</strong></span>
                              <span>•</span>
                              <span>{ws.kabupaten || 'Bogor'} (TA {ws.tahunAnggaran})</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setManagingPinFor(ws);
                                setNewPinValue('');
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title={ws.hasPin ? 'Ubah / Hapus PIN Sandi' : 'Pasang Kunci PIN Sandi'}
                            >
                              <KeyRound className="w-4 h-4 text-slate-600" />
                            </button>

                            {workspaces.length > 1 && (
                              <button
                                onClick={() => handleDelete(ws)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus profil sekolah dari sistem"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleSelectWorkspace(ws)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                                isActive
                                  ? 'bg-emerald-700 text-white cursor-default'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Sekolah Aktif</span>
                                </>
                              ) : (
                                <>
                                  <span>Pilih Sekolah</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Bundle & Archive helper */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Data terisolasi rapi berdasarkan prefix NPSN masing-masing.</span>
                </div>
                <button
                  onClick={exportAllSchoolsBundle}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Cadangkan Semua Sekolah ({workspaces.length} Sekolah)</span>
                </button>
              </div>
            </div>
          )}

          {/* PIN PROMPT MODAL WHEN SWITCHING */}
          {selectedForSwitch && (
            <div className="p-5 border border-amber-200 bg-amber-50/50 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>Masukkan Kupon Sandi / PIN Sekolah: {selectedForSwitch.namaSekolah}</span>
              </div>
              <p className="text-xs text-slate-600">
                Profil sekolah ini (NPSN: <strong className="font-mono">{selectedForSwitch.npsn}</strong>) dilindungi dengan kunci akses PIN lokal. Silakan masukkan PIN 4–6 digit Anda.
              </p>

              <form onSubmit={handleConfirmPinSwitch} className="space-y-3">
                <div>
                  <input
                    type="password"
                    maxLength={10}
                    autoFocus
                    placeholder="Masukkan PIN sandi..."
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(null);
                    }}
                    className="w-full p-2.5 text-center tracking-widest text-lg font-mono font-bold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  {pinError && (
                    <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedForSwitch(null);
                      setPinInput('');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                  >
                    Buka & Masuk Profil Sekolah
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MANAGE PIN MODAL */}
          {managingPinFor && (
            <div className="p-5 border border-slate-200 bg-slate-50/70 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <KeyRound className="w-5 h-5 text-emerald-700" />
                <span>Pengaturan Kupon Sandi (PIN): {managingPinFor.namaSekolah}</span>
              </div>
              <p className="text-xs text-slate-600">
                Atur PIN 4–6 digit untuk membatasi akses pada profil sekolah ini. Kosongkan jika ingin menghapus proteksi PIN (bebas akses).
              </p>

              <form onSubmit={handleSavePin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kunci PIN Baru (Kosongkan untuk menghapus PIN)
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="Contoh: 1234"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    className="w-full p-2 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setManagingPinFor(null)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                  >
                    Simpan Pengaturan PIN
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CREATE NEW WORKSPACE */}
          {activeTab === 'CREATE' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {createError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Identitas Sekolah & Pagu Revitalisasi</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NPSN Sekolah (ID Unik) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 20201842"
                      value={formData.npsn}
                      onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                      className="w-full p-2 font-mono border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap Sekolah *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SDN 02 Babakan Madang"
                      value={formData.namaSekolah}
                      onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenjang</label>
                    <select
                      value={formData.jenjang}
                      onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="SD">SD (Sekolah Dasar)</option>
                      <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                      <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                      <option value="SMK">SMK (Kejuruan)</option>
                      <option value="SLB">SLB</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Total Pagu Anggaran (Rp) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000000"
                      required
                      value={formData.paguAnggaran}
                      onChange={(e) => setFormData({ ...formData, paguAnggaran: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tahun Anggaran</label>
                    <input
                      type="text"
                      value={formData.tahunAnggaran}
                      onChange={(e) => setFormData({ ...formData, tahunAnggaran: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pejabat & Proteksi */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span>Pejabat & Kupon Sandi (PIN Opsional)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nama Kepala Sekolah / Pimpinan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd."
                      value={formData.namaPimpinan}
                      onChange={(e) => setFormData({ ...formData, namaPimpinan: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nama Bendahara P2SP
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad Fauzi, S.Pd."
                      value={formData.namaBendahara}
                      onChange={(e) => setFormData({ ...formData, namaBendahara: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kupon Sandi / PIN 4-6 Digit (Opsional)
                    </label>
                    <input
                      type="password"
                      maxLength={10}
                      placeholder="Biarkan kosong jika tanpa PIN"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      className="w-full p-2 font-mono border border-slate-300 rounded-lg bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Jika diisi, user harus memasukkan PIN ini untuk membuka profil sekolah ini.
                    </span>
                  </div>

                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.useDefaultTemplate}
                        onChange={(e) =>
                          setFormData({ ...formData, useDefaultTemplate: e.target.checked })
                        }
                        className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Sertakan template standar RAB & Kwitansi contoh awal
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan & Buka Profil Sekolah</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
