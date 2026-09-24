import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah, terbilangRupiah } from '../utils/terbilang';
import { generateRABTemplateExcel } from '../utils/excelTemplateEngine';
import { getBerkas001StructuredData } from '../utils/berkas001RABTemplateData';
import { RABMasterItem } from '../types';

interface Berkas001RABModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Berkas001RABModal: React.FC<Berkas001RABModalProps> = ({ isOpen, onClose }) => {
  const { projectInfo, updateRABMaster, updateProjectInfo } = useProject();
  const [activeView, setActiveView] = useState<'detail' | 'rekap'>('detail');
  const [applySuccess, setApplySuccess] = useState(false);

  if (!isOpen) return null;

  const data001 = getBerkas001StructuredData();
  const namaSekolah = projectInfo?.dataSekolah?.namaSekolah || projectInfo?.namaInstansi || 'SD/SMP NEGERI PELAKSANA REVITALISASI';
  const npsn = projectInfo?.dataSekolah?.npsn || '20260001';
  const desa = projectInfo?.alamatLengkap?.desaKelurahan || projectInfo?.desa || 'Babakan';
  const kec = projectInfo?.alamatLengkap?.kecamatan || projectInfo?.kecamatan || 'Sukaraja';
  const kab = projectInfo?.alamatLengkap?.kabupatenKota || projectInfo?.kabupaten || 'Kabupaten Bogor';
  const prov = projectInfo?.alamatLengkap?.provinsi || projectInfo?.provinsi || 'Jawa Barat';
  const alamat = `${desa}, Kec. ${kec}, ${kab}, Prov. ${prov}`;
  const namaProyek = projectInfo?.namaProyek || 'Rehabilitasi Ruang Kelas & Prasarana Pembelajaran Sekolah';
  const tahunAnggaran = projectInfo?.tahunAnggaran || '2026';
  const kepalaSekolah = projectInfo?.timP2sp?.penanggungJawab?.nama || projectInfo?.namaPimpinan || 'Drs. H. Ahmad Dahlan, M.Pd.';
  const nipKepalaSekolah = projectInfo?.timP2sp?.penanggungJawab?.nipNik || '19750812 200212 1 003';
  const ketuaTPK = projectInfo?.timP2sp?.ketuaP2sp?.nama || projectInfo?.namaKetuaTPK || 'Bambang Irawan, S.T.';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    generateRABTemplateExcel({
      namaSekolah,
      npsn,
      desaKelurahan: desa,
      kecamatan: kec,
      kabupatenKota: kab,
      provinsi: prov,
      namaProyek,
      tahunAnggaran,
      namaKepalaSekolah: kepalaSekolah,
      nipKepalaSekolah,
      ketuaPelaksana: ketuaTPK,
      totalPaguAnggaran: projectInfo?.totalPaguAnggaran,
    });
  };

  const handleApplyToProject = () => {
    if (
      window.confirm(
        `Terapkan seluruh 56 item pekerjaan Berkas 001 RAB ini ke database proyek aktif sekolah ${namaSekolah}? Total RAB akan menjadi ${formatRupiah(data001.totalCost)}.`
      )
    ) {
      const convertedItems: RABMasterItem[] = data001.itemsFlat.map((it) => ({
        id: `rab-001-${it.no}-${Date.now()}`,
        kode: it.kode,
        namaPekerjaan: it.nama,
        kategori: it.divisi,
        bobotRencana: it.bobot,
        progresRealisasi: 0,
        volumeRAB: it.volume,
        satuan: it.satuan,
        biayaRAB: it.jumlahHarga,
        biayaRealisasi: 0,
        materialComponents: [],
      }));

      updateRABMaster(convertedItems);
      updateProjectInfo({ totalPaguAnggaran: data001.totalCost });
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Dokumen Berkas 001: Rencana Anggaran Biaya (RAB)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Format Fisik Standar
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Format resmi sesuai berkas pengajuan bantuan revitalisasi sekolah (Kop resmi, 12 Divisi, BOQ, Rekapitulasi & Pengesahan).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Aksi Atas */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('detail')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'detail'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Tabel RAB Lengkap (BOQ)
            </button>
            <button
              onClick={() => setActiveView('rekap')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'rekap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Rekapitulasi Divisi
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyToProject}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              title="Terapkan 56 item template ini ke database RAB sekolah aktif"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Terapkan ke Proyek Ini</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Cetak format fisik / simpan ke PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              title="Unduh file Excel (.xlsx) lengkap dengan sheet 001_Formulir_RAB, Rekapitulasi_RAB dan Petunjuk"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>
        </div>

        {applySuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Berhasil! 56 item pekerjaan Berkas 001 RAB telah diterapkan ke proyek sekolah Anda dengan Total Pagu{' '}
              {formatRupiah(data001.totalCost)}.
            </span>
          </div>
        )}

        {/* Isi Dokumen (Dapat dicetak) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0">
          <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Kop Resmi Standar */}
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
              <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-700">
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
              </h3>
              <h4 className="text-[11px] sm:text-xs font-semibold uppercase text-slate-600">
                Direktorat Jenderal Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Pendidikan Menengah
              </h4>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">
                PROGRAM REVITALISASI / REHABILITASI SATUAN PENDIDIKAN TAHUN {tahunAnggaran}
              </p>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 mt-2 tracking-tight">
                FORMULIR 001: RENCANA ANGGARAN BIAYA (RAB)
              </h2>
            </div>

            {/* Identitas Proyek Sekolah */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-800 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-300">
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Nama Sekolah</span>
                <span className="font-bold text-slate-900">: {namaSekolah}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Tahun Anggaran</span>
                <span className="font-bold text-slate-900">: {tahunAnggaran}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">NPSN / Identitas</span>
                <span className="font-bold text-slate-900">: {npsn}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Sumber Dana</span>
                <span className="font-bold text-slate-900">: DAK Fisik / Bantuan Revitalisasi</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Lokasi / Alamat</span>
                <span className="text-slate-800">: {alamat}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-semibold text-slate-600">Kegiatan</span>
                <span className="text-slate-800">: {namaProyek}</span>
              </div>
            </div>

            {activeView === 'detail' ? (
              /* TABEL DETAIL BOQ 56 ITEM */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300 text-center">
                      <th className="py-2 px-1.5 border border-slate-300 w-10">NO</th>
                      <th className="py-2 px-2 border border-slate-300 w-16">KODE</th>
                      <th className="py-2 px-3 border border-slate-300 text-left">URAIAN PEKERJAAN</th>
                      <th className="py-2 px-2 border border-slate-300 w-16">VOL</th>
                      <th className="py-2 px-1.5 border border-slate-300 w-12">SAT</th>
                      <th className="py-2 px-2.5 border border-slate-300 text-right w-24">HARGA SATUAN</th>
                      <th className="py-2 px-2.5 border border-slate-300 text-right w-28">JUMLAH BIAYA</th>
                      <th className="py-2 px-1.5 border border-slate-300 w-14">BOBOT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data001.divisions.map((div) => (
                      <React.Fragment key={div.romawi}>
                        {/* Baris Judul Divisi */}
                        <tr className="bg-slate-50 font-black text-slate-900 border-b border-slate-300">
                          <td className="py-1.5 px-2 border border-slate-300 text-center font-bold">
                            {div.romawi}
                          </td>
                          <td className="py-1.5 px-2 border border-slate-300 text-center">-</td>
                          <td
                            colSpan={6}
                            className="py-1.5 px-3 border border-slate-300 uppercase tracking-wide text-emerald-950 font-black"
                          >
                            {div.divisi}
                          </td>
                        </tr>

                        {/* Baris Item-Item Pekerjaan */}
                        {div.items.map((it) => (
                          <tr key={it.kode} className="hover:bg-slate-50/70 border-b border-slate-200">
                            <td className="py-1.5 px-1.5 border border-slate-300 text-center text-slate-600">
                              {it.no}
                            </td>
                            <td className="py-1.5 px-2 border border-slate-300 font-mono text-center font-semibold text-slate-700">
                              {it.kode}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-300 text-slate-800">
                              {it.nama}
                            </td>
                            <td className="py-1.5 px-2 border border-slate-300 text-center font-mono font-medium">
                              {it.volume.toLocaleString('id-ID')}
                            </td>
                            <td className="py-1.5 px-1.5 border border-slate-300 text-center text-slate-600">
                              {it.satuan}
                            </td>
                            <td className="py-1.5 px-2.5 border border-slate-300 text-right font-mono text-slate-700">
                              {formatRupiah(it.hargaSatuan, false)}
                            </td>
                            <td className="py-1.5 px-2.5 border border-slate-300 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(it.jumlahHarga, false)}
                            </td>
                            <td className="py-1.5 px-1.5 border border-slate-300 text-center font-mono text-slate-600">
                              {it.bobot.toFixed(2)}%
                            </td>
                          </tr>
                        ))}

                        {/* Subtotal Divisi */}
                        <tr className="bg-slate-100/70 font-bold border-b border-slate-300 text-slate-900">
                          <td
                            colSpan={6}
                            className="py-1.5 px-3 border border-slate-300 text-right italic font-semibold text-slate-700"
                          >
                            SUBTOTAL {div.divisi}
                          </td>
                          <td className="py-1.5 px-2.5 border border-slate-300 text-right font-mono font-black text-slate-900">
                            {formatRupiah(div.subtotal, false)}
                          </td>
                          <td className="py-1.5 px-1.5 border border-slate-300 text-center font-mono font-bold text-slate-800">
                            {div.bobotSubtotal.toFixed(2)}%
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}

                    {/* Total Keseluruhan */}
                    <tr className="bg-emerald-50 font-black text-slate-900 border-t-2 border-slate-900">
                      <td colSpan={6} className="py-2.5 px-3 border border-slate-300 text-right uppercase">
                        TOTAL RENCANA ANGGARAN BIAYA (RAB)
                      </td>
                      <td className="py-2.5 px-2.5 border border-slate-300 text-right font-mono text-emerald-950 font-black text-xs">
                        {formatRupiah(data001.totalCost)}
                      </td>
                      <td className="py-2.5 px-1.5 border border-slate-300 text-center font-mono font-black text-xs">
                        100.00%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABEL REKAPITULASI DIVISI */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300 text-center">
                      <th className="py-2.5 px-2 border border-slate-300 w-12">NO</th>
                      <th className="py-2.5 px-4 border border-slate-300 text-left">
                        DIVISI / URAIAN KELOMPOK PEKERJAAN
                      </th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right w-44">
                        JUMLAH BIAYA (Rp)
                      </th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center w-28">
                        BOBOT (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data001.divisions.map((div, idx) => (
                      <tr key={div.romawi} className="hover:bg-slate-50 border-b border-slate-200">
                        <td className="py-2 px-2 border border-slate-300 text-center font-bold text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-4 border border-slate-300 font-semibold text-slate-800">
                          {div.divisi}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(div.subtotal)}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono font-semibold text-slate-700">
                          {div.bobotSubtotal.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 font-black text-slate-900 border-t-2 border-slate-900">
                      <td colSpan={2} className="py-3 px-4 border border-slate-300 text-right uppercase">
                        TOTAL KESELURUHAN ANGGARAN (RAB)
                      </td>
                      <td className="py-3 px-3 border border-slate-300 text-right font-mono text-emerald-950 font-black text-sm">
                        {formatRupiah(data001.totalCost)}
                      </td>
                      <td className="py-3 px-3 border border-slate-300 text-center font-mono font-black text-sm">
                        100.00%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Terbilang */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-bold text-slate-700">Terbilang: </span>
              <span className="italic font-serif text-slate-900 font-semibold">
                "{terbilangRupiah(data001.totalCost)}"
              </span>
            </div>

            {/* Lembar Tanda Tangan Pengesahan */}
            <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div>
                <p className="font-medium text-slate-600">Mengetahui / Menyetujui,</p>
                <p className="font-bold text-slate-900 mt-0.5">Kepala Satuan Pendidikan</p>
                <p className="text-[11px] text-slate-500">{namaSekolah}</p>
                <div className="h-16"></div>
                <p className="font-black text-slate-900 underline">{kepalaSekolah}</p>
                <p className="text-[10px] text-slate-500">NIP. {nipKepalaSekolah}</p>
              </div>

              <div>
                <p className="font-medium text-slate-600">Dibuat & Disusun Oleh,</p>
                <p className="font-bold text-slate-900 mt-0.5">Tim Pelaksana Kegiatan (TPK)</p>
                <p className="text-[11px] text-slate-500">Ketua Pelaksana / Tim Teknis</p>
                <div className="h-16"></div>
                <p className="font-black text-slate-900 underline">{ketuaTPK}</p>
                <p className="text-[10px] text-slate-500">NIP/NIK. -</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Format Excel (.xlsx) mencakup rumus aktif, kop satuan pendidikan, dan 3 sheet terintegrasi.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download File Template (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
