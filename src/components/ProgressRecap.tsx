import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CloudSun,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  Printer,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Layers,
  Edit2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { DailyWorkLog, WBSItem } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';

type ProgressTab = 'HARIAN' | 'MINGGUAN' | 'BULANAN' | 'TAHUNAN';

export const ProgressRecap: React.FC = () => {
  const {
    projectInfo,
    dailyLogs,
    weeklyRecaps,
    wbsList,
    summary,
    addDailyLog,
    deleteDailyLog,
    updateWBSItem,
  } = useProject();

  const [activeTab, setActiveTab] = useState<ProgressTab>('HARIAN');
  const [showAddDailyModal, setShowAddDailyModal] = useState(false);

  // New Daily Log State
  const [newLog, setNewLog] = useState<{
    tanggal: string;
    mingguKe: number;
    cuaca: 'CERAH' | 'BERAWAN' | 'HUJAN_RINGAN' | 'HUJAN_DERAS';
    mandor: number;
    tukang: number;
    laden: number;
    uraianPekerjaan: string;
    progresHariIniPersen: number;
    kendalaDanSolusi: string;
    catatanMaterial: string;
  }>({
    tanggal: new Date().toISOString().split('T')[0],
    mingguKe: 4,
    cuaca: 'CERAH',
    mandor: 1,
    tukang: 4,
    laden: 5,
    uraianPekerjaan: '',
    progresHariIniPersen: 1.0,
    kendalaDanSolusi: '',
    catatanMaterial: '',
  });

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.uraianPekerjaan.trim()) {
      alert('Mohon isi uraian pengerjaan bangunan hari ini.');
      return;
    }

    addDailyLog({
      tanggal: newLog.tanggal,
      mingguKe: Number(newLog.mingguKe),
      cuaca: newLog.cuaca,
      jumlahTenagaKerja: {
        mandor: Number(newLog.mandor),
        tukang: Number(newLog.tukang),
        laden: Number(newLog.laden),
      },
      uraianPekerjaan: newLog.uraianPekerjaan,
      progresHariIniPersen: Number(newLog.progresHariIniPersen),
      kendalaDanSolusi: newLog.kendalaDanSolusi,
      catatanMaterial: newLog.catatanMaterial,
    });

    setShowAddDailyModal(false);
    setNewLog({
      tanggal: new Date().toISOString().split('T')[0],
      mingguKe: 4,
      cuaca: 'CERAH',
      mandor: 1,
      tukang: 4,
      laden: 5,
      uraianPekerjaan: '',
      progresHariIniPersen: 1.0,
      kendalaDanSolusi: '',
      catatanMaterial: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Mode Switcher */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>Monitoring Fisik Bangunan Revitalisasi</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Rekapitulasi Progres Pengerjaan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan berjenjang harian, mingguan, bulanan dan evaluasi tahunan
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'HARIAN' && (
              <button
                onClick={() => setShowAddDailyModal(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Input Log Harian</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('HARIAN')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'HARIAN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Rekap Harian</span>
            <span className="opacity-80 text-[11px]">({dailyLogs.length} Log)</span>
          </button>

          <button
            onClick={() => setActiveTab('MINGGUAN')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'MINGGUAN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Rekap Mingguan</span>
            <span className="opacity-80 text-[11px]">({weeklyRecaps.length} Minggu)</span>
          </button>

          <button
            onClick={() => setActiveTab('BULANAN')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'BULANAN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Rekap Bulanan & Kurva S</span>
          </button>

          <button
            onClick={() => setActiveTab('TAHUNAN')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'TAHUNAN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Rekap Tahunan / WBS Master</span>
            <span className="opacity-80 text-[11px]">({summary.progresFisikKumulatif.toFixed(1)}%)</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: HARIAN */}
      {activeTab === 'HARIAN' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Buku Jurnal Laporan Harian Proyek Revitalisasi
              </h2>
              <p className="text-xs text-slate-500">
                Mencatat kondisi cuaca, tenaga kerja di lapangan, rincian aktivitas fisik, dan kedatangan material
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span>Total Catatan: <strong>{dailyLogs.length} Hari Kerja</strong></span>
            </div>
          </div>

          <div className="space-y-4">
            {dailyLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Belum ada jurnal harian. Klik &quot;Input Log Harian&quot; untuk menambahkan catatan.
              </div>
            ) : (
              dailyLogs.map((log) => {
                const totalWorkers =
                  log.jumlahTenagaKerja.mandor +
                  log.jumlahTenagaKerja.tukang +
                  log.jumlahTenagaKerja.laden;
                return (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatTanggalIndo(log.tanggal)}
                        </span>
                        <span className="text-xs text-slate-500">
                          Minggu Ke-{log.mingguKe}
                        </span>
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <CloudSun className="w-3.5 h-3.5 text-amber-600" />
                          <span>Cuaca: {log.cuaca}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Progres: +{log.progresHariIniPersen}%
                        </span>
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus log harian tanggal ini?')) {
                              deleteDailyLog(log.id);
                            }
                          }}
                          className="no-print p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {log.uraianPekerjaan}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-500">Tenaga Kerja ({totalWorkers} org): </span>
                        <span>
                          {log.jumlahTenagaKerja.mandor} Mandor, {log.jumlahTenagaKerja.tukang} Tukang, {log.jumlahTenagaKerja.laden} Laden
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500">Material Masuk: </span>
                        <span>{log.catatanMaterial || 'Tidak ada drop material baru'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500">Kendala & Penanganan: </span>
                        <span>{log.kendalaDanSolusi || 'Kondisi kerja lancar'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MINGGUAN */}
      {activeTab === 'MINGGUAN' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs">
          <div className="mb-4 pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Laporan Rekapitulasi Progres Mingguan
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi deviasi rencana vs realisasi kumulatif dan penyerapan dana proyek
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-800 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Periode Minggu</th>
                  <th className="py-2.5 px-3">Rentang Tanggal</th>
                  <th className="py-2.5 px-3 text-right">Target Rencana (%)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi (%)</th>
                  <th className="py-2.5 px-3 text-right">Deviasi (+/-)</th>
                  <th className="py-2.5 px-3 text-right">Serapan Dana (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Status Jadwal</th>
                  <th className="py-2.5 px-3">Catatan / Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {weeklyRecaps.map((item) => {
                  const isPositive = item.deviasi >= 0;
                  return (
                    <tr key={item.mingguKe} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        Minggu Ke-{item.mingguKe}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {item.rentangTanggal}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                        {item.targetKumulatif.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {item.realisasiKumulatif.toFixed(1)}%
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? `+${item.deviasi.toFixed(1)}%` : `${item.deviasi.toFixed(1)}%`}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 font-medium">
                        {formatRupiah(item.serapanBiayaKumulatif)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.status === 'MENDAHULUI' ? 'Mendahului Jadwal' : item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 text-xs">
                        {item.catatanEvaluasi}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              <strong className="text-slate-900">Kesimpulan Evaluasi Mingguan:</strong> Kecepatan pengerjaan fisik berada dalam status prima (+1.5% dari target awal). Pengadaan material rangka atap dan semen mortar terlaksana tepat waktu.
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
              Kumulatif Fisik: 65.5%
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BULANAN & KURVA S */}
      {activeTab === 'BULANAN' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Rekapitulasi Bulanan & Kurva S Progres Revitalisasi
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi Kurva S (Rencana vs Realisasi) dan serapan anggaran per bulan pelaksanaan
            </p>
          </div>

          {/* SVG S-Curve Chart */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold tracking-wide">
                  Grafik Kurva S Pelaksanaan Konstruksi (Februari - Mei 2026)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-400 inline-block"></span>
                  <span className="text-slate-300">Kurva Rencana</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-emerald-400 inline-block rounded-full"></span>
                  <span className="text-emerald-300 font-semibold">Kurva Realisasi Fisik</span>
                </span>
              </div>
            </div>

            <div className="relative h-64 w-full">
              {/* Grid lines and axes */}
              <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
                {/* Horizontal Guide lines */}
                {[0, 25, 50, 75, 100].map((pct, i) => {
                  const y = 200 - (pct / 100) * 180;
                  return (
                    <g key={i}>
                      <line
                        x1="50"
                        y1={y}
                        x2="680"
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text x="20" y={y + 4} fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        {pct}%
                      </text>
                    </g>
                  );
                })}

                {/* S-Curve Planned (Blue dashed line) */}
                <path
                  d="M 60 200 Q 200 170, 360 95 T 670 20"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />

                {/* S-Curve Realization (Emerald bold line up to current week 4) */}
                <path
                  d="M 60 200 L 140 174 L 220 146 L 300 107 L 380 82"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3.5"
                />

                {/* Data Points on Realization */}
                <circle cx="60" cy="200" r="4" fill="#34d399" />
                <circle cx="140" cy="174" r="4" fill="#34d399" />
                <circle cx="220" cy="146" r="4" fill="#34d399" />
                <circle cx="300" cy="107" r="4" fill="#34d399" />
                <circle cx="380" cy="82" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

                {/* Current Milestone Tag */}
                <text x="390" y="78" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  Realisasi: 65.5% (W4)
                </text>

                {/* X Axis Labels */}
                <text x="60" y="225" fill="#cbd5e1" fontSize="10" textAnchor="middle">Feb (W1)</text>
                <text x="140" y="225" fill="#cbd5e1" fontSize="10" textAnchor="middle">Feb (W2)</text>
                <text x="220" y="225" fill="#cbd5e1" fontSize="10" textAnchor="middle">Mar (W3)</text>
                <text x="300" y="225" fill="#cbd5e1" fontSize="10" textAnchor="middle">Mar (W4 - Kini)</text>
                <text x="380" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle">Apr (W6)</text>
                <text x="480" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle">Apr (W8)</text>
                <text x="580" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle">Mei (W10)</text>
                <text x="670" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle">Mei (Akhir)</text>
              </svg>
            </div>
          </div>

          {/* Monthly Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-800 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Bulan Pelaksanaan</th>
                  <th className="py-2.5 px-3 text-right">Target Fisik (%)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Fisik (%)</th>
                  <th className="py-2.5 px-3 text-right">Target Serapan (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Serapan (Rp)</th>
                  <th className="py-2.5 px-3">Status Kinerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Bulan 1: Februari 2026</td>
                  <td className="py-2.5 px-3 text-right font-mono">20.0%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">22.5%</td>
                  <td className="py-2.5 px-3 text-right font-mono">Rp 37.000.000</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">Rp 35.800.000</td>
                  <td className="py-2.5 px-3 text-emerald-800 font-medium">Melampaui Target (+2.5%)</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Bulan 2: Maret 2026 (Berjalan)</td>
                  <td className="py-2.5 px-3 text-right font-mono">48.0%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">51.0%</td>
                  <td className="py-2.5 px-3 text-right font-mono">Rp 88.800.000</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">Rp 83.500.000</td>
                  <td className="py-2.5 px-3 text-emerald-800 font-medium">Sesuai Rencana (+3.0%)</td>
                </tr>
                <tr className="text-slate-400">
                  <td className="py-2.5 px-3">Bulan 3: April 2026 (Rencana)</td>
                  <td className="py-2.5 px-3 text-right font-mono">80.0%</td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                  <td className="py-2.5 px-3 text-right font-mono">Rp 148.000.000</td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                  <td className="py-2.5 px-3">Jadwal Finishing & Pengecatan</td>
                </tr>
                <tr className="text-slate-400">
                  <td className="py-2.5 px-3">Bulan 4: Mei 2026 (Rencana Pelunasan)</td>
                  <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                  <td className="py-2.5 px-3 text-right font-mono">Rp 185.000.000</td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                  <td className="py-2.5 px-3">Serah Terima Pekerjaan (PHO)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TAHUNAN / WBS MASTER */}
      {activeTab === 'TAHUNAN' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Struktur Rincian Kerja (WBS) & Rekapitulasi Tahunan
              </h2>
              <p className="text-xs text-slate-500">
                Itemisasi volume pekerjaan bangunan, bobot persentase, dan realisasi anggaran
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Realisasi Fisik:</span>
              <span className="text-xl font-bold font-mono text-emerald-800">
                {summary.progresFisikKumulatif.toFixed(1)}% / 100%
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-300 text-slate-800 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-2 text-center">Kode</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Uraian Item Pekerjaan Bangunan</th>
                  <th className="py-2.5 px-2 text-center">Volume</th>
                  <th className="py-2.5 px-2 text-center">Sat</th>
                  <th className="py-2.5 px-3 text-right">Bobot RAB (%)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Fisik (%)</th>
                  <th className="py-2.5 px-3 text-right">Anggaran RAB (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Realisasi Biaya (Rp)</th>
                  <th className="no-print py-2.5 px-2 text-center">Update %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {wbsList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-700">
                        {item.kode}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {item.namaPekerjaan}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {item.volumeRAB}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">
                        {item.satuan}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {item.bobotRencana.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {item.progresRealisasi.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        {formatRupiah(item.biayaRAB)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-medium">
                        {formatRupiah(item.biayaRealisasi)}
                      </td>
                      <td className="no-print py-2.5 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={item.progresRealisasi}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateWBSItem(item.id, { progresRealisasi: Math.min(100, Math.max(0, val)) });
                          }}
                          className="w-16 px-1.5 py-1 text-center font-mono text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                          title="Ubah progres realisasi fisik item ini"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900 text-xs">
                  <td colSpan={4} className="py-3 px-3 uppercase text-right">
                    Total Keseluruhan:
                  </td>
                  <td className="py-3 px-3 text-right font-mono">100.0%</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">
                    {summary.progresFisikKumulatif.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatRupiah(projectInfo.totalPaguAnggaran)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    {formatRupiah(
                      wbsList.reduce((sum, w) => sum + w.biayaRealisasi, 0)
                    )}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah Log Harian */}
      {showAddDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Input Jurnal Laporan Harian Konstruksi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Catat aktivitas fisik lapangan, jumlah pekerja, dan kendala operasional
            </p>

            <form onSubmit={handleSaveDailyLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newLog.tanggal}
                    onChange={(e) => setNewLog({ ...newLog, tanggal: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Minggu Ke-</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newLog.mingguKe}
                    onChange={(e) => setNewLog({ ...newLog, mingguKe: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kondisi Cuaca</label>
                  <select
                    value={newLog.cuaca}
                    onChange={(e) =>
                      setNewLog({
                        ...newLog,
                        cuaca: e.target.value as 'CERAH' | 'BERAWAN' | 'HUJAN_RINGAN' | 'HUJAN_DERAS',
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="CERAH">Cerah</option>
                    <option value="BERAWAN">Berawan</option>
                    <option value="HUJAN_RINGAN">Hujan Ringan</option>
                    <option value="HUJAN_DERAS">Hujan Deras</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Jumlah Tenaga Kerja Lapangan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Mandor (org)</span>
                    <input
                      type="number"
                      min="0"
                      value={newLog.mandor}
                      onChange={(e) => setNewLog({ ...newLog, mandor: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Tukang (org)</span>
                    <input
                      type="number"
                      min="0"
                      value={newLog.tukang}
                      onChange={(e) => setNewLog({ ...newLog, tukang: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Laden / Kenek (org)</span>
                    <input
                      type="number"
                      min="0"
                      value={newLog.laden}
                      onChange={(e) => setNewLog({ ...newLog, laden: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Uraian Aktivitas Pengerjaan Hari Ini
                </label>
                <textarea
                  required
                  rows={3}
                  value={newLog.uraianPekerjaan}
                  onChange={(e) => setNewLog({ ...newLog, uraianPekerjaan: e.target.value })}
                  placeholder="Contoh: Pemasangan bata hebel sisi timur, pengecoran ringbalk atas, perakitan kuda-kuda rangka baja..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Estimasi Bobot Tambahan (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newLog.progresHariIniPersen}
                    onChange={(e) =>
                      setNewLog({ ...newLog, progresHariIniPersen: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Material Masuk Hari Ini
                  </label>
                  <input
                    type="text"
                    value={newLog.catatanMaterial}
                    onChange={(e) => setNewLog({ ...newLog, catatanMaterial: e.target.value })}
                    placeholder="Misal: 50 sak semen mortar hebel"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kendala & Solusi Lapangan (Opsional)
                </label>
                <input
                  type="text"
                  value={newLog.kendalaDanSolusi}
                  onChange={(e) => setNewLog({ ...newLog, kendalaDanSolusi: e.target.value })}
                  placeholder="Misal: Hujan sore hari, pekerja dialihkan acian bagian dalam..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddDailyModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                >
                  Simpan Jurnal Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
