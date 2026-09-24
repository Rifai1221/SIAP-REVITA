import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Building,
  UserCheck,
  Landmark,
  Save,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ProjectInfo } from '../types';
import { formatRupiah, terbilangRupiah } from '../utils/terbilang';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    projectInfo,
    updateProjectInfo,
    resetToDefaultData,
    resetToCleanData,
    loadDemoSimulationData,
    cloudSyncStatus,
    exportProjectFile,
    transactions,
    kwitansiList,
    payrollHarian,
    payrollBorongan,
    dailyLogs,
    weeklyRecaps,
    wbsList,
    rabMaster,
    standardWages,
    standardMaterials,
  } = useProject();

  const [formData, setFormData] = useState<ProjectInfo>({ ...projectInfo });

  React.useEffect(() => {
    setFormData({ ...projectInfo });
  }, [projectInfo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectInfo(formData);
    alert('Pengaturan identitas proyek revitalisasi berhasil disimpan!');
    onClose();
  };

  const handleExportData = () => {
    const fullBackup = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      projectInfo: formData,
      transactions,
      kwitansiList,
      payrollHarian,
      payrollBorongan,
      dailyLogs,
      weeklyRecaps,
      wbsList,
      rabMaster,
      standardWages,
      standardMaterials,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-revitalisasi-${formData.desa.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Identitas Proyek & Pejabat Penandatangan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Informasi Dasar Proyek */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-600" />
              <span>Identitas Kegiatan & Pagu Anggaran</span>
            </h4>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Proyek / Pekerjaan</label>
              <input
                type="text"
                required
                value={formData.namaProyek}
                onChange={(e) => setFormData({ ...formData, namaProyek: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Instansi / Lembaga</label>
                <input
                  type="text"
                  required
                  value={formData.namaInstansi}
                  onChange={(e) => setFormData({ ...formData, namaInstansi: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Total Pagu Penerimaan / Anggaran (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  required
                  value={formData.totalPaguAnggaran}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPaguAnggaran: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-emerald-900"
                />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-700 font-mono">
                    {formatRupiah(formData.totalPaguAnggaran)}
                  </span>
                  <span className="text-slate-400 italic truncate max-w-[280px]">
                    {formData.totalPaguAnggaran > 0 ? `#${terbilangRupiah(formData.totalPaguAnggaran)}#` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Desa / Kelurahan</label>
                <input
                  type="text"
                  value={formData.desa}
                  onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kabupaten</label>
                <input
                  type="text"
                  value={formData.kabupaten}
                  onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Penandatangan LPJ */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Pejabat & Penanggung Jawab Administrasi LPJ</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kepala Desa / Pimpinan Lembaga
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPimpinan}
                  onChange={(e) => setFormData({ ...formData, namaPimpinan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ketua TPK</label>
                <input
                  type="text"
                  required
                  value={formData.namaKetuaTPK}
                  onChange={(e) => setFormData({ ...formData, namaKetuaTPK: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Bendahara Pengeluaran TPK
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaBendahara}
                  onChange={(e) => setFormData({ ...formData, namaBendahara: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pelaksana Teknis Lapangan
                </label>
                <input
                  type="text"
                  value={formData.namaPelaksanaTeknis}
                  onChange={(e) => setFormData({ ...formData, namaPelaksanaTeknis: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Rekening Bank */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-slate-600" />
              <span>Rekening Bank Operasional Program</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={formData.namaBank}
                  onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.nomorRekeningBank}
                  onChange={(e) => setFormData({ ...formData, nomorRekeningBank: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Backup & Reset */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-800 block">Cadangkan Data Proyek Mandiri</span>
              <span className="text-[11px] text-slate-500">
                Download seluruh catatan BKU, kwitansi, SPJ upah, RAB, dan progres ke file portabel .revita atau .json
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => exportProjectFile('revita')}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .revita</span>
              </button>
              <button
                type="button"
                onClick={() => exportProjectFile('json')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Kosongkan semua data transaksi, kwitansi, dan payroll untuk sekolah ini? Data keuangan akan dibersihkan mulai dari nol (Rp 0).'
                    )
                  ) {
                    resetToCleanData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1"
                title="Hapus semua transaksi dan mulai dari Rp 0 bersih"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Transaksi (Nol)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'Muat data simulasi contoh (13 transaksi, 5 kwitansi, payroll)? Gunakan ini HANYA jika ingin mencoba simulasi aplikasi.'
                    )
                  ) {
                    loadDemoSimulationData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-1"
                title="Muat data contoh transaksi hanya untuk simulasi uji coba"
              >
                <span>🧪 Muat Contoh Simulasi</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
