import React, { useState } from 'react';
import {
  Users,
  HardHat,
  Briefcase,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  Camera,
  Image as ImageIcon,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  CashType,
  PayrollHarianBatch,
  WorkerBoronganItem,
  WorkerHarian,
} from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/terbilang';
import { WeeklyPhotoUploader } from './WeeklyPhotoUploader';

type PayrollMode = 'HARIAN' | 'BORONGAN';

export const WorkerPayroll: React.FC = () => {
  const {
    projectInfo,
    payrollHarian,
    payrollBorongan,
    progressPhotos,
    addPayrollHarianBatch,
    deletePayrollHarianBatch,
    addWorkerBorongan,
    payWorkerBorongan,
    deleteWorkerBorongan,
    addProgressPhotos,
    deleteProgressPhoto,
    updateProgressPhotoCaption,
  } = useProject();

  const [activeMode, setActiveMode] = useState<PayrollMode>('HARIAN');
  const [showAddHarianModal, setShowAddHarianModal] = useState(false);
  const [showAddBoronganModal, setShowAddBoronganModal] = useState(false);
  const [showPhotoUploaderInSpj, setShowPhotoUploaderInSpj] = useState(false);
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<PayrollHarianBatch | null>(
    payrollHarian[0] || null
  );

  // Form State: Harian Batch
  const nextSpjNum = payrollHarian.length + 1;
  const [spjNo, setSpjNo] = useState(`SPJ-UPAH/${new Date().getFullYear()}/W0${nextSpjNum}`);
  const [periodeAwal, setPeriodeAwal] = useState('2026-03-16');
  const [periodeAkhir, setPeriodeAkhir] = useState('2026-03-21');
  const [mingguKe, setMingguKe] = useState(4);
  const [pekerjaanTerkait, setPekerjaanTerkait] = useState(
    'Pemasangan Dinding Bata Ringan & Pengecoran Ringbalk Atas'
  );
  const [tanggalBayarHarian, setTanggalBayarHarian] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [jenisKasHarian, setJenisKasHarian] = useState<CashType>('TUNAI');
  const [isBookedHarian, setIsBookedHarian] = useState(true);

  // Worker rows for the new batch
  const [workersList, setWorkersList] = useState<WorkerHarian[]>([
    {
      id: 'w1',
      nama: 'Suparman',
      peran: 'MANDOR',
      upahHarian: 160000,
      hariKerja: 6,
      jamLembur: 4,
      upahLemburPerJam: 25000,
      kasbon: 0,
      totalUpahKotor: 1060000,
      totalUpahBersih: 1060000,
      keterangan: 'Mandor Utama',
    },
    {
      id: 'w2',
      nama: 'Karyo Utomo',
      peran: 'TUKANG',
      upahHarian: 135000,
      hariKerja: 6,
      jamLembur: 4,
      upahLemburPerJam: 20000,
      kasbon: 0,
      totalUpahKotor: 890000,
      totalUpahBersih: 890000,
      keterangan: 'Tukang Batu',
    },
    {
      id: 'w3',
      nama: 'Slamet Riyadi',
      peran: 'TUKANG',
      upahHarian: 135000,
      hariKerja: 6,
      jamLembur: 4,
      upahLemburPerJam: 20000,
      kasbon: 0,
      totalUpahKotor: 890000,
      totalUpahBersih: 890000,
      keterangan: 'Tukang Besi',
    },
    {
      id: 'w4',
      nama: 'Asep Saepul',
      peran: 'LADEN',
      upahHarian: 100000,
      hariKerja: 6,
      jamLembur: 4,
      upahLemburPerJam: 15000,
      kasbon: 0,
      totalUpahKotor: 660000,
      totalUpahBersih: 660000,
      keterangan: 'Laden / Kenek',
    },
    {
      id: 'w5',
      nama: 'Cecep Hidayat',
      peran: 'LADEN',
      upahHarian: 100000,
      hariKerja: 6,
      jamLembur: 4,
      upahLemburPerJam: 15000,
      kasbon: 0,
      totalUpahKotor: 660000,
      totalUpahBersih: 660000,
      keterangan: 'Laden / Kenek',
    },
  ]);

  const handleWorkerFieldChange = (
    id: string,
    field: keyof WorkerHarian,
    value: any
  ) => {
    setWorkersList((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const updated = { ...w, [field]: value };

        // Re-calculate
        const pokok = Number(updated.upahHarian || 0) * Number(updated.hariKerja || 0);
        const lembur = Number(updated.jamLembur || 0) * Number(updated.upahLemburPerJam || 0);
        const kotor = pokok + lembur;
        const bersih = Math.max(0, kotor - Number(updated.kasbon || 0));

        updated.totalUpahKotor = kotor;
        updated.totalUpahBersih = bersih;
        return updated;
      })
    );
  };

  const handleAddWorkerRow = () => {
    const newWorker: WorkerHarian = {
      id: `w-${Date.now()}`,
      nama: '',
      peran: 'TUKANG',
      upahHarian: 135000,
      hariKerja: 6,
      jamLembur: 0,
      upahLemburPerJam: 20000,
      kasbon: 0,
      totalUpahKotor: 810000,
      totalUpahBersih: 810000,
      keterangan: '',
    };
    setWorkersList((prev) => [...prev, newWorker]);
  };

  const handleRemoveWorkerRow = (id: string) => {
    if (workersList.length <= 1) return;
    setWorkersList((prev) => prev.filter((w) => w.id !== id));
  };

  const totalHonorBatch = workersList.reduce((sum, w) => sum + w.totalUpahBersih, 0);

  const handleSaveBatchHarian = (e: React.FormEvent) => {
    e.preventDefault();
    if (workersList.length === 0) {
      alert('Daftar pekerja tidak boleh kosong.');
      return;
    }

    addPayrollHarianBatch({
      noSpj: spjNo,
      periodeAwal,
      periodeAkhir,
      mingguKe: Number(mingguKe),
      pekerjaanTerkait,
      workers: workersList,
      totalDibayarkan: totalHonorBatch,
      tanggalBayar: tanggalBayarHarian,
      jenisKas: jenisKasHarian,
      isBookedToBKU: isBookedHarian,
    });

    alert('Daftar upah harian berhasil disimpan dan dibukukan!');
    setShowAddHarianModal(false);
  };

  // Form State: Borongan
  const [boronganForm, setBoronganForm] = useState({
    noKontrak: `SPK-BRG/REV/${new Date().getFullYear()}/0${payrollBorongan.length + 1}`,
    namaMandor: '',
    itemPekerjaan: '',
    volume: 100,
    satuan: 'm2',
    hargaSatuan: 85000,
    persentaseSelesai: 30,
    tahapTermin: 'Termin I (DP 30%)',
    nominalTermin: 2550000,
    tanggalBayar: new Date().toISOString().split('T')[0],
    jenisKas: 'BANK' as CashType,
  });

  const handleSaveBorongan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boronganForm.namaMandor.trim() || !boronganForm.itemPekerjaan.trim()) {
      alert('Nama mandor dan item pekerjaan wajib diisi.');
      return;
    }

    const totalKontrak = boronganForm.volume * boronganForm.hargaSatuan;

    addWorkerBorongan({
      noKontrak: boronganForm.noKontrak,
      namaMandor: boronganForm.namaMandor,
      itemPekerjaan: boronganForm.itemPekerjaan,
      volume: Number(boronganForm.volume),
      satuan: boronganForm.satuan,
      hargaSatuan: Number(boronganForm.hargaSatuan),
      nilaiKontrak: totalKontrak,
      persentaseSelesai: Number(boronganForm.persentaseSelesai),
      tahapTermin: boronganForm.tahapTermin,
      nominalTermin: Number(boronganForm.nominalTermin),
      tanggalBayar: boronganForm.tanggalBayar,
      status: 'DRAFT',
      jenisKas: boronganForm.jenisKas,
      isBookedToBKU: false,
    });

    alert('Kontrak pekerjaan borongan berhasil disimpan!');
    setShowAddBoronganModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>Administrasi Pengupahan Tenaga Kerja Konstruksi</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Honor & Upah Tukang (Harian & Borongan)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan daftar tanda terima honorarium pekerja, lembur, dan pembayaran termin borongan
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeMode === 'HARIAN' ? (
              <button
                onClick={() => setShowAddHarianModal(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat SPJ Upah Harian</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddBoronganModal(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Input Kontrak Borongan</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-2 text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Daftar Upah</span>
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveMode('HARIAN')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeMode === 'HARIAN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>1. Upah Harian (Mingguan)</span>
            <span className="opacity-80 text-[11px]">({payrollHarian.length} SPJ)</span>
          </button>

          <button
            onClick={() => setActiveMode('BORONGAN')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeMode === 'BORONGAN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Upah Borongan (Termin / SPK)</span>
            <span className="opacity-80 text-[11px]">({payrollBorongan.length} Kontrak)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: HARIAN */}
      {activeMode === 'HARIAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of batches on the left (4 cols) */}
          <div className="no-print lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 pb-2 border-b border-slate-200">
              Daftar SPJ Upah Mingguan
            </h3>

            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {payrollHarian.map((batch) => {
                const isSelected = selectedBatchForPrint?.id === batch.id;
                return (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatchForPrint(batch)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {batch.noSpj}
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {formatRupiah(batch.totalDibayarkan)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium truncate">
                      Minggu Ke-{batch.mingguKe} · {batch.workers.length} Pekerja
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {batch.pekerjaanTerkait}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                      <span>{batch.periodeAwal} s/d {batch.periodeAkhir}</span>
                      <span>Kas: {batch.jenisKas}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Printable SPJ Upah Sheet (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedBatchForPrint ? (
              <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs print:p-0 print:border-0 space-y-6">
                <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">
                      Dokumen Tanda Terima Pembayaran Upah & Lampiran SPJ Mingguan
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {progressPhotos.filter((p) => p.mingguKe === selectedBatchForPrint.mingguKe).length} Foto Progres Terlampir pada SPJ ini
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPhotoUploaderInSpj(!showPhotoUploaderInSpj)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${
                        showPhotoUploaderInSpj
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload / Kelola Foto</span>
                      {showPhotoUploaderInSpj ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak SPJ Upah & Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus SPJ upah ${selectedBatchForPrint.noSpj}?`)) {
                          deletePayrollHarianBatch(selectedBatchForPrint.id);
                          setSelectedBatchForPrint(null);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Photo Uploader for SPJ if toggled */}
                {showPhotoUploaderInSpj && (
                  <div className="no-print">
                    <WeeklyPhotoUploader
                      mingguKe={selectedBatchForPrint.mingguKe}
                      photos={progressPhotos}
                      onPhotosChange={(newPhotos) => {
                        const otherWeekPhotos = progressPhotos.filter((p) => p.mingguKe !== selectedBatchForPrint.mingguKe);
                        const updatedForThisWeek = newPhotos
                          .filter((p) => p.mingguKe === selectedBatchForPrint.mingguKe || !p.mingguKe)
                          .map((p) => ({
                            ...p,
                            mingguKe: selectedBatchForPrint.mingguKe,
                          }));
                        addProgressPhotos([...otherWeekPhotos, ...updatedForThisWeek]);
                      }}
                      title={`Lampiran Foto Dokumentasi Fisik SPJ Minggu Ke-${selectedBatchForPrint.mingguKe}`}
                      subtitle="Upload foto-foto realisasi pekerjaan minggu ini. Foto otomatis ikut tercetak pada lembar lampiran SPJ Upah."
                    />
                  </div>
                )}

                {/* Formal Printable Document: Lembar 1 - Daftar Tanda Terima Upah */}
                <div className="border border-slate-400 p-6 rounded-lg text-slate-900 space-y-4">
                  {/* Header */}
                  <div className="text-center border-b-2 border-slate-800 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      {projectInfo.dataSekolah?.namaSekolah?.toUpperCase() || projectInfo.namaInstansi.toUpperCase()}
                    </h2>
                    <h1 className="text-base font-bold uppercase tracking-tight text-slate-900 mt-0.5">
                      DAFTAR TANDA TERIMA HONORARIUM TUKANG & PEKERJA
                    </h1>
                    <p className="text-xs text-slate-700 mt-1">
                      Kegiatan: {projectInfo.namaProyek} · TA {projectInfo.tahunAnggaran}
                    </p>
                    <div className="flex justify-between items-center text-[11px] text-slate-600 mt-2 px-1">
                      <span>No. Bukti: <strong className="font-mono">{selectedBatchForPrint.noSpj}</strong></span>
                      <span>Periode: {formatTanggalIndo(selectedBatchForPrint.periodeAwal)} s/d {formatTanggalIndo(selectedBatchForPrint.periodeAkhir)}</span>
                      <span>Minggu Ke: <strong>{selectedBatchForPrint.mingguKe}</strong></span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700">
                    <strong>Pekerjaan Terlaksana:</strong> {selectedBatchForPrint.pekerjaanTerkait}
                  </div>

                  {/* Worker Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border border-slate-400">
                      <thead className="bg-slate-100 text-slate-800 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-1.5 border border-slate-400 text-center w-8">No</th>
                          <th className="py-2 px-2 border border-slate-400">Nama Pekerja</th>
                          <th className="py-2 px-1.5 border border-slate-400 text-center">Jabatan</th>
                          <th className="py-2 px-2 border border-slate-400 text-right">Tarif/Hari</th>
                          <th className="py-2 px-1.5 border border-slate-400 text-center">Hari</th>
                          <th className="py-2 px-1.5 border border-slate-400 text-center">Lembur</th>
                          <th className="py-2 px-2 border border-slate-400 text-right">Kasbon</th>
                          <th className="py-2 px-2 border border-slate-400 text-right">Diterima Bersih</th>
                          <th className="py-2 px-3 border border-slate-400 text-center w-28">Tanda Tangan / Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatchForPrint.workers.map((w, idx) => (
                          <tr key={w.id} className="hover:bg-slate-50">
                            <td className="py-2 px-1.5 border border-slate-400 text-center font-mono">{idx + 1}</td>
                            <td className="py-2 px-2 border border-slate-400 font-semibold text-slate-900">{w.nama}</td>
                            <td className="py-2 px-1.5 border border-slate-400 text-center text-[11px] text-slate-600">{w.peran}</td>
                            <td className="py-2 px-2 border border-slate-400 text-right font-mono">{formatRupiah(w.upahHarian, false)}</td>
                            <td className="py-2 px-1.5 border border-slate-400 text-center font-mono">{w.hariKerja}</td>
                            <td className="py-2 px-1.5 border border-slate-400 text-center font-mono">{w.jamLembur} Jam</td>
                            <td className="py-2 px-2 border border-slate-400 text-right font-mono text-slate-500">
                              {w.kasbon > 0 ? formatRupiah(w.kasbon, false) : '-'}
                            </td>
                            <td className="py-2 px-2 border border-slate-400 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(w.totalUpahBersih, false)}
                            </td>
                            <td className="py-2 px-3 border border-slate-400 text-left align-middle text-[11px] text-slate-400">
                              {idx + 1}. ..................
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-500 text-xs">
                          <td colSpan={7} className="py-2.5 px-3 border border-slate-400 text-right uppercase">
                            Jumlah Total Upah Dibayarkan:
                          </td>
                          <td className="py-2.5 px-2 border border-slate-400 text-right font-mono text-sm text-slate-900">
                            {formatRupiah(selectedBatchForPrint.totalDibayarkan)}
                          </td>
                          <td className="border border-slate-400"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="pt-8 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-800">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Ketua Tim P2SP</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline uppercase">
                        {projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK}
                      </p>
                    </div>
                    <div>
                      <p>Telah Dibayar Lunas,</p>
                      <p className="font-bold">Bendahara Tim P2SP</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline uppercase">
                        {projectInfo.timP2sp?.bendahara?.nama || projectInfo.namaBendahara}
                      </p>
                    </div>
                    <div>
                      <p>{projectInfo.alamatLengkap?.desaKelurahan || projectInfo.desa}, {formatTanggalIndo(selectedBatchForPrint.tanggalBayar)}</p>
                      <p className="font-bold">Mandor / Koordinator Pekerja</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline uppercase">
                        {selectedBatchForPrint.workers.find((w) => w.peran === 'MANDOR')?.nama || 'Mandor Lapangan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formal Printable Document: Lembar 2 - Lampiran Dokumentasi Foto SPJ */}
                {(() => {
                  const spjPhotos = progressPhotos.filter(
                    (p) => p.mingguKe === selectedBatchForPrint.mingguKe || (!p.mingguKe && progressPhotos.length <= 4)
                  );
                  return (
                    <div className="border border-slate-400 p-6 rounded-lg text-slate-900 space-y-4 print:page-break-before">
                      <div className="text-center border-b-2 border-slate-800 pb-3">
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                          {projectInfo.dataSekolah?.namaSekolah?.toUpperCase() || projectInfo.namaInstansi.toUpperCase()}
                        </h3>
                        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 mt-0.5">
                          LAMPIRAN DOKUMENTASI FOTO FISIK PEKERJAAN (SPJ UPAH)
                        </h2>
                        <p className="text-xs text-slate-600 mt-0.5">
                          No. Bukti SPJ: <strong className="font-mono">{selectedBatchForPrint.noSpj}</strong> · Minggu Ke-{selectedBatchForPrint.mingguKe} · Periode: {selectedBatchForPrint.periodeAwal} s/d {selectedBatchForPrint.periodeAkhir}
                        </p>
                      </div>

                      {spjPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {spjPhotos.map((photo, idx) => (
                            <div key={photo.id} className="border border-slate-300 p-2.5 rounded bg-slate-50/50 space-y-2">
                              <div className="aspect-4/3 overflow-hidden bg-slate-200 rounded border border-slate-200 flex items-center justify-center">
                                <img
                                  src={photo.url}
                                  alt={photo.caption}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs border-t border-slate-200 pt-2">
                                <p className="font-bold text-slate-900 text-[11px]">
                                  Foto #{idx + 1}: <span className="font-normal text-slate-700">{photo.caption}</span>
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Minggu Ke-{photo.mingguKe} · Tanggal Dokumentasi: {photo.tanggal || selectedBatchForPrint.tanggalBayar}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-400 border border-dashed border-slate-300 rounded-lg">
                          <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-600">
                            Belum ada foto progres mingguan untuk SPJ Minggu Ke-{selectedBatchForPrint.mingguKe}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Klik tombol &quot;Upload / Kelola Foto&quot; di atas untuk melampirkan foto fisik pekerjaan agar ikut tercetak.
                          </p>
                        </div>
                      )}

                      {/* Photo Verification Signatures */}
                      <div className="pt-6 grid grid-cols-2 gap-6 text-center text-[11px] text-slate-800 border-t border-slate-200 mt-4">
                        <div>
                          <p>Diperiksa & Diverifikasi,</p>
                          <p className="font-bold">Pengawas Teknis Lapangan</p>
                          <div className="h-14"></div>
                          <p className="font-bold underline uppercase">
                            {projectInfo.timP2sp?.pengawas?.nama || 'Pengawas Lapangan'}
                          </p>
                        </div>
                        <div>
                          <p>Pelaksana Lapangan,</p>
                          <p className="font-bold">Ketua Tim P2SP</p>
                          <div className="h-14"></div>
                          <p className="font-bold underline uppercase">
                            {projectInfo.timP2sp?.ketuaP2sp?.nama || projectInfo.namaKetuaTPK}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
                Pilih salah satu SPJ upah di sebelah kiri untuk melihat dan mencetak dokumen.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: BORONGAN */}
      {activeMode === 'BORONGAN' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daftar Kontrak & Termin Pembayaran Upah Borongan
                </h2>
                <p className="text-xs text-slate-500">
                  Untuk paket pengerjaan borongan (seperti rangka atap baja ringan, pemasangan keramik granit, finishing plesteran)
                </p>
              </div>
              <button
                onClick={() => setShowAddBoronganModal(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Kontrak Borongan</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-slate-800 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">No. Kontrak / SPK</th>
                    <th className="py-2.5 px-3">Mandor / Rekanan</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Item Pekerjaan Borongan</th>
                    <th className="py-2.5 px-2 text-center">Volume</th>
                    <th className="py-2.5 px-3 text-right">Nilai Kontrak</th>
                    <th className="py-2.5 px-2 text-center">Progres (%)</th>
                    <th className="py-2.5 px-3">Termin Bayar</th>
                    <th className="py-2.5 px-3 text-right">Nominal Termin</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="no-print py-2.5 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payrollBorongan.map((item) => {
                    const isPaid = item.status === 'DIBAYAR';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {item.noKontrak}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {item.namaMandor}
                        </td>
                        <td className="py-3 px-3 text-slate-800">
                          {item.itemPekerjaan}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">
                          {item.volume} {item.satuan}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                          {formatRupiah(item.nilaiKontrak)}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-emerald-800">
                          {item.persentaseSelesai}%
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {item.tahapTermin}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(item.nominalTermin)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPaid ? 'Lunas Dibayar' : 'Menunggu Bayar'}
                          </span>
                        </td>
                        <td className="no-print py-3 px-2 text-center whitespace-nowrap">
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                const via = window.confirm(
                                  `Bayar ${item.tahapTermin} (${formatRupiah(item.nominalTermin)}) via Rekening BANK? Klik OK untuk BANK, Cancel untuk Kas TUNAI.`
                                )
                                  ? 'BANK'
                                  : 'TUNAI';
                                payWorkerBorongan(item.id, via);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors shadow-xs mr-2"
                            >
                              Bayar & Bukukan
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 mr-2">Tercatat di BKU</span>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('Hapus kontrak borongan ini?')) {
                                deleteWorkerBorongan(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT SPJ UPAH HARIAN */}
      {showAddHarianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Buat SPJ Pembayaran Upah Tukang Harian
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Menghitung upah harian, jam lembur, potongan kasbon, dan otomatis membukukan ke BKU
            </p>

            <form onSubmit={handleSaveBatchHarian} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor SPJ</label>
                  <input
                    type="text"
                    required
                    value={spjNo}
                    onChange={(e) => setSpjNo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Minggu Ke-</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mingguKe}
                    onChange={(e) => setMingguKe(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    required
                    value={tanggalBayarHarian}
                    onChange={(e) => setTanggalBayarHarian(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Periode Kerja</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      required
                      value={periodeAwal}
                      onChange={(e) => setPeriodeAwal(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <span>s/d</span>
                    <input
                      type="date"
                      required
                      value={periodeAkhir}
                      onChange={(e) => setPeriodeAkhir(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pekerjaan Terkait</label>
                  <input
                    type="text"
                    required
                    value={pekerjaanTerkait}
                    onChange={(e) => setPekerjaanTerkait(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Workers dynamic table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900">
                    Daftar Pekerja (Mandor, Tukang, Laden)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddWorkerRow}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Pekerja</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  {workersList.map((w) => (
                    <div
                      key={w.id}
                      className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-200"
                    >
                      <div className="col-span-3">
                        <input
                          type="text"
                          required
                          placeholder="Nama Pekerja"
                          value={w.nama}
                          onChange={(e) => handleWorkerFieldChange(w.id, 'nama', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded text-xs font-medium"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={w.peran}
                          onChange={(e) => handleWorkerFieldChange(w.id, 'peran', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white"
                        >
                          <option value="MANDOR">Mandor</option>
                          <option value="TUKANG">Tukang</option>
                          <option value="LADEN">Laden/Kenek</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="5000"
                          placeholder="Upah/Hari"
                          value={w.upahHarian}
                          onChange={(e) =>
                            handleWorkerFieldChange(w.id, 'upahHarian', parseInt(e.target.value) || 0)
                          }
                          className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="1"
                          max="7"
                          placeholder="Hari"
                          value={w.hariKerja}
                          onChange={(e) =>
                            handleWorkerFieldChange(w.id, 'hariKerja', parseInt(e.target.value) || 1)
                          }
                          className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-center"
                          title="Hari kerja"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          min="0"
                          placeholder="Lembur (jam)"
                          value={w.jamLembur}
                          onChange={(e) =>
                            handleWorkerFieldChange(w.id, 'jamLembur', parseInt(e.target.value) || 0)
                          }
                          className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-center"
                          title="Jam lembur"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {formatRupiah(w.totalUpahBersih)}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkerRow(w.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Auto Book */}
              <div className="p-3 bg-slate-100 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isBookedHarian}
                      onChange={(e) => setIsBookedHarian(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Otomatis bukukan pengeluaran ke Kas Tunai & BKU</span>
                  </label>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600 mr-2">Total Upah Mingguan:</span>
                  <span className="text-base font-bold font-mono text-emerald-800">
                    {formatRupiah(totalHonorBatch)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddHarianModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan & Terbitkan SPJ Upah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INPUT KONTRAK BORONGAN */}
      {showAddBoronganModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Input Pekerjaan Upah Borongan Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan surat perjanjian kerja (SPK) borongan dan rencana termin pembayaran
            </p>

            <form onSubmit={handleSaveBorongan} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. Kontrak / SPK</label>
                  <input
                    type="text"
                    required
                    value={boronganForm.noKontrak}
                    onChange={(e) => setBoronganForm({ ...boronganForm, noKontrak: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mandor / Pelaksana</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Kepala Tukang"
                    value={boronganForm.namaMandor}
                    onChange={(e) => setBoronganForm({ ...boronganForm, namaMandor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Item Pekerjaan Borongan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pasang Keramik Granit 60x60 Balai Warga"
                  value={boronganForm.itemPekerjaan}
                  onChange={(e) => setBoronganForm({ ...boronganForm, itemPekerjaan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Volume</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={boronganForm.volume}
                    onChange={(e) =>
                      setBoronganForm({ ...boronganForm, volume: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={boronganForm.satuan}
                    onChange={(e) => setBoronganForm({ ...boronganForm, satuan: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={boronganForm.hargaSatuan}
                    onChange={(e) =>
                      setBoronganForm({ ...boronganForm, hargaSatuan: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono text-right"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between">
                <span>Nilai Total Kontrak:</span>
                <strong className="font-mono text-slate-900">
                  {formatRupiah(boronganForm.volume * boronganForm.hargaSatuan)}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tahap Termin Saat Ini</label>
                  <input
                    type="text"
                    value={boronganForm.tahapTermin}
                    onChange={(e) => setBoronganForm({ ...boronganForm, tahapTermin: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nominal Termin Dibayar</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={boronganForm.nominalTermin}
                    onChange={(e) =>
                      setBoronganForm({ ...boronganForm, nominalTermin: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddBoronganModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Kontrak Borongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
