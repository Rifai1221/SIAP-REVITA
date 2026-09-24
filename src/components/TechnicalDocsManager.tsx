import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Layers,
  Sparkles,
  BookOpen,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowRight,
  Info,
  Building,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { RABMasterItem, RABMaterialComponent } from '../types';
import { formatRupiah } from '../utils/terbilang';
import {
  generateRABTemplateExcel,
  generateAHSPTemplateExcel,
  generateHargaBahanUpahTemplateExcel,
  generateLaporanMingguanTemplateExcel,
  parseWeeklyProgressFile,
  parseRABFile,
  parseAHSPFile,
} from '../utils/excelTemplateEngine';

interface TechnicalDocsManagerProps {
  onNavigateToProgressSync?: () => void;
}

export const TechnicalDocsManager: React.FC<TechnicalDocsManagerProps> = ({
  onNavigateToProgressSync,
}) => {
  const {
    rabMaster,
    updateRABMaster,
    projectInfo,
    updateProjectInfo,
    standardWages,
    standardMaterials,
    addStandardWage,
    updateStandardWage,
    deleteStandardWage,
    addStandardMaterial,
    updateStandardMaterial,
    deleteStandardMaterial,
  } = useProject();

  const [activeSubTab, setActiveSubTab] = useState<'RAB' | 'AHSP' | 'PRICES' | 'UPLOAD_WEEKLY'>('RAB');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRABItem, setSelectedRABItem] = useState<RABMasterItem | null>(rabMaster[0] || null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);

  // State untuk form tambah manual Upah Tenaga Kerja
  const [isAddingWage, setIsAddingWage] = useState(false);
  const [wageForm, setWageForm] = useState({
    role: '',
    harga: '',
    desc: '',
    satuan: 'HOK',
  });

  // State untuk form tambah manual Bahan & Material Konstruksi
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    nama: '',
    satuan: '',
    harga: '',
    kategori: 'STRUKTUR',
    spesifikasi: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rabFileInputRef = useRef<HTMLInputElement>(null);
  const ahspFileInputRef = useRef<HTMLInputElement>(null);

  // Filter list
  const filteredRAB = rabMaster.filter(
    (item) =>
      item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaPekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kategori && item.kategori.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Total Pagu RAB Master
  const totalBiayaRAB = rabMaster.reduce((acc, curr) => acc + curr.biayaRAB, 0);

  // Handler Upload Berkas RAB (.xlsx / .csv)
  const handleUploadRABFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseRABFile(file);
      if (result.items.length === 0) {
        setUploadStatus({
          success: false,
          message: 'Gagal mengekstrak item RAB. Pastikan file memiliki kolom Uraian Pekerjaan, Volume, dan Harga.',
        });
        return;
      }

      // Gabungkan atau replace item pekerjaan RAB
      updateRABMaster(result.items);
      setSelectedRABItem(result.items[0]);
      setUploadStatus({
        success: true,
        message: result.message || `Berhasil mengunggah ${result.items.length} item RAB!`,
      });
      if (rabFileInputRef.current) rabFileInputRef.current.value = '';
    } catch (err: any) {
      setUploadStatus({
        success: false,
        message: `Gagal membaca file RAB: ${err?.message || 'Format tidak sesuai template'}`,
      });
    }
  };

  // Handler Upload Berkas AHSP Koefisien (.xlsx / .csv)
  const handleUploadAHSPFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseAHSPFile(file);
      if (result.rows.length === 0) {
        setUploadStatus({
          success: false,
          message: 'Tidak ada baris koefisien yang terbaca. Pastikan format kolom sesuai Template AHSP.',
        });
        return;
      }

      // Petakan koefisien bahan ke rabMaster berdasarkan kodeAnalisa
      const updated = rabMaster.map((rab) => {
        const matchingAHSP = result.rows.filter(
          (r) =>
            r.kodeAnalisa.toLowerCase() === rab.kode.toLowerCase() ||
            rab.namaPekerjaan.toLowerCase().includes(r.kodeAnalisa.toLowerCase())
        );

        if (matchingAHSP.length > 0) {
          const newBOM: RABMaterialComponent[] = matchingAHSP
            .filter((m) => m.tipe === 'BAHAN')
            .map((m, idx) => ({
              id: `mat-ahsp-${rab.id}-${idx}`,
              namaMaterial: m.uraianKomponen,
              satuan: m.satuan,
              koefisienPerSatuanPekerjaan: m.koefisien,
              hargaSatuan: m.hargaDasar,
              tokoDefault: 'TB. Sumber Rejeki Jaya',
              kategoriBahan: 'STRUKTUR',
              preferensiHariBeli: 'AWAL_MINGGU',
            }));

          return {
            ...rab,
            materialComponents: newBOM.length > 0 ? newBOM : rab.materialComponents,
          };
        }
        return rab;
      });

      updateRABMaster(updated);
      setUploadStatus({
        success: true,
        message: `Berhasil mengunggah ${result.rows.length} koefisien AHSP ke dalam master pekerjaan!`,
      });
      if (ahspFileInputRef.current) ahspFileInputRef.current.value = '';
    } catch (err: any) {
      setUploadStatus({
        success: false,
        message: `Gagal membaca file AHSP: ${err?.message || 'Format tidak sesuai'}`,
      });
    }
  };

  // Handler Upload Laporan Mingguan File (Excel/CSV)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseWeeklyProgressFile(file);
      if (parsed.rows.length === 0) {
        setUploadStatus({
          success: false,
          message: 'File berhasil dibaca, namun tidak ditemukan nilai pada kolom Volume Minggu Ini atau Bobot Minggu Ini (> 0).',
        });
        return;
      }

      // Update rabMaster progresRealisasi based on parsed rows
      let updatedCount = 0;
      const updated = rabMaster.map((rab) => {
        const matched = parsed.rows.find(
          (r) =>
            (r.kode && r.kode === rab.kode) ||
            r.namaPekerjaan.toLowerCase().includes(rab.namaPekerjaan.toLowerCase()) ||
            rab.namaPekerjaan.toLowerCase().includes(r.namaPekerjaan.toLowerCase())
        );

        if (matched) {
          updatedCount++;
          // Hitung progres baru
          const tambahProg =
            matched.bobotMingguIniPersen > 0
              ? matched.bobotMingguIniPersen
              : rab.volumeRAB > 0
              ? (matched.volumeMingguIni / rab.volumeRAB) * 100
              : 0;

          const newProg = Math.min(100, Math.round((rab.progresRealisasi + tambahProg) * 10) / 10);
          return {
            ...rab,
            progresRealisasi: newProg,
          };
        }
        return rab;
      });

      updateRABMaster(updated);
      setUploadStatus({
        success: true,
        message: `Berhasil memproses ${parsed.rows.length} capaian item pekerjaan dari file. ${updatedCount} item RAB terkoneksi secara langsung!`,
      });

      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadStatus({
        success: false,
        message: `Gagal membaca file Excel/CSV: ${err?.message || 'Format tidak sesuai template'}`,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Pusat Berkas Teknis & Acuan Integrasi Proyek</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bank Dokumen RAB, AHSP SNI & Laporan Mingguan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Kelola dokumen acuan rehabilitasi sekolah. Data RAB dan analisa koefisien ini terhubung langsung dengan Buku Kas Umum (BKU), modul Laporan Mingguan, serta otomatis dipecah menjadi kwitansi harian tanpa biaya langganan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => generateRABTemplateExcel()}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-300 transition-colors"
              title="Unduh format tabel RAB Induk"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Template RAB (.xlsx)</span>
            </button>
            <button
              onClick={() => generateLaporanMingguanTemplateExcel(rabMaster)}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              title="Unduh format pengisian progres mingguan"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template Laporan Mingguan</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('RAB')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'RAB'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. RAB Induk Kegiatan ({rabMaster.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('AHSP')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'AHSP'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Analisa Koefisien AHSP (SNI)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('PRICES')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'PRICES'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>3. Standar Harga Upah & Bahan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('UPLOAD_WEEKLY')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'UPLOAD_WEEKLY'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>4. Upload File Progres Mingguan</span>
          </button>
        </div>
      </div>

      {/* Global Upload Status Notification */}
      {uploadStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            uploadStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {uploadStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <strong>{uploadStatus.success ? 'Upload Berhasil!' : 'Perhatian:'}</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed">{uploadStatus.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadStatus(null)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
          >
            ×
          </button>
        </div>
      )}

      {/* SUBTAB 1: RAB INDUK */}
      {activeSubTab === 'RAB' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode atau nama pekerjaan (contoh: 04.00, hebel, beton)..."
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg w-full sm:w-80"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <input
                type="file"
                ref={rabFileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleUploadRABFile}
                className="hidden"
                id="upload-rab-file"
              />
              <button
                type="button"
                onClick={() => generateRABTemplateExcel()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template RAB</span>
              </button>
              <label
                htmlFor="upload-rab-file"
                className="cursor-pointer px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Berkas RAB (.xlsx)</span>
              </label>

              <div className="pl-3 border-l border-slate-200 text-right flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Pagu RAB</span>
                  <strong className="text-xs sm:text-sm font-mono text-emerald-800 font-black">
                    {formatRupiah(totalBiayaRAB)}
                  </strong>
                </div>
                {totalBiayaRAB !== projectInfo.totalPaguAnggaran && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Sinkronkan Total Pagu Penerimaan Anggaran menjadi ${formatRupiah(totalBiayaRAB)} (sesuai total RAB)?`)) {
                        updateProjectInfo({ totalPaguAnggaran: totalBiayaRAB });
                      }
                    }}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded text-[10px] font-bold"
                    title="Jadikan Total RAB ini sebagai Pagu Anggaran Utama"
                  >
                    Set sbg Pagu
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3 w-16">Kode</th>
                    <th className="py-3 px-3">Divisi & Uraian Item Pekerjaan</th>
                    <th className="py-3 px-3 text-center">Volume Pagu</th>
                    <th className="py-3 px-3 text-right">Harga Satuan</th>
                    <th className="py-3 px-3 text-right">Jumlah Biaya RAB</th>
                    <th className="py-3 px-3 text-center">Bobot</th>
                    <th className="py-3 px-3 text-center">Realisasi (%)</th>
                    <th className="py-3 px-3 text-center">BOM Bahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRAB.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                        {item.kode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.namaPekerjaan}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Divisi: {item.kategori}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {item.volumeRAB} {item.satuan}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {formatRupiah(Math.round(item.biayaRAB / (item.volumeRAB || 1)))}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(item.biayaRAB)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                        {item.bobotRencana}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                          {item.progresRealisasi}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedRABItem(item);
                            setActiveSubTab('AHSP');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded text-[11px] font-medium border border-slate-200"
                        >
                          {item.materialComponents.length} Komponen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ANALISA SATUAN PEKERJAAN (AHSP / KOEFISIEN) */}
      {activeSubTab === 'AHSP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Pilihan Item Pekerjaan (4 Kolom) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daftar Analisa AHSP
              </h3>
              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  ref={ahspFileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleUploadAHSPFile}
                  className="hidden"
                  id="upload-ahsp-file"
                />
                <button
                  type="button"
                  onClick={() => generateAHSPTemplateExcel()}
                  className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded flex items-center gap-1 border border-slate-200"
                >
                  <Download className="w-3 h-3" />
                  <span>Template</span>
                </button>
                <label
                  htmlFor="upload-ahsp-file"
                  className="cursor-pointer text-[11px] text-white bg-emerald-700 hover:bg-emerald-800 px-2 py-1 rounded font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload AHSP</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {rabMaster.map((item) => {
                const isSelected = selectedRABItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedRABItem(item)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 font-bold text-emerald-900 shadow-2xs'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono text-[10px] text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.kode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.materialComponents.length} bahan
                      </span>
                    </div>
                    <div className="truncate">{item.namaPekerjaan}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Rincian Koefisien Bahan & Upah (8 Kolom) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {selectedRABItem ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      KODE: {selectedRABItem.kode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {selectedRABItem.namaPekerjaan}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Basis Analisa Satuan: per 1.00 {selectedRABItem.satuan} pekerjaan
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Pagu Total Pekerjaan</span>
                    <strong className="text-sm font-mono text-emerald-800">
                      {formatRupiah(selectedRABItem.biayaRAB)}
                    </strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Koefisien Kebutuhan Material & Toko Rekanan:
                  </h4>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="py-2 px-3">Nama Material & Spek</th>
                          <th className="py-2 px-3 text-center">Koefisien / {selectedRABItem.satuan}</th>
                          <th className="py-2 px-3 text-right">Harga Satuan</th>
                          <th className="py-2 px-3">Toko Rekanan</th>
                          <th className="py-2 px-3 text-center">Jadwal Belanja</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedRABItem.materialComponents.map((mat) => (
                          <tr key={mat.id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {mat.namaMaterial}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                              {mat.koefisienPerSatuanPekerjaan} {mat.satuan}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">
                              {formatRupiah(mat.hargaSatuan)}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {mat.tokoDefault || 'TB. Sumber Rejeki Jaya'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {mat.preferensiHariBeli.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Integrasi Otomatis:</strong> Saat Anda menginput progres fisik pada pekerjaan ini, sistem secara otomatis mengalikan koefisien di atas dengan volume mingguan yang dicapai, lalu membagikannya ke kwitansi harian tanpa perlu perhitungan manual berulang.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">Pilih salah satu analisa pekerjaan di sebelah kiri.</div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: STANDAR HARGA UPAH & BAHAN */}
      {activeSubTab === 'PRICES' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Standar Harga Dasar Satuan Bahan & Upah Tenaga Kerja
              </h3>
              <p className="text-xs text-slate-500">
                Referensi harga satuan material dan upah kerja standar Kabupaten Bogor / UMK yang menjadi acuan pengisian RAB dan SPJ
              </p>
            </div>
            <button
              onClick={() => generateHargaBahanUpahTemplateExcel()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-300 w-fit"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Daftar Harga (.xlsx)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Box Upah Tenaga Kerja */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>Standar Upah Tenaga Kerja ({standardWages.length} Profesi)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingWage(!isAddingWage)}
                    className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingWage ? 'Tutup Form' : 'Tambah Upah'}</span>
                  </button>
                </div>

                {/* Form Tambah Manual Upah */}
                {isAddingWage && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!wageForm.role.trim() || !wageForm.harga) {
                        alert('Silakan lengkapi nama profesi/jabatan dan nominal upah.');
                        return;
                      }
                      addStandardWage({
                        role: wageForm.role.trim(),
                        harga: parseFloat(wageForm.harga) || 0,
                        desc: wageForm.desc.trim() || 'Tenaga kerja lapangan',
                        satuan: wageForm.satuan || 'HOK',
                      });
                      setWageForm({ role: '', harga: '', desc: '', satuan: 'HOK' });
                      setIsAddingWage(false);
                    }}
                    className="mb-3 p-3 bg-white border border-blue-200 rounded-xl space-y-2.5 shadow-2xs"
                  >
                    <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1 text-blue-800">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Input Standar Upah Tenaga Kerja Baru</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Nama Profesi / Tenaga
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Operator Alat / Genset"
                          value={wageForm.role}
                          onChange={(e) => setWageForm({ ...wageForm, role: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Upah Harian / HOK (Rp)
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="contoh: 220000"
                          value={wageForm.harga}
                          onChange={(e) => setWageForm({ ...wageForm, harga: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Keterangan / Tugas
                        </label>
                        <input
                          type="text"
                          placeholder="contoh: Tenaga instalasi khusus"
                          value={wageForm.desc}
                          onChange={(e) => setWageForm({ ...wageForm, desc: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Satuan Hitung
                        </label>
                        <input
                          type="text"
                          value={wageForm.satuan}
                          onChange={(e) => setWageForm({ ...wageForm, satuan: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-center"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingWage(false)}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] bg-blue-700 hover:bg-blue-800 text-white font-bold rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>Simpan Tarif Upah</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {standardWages.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition-colors group"
                    >
                      <div className="pr-2">
                        <strong className="text-slate-800 block text-xs">{u.role}</strong>
                        <span className="text-[11px] text-slate-400 block">{u.desc || 'Tenaga kerja lapangan'}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {formatRupiah(u.harga)} / {u.satuan || 'HOK'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus tarif upah untuk "${u.role}"?`)) {
                              deleteStandardWage(u.id);
                            }
                          }}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Hapus tarif upah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200/60 mt-2">
                * Menjadi acuan otomatis saat mengisi Daftar Hadir & Upah Tukang Harian (Payroll).
              </div>
            </div>

            {/* Box Bahan Pokok & Material Konstruksi */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Bahan Pokok & Material ({standardMaterials.length} Jenis)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingMaterial ? 'Tutup Form' : 'Tambah Bahan'}</span>
                  </button>
                </div>

                {/* Form Tambah Manual Bahan */}
                {isAddingMaterial && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!materialForm.nama.trim() || !materialForm.satuan.trim() || !materialForm.harga) {
                        alert('Silakan lengkapi nama material, satuan, dan harga satuan.');
                        return;
                      }
                      addStandardMaterial({
                        nama: materialForm.nama.trim(),
                        satuan: materialForm.satuan.trim(),
                        harga: parseFloat(materialForm.harga) || 0,
                        kategori: materialForm.kategori || 'STRUKTUR',
                        spesifikasi: materialForm.spesifikasi.trim() || 'Standar SNI',
                      });
                      setMaterialForm({
                        nama: '',
                        satuan: '',
                        harga: '',
                        kategori: 'STRUKTUR',
                        spesifikasi: '',
                      });
                      setIsAddingMaterial(false);
                    }}
                    className="mb-3 p-3 bg-white border border-emerald-200 rounded-xl space-y-2.5 shadow-2xs"
                  >
                    <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1 text-emerald-800">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Input Material / Bahan Konstruksi Baru</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Nama Material & Merk
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="contoh: Pipa PVC Wavin 3 inch D"
                        value={materialForm.nama}
                        onChange={(e) => setMaterialForm({ ...materialForm, nama: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Satuan
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="btg / sak / m3"
                          value={materialForm.satuan}
                          onChange={(e) => setMaterialForm({ ...materialForm, satuan: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Harga Satuan (Rp)
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="85000"
                          value={materialForm.harga}
                          onChange={(e) => setMaterialForm({ ...materialForm, harga: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Kategori
                        </label>
                        <select
                          value={materialForm.kategori}
                          onChange={(e) => setMaterialForm({ ...materialForm, kategori: e.target.value })}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                        >
                          <option value="STRUKTUR">STRUKTUR</option>
                          <option value="DINDING">DINDING</option>
                          <option value="AGREGAT">AGREGAT</option>
                          <option value="ATAP">ATAP</option>
                          <option value="LANTAI">LANTAI</option>
                          <option value="FINISHING">FINISHING</option>
                          <option value="MEKANIKAL">MEKANIKAL</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Spesifikasi / Standar Teknis
                      </label>
                      <input
                        type="text"
                        placeholder="contoh: Standar SNI Kelas AW"
                        value={materialForm.spesifikasi}
                        onChange={(e) => setMaterialForm({ ...materialForm, spesifikasi: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingMaterial(false)}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>Simpan Material</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {standardMaterials.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition-colors group"
                    >
                      <div className="pr-2">
                        <strong className="text-slate-800 block text-xs">{b.nama}</strong>
                        <span className="text-[11px] text-slate-400 block">
                          Satuan: 1 {b.satuan} {b.spesifikasi ? `• ${b.spesifikasi}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                          {formatRupiah(b.harga)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus material "${b.nama}"?`)) {
                              deleteStandardMaterial(b.id);
                            }
                          }}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Hapus harga material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200/60 mt-2">
                * Menjadi acuan otomatis saat memecah RAB & Progres Mingguan menjadi Kwitansi Pembelian Harian.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: UPLOAD FILE LAPORAN MINGGUAN DENGAN TEMPLATE */}
      {activeSubTab === 'UPLOAD_WEEKLY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Box Kiri: Upload Form & Panduan (6 Kolom) */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Unggah File Laporan & Progres Mingguan</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Anda dapat mengunggah berkas Excel (.xlsx) atau CSV yang berisi realisasi fisik mingguan. Sistem akan secara otomatis memetakan volume capaian ke setiap kode analisa RAB Anda.
            </p>

            {/* Tombol Unduh Template */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Belum punya template berkas?</span>
                <span className="text-[11px] text-slate-500">Unduh format yang sudah sinkron dengan {rabMaster.length} item RAB</span>
              </div>
              <button
                type="button"
                onClick={() => generateLaporanMingguanTemplateExcel(rabMaster)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format Excel</span>
              </button>
            </div>

            {/* Area Drag and Drop / Pilih File */}
            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 mb-1">
                Pilih atau Tarik Berkas Laporan Mingguan ke Sini
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Format file yang didukung: <strong>.xlsx, .xls, .csv</strong> (Maksimal 10 MB)
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="weekly-progress-file-input"
              />

              <label
                htmlFor="weekly-progress-file-input"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Berkas Dari Komputer</span>
              </label>
            </div>

            {/* Status Notifikasi Upload */}
            {uploadStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  uploadStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {uploadStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong>{uploadStatus.success ? 'Upload Sukses!' : 'Perhatian:'}</strong>
                  <p className="mt-0.5 text-[11px]">{uploadStatus.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Box Kanan: Integrasi Lanjutan & Rantai Eksekusi (6 Kolom) */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Alur Rantai Integrasi Setelah File Terunggah</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center">1</span>
                  <span>Data Realisasi Fisik Terupdate Otomatis</span>
                </span>
                <p className="text-slate-500 text-[11px] pl-5.5">
                  Nilai volume dan persentase (%) pada tabel RAB Induk dan kurva capaian fisik langsung diperbarui tanpa perlu mengetik ulang satu per satu.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center">2</span>
                  <span>Buka Menu RAB & Kwitansi Harian</span>
                </span>
                <p className="text-slate-500 text-[11px] pl-5.5">
                  Sistem langsung mengarahkan volume progres tersebut untuk dihitung kebutuhan semen, pasir, bata, dan baja ringannya via engine pemecah belanja harian (Senin–Sabtu).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center">3</span>
                  <span>Otomatis Masuk Buku Kas Umum (BKU) & LPJ</span>
                </span>
                <p className="text-slate-500 text-[11px] pl-5.5">
                  Kwitansi yang diterbitkan dari capaian progres mingguan langsung tercatat rapi di kas tunai/bank BKU dan diarsipkan pada format LPJ resmi.
                </p>
              </div>
            </div>

            {onNavigateToProgressSync && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateToProgressSync}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Buka Generator Kwitansi Harian dari Progres Ini</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
