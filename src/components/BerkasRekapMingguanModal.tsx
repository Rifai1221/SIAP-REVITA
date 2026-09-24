import React from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  OFFICIAL_REKAP_MINGGUAN_DATA,
  generateOfficialWeeklyRecapTemplateExcel,
} from '../utils/weeklyRecapTemplateEngine';

interface BerkasRekapMingguanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BerkasRekapMingguanModal: React.FC<BerkasRekapMingguanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { projectInfo, rabMaster } = useProject();

  if (!isOpen) return null;

  const namaSekolah =
    projectInfo?.dataSekolah?.namaSekolah ||
    projectInfo?.namaInstansi ||
    'TK NURIADEEN CENDEKIA';
  const jenisPendidikan = 'PENDIDIKAN ANAK USIA DINI';
  const ruang = projectInfo?.namaProyek || 'RUANG KELAS BARU';
  const kabKota =
    projectInfo?.alamatLengkap?.kabupatenKota ||
    projectInfo?.kabupaten ||
    'KAB/KOTA BOGOR';
  const provinsi =
    projectInfo?.alamatLengkap?.provinsi ||
    projectInfo?.provinsi ||
    'PROPINSI JAWA BARAT';
  const tanggalSurat = 'Bogor, 02 Agustus 2026';
  const ketuaP2SP =
    projectInfo?.timP2sp?.ketuaP2sp?.nama ||
    projectInfo?.namaKetuaTPK ||
    'SURYADI, S.Pd.I.';
  const pengawas = 'ERWIN RUSANDI, S.T.';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    generateOfficialWeeklyRecapTemplateExcel(
      {
        namaSekolah,
        namaProyek: ruang,
        kabupatenKota: kabKota,
        provinsi,
        tanggalSurat,
        namaKetuaP2SP: ketuaP2SP,
        namaPengawas: pengawas,
      },
      rabMaster
    );
  };

  const data = OFFICIAL_REKAP_MINGGUAN_DATA;
  const totalFisikSd = data.pekerjaanFisik.reduce((acc, c) => acc + c.prestasiSdMingguIni, 0);
  const totalManajemenSd = data.biayaManajemen.reduce((acc, c) => acc + c.prestasiSdMingguIni, 0);
  const grandTotalSd = Math.round((totalFisikSd + totalManajemenSd) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 border border-emerald-500/40 rounded-xl text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Dokumen Rekapitulasi Prestasi Laporan Mingguan
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Format Resmi Pengawas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Format fisik monitoring mingguan pengawas pekerjaan fisik dan biaya manajemen P2SP.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Status Capaian:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
              Realisasi: {grandTotalSd.toFixed(2)} % (Lebih cepat +8.09 %)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Format Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berkas Fisik</span>
            </button>
          </div>
        </div>

        {/* Content Sheet Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-100">
          <div className="max-w-3xl mx-auto bg-white border border-slate-300 p-6 sm:p-8 rounded-xl shadow-sm text-slate-800">
            {/* Kop Berkas */}
            <div className="text-left font-black text-slate-900 text-sm tracking-wide uppercase mb-4 leading-tight">
              <div>REKAPITULASI</div>
              <div>{jenisPendidikan}</div>
              <div>{ruang}</div>
              <div>{namaSekolah}</div>
              <div>{kabKota} {provinsi}</div>
            </div>

            {/* Tabel Rekapitulasi */}
            <div className="border-2 border-slate-900 overflow-hidden text-[11px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-sky-400 text-slate-900 font-black text-center border-b-2 border-slate-900">
                    <th className="py-2.5 px-2 w-10 border-r border-slate-900">NO.</th>
                    <th className="py-2.5 px-3 border-r border-slate-900 text-left">URAIAN PEKERJAAN</th>
                    <th className="py-2.5 px-2 w-20 border-r border-slate-900">BOBOT %</th>
                    <th className="py-2.5 px-2 w-24 border-r border-slate-900">
                      PRESTASI<br />MINGGU LALU<br /><span className="text-[10px] font-bold">BOBOT %</span>
                    </th>
                    <th className="py-2.5 px-2 w-24 border-r border-slate-900">
                      PRESTASI<br />MINGGU INI<br /><span className="text-[10px] font-bold">BOBOT %</span>
                    </th>
                    <th className="py-2.5 px-2 w-24">
                      PRESTASI S.D<br />MINGGU INI<br /><span className="text-[10px] font-bold">BOBOT %</span>
                    </th>
                  </tr>
                  <tr className="bg-slate-100 font-black text-slate-900 border-b border-slate-900">
                    <td colSpan={6} className="py-1 px-3 text-center tracking-widest text-[11px]">
                      R E K A P I T U L A S I :
                    </td>
                  </tr>
                  <tr className="bg-white font-bold text-slate-900 border-b border-slate-900">
                    <td colSpan={6} className="py-1 px-3">
                      PEKERJAAN FISIK
                    </td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {data.pekerjaanFisik.map((row) => (
                    <tr key={row.no} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900 font-semibold">{row.no}</td>
                      <td className="py-1.5 px-3 border-r border-slate-900 font-medium">{row.uraianPekerjaan}</td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">{row.bobotPersen.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">
                        {row.prestasiMingguLalu > 0 ? row.prestasiMingguLalu.toFixed(2) : ''}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">
                        {row.prestasiMingguIni > 0 ? row.prestasiMingguIni.toFixed(2) : ''}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold">
                        {row.prestasiSdMingguIni > 0 ? row.prestasiSdMingguIni.toFixed(2) : ''}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-white font-bold text-slate-900 border-t-2 border-b border-slate-900">
                    <td colSpan={6} className="py-1 px-3">
                      RINCIAN BIAYA MANAJEMEN
                    </td>
                  </tr>

                  {data.biayaManajemen.map((row) => (
                    <tr key={`m-${row.no}`} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900 font-semibold">{row.no}</td>
                      <td className="py-1.5 px-3 border-r border-slate-900 font-medium">{row.uraianPekerjaan}</td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">{row.bobotPersen.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">
                        {row.prestasiMingguLalu.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono border-r border-slate-900">
                        {row.prestasiMingguIni.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold">
                        {row.prestasiSdMingguIni.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL */}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-900 text-xs">
                    <td colSpan={2} className="py-2 px-3 text-center border-r border-slate-900">
                      TOTAL
                    </td>
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-900">100,00</td>
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-900">9,66</td>
                    <td className="py-2 px-2 text-center font-mono border-r border-slate-900">5,33</td>
                    <td className="py-2 px-2 text-center font-mono font-black text-emerald-800">15,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* KETERANGAN & WAKTU */}
            <div className="mt-5 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 mb-1">KETERANGAN</div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-slate-600">PRESTASI PELAKSANAAN</span>
                  <span className="font-mono font-bold text-slate-900">: 15,00 %</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-slate-600">PRESTASI YANG DIRENCANAKAN</span>
                  <span className="font-mono font-bold text-slate-900">: 6,90 %</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-slate-600">LEBIH CEPAT DARI RENCANA</span>
                  <span className="font-mono font-bold text-emerald-700">: 8,09 %</span>
                </div>
              </div>

              <div className="space-y-1 md:pl-4">
                <div className="h-4"></div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-slate-600">RENCANA WAKTU PELAKSANAAN</span>
                  <span className="font-mono font-bold text-slate-900">: 112 HK</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-slate-600">WAKTU YANG SUDAH DILAKSANAKAN</span>
                  <span className="font-mono font-bold text-slate-900">: 28 HK</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-slate-600">SISA WAKTU PELAKSANAAN</span>
                  <span className="font-mono font-bold text-slate-900">: 84 HK</span>
                </div>
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center">
              <div>
                <p className="text-slate-500">Diperiksa dan Disetujui</p>
                <p className="font-bold text-slate-900">Ketua P2SP</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-slate-300 italic text-[11px]">[Tanda Tangan & Cap P2SP]</span>
                </div>
                <p className="font-bold text-slate-900 underline">{ketuaP2SP}</p>
              </div>

              <div>
                <p className="text-slate-500">{tanggalSurat}</p>
                <p className="text-slate-500">Dibuat Oleh</p>
                <p className="font-bold text-slate-900">Pengawas</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-slate-300 italic text-[11px]">[Tanda Tangan Pengawas]</span>
                </div>
                <p className="font-bold text-slate-900 underline">{pengawas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
