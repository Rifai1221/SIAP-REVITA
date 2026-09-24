import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Landmark,
  Coins,
  Plus,
  ArrowRightLeft,
  Search,
  Filter,
  Trash2,
  Printer,
  Calendar,
  ShieldCheck,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { CashTransaction, CashType, ExpenseCategory, TransactionType } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';

type LedgerType = 'BKU' | 'BANK' | 'TUNAI';

interface CashBooksProps {
  onOpenTransferModal: () => void;
  onOpenAddTxModal: () => void;
}

export const CashBooks: React.FC<CashBooksProps> = ({
  onOpenTransferModal,
  onOpenAddTxModal,
}) => {
  const { projectInfo, transactions, summary, deleteTransaction } = useProject();

  const [activeLedger, setActiveLedger] = useState<LedgerType>('BKU');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Filter transactions based on active ledger
  const rawFilteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (activeLedger === 'BANK') {
      list = list.filter((t) => t.jenisKas === 'BANK');
    } else if (activeLedger === 'TUNAI') {
      list = list.filter((t) => t.jenisKas === 'TUNAI');
    }

    // Sort by date ascending for chronological ledger running balance
    list.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.uraian.toLowerCase().includes(q) ||
          t.noBukti.toLowerCase().includes(q) ||
          (t.penerimaAtauPemberi && t.penerimaAtauPemberi.toLowerCase().includes(q)) ||
          (t.keterangan && t.keterangan.toLowerCase().includes(q))
      );
    }

    // Transaction Type filter
    if (filterType !== 'ALL') {
      list = list.filter((t) => t.jenisTransaksi === filterType);
    }

    // Month filter
    if (selectedMonth !== 'ALL') {
      list = list.filter((t) => t.tanggal.startsWith(selectedMonth));
    }

    return list;
  }, [transactions, activeLedger, searchTerm, filterType, selectedMonth]);

  // Compute running balance for each row
  let runningBalance = 0;
  const ledgerRows = rawFilteredTransactions.map((tx) => {
    const isPenerimaan = tx.jenisTransaksi === 'PENERIMAAN';
    if (isPenerimaan) {
      runningBalance += tx.nominal;
    } else {
      runningBalance -= tx.nominal;
    }
    return {
      ...tx,
      saldoBerjalan: runningBalance,
    };
  });

  const totalPenerimaan = rawFilteredTransactions
    .filter((t) => t.jenisTransaksi === 'PENERIMAAN')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = rawFilteredTransactions
    .filter((t) => t.jenisTransaksi === 'PENGELUARAN')
    .reduce((sum, t) => sum + t.nominal, 0);

  const saldoAkhir = totalPenerimaan - totalPengeluaran;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Quick Actions */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800">
                Administrasi Penatausahaan Keuangan Revitalisasi
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Pembukuan Kas (BKU, Bank & Tunai)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan mutasi kas terintegrasi dengan validasi saldo otomatis
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddTxModal}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Transaksi</span>
            </button>
            <button
              onClick={onOpenTransferModal}
              className="px-3.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-600" />
              <span>Tarik Tunai dari Bank</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Buku</span>
            </button>
          </div>
        </div>

        {/* Ledger Mode Segmented Control Tabs */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveLedger('BKU')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeLedger === 'BKU'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Buku Kas Umum (BKU)</span>
            <span className="ml-1 text-[11px] font-mono tabular-nums opacity-90">
              ({formatRupiah(summary.saldoBKU)})
            </span>
          </button>

          <button
            onClick={() => setActiveLedger('BANK')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeLedger === 'BANK'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Buku Pembantu Kas Bank</span>
            <span className="ml-1 text-[11px] font-mono tabular-nums opacity-90">
              ({formatRupiah(summary.saldoBank)})
            </span>
          </button>

          <button
            onClick={() => setActiveLedger('TUNAI')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeLedger === 'TUNAI'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Buku Pembantu Kas Tunai</span>
            <span className="ml-1 text-[11px] font-mono tabular-nums opacity-90">
              ({formatRupiah(summary.saldoTunai)})
            </span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari uraian, no. bukti, rekanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="PENERIMAAN">Penerimaan Saja (+)</option>
              <option value="PENGELUARAN">Pengeluaran Saja (-)</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Bulan</option>
              <option value="2026-02">Februari 2026</option>
              <option value="2026-03">Maret 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-05">Mei 2026</option>
            </select>
          </div>
        </div>

        {/* Real-time Budget Pagu & Absorption Strip */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-slate-500">Pagu Total Anggaran: </span>
              <strong className="font-mono font-bold text-slate-900">{formatRupiah(projectInfo.totalPaguAnggaran)}</strong>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-slate-500">Total Pengeluaran Riil: </span>
              <strong className="font-mono font-bold text-rose-700">{formatRupiah(summary.totalSerapanAnggaran)}</strong>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-slate-500">Sisa Anggaran Tersedia: </span>
              <strong className="font-mono font-bold text-emerald-800">{formatRupiah(summary.sisaPaguAnggaran)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Serapan: {summary.persentaseSerapanAnggaran.toFixed(1)}%</span>
            <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, summary.persentaseSerapanAnggaran)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs print:p-0 print:border-0">
        {/* Printable Official Header */}
        <div className="text-center mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-xs uppercase font-bold tracking-widest text-slate-700">
            {projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi}
            {projectInfo.dataSekolah?.npsn && ` (NPSN: ${projectInfo.dataSekolah.npsn})`}
          </h2>
          <h1 className="text-lg font-bold text-slate-900 uppercase mt-0.5">
            {activeLedger === 'BKU' && 'BUKU KAS UMUM (BKU) — P2SP'}
            {activeLedger === 'BANK' && 'BUKU PEMBANTU KAS BANK — P2SP'}
            {activeLedger === 'TUNAI' && 'BUKU PEMBANTU KAS TUNAI — P2SP'}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Kegiatan: {projectInfo.namaProyek} · Tahun Anggaran {projectInfo.tahunAnggaran}
          </p>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-1">
            <span>Lokasi: {projectInfo.alamatLengkap?.jalan || projectInfo.lokasi}, Ds. {projectInfo.desa}</span>
            {activeLedger === 'BANK' && (
              <span>Bank: {projectInfo.namaBank} (No. Rek: {projectInfo.nomorRekeningBank})</span>
            )}
            <span>Pagu: {formatRupiah(projectInfo.totalPaguAnggaran)}</span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-slate-800 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-2 text-center w-10">No</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Tanggal</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">No. Bukti</th>
                <th className="py-2.5 px-2 text-center">Kode</th>
                <th className="py-2.5 px-3 min-w-[220px]">Uraian Transaksi</th>
                <th className="py-2.5 px-2.5">Rekanan / Penerima</th>
                <th className="py-2.5 px-3 text-right">Penerimaan (Rp)</th>
                <th className="py-2.5 px-3 text-right">Pengeluaran (Rp)</th>
                <th className="py-2.5 px-3 text-right">Saldo (Rp)</th>
                <th className="no-print py-2.5 px-2 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Tidak ada catatan transaksi pada filter ini.
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row, idx) => {
                  const isPenerimaan = row.jenisTransaksi === 'PENERIMAAN';
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700">
                        {formatTanggalIndo(row.tanggal)}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-900 whitespace-nowrap font-medium">
                        {row.noBukti}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500 text-[11px]">
                        {row.kodeAkun || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        <div className="font-medium leading-relaxed">{row.uraian}</div>
                        {row.keterangan && (
                          <div className="text-[11px] text-slate-500">{row.keterangan}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-700">
                        {row.penerimaAtauPemberi || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-medium">
                        {isPenerimaan ? formatRupiah(row.nominal, false) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-medium">
                        {!isPenerimaan ? formatRupiah(row.nominal, false) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatRupiah(row.saldoBerjalan, false)}
                      </td>
                      <td className="no-print py-2.5 px-2 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus transaksi "${row.uraian}"?`)) {
                              deleteTransaction(row.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                <td colSpan={6} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                  Jumlah Kumulatif Periode Ini:
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-800 text-xs">
                  {formatRupiah(totalPenerimaan)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 text-xs">
                  {formatRupiah(totalPengeluaran)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-blue-900 text-sm">
                  {formatRupiah(saldoAkhir)}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Reconciliation Summary Note */}
        <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-900 block mb-1">
              Catatan Penutupan Kas:
            </span>
            <p>
              Buku kas ini ditutup dengan saldo akhir sebesar{' '}
              <strong className="text-slate-900 font-mono">{formatRupiah(saldoAkhir)}</strong>.
              Seluruh transaksi telah diverifikasi dengan bukti fisik yang sah (kwitansi toko, SPJ honor pekerja, dan mutasi bank).
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="font-semibold text-slate-900 block mb-1">
              Validasi Keseimbangan Kas:
            </span>
            <div className="text-slate-600">
              Saldo Kas Bank: <strong className="font-mono">{formatRupiah(summary.saldoBank)}</strong>
            </div>
            <div className="text-slate-600">
              Saldo Kas Tunai: <strong className="font-mono">{formatRupiah(summary.saldoTunai)}</strong>
            </div>
            <div className="text-slate-900 font-semibold pt-1 border-t border-slate-200">
              Total Kas Fisik: <strong className="font-mono">{formatRupiah(summary.saldoBank + summary.saldoTunai)}</strong>
            </div>
          </div>
        </div>

        {/* Official Signatures Section for Printing */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-800 print:mt-16">
          <div>
            <p>Mengetahui / Menyetujui,</p>
            <p className="font-bold">Ketua Tim Pelaksana (P2SP)</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">
              {projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK}
            </p>
            <p className="text-slate-500">
              {projectInfo.timP2sp?.ketuaP2sp?.jabatanAsal || 'Ketua P2SP'}
            </p>
          </div>

          <div>
            <p>{projectInfo.alamatLengkap?.desaKelurahan || projectInfo.desa}, {formatTanggalIndo(new Date().toISOString().split('T')[0])}</p>
            <p className="font-bold">Bendahara Tim P2SP</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">
              {projectInfo.timP2sp?.bendahara?.nama || projectInfo.namaBendahara}
            </p>
            <p className="text-slate-500">
              {projectInfo.timP2sp?.bendahara?.jabatanAsal || 'Bendahara Pengeluaran'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
