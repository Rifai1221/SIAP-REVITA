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
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { GeneratedDailyPurchasePlan, RABMasterItem } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';
import {
  generateDailyPurchasesFromWeeklyProgress,
  WeeklyProgressSubmission,
} from '../utils/dailyDistributorEngine';
import {
  generateLaporanMingguanTemplateExcel,
  parseWeeklyProgressFile,
} from '../utils/excelTemplateEngine';

export const RabProgressSyncModal: React.FC<{ onNavigateToReceipts?: () => void }> = ({
  onNavigateToReceipts,
}) => {
  const {
    rabMaster,
    updateRABMaster,
    kwitansiList,
    addBatchKwitansi,
    weeklyRecaps,
    projectInfo,
  } = useProject();

  // Tab: PROGRESS_TO_DAILY_KWITANSI vs MASTER_RAB
  const [activeMode, setActiveMode] = useState<'AUTO_GENERATE' | 'VIEW_RAB'>('AUTO_GENERATE');

  // Input State for Weekly Progress
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

  // Progres item per WBS yang dicapai minggu ini
  const [itemsProgress, setItemsProgress] = useState<{
    [wbsId: string]: { persentaseTambah: number; volumeTambah: number };
  }>(() => {
    const init: { [wbsId: string]: { persentaseTambah: number; volumeTambah: number } } = {};
    rabMaster.forEach((r) => {
      // Default contoh untuk minggu berjalan
      if (r.kode === '04.00') {
        // Dinding hebel
        init[r.id] = { persentaseTambah: 8.0, volumeTambah: 22.4 };
      } else if (r.kode === '05.00') {
        // Atap
        init[r.id] = { persentaseTambah: 6.0, volumeTambah: 11.1 };
      } else {
        init[r.id] = { persentaseTambah: 0, volumeTambah: 0 };
      }
    });
    return init;
  });

  // Generated Result State
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedDailyPurchasePlan[] | null>(null);
  const [selectedPlanPreview, setSelectedPlanPreview] = useState<GeneratedDailyPurchasePlan | null>(
    null
  );
  const [isSuccessfullySaved, setIsSuccessfullySaved] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload and parse weekly progress file directly
  const handleQuickUploadWeeklyFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseWeeklyProgressFile(file);
      if (parsed.rows.length === 0) {
        alert('File terbaca, namun tidak ditemukan kolom capaian minggu ini (> 0).');
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

      setItemsProgress(updatedProgress);
      setUploadNote(`File berhasil dimuat! ${matchCount} item pekerjaan otomatis terisi sesuai laporan mingguan.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert('Gagal membaca file Excel/CSV: ' + (err?.message || 'Format tidak dikenali'));
    }
  };

  // Toggle hari aktif
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

  // Hitung otomatis rencana pembelian harian
  const handleGenerateDailyPurchases = () => {
    const submission: WeeklyProgressSubmission = {
      mingguKe,
      tanggalMulai,
      tanggalSelesai,
      modeDistribusi,
      hariAktifBelanja: hariAktif,
      namaTokoDefault,
      items: Object.entries(itemsProgress).map(([wbsId, val]) => ({
        wbsId,
        persentaseTambah: Number(val.persentaseTambah) || 0,
        volumeTambah: Number(val.volumeTambah) || 0,
      })),
    };

    const plans = generateDailyPurchasesFromWeeklyProgress(
      submission,
      rabMaster,
      kwitansiList.length
    );

    if (plans.length === 0) {
      alert('Tidak ada kebutuhan material yang terhitung. Pastikan persentase/volume progres fisik terisi di atas 0%.');
      return;
    }

    setGeneratedPlans(plans);
    setSelectedPlanPreview(plans[0]);
    setIsSuccessfullySaved(false);
  };

  // Simpan ke Kwitansi & BKU Kas
  const handleSaveToKwitansiAndBKU = () => {
    if (!generatedPlans || generatedPlans.length === 0) return;

    if (
      window.confirm(
        `Konfirmasi pembukuan ${generatedPlans.length} kwitansi harian ke Buku Kas Umum (BKU)?\nTotal belanja material: ${formatRupiah(
          generatedPlans.reduce((acc, p) => acc + p.totalNominal, 0)
        )}`
      )
    ) {
      addBatchKwitansi(generatedPlans, true, mingguKe);

      // Update progres realisasi WBS di sistem
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
      updateRABMaster(updatedRAB);

      setIsSuccessfullySaved(true);
      alert('Kwitansi harian berhasil dibukukan ke BKU dan progres bangunan telah terupdate!');
    }
  };

  const totalNominalGenerated = generatedPlans
    ? generatedPlans.reduce((acc, p) => acc + p.totalNominal, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulator Pemecah Kwitansi Harian Berdasarkan AHSP Standar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Sinkronisasi RAB, Progres Mingguan & Kwitansi Harian
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1">
              Upload atau masukkan capaian progres fisik mingguan. Sistem otomatis membaca koefisien bahan di RAB dan memecahnya menjadi daftar kwitansi pembelian harian (Senin–Sabtu) yang logis, siap dicetak, dan langsung tercatat di BKU.
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
              Input Progres Mingguan
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Input Progres Mingguan & Parameter (5 Kolom) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>1. Periode & Pengaturan Pemecahan Harian</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Minggu Ke-</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={mingguKe}
                      onChange={(e) => setMingguKe(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mulai (Senin)</label>
                    <input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Selesai (Sabtu)</label>
                    <input
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Toko Material Utama</label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={namaTokoDefault}
                      onChange={(e) => setNamaTokoDefault(e.target.value)}
                      placeholder="TB. Sumber Rejeki Jaya"
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Metode Distribusi Harian
                  </label>
                  <select
                    value={modeDistribusi}
                    onChange={(e) => setModeDistribusi(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="SMART_STAGING">
                      Mode Alami Konstruksi (Bahan kasar di awal, semen/finishing bertahap)
                    </option>
                    <option value="HARI_TERTENTU">
                      Pilih Hari Belanja Tertentu Saja (Kustom Hari)
                    </option>
                    <option value="RATA_BERTAHAP">
                      Rata Bertahap (Bagi merata ke seluruh hari kerja)
                    </option>
                  </select>
                </div>

                {modeDistribusi === 'HARI_TERTENTU' && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5">
                      Pilih Hari Transaksi Buka Toko:
                    </label>
                    <div className="grid grid-cols-6 gap-1 text-center">
                      {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const).map((h) => {
                        const active = hariAktif.includes(h);
                        return (
                          <button
                            type="button"
                            key={h}
                            onClick={() => toggleHari(h)}
                            className={`py-1.5 px-1 rounded-md text-[11px] font-semibold border transition-all ${
                              active
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {h.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Input Capaian Fisik per Item Pekerjaan */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 pb-2 border-b border-slate-100 gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>2. Capaian Progres Fisik Minggu Ini</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => generateLaporanMingguanTemplateExcel(rabMaster)}
                    className="text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded flex items-center gap-1 border border-slate-200"
                    title="Unduh format file Excel laporan mingguan"
                  >
                    <Download className="w-3 h-3" />
                    <span>Template</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleQuickUploadWeeklyFile}
                    className="hidden"
                    id="quick-upload-weekly"
                  />
                  <label
                    htmlFor="quick-upload-weekly"
                    className="cursor-pointer text-[10px] text-white bg-emerald-700 hover:bg-emerald-800 px-2 py-1 rounded font-bold flex items-center gap-1 shadow-2xs"
                    title="Upload file progres mingguan hasil pengawas lapangan"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Excel</span>
                  </label>
                </div>
              </div>

              {uploadNote && (
                <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
                  <span>{uploadNote}</span>
                  <button
                    type="button"
                    onClick={() => setUploadNote(null)}
                    className="font-bold text-emerald-900 hover:text-emerald-700 ml-2"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {rabMaster.map((rab) => {
                  const currentProg = itemsProgress[rab.id] || {
                    persentaseTambah: 0,
                    volumeTambah: 0,
                  };
                  const hasInput =
                    currentProg.persentaseTambah > 0 || currentProg.volumeTambah > 0;

                  return (
                    <div
                      key={rab.id}
                      className={`p-2.5 rounded-lg border text-xs transition-all ${
                        hasInput
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded mr-1.5">
                            {rab.kode}
                          </span>
                          <span className="font-semibold text-slate-800">{rab.namaPekerjaan}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span>Pagu RAB: {rab.volumeRAB} {rab.satuan}</span>
                        <span>Realisasi Lalu: <strong>{rab.progresRealisasi}%</strong></span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                        <div>
                          <label className="block text-[10px] text-slate-600 mb-0.5 font-medium">
                            Tambah Progres (%)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={currentProg.persentaseTambah || ''}
                            onChange={(e) => {
                              const pct = parseFloat(e.target.value) || 0;
                              const volCalc = Math.round((pct / 100) * rab.volumeRAB * 10) / 10;
                              setItemsProgress({
                                ...itemsProgress,
                                [rab.id]: {
                                  persentaseTambah: pct,
                                  volumeTambah: volCalc,
                                },
                              });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded font-bold text-center bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-600 mb-0.5 font-medium">
                            Vol Fisik ({rab.satuan})
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0"
                            value={currentProg.volumeTambah || ''}
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value) || 0;
                              const pctCalc =
                                rab.volumeRAB > 0
                                  ? Math.round((vol / rab.volumeRAB) * 1000) / 10
                                  : 0;
                              setItemsProgress({
                                ...itemsProgress,
                                [rab.id]: {
                                  persentaseTambah: pctCalc,
                                  volumeTambah: vol,
                                },
                              });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded font-mono text-center bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleGenerateDailyPurchases}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Hitung & Pecah Jadi Kwitansi Harian</span>
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Preview Hasil Kwitansi Harian (7 Kolom) */}
          <div className="lg:col-span-7 space-y-4">
            {generatedPlans && generatedPlans.length > 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{generatedPlans.length} Kwitansi Harian Dihasilkan</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Hasil Pemecahan Belanja Minggu Ke-{mingguKe}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Total Nilai Kwitansi</span>
                    <strong className="text-sm font-mono text-emerald-800 font-black">
                      {formatRupiah(totalNominalGenerated)}
                    </strong>
                  </div>
                </div>

                {/* Status Sukses Simpan Alert */}
                {isSuccessfullySaved && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Seluruh kwitansi telah dibukukan ke BKU Kas & LPJ.
                    </span>
                    {onNavigateToReceipts && (
                      <button
                        onClick={onNavigateToReceipts}
                        className="font-bold underline text-emerald-900 hover:text-emerald-700"
                      >
                        Buka Daftar Kwitansi
                      </button>
                    )}
                  </div>
                )}

                {/* List Kwitansi Harian */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                    <span>Jadwal Kwitansi Harian (Senin - Sabtu):</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Klik kartu untuk preview detail barang
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {generatedPlans.map((plan) => {
                      const isSelected = selectedPlanPreview?.id === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanPreview(plan)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-700 bg-emerald-50/70 shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white text-[10px]">
                                {plan.hari}
                              </span>
                              <span>{formatTanggalIndo(plan.tanggal)}</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 font-semibold">
                              {plan.nomorKwitansi}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 truncate mb-2">
                            Toko: <strong>{plan.namaToko}</strong>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                            <span className="text-slate-500 text-[11px]">
                              {plan.items.length} Macam Barang
                            </span>
                            <strong className="font-mono text-emerald-800">
                              {formatRupiah(plan.totalNominal)}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail Box: Preview Barang pada Kwitansi Terpilih */}
                {selectedPlanPreview && (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">
                          Preview Rincian Belanja ({selectedPlanPreview.hari},{' '}
                          {formatTanggalIndo(selectedPlanPreview.tanggal)})
                        </span>
                        <strong className="text-slate-800 text-sm">
                          Nomor: {selectedPlanPreview.nomorKwitansi}
                        </strong>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                        {formatRupiah(selectedPlanPreview.totalNominal)}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                            <th className="py-1.5 pr-2">No</th>
                            <th className="py-1.5 px-2">Nama Barang & Spek</th>
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
                              <td className="py-1.5 px-2 font-medium">
                                {it.namaBarang}
                              </td>
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

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Kwitansi akan langsung dimasukkan ke BKU Tunai secara berurutan per tanggal.
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isSuccessfullySaved}
                      onClick={handleSaveToKwitansiAndBKU}
                      className={`w-full sm:w-auto px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors ${
                        isSuccessfullySaved
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSuccessfullySaved ? 'Sudah Dibukukan' : 'Simpan Seluruh Kwitansi ke BKU'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  Kwitansi Harian Belum Dihasilkan
                </h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Masukkan persentase atau volume pekerjaan yang terealisasi pada panel di sebelah kiri, kemudian klik tombol <strong>"Hitung & Pecah Jadi Kwitansi Harian"</strong>.
                </p>
              </div>
            )}
          </div>
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
                Komponen bahan dan indeks koefisien per unit pekerjaan yang dijadikan dasar perhitungan belanja harian
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
    </div>
  );
};
