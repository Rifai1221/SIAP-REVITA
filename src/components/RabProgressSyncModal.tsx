import React, { useState, useRef } from 'react';
import {
  Calculator,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Building,
  Store,
  Clock,
  Printer,
  ChevronRight,
  Info,
  RefreshCw,
  Upload,
  Download,
  Users,
  HardHat,
  Briefcase,
  FileText,
  DollarSign,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { GeneratedDailyPurchasePlan, RABMasterItem } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';
import {
  generateDailyPurchasesFromWeeklyProgress,
  WeeklyProgressSubmission,
} from '../utils/dailyDistributorEngine';
import {
  generateOfficialWeeklyRecapTemplateExcel,
  parseEnhancedWeeklyProgressFile,
  OFFICIAL_REKAP_MINGGUAN_DATA,
} from '../utils/weeklyRecapTemplateEngine';
import {
  calculateWeeklyWagesFromProgress,
  WeeklyWagesCalculationResult,
  WeeklyWageItem,
} from '../utils/weeklyWagesEngine';
import { KwitansiUpahMingguanModal } from './KwitansiUpahMingguanModal';

interface RabProgressSyncModalProps {
  onNavigateToReceipts?: () => void;
  onNavigateToBKU?: () => void;
  onNavigateToPayroll?: () => void;
}

export const RabProgressSyncModal: React.FC<RabProgressSyncModalProps> = ({
  onNavigateToReceipts,
  onNavigateToBKU,
  onNavigateToPayroll,
}) => {
  const {
    rabMaster,
    updateRABMaster,
    kwitansiList,
    addBatchKwitansiAndWeeklyWages,
    projectInfo,
    standardWages,
  } = useProject();

  // Mode: Input / Otomasi vs Katalog Koefisien
  const [activeMode, setActiveMode] = useState<'AUTO_GENERATE' | 'VIEW_RAB'>('AUTO_GENERATE');

  // Result Active Tab: Belanja Bahan Harian vs Upah Mingguan
  const [activeResultTab, setActiveResultTab] = useState<'BARANG_HARIAN' | 'UPAH_MINGGUAN'>('BARANG_HARIAN');

  // Input Parameter Mingguan
  const [mingguKe, setMingguKe] = useState<number>(5);
  const [tanggalMulai, setTanggalMulai] = useState<string>('2026-03-23'); // Senin
  const [tanggalSelesai, setTanggalSelesai] = useState<string>('2026-03-28'); // Sabtu
  const [namaTokoDefault, setNamaTokoDefault] = useState<string>('TB. Sumber Rejeki Jaya');
  const [modeDistribusi, setModeDistribusi] = useState<
    'SMART_STAGING' | 'HARI_TERTENTU' | 'RATA_BERTAHAP'
  >('SMART_STAGING');

  const [hariAktif, setHariAktif] = useState<
    ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[]
  >(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);

  // Bobot Manajemen (Perencana, Pengawas, Administrasi)
  const [bobotPerencana, setBobotPerencana] = useState<number>(0.18);
  const [bobotPengawas, setBobotPengawas] = useState<number>(0.22);
  const [bobotAdministrasi, setBobotAdministrasi] = useState<number>(0.24);

  // Progres Fisik per Item Pekerjaan
  const [itemsProgress, setItemsProgress] = useState<{
    [wbsId: string]: { persentaseTambah: number; volumeTambah: number };
  }>(() => {
    const init: { [wbsId: string]: { persentaseTambah: number; volumeTambah: number } } = {};
    rabMaster.forEach((r) => {
      if (r.kode === '04.00') {
        init[r.id] = { persentaseTambah: 8.0, volumeTambah: 22.4 };
      } else if (r.kode === '05.00') {
        init[r.id] = { persentaseTambah: 6.0, volumeTambah: 11.1 };
      } else {
        init[r.id] = { persentaseTambah: 0, volumeTambah: 0 };
      }
    });
    return init;
  });

  // Generated Result State
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedDailyPurchasePlan[] | null>(null);
  const [weeklyWagesPlan, setWeeklyWagesPlan] = useState<WeeklyWagesCalculationResult | null>(null);
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<GeneratedDailyPurchasePlan | null>(null);
  const [isSuccessfullySaved, setIsSuccessfullySaved] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State untuk Pratinjau Kwitansi Upah Mingguan
  const [selectedWageModalItem, setSelectedWageModalItem] = useState<WeeklyWageItem | null>(null);
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);

  // Toggle Hari Belanja
  const toggleHari = (hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu') => {
    if (hariAktif.includes(hari)) {
      if (hariAktif.length === 1) {
        alert('Minimal harus ada 1 hari belanja aktif.');
        return;
      }
      setHariAktif(hariAktif.filter((h) => h !== hari));
    } else {
      setHariAktif([...hariAktif, hari]);
    }
  };

  // Fungsi Inti: Eksekusi Perhitungan Kwitansi Bahan Harian & Upah Mingguan
  const executeCalculation = (
    currentProgress: { [wbsId: string]: { persentaseTambah: number; volumeTambah: number } },
    mKe: number,
    tMulai: string,
    tSelesai: string,
    bPerencana: number,
    bPengawas: number,
    bAdmin: number,
    tokoNama?: string
  ) => {
    const submission: WeeklyProgressSubmission = {
      mingguKe: mKe,
      tanggalMulai: tMulai,
      tanggalSelesai: tSelesai,
      modeDistribusi,
      hariAktifBelanja: hariAktif,
      namaTokoDefault: tokoNama || namaTokoDefault,
      items: Object.entries(currentProgress).map(([wbsId, val]) => ({
        wbsId,
        persentaseTambah: Number(val.persentaseTambah) || 0,
        volumeTambah: Number(val.volumeTambah) || 0,
      })),
    };

    // 1. Pecah Bahan Belanja Jadi Kwitansi Harian (Senin - Sabtu)
    const plans = generateDailyPurchasesFromWeeklyProgress(
      submission,
      rabMaster,
      kwitansiList.length
    );

    // Hitung total bobot fisik minggu ini dari itemsProgress
    let totalBobotFisik = 0;
    Object.entries(currentProgress).forEach(([wbsId, p]) => {
      const rab = rabMaster.find((r) => r.id === wbsId);
      if (rab && p.persentaseTambah > 0) {
        // Bobot item ini terhadap total proyek
        const bobotRelatif = (p.persentaseTambah / 100) * (rab.bobotRencana || 0);
        totalBobotFisik += bobotRelatif;
      }
    });

    if (totalBobotFisik === 0) {
      // Fallback jika bobot rencana kecil: gunakan rata-rata persentase input
      const itemsWithProg = Object.values(currentProgress).filter((p) => p.persentaseTambah > 0);
      if (itemsWithProg.length > 0) {
        totalBobotFisik = itemsWithProg.reduce((sum, p) => sum + p.persentaseTambah, 0);
      }
    }

    // 2. Hitung Upah Mingguan Sesuai Bobot (Tukang, Perencana, Pengawas, Administrasi)
    const totalPagu = projectInfo.totalPaguAnggaran || 185000000;
    const wagesResult = calculateWeeklyWagesFromProgress({
      mingguKe: mKe,
      tanggalMulai: tMulai,
      tanggalSelesai: tSelesai,
      totalPaguAnggaran: totalPagu,
      bobotFisikMingguIni: totalBobotFisik,
      bobotPerencanaMingguIni: bPerencana,
      bobotPengawasMingguIni: bPengawas,
      bobotAdministrasiMingguIni: bAdmin,
      projectInfo,
      standardWages,
    });

    setGeneratedPlans(plans);
    if (plans.length > 0) {
      setSelectedPlanPreview(plans[0]);
    }
    setWeeklyWagesPlan(wagesResult);
    setIsSuccessfullySaved(false);
  };

  // Upload Langsung Berkas Template Laporan Mingguan (.xlsx / .csv)
  const processUploadedFile = async (file: File) => {
    try {
      const parsed = await parseEnhancedWeeklyProgressFile(file, rabMaster);

      if (parsed.rows.length === 0 && (!parsed.rekapDivisi || parsed.rekapDivisi.length === 0)) {
        alert('File terbaca, namun tidak ditemukan kolom capaian bobot minggu ini (> 0).');
        return;
      }

      const updatedProgress = { ...itemsProgress };
      let matchCount = 0;

      parsed.rows.forEach((row) => {
        const rab = rabMaster.find(
          (r) =>
            (row.kode && r.kode === row.kode) ||
            r.namaPekerjaan.toLowerCase().includes(row.namaPekerjaan.toLowerCase()) ||
            row.namaPekerjaan.toLowerCase().includes(r.namaPekerjaan.toLowerCase())
        );

        if (rab) {
          matchCount++;
          const pct =
            row.bobotMingguIniPersen > 0
              ? row.bobotMingguIniPersen
              : rab.volumeRAB > 0
              ? Math.round((row.volumeMingguIni / rab.volumeRAB) * 1000) / 10
              : 0;

          const vol =
            row.volumeMingguIni > 0
              ? row.volumeMingguIni
              : Math.round((pct / 100) * rab.volumeRAB * 10) / 10;

          updatedProgress[rab.id] = {
            persentaseTambah: pct,
            volumeTambah: vol,
          };
        }
      });

      // Terapkan minggu ke jika ada
      const targetMinggu = parsed.mingguKe || mingguKe;
      if (parsed.mingguKe) {
        setMingguKe(parsed.mingguKe);
      }

      // Terapkan bobot upah manajemen dari berkas
      let newBPerencana = bobotPerencana;
      let newBPengawas = bobotPengawas;
      let newBAdmin = bobotAdministrasi;

      if (parsed.biayaManajemen) {
        newBPerencana = parsed.biayaManajemen.prestasiPerencanaMingguIni;
        newBPengawas = parsed.biayaManajemen.prestasiPengawasMingguIni;
        newBAdmin = parsed.biayaManajemen.prestasiAdministrasiMingguIni;
        setBobotPerencana(newBPerencana);
        setBobotPengawas(newBPengawas);
        setBobotAdministrasi(newBAdmin);
      }

      setItemsProgress(updatedProgress);

      const msg = `Berkas berhasil dimuat! Terdeteksi ${matchCount} item pekerjaan fisik & 3 pos honor manajemen (Perencana: ${newBPerencana.toFixed(2)}%, Pengawas: ${newBPengawas.toFixed(2)}%, Adm: ${newBAdmin.toFixed(2)}%). Otomasi kwitansi langsung selesai!`;
      setUploadNote(msg);

      // LANGSUNG JALANKAN OTOMASI KWITANSI BAHAN & UPAH MINGGUAN TANPA PERLU KLIK LAGI
      executeCalculation(
        updatedProgress,
        targetMinggu,
        tanggalMulai,
        tanggalSelesai,
        newBPerencana,
        newBPengawas,
        newBAdmin
      );

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert('Gagal membaca berkas Excel/CSV: ' + (err?.message || 'Format tidak dikenali'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Muat Contoh Berkas Mingguan Resmi (Demo 1-Klik)
  const handleLoadOfficialDemo = () => {
    const updatedProgress = { ...itemsProgress };
    let matchCount = 0;

    // Gunakan data resmi dari OFFICIAL_REKAP_MINGGUAN_DATA (Persiapan 0.25%, Pasangan 2.24%, Beton 2.21%)
    OFFICIAL_REKAP_MINGGUAN_DATA.pekerjaanFisik.forEach((divisi) => {
      if (divisi.prestasiMingguIni > 0) {
        const matched = rabMaster.filter(
          (r) =>
            r.namaPekerjaan.toLowerCase().includes(divisi.uraianPekerjaan.toLowerCase().replace('pekerjaan ', '')) ||
            (r.kategori && divisi.uraianPekerjaan.toLowerCase().includes(r.kategori.toLowerCase()))
        );

        if (matched.length > 0) {
          const share = divisi.prestasiMingguIni / matched.length;
          matched.forEach((m) => {
            matchCount++;
            const pct = Math.round(share * 100) / 100;
            const vol = Math.round((pct / 100) * m.volumeRAB * 10) / 10;
            updatedProgress[m.id] = {
              persentaseTambah: pct,
              volumeTambah: vol,
            };
          });
        }
      }
    });

    const bPer = 0.18;
    const bWas = 0.22;
    const bAdm = 0.24;

    setMingguKe(4);
    setBobotPerencana(bPer);
    setBobotPengawas(bWas);
    setBobotAdministrasi(bAdm);
    setItemsProgress(updatedProgress);

    setUploadNote(
      'Contoh Berkas Resmi Laporan Mingguan berhasil dimuat! Bobot fisik 4.70% dipecah ke kwitansi harian, serta honor perencana (0.18%), pengawas (0.22%), dan administrasi (0.24%) otomatis dihitung mingguan.'
    );

    executeCalculation(
      updatedProgress,
      4,
      tanggalMulai,
      tanggalSelesai,
      bPer,
      bWas,
      bAdm
    );
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Simpan Seluruh Kwitansi Belanja Harian & Upah Mingguan ke BKU
  const handleSaveAllToBKU = () => {
    if (!generatedPlans || !weeklyWagesPlan) return;

    const totalMaterial = generatedPlans.reduce((acc, p) => acc + p.totalNominal, 0);
    const totalUpah = weeklyWagesPlan.totalNominalUpahMingguan;
    const grandTotal = totalMaterial + totalUpah;

    const konfirmasi = window.confirm(
      `Konfirmasi pembukuan resmi ke Buku Kas Umum (BKU)?\n\n` +
        `• Kwitansi Bahan Harian (${generatedPlans.length} kwt): ${formatRupiah(totalMaterial)}\n` +
        `• Upah Tukang & Tenaga Kerja: ${formatRupiah(weeklyWagesPlan.upahTukang.nominal)}\n` +
        `• Honor Tenaga Perencana: ${formatRupiah(weeklyWagesPlan.upahPerencana.nominal)}\n` +
        `• Honor Tenaga Pengawas: ${formatRupiah(weeklyWagesPlan.upahPengawas.nominal)}\n` +
        `• Honor/Biaya Administrasi P2SP: ${formatRupiah(weeklyWagesPlan.upahAdministrasi.nominal)}\n\n` +
        `TOTAL PENGELUARAN MINGGU KE-${mingguKe}: ${formatRupiah(grandTotal)}\n\n` +
        `Semua data akan langsung tercatat di BKU, Daftar Kwitansi, SPJ Payroll & LPJ.`
    );

    if (konfirmasi) {
      // Hitung progres realisasi WBS baru
      const updatedRAB = rabMaster.map((item) => {
        const p = itemsProgress[item.id];
        if (p && (p.persentaseTambah > 0 || p.volumeTambah > 0)) {
          const newProg = Math.min(100, item.progresRealisasi + Number(p.persentaseTambah || 0));
          return {
            ...item,
            progresRealisasi: Math.round(newProg * 10) / 10,
          };
        }
        return item;
      });

      addBatchKwitansiAndWeeklyWages(
        generatedPlans,
        weeklyWagesPlan,
        mingguKe,
        updatedRAB
      );

      setIsSuccessfullySaved(true);
      alert('Seluruh kwitansi pembelian harian & upah mingguan berhasil dibukukan ke BKU Kas!');
    }
  };

  const totalMaterialGenerated = generatedPlans
    ? generatedPlans.reduce((acc, p) => acc + p.totalNominal, 0)
    : 0;

  const totalUpahGenerated = weeklyWagesPlan ? weeklyWagesPlan.totalNominalUpahMingguan : 0;
  const grandTotalMingguIni = totalMaterialGenerated + totalUpahGenerated;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Otomasi Kwitansi Bahan Harian & Upah Mingguan Berdasarkan Bobot Template</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              RAB & Kwitansi Harian (Otomatis dari Template)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1">
              Cukup upload template Laporan Mingguan. Sistem langsung memecah pembelian bahan per hari (Senin–Sabtu) dan menghitung upah tukang, honor perencana, honor pengawas, serta honor administrasi secara mingguan sesuai bobot capaian.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/40 p-2 rounded-xl border border-emerald-600/30">
            <button
              onClick={() => setActiveMode('AUTO_GENERATE')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'AUTO_GENERATE'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Input & Otomasi Belanja
            </button>
            <button
              onClick={() => setActiveMode('VIEW_RAB')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                activeMode === 'VIEW_RAB'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Katalog Koefisien RAB
            </button>
          </div>
        </div>
      </div>

      {activeMode === 'AUTO_GENERATE' ? (
        <div className="space-y-6">
          {/* HERO UPLOAD ZONE: "CUKUP DENGAN MENGUPLOAD TEMPLATE" */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all bg-white text-center shadow-xs ${
              isDragOver
                ? 'border-emerald-600 bg-emerald-50/70 scale-[1.005]'
                : 'border-slate-300 hover:border-emerald-600'
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Upload Template Laporan Mingguan & Rekapitulasi Progres
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                  Tarik berkas <strong>.xlsx</strong> atau <strong>.csv</strong> ke sini, atau klik tombol di bawah. Sistem otomatis mendeteksi bobot capaian fisik dan manajemen untuk memecah kwitansi secara instan.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="main-weekly-template-upload"
                />

                <label
                  htmlFor="main-weekly-template-upload"
                  className="cursor-pointer px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-102"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih Berkas Laporan Mingguan</span>
                </label>

                <button
                  type="button"
                  onClick={() => generateOfficialWeeklyRecapTemplateExcel(projectInfo, rabMaster)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Download Template Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadOfficialDemo}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 flex items-center gap-2 transition-colors shadow-2xs"
                  title="Muat data contoh resmi: Fisik 4.70%, Perencana 0.18%, Pengawas 0.22%, Administrasi 0.24%"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Muat Contoh Berkas Resmi (Demo 1-Klik)</span>
                </button>
              </div>

              {uploadNote && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between mt-3 text-left">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadNote}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadNote(null)}
                    className="font-bold text-emerald-800 hover:text-emerald-950 ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PARAMETER OPERASIONAL & BOBOT MANAJEMEN */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Pengaturan Periode & Bobot Honor Manajemen Mingguan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Minggu Ke-</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={mingguKe}
                  onChange={(e) => setMingguKe(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mulai (Senin)</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-[11px] bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Selesai (Sabtu)</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-[11px] bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Upah Perencana (% Bobot)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bobotPerencana}
                  onChange={(e) => setBobotPerencana(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-center bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Upah Pengawas (% Bobot)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bobotPengawas}
                  onChange={(e) => setBobotPengawas(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-center bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Upah Administrasi (% Bobot)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bobotAdministrasi}
                  onChange={(e) => setBobotAdministrasi(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-center bg-white"
                />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-600 font-medium">Toko Material:</span>
                <input
                  type="text"
                  value={namaTokoDefault}
                  onChange={(e) => setNamaTokoDefault(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-lg text-xs font-semibold w-56"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  executeCalculation(
                    itemsProgress,
                    mingguKe,
                    tanggalMulai,
                    tanggalSelesai,
                    bobotPerencana,
                    bobotPengawas,
                    bobotAdministrasi
                  )
                }
                className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Hitung Ulang Berdasarkan Bobot</span>
              </button>
            </div>
          </div>

          {/* HASIL PEMBAGIAN KWITANSI & UPAH */}
          {generatedPlans && weeklyWagesPlan ? (
            <div className="space-y-4">
              {/* IKHTISAR REKAPITULASI SERAPAN MINGGU INI */}
              <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hasil Pemecahan Otomatis Minggu Ke-{mingguKe}</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight mt-1">
                      Total Serapan Anggaran: {formatRupiah(grandTotalMingguIni)}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Total Bobot Minggu Ini:{' '}
                      <strong className="text-amber-300 font-mono">
                        {weeklyWagesPlan.totalBobotMingguIni.toFixed(2)}%
                      </strong>{' '}
                      (Fisik: {weeklyWagesPlan.bobotFisikMingguIni.toFixed(2)}% | Manajemen:{' '}
                      {(
                        weeklyWagesPlan.bobotPerencanaMingguIni +
                        weeklyWagesPlan.bobotPengawasMingguIni +
                        weeklyWagesPlan.bobotAdministrasiMingguIni
                      ).toFixed(2)}
                      %)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSuccessfullySaved}
                      onClick={handleSaveAllToBKU}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                        isSuccessfullySaved
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isSuccessfullySaved
                          ? 'Seluruh Kwitansi & Upah Sudah Masuk BKU'
                          : 'Simpan Seluruh Kwitansi & Upah ke BKU'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">
                      1. Belanja Barang / Material (Harian)
                    </span>
                    <strong className="text-sm font-mono text-emerald-400 block mt-0.5">
                      {formatRupiah(totalMaterialGenerated)}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      Dipecah {generatedPlans.length} kwitansi (Senin - Sabtu)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">
                      2. Upah Tukang & Tenaga Kerja (Mingguan)
                    </span>
                    <strong className="text-sm font-mono text-amber-300 block mt-0.5">
                      {formatRupiah(weeklyWagesPlan.upahTukang.nominal)}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      Dihitung dari bobot fisik {weeklyWagesPlan.bobotFisikMingguIni.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[11px]">
                      3. Upah / Honor Manajemen (Mingguan)
                    </span>
                    <strong className="text-sm font-mono text-teal-300 block mt-0.5">
                      {formatRupiah(
                        weeklyWagesPlan.upahPerencana.nominal +
                          weeklyWagesPlan.upahPengawas.nominal +
                          weeklyWagesPlan.upahAdministrasi.nominal
                      )}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      Perencana ({weeklyWagesPlan.bobotPerencanaMingguIni}%), Pengawas (
                      {weeklyWagesPlan.bobotPengawasMingguIni}%), Adm (
                      {weeklyWagesPlan.bobotAdministrasiMingguIni}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Sukses Notifikasi */}
              {isSuccessfullySaved && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Semua Pembukuan Berhasil!</strong> Seluruh {generatedPlans.length} kwitansi bahan harian dan 4 pos upah/honor mingguan telah dibukukan ke Buku Kas Umum (BKU), Kwitansi, SPJ Payroll, dan LPJ.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigateToReceipts && (
                      <button
                        onClick={onNavigateToReceipts}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-800 flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Daftar Kwitansi</span>
                      </button>
                    )}
                    {onNavigateToBKU && (
                      <button
                        onClick={onNavigateToBKU}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-[11px] hover:bg-slate-900 flex items-center gap-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Buku Kas (BKU)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TABS SWITCHER: KWITANSI BAHAN HARIAN VS UPAH MINGGUAN */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveResultTab('BARANG_HARIAN')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      activeResultTab === 'BARANG_HARIAN'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>
                      1. Kwitansi Pembelian Barang Harian ({generatedPlans.length} Hari)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveResultTab('UPAH_MINGGUAN')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      activeResultTab === 'UPAH_MINGGUAN'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>
                      2. Rekapitulasi Upah & Honor Mingguan (4 Pos Sesuai Bobot)
                    </span>
                  </button>
                </div>

                <div className="p-4">
                  {/* TAB 1: KWITANSI PEMBELIAN BARANG HARIAN */}
                  {activeResultTab === 'BARANG_HARIAN' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                        <span>
                          Daftar Pembagian Pembelian Bahan per Hari (Senin s/d Sabtu):
                        </span>
                        <span>Klik kartu untuk melihat rincian barang per kwitansi</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {generatedPlans.map((plan) => {
                          const isSelected = selectedPlanPreview?.id === plan.id;
                          return (
                            <div
                              key={plan.id}
                              onClick={() => setSelectedPlanPreview(plan)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-emerald-700 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-700'
                                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px]">
                                  {plan.hari}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 font-semibold">
                                  {formatTanggalIndo(plan.tanggal)}
                                </span>
                              </div>

                              <div className="font-mono text-[10px] text-slate-600 truncate mb-1">
                                {plan.nomorKwitansi}
                              </div>

                              <div className="text-[11px] text-slate-700 truncate mb-2">
                                Toko: <strong>{plan.namaToko}</strong>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                                <span className="text-[11px] text-slate-500">
                                  {plan.items.length} Macam Barang
                                </span>
                                <strong className="font-mono text-emerald-800 font-bold">
                                  {formatRupiah(plan.totalNominal)}
                                </strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detail Preview Kwitansi Bahan Terpilih */}
                      {selectedPlanPreview && (
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/80 space-y-3 mt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 text-xs gap-2">
                            <div>
                              <span className="text-slate-500 block text-[11px]">
                                Rincian Barang Belanja ({selectedPlanPreview.hari},{' '}
                                {formatTanggalIndo(selectedPlanPreview.tanggal)})
                              </span>
                              <strong className="text-slate-800 text-sm">
                                {selectedPlanPreview.nomorKwitansi} — {selectedPlanPreview.namaToko}
                              </strong>
                            </div>
                            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                              Total: {formatRupiah(selectedPlanPreview.totalNominal)}
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                                  <th className="py-1.5 pr-2">No</th>
                                  <th className="py-1.5 px-2">Nama Barang & Spesifikasi</th>
                                  <th className="py-1.5 px-2 text-center">Volume</th>
                                  <th className="py-1.5 px-2 text-right">Harga Satuan</th>
                                  <th className="py-1.5 pl-2 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {selectedPlanPreview.items.map((it, idx) => (
                                  <tr key={it.id} className="text-slate-700">
                                    <td className="py-1.5 pr-2 text-slate-400 font-mono text-[10px]">
                                      {idx + 1}
                                    </td>
                                    <td className="py-1.5 px-2 font-medium">{it.namaBarang}</td>
                                    <td className="py-1.5 px-2 text-center font-mono font-semibold">
                                      {it.volume} {it.satuan}
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                                      {formatRupiah(it.hargaSatuan)}
                                    </td>
                                    <td className="py-1.5 pl-2 text-right font-mono font-bold text-slate-900">
                                      {formatRupiah(it.subtotal)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: REKAPITULASI UPAH & HONOR MINGGUAN SESUAI BOBOT */}
                  {activeResultTab === 'UPAH_MINGGUAN' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                        <span>
                          Rincian 4 Pos Upah & Honor Mingguan Sesuai Bobot Capaian:
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          Total Upah Mingguan: {formatRupiah(weeklyWagesPlan.totalNominalUpahMingguan)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. UPAH TUKANG */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                                <HardHat className="w-5 h-5" />
                              </span>
                              <div>
                                <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider block">
                                  Upah Kerja Fisik
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {weeklyWagesPlan.upahTukang.judul}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              Bobot Fisik: {weeklyWagesPlan.upahTukang.bobotMingguIniPersen.toFixed(2)}%
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Nominal Upah:</span>
                              <strong className="font-mono text-sm text-slate-900 font-bold">
                                {formatRupiah(weeklyWagesPlan.upahTukang.nominal)}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>Penerima:</span>
                              <span className="font-semibold text-slate-800">
                                {weeklyWagesPlan.upahTukang.penerima}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>No. SPJ Upah:</span>
                              <span className="font-mono">{weeklyWagesPlan.upahTukang.nomorKwitansi}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 italic">
                            "{weeklyWagesPlan.upahTukang.uraian}"
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              {weeklyWagesPlan.upahTukang.workersDetail?.length || 4} Tenaga Kerja Terdata
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWageModalItem(weeklyWagesPlan.upahTukang);
                                setIsWageModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Pratinjau SPJ Upah</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. UPAH PERENCANA */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
                                <Briefcase className="w-5 h-5" />
                              </span>
                              <div>
                                <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider block">
                                  Biaya Perencanaan
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {weeklyWagesPlan.upahPerencana.judul}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                              Bobot: {weeklyWagesPlan.upahPerencana.bobotMingguIniPersen.toFixed(2)}%
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Nominal Honor:</span>
                              <strong className="font-mono text-sm text-slate-900 font-bold">
                                {formatRupiah(weeklyWagesPlan.upahPerencana.nominal)}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>Penerima:</span>
                              <span className="font-semibold text-slate-800">
                                {weeklyWagesPlan.upahPerencana.penerima}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>No. Kwitansi:</span>
                              <span className="font-mono">{weeklyWagesPlan.upahPerencana.nomorKwitansi}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 italic">
                            "{weeklyWagesPlan.upahPerencana.uraian}"
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Pagu Pos: {formatRupiah(weeklyWagesPlan.upahPerencana.paguAlokasi)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWageModalItem(weeklyWagesPlan.upahPerencana);
                                setIsWageModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Pratinjau Kwitansi</span>
                            </button>
                          </div>
                        </div>

                        {/* 3. UPAH PENGAWAS */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
                                <Award className="w-5 h-5" />
                              </span>
                              <div>
                                <span className="text-[10px] font-bold uppercase text-teal-700 tracking-wider block">
                                  Biaya Pengawasan
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {weeklyWagesPlan.upahPengawas.judul}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
                              Bobot: {weeklyWagesPlan.upahPengawas.bobotMingguIniPersen.toFixed(2)}%
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100 space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Nominal Honor:</span>
                              <strong className="font-mono text-sm text-slate-900 font-bold">
                                {formatRupiah(weeklyWagesPlan.upahPengawas.nominal)}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>Penerima:</span>
                              <span className="font-semibold text-slate-800">
                                {weeklyWagesPlan.upahPengawas.penerima}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>No. Kwitansi:</span>
                              <span className="font-mono">{weeklyWagesPlan.upahPengawas.nomorKwitansi}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 italic">
                            "{weeklyWagesPlan.upahPengawas.uraian}"
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Pagu Pos: {formatRupiah(weeklyWagesPlan.upahPengawas.paguAlokasi)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWageModalItem(weeklyWagesPlan.upahPengawas);
                                setIsWageModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Pratinjau Kwitansi</span>
                            </button>
                          </div>
                        </div>

                        {/* 4. UPAH ADMINISTRASI & PENGELOLAAN */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
                                <FileText className="w-5 h-5" />
                              </span>
                              <div>
                                <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider block">
                                  Biaya Pengelolaan P2SP
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {weeklyWagesPlan.upahAdministrasi.judul}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-200">
                              Bobot: {weeklyWagesPlan.upahAdministrasi.bobotMingguIniPersen.toFixed(2)}%
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Nominal Honor/ATK:</span>
                              <strong className="font-mono text-sm text-slate-900 font-bold">
                                {formatRupiah(weeklyWagesPlan.upahAdministrasi.nominal)}
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>Penerima:</span>
                              <span className="font-semibold text-slate-800">
                                {weeklyWagesPlan.upahAdministrasi.penerima}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                              <span>No. Kwitansi:</span>
                              <span className="font-mono">{weeklyWagesPlan.upahAdministrasi.nomorKwitansi}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 italic">
                            "{weeklyWagesPlan.upahAdministrasi.uraian}"
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                              Pagu Pos: {formatRupiah(weeklyWagesPlan.upahAdministrasi.paguAlokasi)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWageModalItem(weeklyWagesPlan.upahAdministrasi);
                                setIsWageModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Pratinjau Kwitansi</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">
                Kwitansi Harian & Upah Mingguan Belum Dihitung
              </h4>
              <p className="text-xs text-slate-500 max-w-md">
                Silakan upload template Laporan Mingguan di atas, atau klik tombol <strong>"Muat Contoh Berkas Resmi (Demo 1-Klik)"</strong> untuk langsung menghasilkan kwitansi bahan harian dan 4 pos upah mingguan.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Tab: Katalog Koefisien RAB Master */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Katalog Master RAB & Koefisien Material Konstruksi (SNI)
              </h3>
              <p className="text-xs text-slate-500">
                Komponen bahan dan indeks koefisien per unit pekerjaan yang dijadikan dasar pemecahan belanja harian
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Total {rabMaster.length} Kelompok Pekerjaan Terkatalog
            </div>
          </div>

          <div className="space-y-4">
            {rabMaster.map((rab) => (
              <div key={rab.id} className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 p-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {rab.kode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{rab.namaPekerjaan}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 text-xs">
                    <span>Volume RAB: <strong>{rab.volumeRAB} {rab.satuan}</strong></span>
                    <span>Biaya RAB: <strong className="font-mono text-slate-900">{formatRupiah(rab.biayaRAB)}</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-white">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Komponen Material & Koefisien Kebutuhan:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {rab.materialComponents.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1"
                      >
                        <div className="font-semibold text-slate-800 truncate">
                          {mat.namaMaterial}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Koefisien: <strong>{mat.koefisienPerSatuanPekerjaan} {mat.satuan} / {rab.satuan}</strong></span>
                          <span className="font-mono font-medium text-slate-700">{formatRupiah(mat.hargaSatuan)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                          <span>Toko: {mat.tokoDefault || 'TB. Terdaftar'}</span>
                          <span className="px-1 py-0.5 rounded bg-slate-200/60 text-slate-600">
                            Beli: {mat.preferensiHariBeli.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU & CETAK RESMI KWITANSI UPAH MINGGUAN */}
      <KwitansiUpahMingguanModal
        isOpen={isWageModalOpen}
        onClose={() => setIsWageModalOpen(false)}
        wageItem={selectedWageModalItem}
        mingguKe={mingguKe}
      />
    </div>
  );
};
