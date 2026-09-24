import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  Coins,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Users,
  FileSpreadsheet,
  Calendar,
  Building,
  Edit3,
  Check,
  X,
  PiggyBank,
  School,
  Users2,
  FolderDown,
  Upload,
  Layers,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';
import { NavTab } from '../types';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTransferModal: () => void;
  onOpenAddTxModal: () => void;
  onOpenWorkspaceManager?: (tab?: 'switcher' | 'upload' | 'download' | 'pin') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenTransferModal,
  onOpenAddTxModal,
  onOpenWorkspaceManager,
}) => {
  const {
    projectInfo,
    updateProjectInfo,
    summary,
    transactions,
    wbsList,
    dailyLogs,
    activeNpsn,
    activeWorkspace,
    workspaces,
    exportProjectFile,
    hasUnsavedExportChanges,
    lastExportedAt,
  } = useProject();

  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [tempPagu, setTempPagu] = useState(projectInfo.totalPaguAnggaran.toString());

  const handleSavePagu = () => {
    const val = parseInt(tempPagu.replace(/[^0-9]/g, ''), 10) || 0;
    if (val <= 0) {
      alert('Total Pagu Anggaran harus lebih besar dari Rp 0');
      return;
    }
    updateProjectInfo({ totalPaguAnggaran: val });
    setIsEditingPagu(false);
  };

  const handleCancelPagu = () => {
    setTempPagu(projectInfo.totalPaguAnggaran.toString());
    setIsEditingPagu(false);
  };

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  const latestDailyLog = dailyLogs[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace & Portable File Quick Hub Strip */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white">
                Workspace Aktif: {projectInfo.dataSekolah?.namaSekolah || activeWorkspace?.namaSekolah}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 font-mono text-[11px] font-bold border border-emerald-400/30">
                NPSN {activeNpsn}
              </span>
              <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
                (Prefix: <code>sekolah_{activeNpsn}_*</code>)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Tersedia {workspaces.length} profil sekolah di browser ini. Data terisolasi 100% tanpa risiko tertukar.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={() => onOpenWorkspaceManager?.('switcher')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ganti Sekolah ({workspaces.length})</span>
          </button>

          <button
            onClick={() => exportProjectFile('revita')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Download Berkas Proyek Mandiri .revita"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>Simpan .revita</span>
            {hasUnsavedExportChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onOpenWorkspaceManager?.('upload')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Buka Berkas Sekolah dari Laptop/WhatsApp"
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>Buka Berkas</span>
          </button>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Program Revitalisasi Satuan Pendidikan (P2SP) · TA {projectInfo.tahunAnggaran}</span>
              {projectInfo.dataSekolah?.npsn && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-bold text-[10px]">
                  NPSN: {projectInfo.dataSekolah.npsn}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi}
            </h1>
            <p className="text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-slate-800">{projectInfo.namaProyek}</span>
              <span className="text-slate-300">|</span>
              <span>Lokasi: {projectInfo.alamatLengkap?.jalan || projectInfo.lokasi}, Ds. {projectInfo.desa}</span>
              <span className="text-slate-300">|</span>
              <span>SK P2SP: {projectInfo.dataSekolah?.nomorSkP2sp || projectInfo.nomorSuratTugas}</span>
            </p>

            {/* Quick Interactive Total Pagu Banner Strip */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">Total Pagu Penerimaan (Anggaran Tersedia):</span>
              {isEditingPagu ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">Rp</span>
                  <input
                    type="number"
                    value={tempPagu}
                    onChange={(e) => setTempPagu(e.target.value)}
                    className="w-44 px-2 py-1 border border-emerald-500 rounded font-mono font-bold text-slate-900 text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
                    placeholder="Contoh: 185000000"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSavePagu}
                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-2xs"
                    title="Simpan Pagu Anggaran"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPagu}
                    className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                    title="Batal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <strong className="text-sm sm:text-base font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {formatRupiah(projectInfo.totalPaguAnggaran)}
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      setTempPagu(projectInfo.totalPaguAnggaran.toString());
                      setIsEditingPagu(true);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 hover:underline cursor-pointer bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200"
                    title="Ubah Total Pagu Penerimaan"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Ubah Pagu</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddTxModal}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
            <button
              onClick={onOpenTransferModal}
              className="px-3.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Landmark className="w-4 h-4 text-slate-600" />
              <span>Tarik Tunai Bank</span>
            </button>
            <button
              onClick={() => onNavigate('receipts')}
              className="px-3.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-slate-600" />
              <span>Buat Kwitansi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning if Ledger Out of Sync */}
      {!summary.isBalanceSynced && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Peringatan Rekonsiliasi Saldo Kas!</p>
            <p className="mt-0.5">
              Terdapat selisih antara Saldo Buku Kas Umum ({formatRupiah(summary.saldoBKU)}) dengan akumulasi Saldo Bank + Tunai ({formatRupiah(summary.saldoBank + summary.saldoTunai)}).
              Selisih: {formatRupiah(summary.selisihSaldo)}. Mohon cek mutasi kas internal Anda.
            </p>
          </div>
        </div>
      )}

      {/* Financial & Physical KPI Cards (5 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Pagu Penerimaan (New Main Anchor Card) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Pagu Anggaran Total
              </span>
              <PiggyBank className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(projectInfo.totalPaguAnggaran)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
            <span>Sisa Pagu:</span>
            <strong className="text-emerald-800 font-mono tabular-nums">
              {formatRupiah(summary.sisaPaguAnggaran)}
            </strong>
          </div>
        </div>

        {/* Card 2: Saldo BKU */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Saldo Buku Kas Umum
              </span>
              <Wallet className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(summary.saldoBKU)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
            <span>Masuk: <strong className="text-emerald-700 font-mono tabular-nums">{formatRupiah(summary.penerimaanBKU)}</strong></span>
            <span>Keluar: <strong className="text-rose-700 font-mono tabular-nums">{formatRupiah(summary.pengeluaranBKU)}</strong></span>
          </div>
        </div>

        {/* Card 3: Saldo Kas Bank */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Saldo Kas Bank
              </span>
              <Landmark className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(summary.saldoBank)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 truncate">
            <span>{projectInfo.namaBank} · {projectInfo.nomorRekeningBank}</span>
          </div>
        </div>

        {/* Card 4: Saldo Kas Tunai */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Saldo Kas Tunai
              </span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(summary.saldoTunai)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Brankas TPK</span>
            <button
              onClick={onOpenTransferModal}
              className="text-emerald-700 hover:text-emerald-800 font-medium underline"
            >
              + Tarik Bank
            </button>
          </div>
        </div>

        {/* Card 5: Serapan Anggaran & Bobot Fisik */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-600">
                Serapan vs Fisik
              </span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                {summary.persentaseSerapanAnggaran.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">
                (Fisik: {summary.progresFisikKumulatif.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.persentaseSerapanAnggaran)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (WBS & Progress) vs Right (Recent Transactions & Quick Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Progres Fisik Pekerjaan Bangunan */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Rincian Progres Konstruksi Bangunan (WBS)
                </h2>
                <p className="text-xs text-slate-500">
                  Bobot rencana vs realisasi pengerjaan fisik di lapangan
                </p>
              </div>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Lihat Rekap Lengkap →
              </button>
            </div>

            <div className="space-y-3.5">
              {wbsList.map((item) => {
                const isComplete = item.progresRealisasi >= 100;
                return (
                  <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">
                        {item.kode}. {item.namaPekerjaan}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600">
                        {item.progresRealisasi}% / {item.bobotRencana}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isComplete ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                        style={{ width: `${Math.min(100, item.progresRealisasi)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>RAB: {formatRupiah(item.biayaRAB)}</span>
                      <span>Realisasi Biaya: {formatRupiah(item.biayaRealisasi)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Harian Terakhir */}
          {latestDailyLog && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Laporan Harian Lapangan Terakhir ({formatTanggalIndo(latestDailyLog.tanggal)})
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Cuaca: {latestDailyLog.cuaca} · Minggu Ke-{latestDailyLog.mingguKe}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                {latestDailyLog.uraianPekerjaan}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>
                  Tenaga Kerja: {latestDailyLog.jumlahTenagaKerja.mandor} Mandor,{' '}
                  {latestDailyLog.jumlahTenagaKerja.tukang} Tukang,{' '}
                  {latestDailyLog.jumlahTenagaKerja.laden} Laden
                </span>
                <span>Progres Hari Ini: +{latestDailyLog.progresHariIniPersen}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 Cols): Buku Kas Terkini & Info TPK */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Ledger Entries */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Transaksi Kas Terakhir
                </h2>
                <p className="text-xs text-slate-500">Mutasi Buku Kas Umum & Pembantu</p>
              </div>
              <button
                onClick={() => onNavigate('cashbooks')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Buka BKU →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const isIncome = tx.jenisTransaksi === 'PENERIMAAN';
                return (
                  <div key={tx.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate" title={tx.uraian}>
                        {tx.uraian}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{formatTanggalIndo(tx.tanggal)}</span>
                        <span>·</span>
                        <span className="font-mono">{tx.noBukti}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-600">{tx.jenisKas}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-mono tabular-nums block ${
                          isIncome ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatRupiah(tx.nominal)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {tx.kategori.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tim Pelaksana P2SP (9 Roles) Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-emerald-700" />
                <span>Susunan Tim Pelaksana P2SP (9 Peran)</span>
              </h3>
              <button
                onClick={() => onNavigate('data_master')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors"
              >
                Kelola Data Master →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-blue-700 font-bold block uppercase">1. Penanggung Jawab</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.penanggungJawab?.nama || projectInfo.namaPimpinan}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {projectInfo.timP2sp?.penanggungJawab?.jabatanAsal || 'Kepala Sekolah'}
                </span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">2. Ketua P2SP</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {projectInfo.timP2sp?.ketuaP2sp?.jabatanAsal || 'Ketua Komite'}
                </span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-indigo-700 font-bold block uppercase">3. Sekretaris / Logistik</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.sekretarisLogistik?.nama || 'Sekretaris'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {projectInfo.timP2sp?.sekretarisLogistik?.jabatanAsal || 'Pengelola Logistik'}
                </span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-amber-700 font-bold block uppercase">4. Bendahara</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.bendahara?.nama || projectInfo.namaBendahara}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {projectInfo.timP2sp?.bendahara?.jabatanAsal || 'Bendahara'}
                </span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-orange-700 font-bold block uppercase">5. Kepala Pelaksana</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.kepalaPelaksana?.nama || projectInfo.namaPelaksanaTeknis}
                </span>
                <span className="text-[10px] text-slate-500 block">Pelaksana Lapangan</span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-700 font-bold block uppercase">6. Keamanan</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.keamanan?.nama || 'Petugas Keamanan'}
                </span>
                <span className="text-[10px] text-slate-500 block">Kamtib & Aset</span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-cyan-700 font-bold block uppercase">7. Perencana</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.perencana?.nama || 'Tim Perencana'}
                </span>
                <span className="text-[10px] text-slate-500 block">Gambar & RAB</span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-teal-700 font-bold block uppercase">8. Pengawas</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.pengawas?.nama || 'Tim Pengawas'}
                </span>
                <span className="text-[10px] text-slate-500 block">Mutu & Fisik</span>
              </div>

              <div className="bg-white p-2 border border-slate-200 rounded-lg sm:col-span-2">
                <span className="text-[10px] text-purple-700 font-bold block uppercase">9. Fasilitator Teknis</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {projectInfo.timP2sp?.fasilitator?.nama || 'Fasilitator'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {projectInfo.timP2sp?.fasilitator?.jabatanAsal || 'Pendamping Dinas Pendidikan'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Format P2SP Standar Kemendikbudristek</span>
              </div>
              <button
                onClick={() => onNavigate('data_master')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline"
              >
                Lihat Bagan SK Lengkap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
