import React, { useState } from 'react';
import {
  FileCheck,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Table,
  Layers,
  Award,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah, formatTanggalIndo, terbilangRupiah } from '../utils/terbilang';

export const LPJReport: React.FC = () => {
  const {
    projectInfo,
    transactions,
    summary,
    wbsList,
    kwitansiList,
    payrollHarian,
    payrollBorongan,
  } = useProject();

  const [activeSection, setActiveSection] = useState<'ALL' | 'BERITA_ACARA' | 'RAB' | 'BKU' | 'KWITANSI' | 'UPAH'>('ALL');

  // Breakdown expenditures by category
  const materialExpenses = transactions
    .filter((t) => t.kategori === 'BELANJA_MATERIAL')
    .reduce((sum, t) => sum + t.nominal, 0);

  const wageExpenses = transactions
    .filter((t) => t.kategori === 'UPAH_TUKANG')
    .reduce((sum, t) => sum + t.nominal, 0);

  const operationalExpenses = transactions
    .filter((t) => t.kategori === 'OPERASIONAL' || t.kategori === 'SEWA_ALAT')
    .reduce((sum, t) => sum + t.nominal, 0);

  const taxBankExpenses = transactions
    .filter((t) => t.kategori === 'PAJAK_RETRIBUSI' || t.kategori === 'BUNGA_BANK' || t.kategori === 'LAIN_LAIN')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalRealisasi = materialExpenses + wageExpenses + operationalExpenses + taxBankExpenses;
  const sisaPagu = projectInfo.totalPaguAnggaran - totalRealisasi;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Control Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sistem Pembuatan LPJ Keuangan Otomatis & Terverifikasi</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Laporan Pertanggungjawaban (LPJ) Revitalisasi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kompilasi akuntabilitas lengkap: Berita Acara Kas, Realisasi Anggaran, BKU Terpadu, Kwitansi, dan SPJ Upah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                summary.isBalanceSynced
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {summary.isBalanceSynced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Validitas: 100% Seimbang & Akurat</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Perlu Cek Selisih Kas</span>
                </>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF Dokumen LPJ Resmi</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs for Screen View */}
        <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveSection('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Bagian (Lengkap)
          </button>
          <button
            onClick={() => setActiveSection('BERITA_ACARA')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'BERITA_ACARA'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Berita Acara Kas
          </button>
          <button
            onClick={() => setActiveSection('RAB')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'RAB'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Realisasi Anggaran (RAB)
          </button>
          <button
            onClick={() => setActiveSection('BKU')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'BKU'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Rekap BKU Kas
          </button>
          <button
            onClick={() => setActiveSection('KWITANSI')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'KWITANSI'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Rekap Kwitansi Bahan
          </button>
          <button
            onClick={() => setActiveSection('UPAH')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'UPAH'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. Rekap Honor Tukang
          </button>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL LPJ BOOKLET */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-xs text-slate-900 print:p-0 print:border-0 print:shadow-none space-y-12">
        {/* KOP SURAT FORMAL */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-4">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-600">
            PEMERINTAH {projectInfo.alamatLengkap?.kabupatenKota?.toUpperCase() || projectInfo.kabupaten.toUpperCase()} · DINAS PENDIDIKAN
          </h3>
          <h2 className="text-base sm:text-lg uppercase font-black text-slate-900 tracking-tight mt-0.5">
            {projectInfo.dataSekolah?.namaSekolah?.toUpperCase() || projectInfo.namaInstansi.toUpperCase()}
          </h2>
          <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-emerald-900 mt-0.5">
            PANITIA PEMBANGUNAN SATUAN PENDIDIKAN (P2SP) — TA {projectInfo.tahunAnggaran}
          </h1>
          <p className="text-[11px] text-slate-600 mt-1">
            NPSN: {projectInfo.dataSekolah?.npsn || '-'} · Alamat: {projectInfo.alamatLengkap?.jalan || projectInfo.lokasi}, Desa/Kel. {projectInfo.desa}, Kec. {projectInfo.kecamatan}, {projectInfo.alamatLengkap?.kabupatenKota || projectInfo.kabupaten}, Prov. {projectInfo.provinsi}
          </p>
        </div>

        {/* COVER / JUDUL DOKUMEN */}
        <div className="text-center py-4 space-y-2">
          <div className="inline-block px-3 py-1 bg-slate-100 rounded text-xs font-bold font-mono uppercase tracking-wider text-slate-800">
            DOKUMEN RESMI PERTANGGUNGJAWABAN (LPJ)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900 max-w-2xl mx-auto">
            LAPORAN PERTANGGUNGJAWABAN REALISASI KEUANGAN & FISIK
          </h2>
          <p className="text-sm font-semibold text-emerald-800">
            {projectInfo.namaProyek}
          </p>
          <p className="text-xs text-slate-600">
            Tahun Anggaran: {projectInfo.tahunAnggaran} · Surat Keputusan / Tugas No: {projectInfo.nomorSuratTugas}
          </p>
        </div>

        {/* BAGIAN I: BERITA ACARA PEMERIKSAAN KAS */}
        {(activeSection === 'ALL' || activeSection === 'BERITA_ACARA') && (
          <div className="space-y-4 pt-4 border-t border-slate-200 print:page-break-after">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider underline">
                BERITA ACARA PEMERIKSAAN DAN REKONSILIASI KAS
              </h3>
              <p className="text-xs font-mono text-slate-600">
                Nomor: BA-KAS/{projectInfo.tahunAnggaran}/REV/001
              </p>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 text-justify">
              Pada hari ini, tanggal <strong>{formatTanggalIndo(new Date().toISOString().split('T')[0])}</strong>, bertempat di Kantor Sekretariat Tim Pelaksana Kegiatan (TPK) Revitalisasi Desa {projectInfo.desa}, kami yang bertanda tangan di bawah ini telah melakukan pemeriksaan dan rekonsiliasi kas atas pelaksanaan kegiatan <strong>{projectInfo.namaProyek}</strong> dengan hasil sebagai berikut:
            </p>

            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2.5 text-xs">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-6 font-medium text-slate-700">1. Total Penerimaan Kas Program (Tahap I):</span>
                <span className="col-span-6 font-mono font-bold text-right text-slate-900">{formatRupiah(summary.penerimaanBKU)}</span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-6 font-medium text-slate-700">2. Total Pengeluaran Riil (Material, Upah, Operasional):</span>
                <span className="col-span-6 font-mono font-bold text-right text-slate-900">{formatRupiah(summary.pengeluaranBKU)}</span>
              </div>
              <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-300">
                <span className="col-span-6 font-bold text-slate-900">3. Sisa Saldo Kas Menurut Buku Kas Umum (BKU):</span>
                <span className="col-span-6 font-mono font-bold text-right text-blue-900 text-sm">{formatRupiah(summary.saldoBKU)}</span>
              </div>
              <div className="text-[11px] italic text-slate-600 pl-4">
                Terbilang: #{terbilangRupiah(summary.saldoBKU)}#
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800">4. Posisi Saldo Kas Nyata (Hasil Pemeriksaan Fisik Brankas & Rekening):</div>
                <div className="grid grid-cols-12 gap-2 pl-4 text-slate-600">
                  <span className="col-span-6">a. Saldo Kas di Bank ({projectInfo.namaBank}):</span>
                  <span className="col-span-6 font-mono text-right">{formatRupiah(summary.saldoBank)}</span>
                </div>
                <div className="grid grid-cols-12 gap-2 pl-4 text-slate-600">
                  <span className="col-span-6">b. Saldo Kas Tunai di Brankas Bendahara:</span>
                  <span className="col-span-6 font-mono text-right">{formatRupiah(summary.saldoTunai)}</span>
                </div>
                <div className="grid grid-cols-12 gap-2 pl-4 font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span className="col-span-6">Jumlah Kas Nyata (a + b):</span>
                  <span className="col-span-6 font-mono text-right">{formatRupiah(summary.saldoBank + summary.saldoTunai)}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-300 font-bold">
                <span className="col-span-6 text-emerald-800">5. Selisih Saldo Kas (BKU vs Kas Nyata):</span>
                <span className="col-span-6 font-mono text-right text-emerald-800">
                  {summary.selisihSaldo === 0 ? 'Rp 0 (NIHIL / 100% SESUAI & SINKRON)' : formatRupiah(summary.selisihSaldo)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Demikian Berita Acara Pemeriksaan Kas ini dibuat dengan sebenarnya dan ditandatangani oleh Tim Pemeriksa serta Penanggung Jawab Kegiatan untuk dipergunakan sebagai kelengkapan dokumen Laporan Pertanggungjawaban (LPJ).
            </p>

            {/* Tripartite Signatures P2SP */}
            <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs text-slate-900">
              <div>
                <p>Mengetahui / Mengesahkan,</p>
                <p className="font-bold">Kepala Sekolah / Penanggung Jawab</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">
                  {projectInfo.timP2sp?.penanggungJawab?.nama || projectInfo.namaPimpinan}
                </p>
                <p className="text-[10px] text-slate-500">
                  NIP: {projectInfo.timP2sp?.penanggungJawab?.nipNik || '-'}
                </p>
              </div>

              <div>
                <p>Panitia Pembangunan (P2SP),</p>
                <p className="font-bold">Ketua Tim P2SP</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">
                  {projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK}
                </p>
                <p className="text-[10px] text-slate-500">
                  {projectInfo.timP2sp?.ketuaP2sp?.jabatanAsal || 'Ketua Pelaksana P2SP'}
                </p>
              </div>

              <div>
                <p>{projectInfo.alamatLengkap?.desaKelurahan || projectInfo.desa}, {formatTanggalIndo(new Date().toISOString().split('T')[0])}</p>
                <p className="font-bold">Bendahara Tim P2SP</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">
                  {projectInfo.timP2sp?.bendahara?.nama || projectInfo.namaBendahara}
                </p>
                <p className="text-[10px] text-slate-500">
                  {projectInfo.timP2sp?.bendahara?.jabatanAsal || 'Bendahara Pengeluaran'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BAGIAN II: LAPORAN REALISASI ANGGARAN (RAB VS REALISASI) */}
        {(activeSection === 'ALL' || activeSection === 'RAB') && (
          <div className="space-y-4 pt-6 border-t-2 border-slate-800 print:page-break-after">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                BAGIAN II: LAPORAN REALISASI ANGGARAN (RAB VS REALISASI)
              </h3>
              <p className="text-xs text-slate-600">
                Perbandingan alokasi rencana anggaran biaya dengan serapan pengeluaran riil di lapangan
              </p>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-400">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-2 border border-slate-400 text-center w-8">No</th>
                  <th className="py-2.5 px-3 border border-slate-400">Pos / Kategori Anggaran Belanja</th>
                  <th className="py-2.5 px-3 border border-slate-400 text-right">Pagu Anggaran RAB</th>
                  <th className="py-2.5 px-3 border border-slate-400 text-right">Realisasi Pengeluaran</th>
                  <th className="py-2.5 px-3 border border-slate-400 text-right">Sisa Anggaran</th>
                  <th className="py-2.5 px-2 border border-slate-400 text-center">% Serapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">1</td>
                  <td className="py-2.5 px-3 border border-slate-400 font-semibold">
                    Belanja Bahan & Material Bangunan (Semen, Besi, Hebel, Baja Ringan, dll)
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">Rp 115.000.000</td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(materialExpenses, false)}
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">
                    {formatRupiah(115000000 - materialExpenses, false)}
                  </td>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">
                    {((materialExpenses / 115000000) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">2</td>
                  <td className="py-2.5 px-3 border border-slate-400 font-semibold">
                    Belanja Upah & Honor Tenaga Kerja (Mandor, Tukang, Laden & Borongan)
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">Rp 55.000.000</td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(wageExpenses, false)}
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">
                    {formatRupiah(55000000 - wageExpenses, false)}
                  </td>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">
                    {((wageExpenses / 55000000) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">3</td>
                  <td className="py-2.5 px-3 border border-slate-400 font-semibold">
                    Belanja Sewa Alat Kerja & Operasional TPK
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">Rp 12.000.000</td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(operationalExpenses, false)}
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">
                    {formatRupiah(12000000 - operationalExpenses, false)}
                  </td>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">
                    {operationalExpenses > 0 ? ((operationalExpenses / 12000000) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">4</td>
                  <td className="py-2.5 px-3 border border-slate-400 font-semibold">
                    Biaya Administrasi Bank & Pajak
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">Rp 3.000.000</td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(taxBankExpenses, false)}
                  </td>
                  <td className="py-2.5 px-3 border border-slate-400 text-right font-mono">
                    {formatRupiah(3000000 - taxBankExpenses, false)}
                  </td>
                  <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">
                    {((taxBankExpenses / 3000000) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-600 text-xs">
                  <td colSpan={2} className="py-3 px-3 border border-slate-400 text-right uppercase">
                    Jumlah Total Pagu & Realisasi:
                  </td>
                  <td className="py-3 px-3 border border-slate-400 text-right font-mono text-slate-900">
                    {formatRupiah(projectInfo.totalPaguAnggaran)}
                  </td>
                  <td className="py-3 px-3 border border-slate-400 text-right font-mono text-emerald-800 text-sm">
                    {formatRupiah(totalRealisasi)}
                  </td>
                  <td className="py-3 px-3 border border-slate-400 text-right font-mono text-slate-700">
                    {formatRupiah(sisaPagu)}
                  </td>
                  <td className="py-3 px-2 border border-slate-400 text-center font-mono text-sm">
                    {summary.persentaseSerapanAnggaran.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* BAGIAN III: REKAPITULASI BUKU KAS UMUM (BKU) */}
        {(activeSection === 'ALL' || activeSection === 'BKU') && (
          <div className="space-y-4 pt-6 border-t-2 border-slate-800 print:page-break-after">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  BAGIAN III: REKAPITULASI BUKU KAS UMUM (BKU)
                </h3>
                <p className="text-xs text-slate-600">
                  Arsip kronologis seluruh mutasi keuangan proyek revitalisasi
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">
                Total Mutasi: {transactions.length} Transaksi
              </span>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-400">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-1 border border-slate-400 text-center w-8">No</th>
                  <th className="py-2 px-2 border border-slate-400">Tanggal</th>
                  <th className="py-2 px-2 border border-slate-400">No. Bukti</th>
                  <th className="py-2 px-3 border border-slate-400">Uraian Transaksi</th>
                  <th className="py-2 px-1 border border-slate-400 text-center">Kas</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Penerimaan</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {transactions.map((tx, idx) => (
                  <tr key={tx.id}>
                    <td className="py-1.5 px-1 border border-slate-400 text-center font-mono">{idx + 1}</td>
                    <td className="py-1.5 px-2 border border-slate-400 whitespace-nowrap">{tx.tanggal}</td>
                    <td className="py-1.5 px-2 border border-slate-400 font-mono font-medium">{tx.noBukti}</td>
                    <td className="py-1.5 px-3 border border-slate-400">{tx.uraian}</td>
                    <td className="py-1.5 px-1 border border-slate-400 text-center font-semibold text-[10px]">{tx.jenisKas}</td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono text-emerald-800">
                      {tx.jenisTransaksi === 'PENERIMAAN' ? formatRupiah(tx.nominal, false) : '-'}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono text-slate-900">
                      {tx.jenisTransaksi === 'PENGELUARAN' ? formatRupiah(tx.nominal, false) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-600 text-xs">
                  <td colSpan={5} className="py-2.5 px-3 border border-slate-400 text-right uppercase">
                    Saldo Akhir Kas Terintegrasi (BKU):
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 border border-slate-400 text-right font-mono text-blue-900 text-sm">
                    {formatRupiah(summary.saldoBKU)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* BAGIAN IV: REKAPITULASI KWITANSI BELANJA MATERIAL */}
        {(activeSection === 'ALL' || activeSection === 'KWITANSI') && (
          <div className="space-y-4 pt-6 border-t-2 border-slate-800 print:page-break-after">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                BAGIAN IV: DAFTAR BUKTI KWITANSI BELANJA MATERIAL & PERALATAN
              </h3>
              <p className="text-xs text-slate-600">
                Bukti sah transaksi faktur dan kwitansi dari toko bangunan/rekanan penyedia material
              </p>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-400">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-1 border border-slate-400 text-center w-8">No</th>
                  <th className="py-2 px-2 border border-slate-400">No. Kwitansi</th>
                  <th className="py-2 px-2 border border-slate-400">Tanggal</th>
                  <th className="py-2 px-2 border border-slate-400">Toko Penyedia / Rekanan</th>
                  <th className="py-2 px-3 border border-slate-400">Uraian Belanja Material</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Nilai Pembayaran</th>
                  <th className="py-2 px-1 border border-slate-400 text-center">Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {kwitansiList.map((kwt, idx) => (
                  <tr key={kwt.id}>
                    <td className="py-2 px-1 border border-slate-400 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono font-bold">{kwt.nomorKwitansi}</td>
                    <td className="py-2 px-2 border border-slate-400 whitespace-nowrap">{kwt.tanggal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-semibold text-slate-800">{kwt.penerimaNama}</td>
                    <td className="py-2 px-3 border border-slate-400">{kwt.untukPembayaran}</td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(kwt.uangSebanyak)}
                    </td>
                    <td className="py-2 px-1 border border-slate-400 text-center text-[10px] font-semibold">{kwt.jenisKasPembayaran}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-600 text-xs">
                  <td colSpan={5} className="py-2.5 px-3 border border-slate-400 text-right uppercase">
                    Total Belanja Material:
                  </td>
                  <td colSpan={2} className="py-2.5 px-2 border border-slate-400 text-right font-mono text-sm text-slate-900">
                    {formatRupiah(kwitansiList.reduce((sum, k) => sum + k.uangSebanyak, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* BAGIAN V: REKAPITULASI HONOR TUKANG */}
        {(activeSection === 'ALL' || activeSection === 'UPAH') && (
          <div className="space-y-4 pt-6 border-t-2 border-slate-800">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                BAGIAN V: DAFTAR NOMINATIF HONORARIUM UPAH TUKANG (HARIAN & BORONGAN)
              </h3>
              <p className="text-xs text-slate-600">
                Rekapitulasi tanda terima SPJ upah pekerja mingguan dan pencairan termin borongan
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">1. Upah Harian Tenaga Kerja (SPJ Mingguan):</h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-400">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-1 border border-slate-400 text-center w-8">No</th>
                    <th className="py-2 px-2 border border-slate-400">No. SPJ</th>
                    <th className="py-2 px-2 border border-slate-400">Periode Pelaksanaan</th>
                    <th className="py-2 px-3 border border-slate-400">Uraian Pekerjaan Bangunan</th>
                    <th className="py-2 px-1 border border-slate-400 text-center">Jml Pekerja</th>
                    <th className="py-2 px-2 border border-slate-400 text-right">Total Upah (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollHarian.map((batch, idx) => (
                    <tr key={batch.id}>
                      <td className="py-1.5 px-1 border border-slate-400 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2 border border-slate-400 font-mono font-bold">{batch.noSpj}</td>
                      <td className="py-1.5 px-2 border border-slate-400">{batch.periodeAwal} s/d {batch.periodeAkhir}</td>
                      <td className="py-1.5 px-3 border border-slate-400">{batch.pekerjaanTerkait}</td>
                      <td className="py-1.5 px-1 border border-slate-400 text-center font-mono">{batch.workers.length} Org</td>
                      <td className="py-1.5 px-2 border border-slate-400 text-right font-mono font-bold">{formatRupiah(batch.totalDibayarkan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-xs font-bold text-slate-800 uppercase pt-2">2. Upah Borongan (SPK / Termin):</h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-400">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-1 border border-slate-400 text-center w-8">No</th>
                    <th className="py-2 px-2 border border-slate-400">No. SPK</th>
                    <th className="py-2 px-2 border border-slate-400">Mandor Pelaksana</th>
                    <th className="py-2 px-3 border border-slate-400">Pekerjaan Borongan</th>
                    <th className="py-2 px-2 border border-slate-400">Tahap Termin</th>
                    <th className="py-2 px-2 border border-slate-400 text-right">Nominal Dibayar (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollBorongan.map((brg, idx) => (
                    <tr key={brg.id}>
                      <td className="py-1.5 px-1 border border-slate-400 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-2 border border-slate-400 font-mono font-bold">{brg.noKontrak}</td>
                      <td className="py-1.5 px-2 border border-slate-400 font-medium">{brg.namaMandor}</td>
                      <td className="py-1.5 px-3 border border-slate-400">{brg.itemPekerjaan}</td>
                      <td className="py-1.5 px-2 border border-slate-400">{brg.tahapTermin}</td>
                      <td className="py-1.5 px-2 border border-slate-400 text-right font-mono font-bold">{formatRupiah(brg.nominalTermin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Signatures P2SP */}
            <div className="pt-10 space-y-8 text-center text-xs text-slate-900 print:mt-12">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p>Mengetahui / Mengesahkan,</p>
                  <p className="font-bold">Kepala Satuan Pendidikan / Penanggung Jawab</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">
                    {projectInfo.timP2sp?.penanggungJawab?.nama || projectInfo.namaPimpinan}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    NIP: {projectInfo.timP2sp?.penanggungJawab?.nipNik || '-'}
                  </p>
                </div>

                <div>
                  <p>Diverifikasi & Dampingi Oleh,</p>
                  <p className="font-bold">Fasilitator Teknis Dinas Pendidikan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">
                    {projectInfo.timP2sp?.fasilitator?.nama || 'Fasilitator Teknis'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    NIP/NIK: {projectInfo.timP2sp?.fasilitator?.nipNik || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                <div>
                  <p>Diperiksa Teknis Lapangan,</p>
                  <p className="font-bold">Pengawas Teknis P2SP</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">
                    {projectInfo.timP2sp?.pengawas?.nama || 'Pengawas Teknis'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {projectInfo.timP2sp?.pengawas?.jabatanAsal || 'Pengawas Lapangan'}
                  </p>
                </div>

                <div>
                  <p>Panitia Pembangunan (P2SP),</p>
                  <p className="font-bold">Ketua Tim P2SP</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">
                    {projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {projectInfo.timP2sp?.ketuaP2sp?.jabatanAsal || 'Ketua Komite'}
                  </p>
                </div>

                <div>
                  <p>{projectInfo.alamatLengkap?.desaKelurahan || projectInfo.desa}, {formatTanggalIndo(new Date().toISOString().split('T')[0])}</p>
                  <p className="font-bold">Bendahara Tim P2SP</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline uppercase">
                    {projectInfo.timP2sp?.bendahara?.nama || projectInfo.namaBendahara}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {projectInfo.timP2sp?.bendahara?.jabatanAsal || 'Bendahara P2SP'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
