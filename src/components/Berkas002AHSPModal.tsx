import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah } from '../utils/terbilang';
import { generateAHSPTemplateExcel } from '../utils/excelTemplateEngine';
import { BERKAS_002_AHSP_DATA, Berkas002AHSPItem } from '../utils/berkas002AHSPTemplateData';

interface Berkas002AHSPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Berkas002AHSPModal: React.FC<Berkas002AHSPModalProps> = ({ isOpen, onClose }) => {
  const { projectInfo, rabMaster, updateRABMaster } = useProject();
  const [activeTab, setActiveTab] = useState<'detail' | 'rekap'>('detail');
  const [selectedItem, setSelectedItem] = useState<Berkas002AHSPItem>(BERKAS_002_AHSP_DATA[0]);
  const [applySuccess, setApplySuccess] = useState(false);

  if (!isOpen) return null;

  const namaSekolah =
    projectInfo?.dataSekolah?.namaSekolah ||
    projectInfo?.namaInstansi ||
    'SD/SMP NEGERI PELAKSANA REVITALISASI';
  const npsn = projectInfo?.dataSekolah?.npsn || '20260001';
  const desa = projectInfo?.alamatLengkap?.desaKelurahan || projectInfo?.desa || 'Babakan';
  const kec = projectInfo?.alamatLengkap?.kecamatan || projectInfo?.kecamatan || 'Sukaraja';
  const kab = projectInfo?.alamatLengkap?.kabupatenKota || projectInfo?.kabupaten || 'Kabupaten Bogor';
  const prov = projectInfo?.alamatLengkap?.provinsi || projectInfo?.provinsi || 'Jawa Barat';
  const alamat = `${desa}, Kec. ${kec}, ${kab}, Prov. ${prov}`;
  const namaProyek = projectInfo?.namaProyek || 'Rehabilitasi Ruang Kelas & Prasarana Pembelajaran Sekolah';
  const tahunAnggaran = projectInfo?.tahunAnggaran || '2026';
  const kepalaSekolah =
    projectInfo?.timP2sp?.penanggungJawab?.nama ||
    projectInfo?.namaPimpinan ||
    'Drs. H. Ahmad Dahlan, M.Pd.';
  const nipKepalaSekolah =
    projectInfo?.timP2sp?.penanggungJawab?.nipNik || '19750812 200212 1 003';
  const ketuaTPK =
    projectInfo?.timP2sp?.ketuaP2sp?.nama ||
    projectInfo?.namaKetuaTPK ||
    'Bambang Irawan, S.T.';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    generateAHSPTemplateExcel({
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
    });
  };

  const handleSyncToProject = () => {
    if (
      window.confirm(
        `Sinkronkan koefisien dan daftar komponen material dari Berkas 002 AHSP ke seluruh item pekerjaan RAB proyek aktif ${namaSekolah}?`
      )
    ) {
      const updated = rabMaster.map((rab) => {
        const matching = BERKAS_002_AHSP_DATA.find(
          (a) =>
            a.kode.toLowerCase() === rab.kode.toLowerCase() ||
            rab.namaPekerjaan.toLowerCase().includes(a.namaPekerjaan.toLowerCase()) ||
            a.namaPekerjaan.toLowerCase().includes(rab.namaPekerjaan.toLowerCase())
        );

        if (matching) {
          const materialBOM = matching.komponen
            .filter((k) => k.kategori === 'BAHAN')
            .map((b, idx) => ({
              id: `mat-ahsp-sync-${rab.id}-${idx}`,
              namaMaterial: b.uraian,
              satuan: b.satuan,
              koefisienPerSatuanPekerjaan: b.koefisien,
              hargaSatuan: b.hargaDasar,
              tokoDefault: 'TB. Mitra Bangunan Mandiri',
              kategoriBahan: 'STRUKTUR' as const,
              preferensiHariBeli: 'AWAL_MINGGU' as const,
            }));

          return {
            ...rab,
            materialComponents: materialBOM.length > 0 ? materialBOM : rab.materialComponents,
          };
        }
        return rab;
      });

      updateRABMaster(updated);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 4000);
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
                  Dokumen Berkas 002: Analisa Harga Satuan Pekerjaan (AHSP)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Standar SNI & PUPR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Format resmi acuan rincian koefisien Tenaga Kerja (Upah), Bahan/Material, dan Alat sesuai berkas fisik lelang/revitalisasi sekolah.
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

        {/* Toolbar Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('detail')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'detail'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              1. Rincian Analisa AHSP (Per Item)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rekap')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'rekap'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              2. Rekapitulasi Harga Satuan ({BERKAS_002_AHSP_DATA.length} Item)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncToProject}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 transition-colors"
              title="Sinkronkan koefisien bahan AHSP ini ke item RAB aktif"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinkronkan ke Master RAB</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas 002 (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen Fisik</span>
            </button>
          </div>
        </div>

        {/* Notifikasi Sinkronisasi Berhasil */}
        {applySuccess && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Koefisien bahan dan BOM dari Berkas 002 AHSP berhasil disinkronkan ke RAB aktif sekolah!</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-100">
          <div className="max-w-4xl mx-auto bg-white border border-slate-300 p-6 sm:p-8 rounded-xl shadow-sm text-slate-800">
            {/* Kop Resmi Surat / Berkas Fisik */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-5">
              <div className="flex items-center justify-center gap-2 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>Kementerian Pendidikan Dasar dan Menengah RI</span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 uppercase mt-0.5 tracking-tight">
                Direktorat Jenderal Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Menengah
              </h1>
              <h2 className="text-base sm:text-lg font-black text-emerald-800 uppercase mt-2">
                Berkas 002: Analisa Harga Satuan Pekerjaan (AHSP)
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Standar Nasional Indonesia (SNI) & Permen Pekerjaan Umum dan Perumahan Rakyat
              </p>
            </div>

            {/* Identitas Proyek */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-6 text-xs mb-6 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Satuan Pendidikan:</span>
                <strong className="text-slate-900 font-semibold">{namaSekolah}</strong>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">NPSN:</span>
                <span className="font-mono text-slate-800">{npsn}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Nama Pekerjaan:</span>
                <span className="text-slate-900 font-semibold">{namaProyek}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Tahun Anggaran:</span>
                <span className="font-mono text-slate-800">{tahunAnggaran}</span>
              </div>
              <div className="flex md:col-span-2">
                <span className="w-36 text-slate-500 font-medium shrink-0">Alamat Lokasi:</span>
                <span className="text-slate-700">{alamat}</span>
              </div>
            </div>

            {/* TAB VIEW 1: DETAIL PER ITEM AHSP */}
            {activeTab === 'detail' && (
              <div className="space-y-6">
                {/* Selector Dropdown Item */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">Pilih Item Analisa:</span>
                  </div>
                  <select
                    value={selectedItem.id}
                    onChange={(e) => {
                      const found = BERKAS_002_AHSP_DATA.find((x) => x.id === e.target.value);
                      if (found) setSelectedItem(found);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-emerald-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {BERKAS_002_AHSP_DATA.map((item, idx) => (
                      <option key={item.id} value={item.id}>
                        {idx + 1}. [{item.kode}] {item.namaPekerjaan} ({item.satuanPekerjaan})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Box Lembar Analisa Spesifik */}
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-3 border-b border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-700 text-white px-2 py-0.5 rounded">
                        KODE: {selectedItem.kode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {selectedItem.namaPekerjaan}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Divisi: {selectedItem.divisi}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">Harga Satuan Pekerjaan</span>
                      <strong className="text-base font-mono font-black text-emerald-800">
                        {formatRupiah(selectedItem.hargaSatuan)} / {selectedItem.satuanPekerjaan}
                      </strong>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3 w-8">No</th>
                        <th className="py-2 px-3">Uraian Komponen Pekerjaan</th>
                        <th className="py-2 px-3 text-center">Satuan</th>
                        <th className="py-2 px-3 text-right">Koefisien</th>
                        <th className="py-2 px-3 text-right">Harga Dasar (Rp)</th>
                        <th className="py-2 px-3 text-right">Jumlah Harga (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* Section A: Tenaga Kerja */}
                      <tr className="bg-slate-50/80 font-bold text-slate-800">
                        <td className="py-2 px-3 font-mono">A</td>
                        <td colSpan={5} className="py-2 px-3">
                          TENAGA KERJA (UPAH)
                        </td>
                      </tr>
                      {selectedItem.komponen
                        .filter((k) => k.kategori === 'UPAH')
                        .map((u, uIdx) => (
                          <tr key={`u-${uIdx}`} className="hover:bg-slate-50/60">
                            <td className="py-1.5 px-3 text-slate-400 font-mono text-[11px]">{uIdx + 1}</td>
                            <td className="py-1.5 px-3 text-slate-800">{u.uraian}</td>
                            <td className="py-1.5 px-3 text-center font-mono text-slate-600">{u.satuan}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-700">{u.koefisien}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-600">{formatRupiah(u.hargaDasar)}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-medium text-slate-900">{formatRupiah(u.jumlah)}</td>
                          </tr>
                        ))}
                      <tr className="bg-emerald-50/50 font-bold text-emerald-950 border-t border-b border-emerald-100">
                        <td className="py-1.5 px-3"></td>
                        <td colSpan={4} className="py-1.5 px-3 text-right">
                          JUMLAH TENAGA KERJA (A):
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">{formatRupiah(selectedItem.totalUpah)}</td>
                      </tr>

                      {/* Section B: Bahan / Material */}
                      <tr className="bg-slate-50/80 font-bold text-slate-800">
                        <td className="py-2 px-3 font-mono">B</td>
                        <td colSpan={5} className="py-2 px-3">
                          BAHAN / MATERIAL
                        </td>
                      </tr>
                      {selectedItem.komponen
                        .filter((k) => k.kategori === 'BAHAN')
                        .map((b, bIdx) => (
                          <tr key={`b-${bIdx}`} className="hover:bg-slate-50/60">
                            <td className="py-1.5 px-3 text-slate-400 font-mono text-[11px]">{bIdx + 1}</td>
                            <td className="py-1.5 px-3 text-slate-800">{b.uraian}</td>
                            <td className="py-1.5 px-3 text-center font-mono text-slate-600">{b.satuan}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-700">{b.koefisien}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-600">{formatRupiah(b.hargaDasar)}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-medium text-slate-900">{formatRupiah(b.jumlah)}</td>
                          </tr>
                        ))}
                      <tr className="bg-emerald-50/50 font-bold text-emerald-950 border-t border-b border-emerald-100">
                        <td className="py-1.5 px-3"></td>
                        <td colSpan={4} className="py-1.5 px-3 text-right">
                          JUMLAH BAHAN / MATERIAL (B):
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono">{formatRupiah(selectedItem.totalBahan)}</td>
                      </tr>

                      {/* Section C: Peralatan */}
                      <tr className="bg-slate-50/80 font-bold text-slate-800">
                        <td className="py-2 px-3 font-mono">C</td>
                        <td colSpan={5} className="py-2 px-3">
                          PERALATAN (ALAT BANTU)
                        </td>
                      </tr>
                      {selectedItem.komponen.filter((k) => k.kategori === 'ALAT').length > 0 ? (
                        selectedItem.komponen
                          .filter((k) => k.kategori === 'ALAT')
                          .map((a, aIdx) => (
                            <tr key={`a-${aIdx}`} className="hover:bg-slate-50/60">
                              <td className="py-1.5 px-3 text-slate-400 font-mono text-[11px]">{aIdx + 1}</td>
                              <td className="py-1.5 px-3 text-slate-800">{a.uraian}</td>
                              <td className="py-1.5 px-3 text-center font-mono text-slate-600">{a.satuan}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-slate-700">{a.koefisien}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-slate-600">{formatRupiah(a.hargaDasar)}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-medium text-slate-900">{formatRupiah(a.jumlah)}</td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td className="py-1.5 px-3 text-center text-slate-400 font-mono">-</td>
                          <td colSpan={4} className="py-1.5 px-3 text-slate-400 italic">
                            Tidak menggunakan alat bantu sewa / alat berat khusus
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-400">Rp 0</td>
                        </tr>
                      )}

                      {/* TOTAL D */}
                      <tr className="bg-emerald-700 text-white font-bold text-sm">
                        <td className="py-2.5 px-3 font-mono">D</td>
                        <td colSpan={4} className="py-2.5 px-3">
                          TOTAL HARGA SATUAN PEKERJAAN (A + B + C) per 1 {selectedItem.satuanPekerjaan}:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black">
                          {formatRupiah(selectedItem.hargaSatuan)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: REKAPITULASI HARGA SATUAN */}
            {activeTab === 'rekap' && (
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 w-8">No</th>
                      <th className="py-2.5 px-3 w-16">Kode</th>
                      <th className="py-2.5 px-3">Divisi & Uraian Item Pekerjaan</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3 text-right">Upah (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Bahan (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {BERKAS_002_AHSP_DATA.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800">{item.kode}</td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900">{item.namaPekerjaan}</div>
                          <div className="text-[10px] text-slate-400">Divisi {item.romawi}: {item.divisi}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-600">{item.satuanPekerjaan}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">{formatRupiah(item.totalUpah)}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">{formatRupiah(item.totalBahan)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                          {formatRupiah(item.hargaSatuan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Lembar Tanda Tangan Fisik Pengesahan */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center">
              <div>
                <p className="text-slate-500">Mengetahui / Menyetujui,</p>
                <p className="font-bold text-slate-900">Kepala Satuan Pendidikan</p>
                <p className="text-slate-600 text-[11px]">{namaSekolah}</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-900 underline">( {kepalaSekolah} )</p>
                <p className="text-slate-500 font-mono text-[10px]">NIP. {nipKepalaSekolah}</p>
              </div>

              <div>
                <p className="text-slate-500">Dibuat & Disusun Oleh,</p>
                <p className="font-bold text-slate-900">Tim Pelaksana Kegiatan (TPK)</p>
                <p className="text-slate-600 text-[11px]">Ketua Pelaksana / Tim Teknis</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-900 underline">( {ketuaTPK} )</p>
                <p className="text-slate-500 font-mono text-[10px]">NIP/NIK. -</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
