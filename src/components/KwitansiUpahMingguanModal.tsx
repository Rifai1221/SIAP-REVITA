import React from 'react';
import {
  X,
  Printer,
  Receipt,
  FileCheck2,
  Users,
  Award,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { WeeklyWageItem } from '../utils/weeklyWagesEngine';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';

interface KwitansiUpahMingguanModalProps {
  isOpen: boolean;
  onClose: () => void;
  wageItem: WeeklyWageItem | null;
  mingguKe: number;
}

export const KwitansiUpahMingguanModal: React.FC<KwitansiUpahMingguanModalProps> = ({
  isOpen,
  onClose,
  wageItem,
  mingguKe,
}) => {
  const { projectInfo } = useProject();

  if (!isOpen || !wageItem) return null;

  const handlePrint = () => {
    window.print();
  };

  const namaSekolah =
    projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi || 'SEKOLAH DASAR NEGERI 01 BABAKAN';
  const kabKota =
    projectInfo.alamatLengkap?.kabupatenKota?.toUpperCase() ||
    projectInfo.kabupaten?.toUpperCase() ||
    'KABUPATEN BOGOR';
  const provinsi =
    projectInfo.alamatLengkap?.provinsi?.toUpperCase() ||
    projectInfo.provinsi?.toUpperCase() ||
    'JAWA BARAT';
  const namaKetua =
    projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK || 'SURYADI, S.Pd.I.';
  const namaBendahara =
    projectInfo.timP2sp?.bendahara?.nama || projectInfo.namaBendahara || 'SITI AMINAH, S.Pd.';
  const tempatTtd =
    projectInfo.alamatLengkap?.desaKelurahan || projectInfo.desa || 'Bogor';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="p-1 rounded bg-emerald-700 text-emerald-100">
              <Receipt className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm">
              Pratinjau Kwitansi / Bukti Pembayaran Resmi ({wageItem.judul})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Physical Receipt Paper */}
        <div className="p-8 sm:p-12 text-slate-900 print:p-0 bg-white">
          {/* KOP RESMI */}
          <div className="border-b-4 border-double border-slate-900 pb-3 text-center mb-6">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              PEMERINTAH {kabKota} · DINAS PENDIDIKAN
            </div>
            <div className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
              {namaSekolah}
            </div>
            <div className="text-xs font-bold uppercase text-emerald-900 tracking-wide">
              PANITIA PEMBANGUNAN SATUAN PENDIDIKAN (P2SP) — TAHUN ANGGARAN {projectInfo.tahunAnggaran || '2026'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Alamat: {projectInfo.alamatLengkap?.jalan || 'Jl. Raya Pendidikan'}, Kec.{' '}
              {projectInfo.alamatLengkap?.kecamatan || projectInfo.kecamatan}, {kabKota} - {provinsi}
            </div>
          </div>

          {/* JUDUL KWITANSI */}
          <div className="text-center mb-6">
            <div className="inline-block border-b-2 border-slate-900 pb-0.5">
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
                {wageItem.pos === 'UPAH_TUKANG'
                  ? 'TANDA BUKTI PEMBAYARAN UPAH KERJA MINGGUAN (SPJ UPAH)'
                  : 'KWITANSI PEMBAYARAN HONORARIUM / JASA MANAJEMEN'}
              </h2>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1">
              Nomor: {wageItem.nomorKwitansi}
            </div>
          </div>

          {/* ISI KWITANSI */}
          <div className="border border-slate-300 rounded-xl p-5 bg-slate-50/50 mb-6 space-y-3.5 text-xs">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold text-slate-600">Telah Terima Dari</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-8 font-bold text-slate-900">
                Bendahara P2SP Program Bantuan Revitalisasi {namaSekolah}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold text-slate-600">Uang Sebanyak</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-8 font-bold font-mono text-emerald-800 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {formatRupiah(wageItem.nominal)}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold text-slate-600">Terbilang</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-8 italic font-semibold text-slate-800 bg-white p-2 rounded border border-slate-200">
                "{wageItem.terbilang} Rupiah"
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold text-slate-600">Untuk Pembayaran</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <div className="col-span-8 text-slate-800 space-y-1">
                <p className="font-semibold">{wageItem.uraian}</p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-1">
                  <span className="bg-slate-200/80 px-2 py-0.5 rounded font-mono">
                    Minggu Ke: <strong>{mingguKe}</strong>
                  </span>
                  <span className="bg-slate-200/80 px-2 py-0.5 rounded font-mono">
                    Bobot Capaian: <strong>{wageItem.bobotMingguIniPersen.toFixed(2)}%</strong>
                  </span>
                  <span className="bg-slate-200/80 px-2 py-0.5 rounded font-mono">
                    Pagu Pos: <strong>{formatRupiah(wageItem.paguAlokasi)}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold text-slate-600">Penerima Hak</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-8 font-bold text-slate-900">
                {wageItem.penerima} <span className="font-normal text-slate-500">({wageItem.penerimaJabatan})</span>
              </span>
            </div>
          </div>

          {/* SPJ PEKERJA JIKA UPAH TUKANG */}
          {wageItem.pos === 'UPAH_TUKANG' && wageItem.workersDetail && wageItem.workersDetail.length > 0 && (
            <div className="mb-6 border border-slate-300 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 p-2.5 font-bold text-slate-800 border-b border-slate-300 flex items-center justify-between">
                <span>Rincian Daftar Penerima Upah Tenaga Kerja (SPJ Upah Mingguan):</span>
                <span className="text-[11px] font-mono text-emerald-800 font-bold">
                  Total: {formatRupiah(wageItem.nominal)}
                </span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-center w-8">No</th>
                    <th className="p-2">Nama Tenaga Kerja</th>
                    <th className="p-2">Peran / Jabatan</th>
                    <th className="p-2 text-center">Hari Kerja</th>
                    <th className="p-2 text-right">Tarif / Hari</th>
                    <th className="p-2 text-right">Total Diterima</th>
                    <th className="p-2 text-center w-20">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {wageItem.workersDetail.map((w, idx) => (
                    <tr key={w.id}>
                      <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{w.nama}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">
                          {w.peran}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono font-semibold">{w.hariKerja} HK</td>
                      <td className="p-2 text-right font-mono text-slate-600">
                        {formatRupiah(w.upahHarian)}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-800">
                        {formatRupiah(w.totalUpahBersih)}
                      </td>
                      <td className="p-2 text-center text-slate-300 font-mono text-[10px]">
                        {idx + 1}. .........
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BLOK TANDA TANGAN (3 KOLOM RESMI STANDAR LPJ) */}
          <div className="pt-4 border-t border-slate-300">
            <div className="text-right text-xs text-slate-600 mb-2">
              {tempatTtd}, {formatTanggalIndo(wageItem.tanggalBayar)}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              {/* Kolom 1: Mengetahui Ketua */}
              <div className="space-y-16">
                <div>
                  <span className="text-slate-500 block text-[11px]">Mengetahui / Menyetujui:</span>
                  <strong className="text-slate-800 block">Ketua P2SP</strong>
                </div>
                <div>
                  <strong className="block underline text-slate-900 font-bold uppercase">{namaKetua}</strong>
                  <span className="text-[10px] text-slate-500 block">Penanggung Jawab Teknis</span>
                </div>
              </div>

              {/* Kolom 2: Lunas Dibayar Bendahara */}
              <div className="space-y-16">
                <div>
                  <span className="text-slate-500 block text-[11px]">Lunas Dibayarkan:</span>
                  <strong className="text-slate-800 block">Bendahara P2SP</strong>
                </div>
                <div>
                  <strong className="block underline text-slate-900 font-bold uppercase">{namaBendahara}</strong>
                  <span className="text-[10px] text-slate-500 block">Pemegang Kas Proyek</span>
                </div>
              </div>

              {/* Kolom 3: Yang Menerima */}
              <div className="space-y-16">
                <div>
                  <span className="text-slate-500 block text-[11px]">Yang Menerima:</span>
                  <strong className="text-slate-800 block">{wageItem.penerimaJabatan}</strong>
                </div>
                <div>
                  <strong className="block underline text-slate-900 font-bold uppercase">{wageItem.penerima}</strong>
                  <span className="text-[10px] text-slate-500 block">Penerima Hak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
