import React, { useState } from 'react';
import {
  School,
  MapPin,
  Users2,
  Landmark,
  FileCheck2,
  Save,
  Printer,
  Shield,
  UserCheck,
  Briefcase,
  Phone,
  CreditCard,
  Building,
  CheckCircle2,
  HardHat,
  Eye,
  Compass,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ProjectInfo, PersonilP2SP } from '../types';
import { formatRupiah, formatTanggalIndo, terbilangRupiah } from '../utils/terbilang';

interface MasterDataManagerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const MasterDataManager: React.FC<MasterDataManagerProps> = () => {
  const { projectInfo, updateProjectInfo } = useProject();

  const [activeSubTab, setActiveSubTab] = useState<'SEKOLAH' | 'ALAMAT' | 'TIM_P2SP' | 'BANK' | 'CETAK_SK'>('SEKOLAH');
  const [formData, setFormData] = useState<ProjectInfo>({ ...projectInfo });
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  // Sync state if external projectInfo changes
  React.useEffect(() => {
    setFormData({ ...projectInfo });
  }, [projectInfo]);

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Auto synchronize redundant top-level fields for backwards compatibility with BKU / LPJ
    const updatedData: ProjectInfo = {
      ...formData,
      namaInstansi: `${formData.dataSekolah.namaSekolah} (Tim P2SP Revitalisasi)`,
      nomorSuratTugas: formData.dataSekolah.nomorSkP2sp,
      lokasi: formData.alamatLengkap.jalan,
      desa: formData.alamatLengkap.desaKelurahan,
      kecamatan: formData.alamatLengkap.kecamatan,
      kabupaten: formData.alamatLengkap.kabupatenKota,
      provinsi: formData.alamatLengkap.provinsi,
      namaPimpinan: formData.timP2sp.penanggungJawab.nama,
      namaKetuaTPK: formData.timP2sp.ketuaP2sp.nama,
      namaBendahara: formData.timP2sp.bendahara.nama,
      namaPelaksanaTeknis: formData.timP2sp.kepalaPelaksana.nama,
    };

    updateProjectInfo(updatedData);
    setSaveSuccessNotification(true);
    setTimeout(() => {
      setSaveSuccessNotification(false);
    }, 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const updatePersonil = (key: keyof typeof formData.timP2sp, field: keyof PersonilP2SP, value: string) => {
    setFormData((prev) => ({
      ...prev,
      timP2sp: {
        ...prev.timP2sp,
        [key]: {
          ...prev.timP2sp[key],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Data Master Program Revitalisasi Satuan Pendidikan (P2SP)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <School className="w-6 h-6 text-emerald-700" />
              <span>Data Master Sekolah & Susunan Tim P2SP</span>
            </h1>
            <p className="text-sm text-slate-600">
              Konfigurasi terpadu profil satuan pendidikan, alamat resmi, dan 9 peran personil Panitia Pembangunan Satuan Pendidikan (P2SP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak SK & Struktur</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Data Master</span>
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {saveSuccessNotification && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Berhasil disimpan!</strong> Data master sekolah, alamat, dan 9 susunan personil P2SP telah diperbarui serta disinkronkan ke seluruh dokumen BKU dan LPJ.
            </span>
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveSubTab('SEKOLAH')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'SEKOLAH'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>1. Data Sekolah</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ALAMAT')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'ALAMAT'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Alamat Lengkap</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TIM_P2SP')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'TIM_P2SP'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>3. Struktur Personil Tim P2SP (9 Peran)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('BANK')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'BANK'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>4. Rekening Bank P2SP</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CETAK_SK')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'CETAK_SK'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>5. Bagan Struktur & Format SK</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DATA SEKOLAH */}
      {activeSubTab === 'SEKOLAH' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-700" />
                <span>Identitas Resmi Satuan Pendidikan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Informasi pokok sekolah yang menjadi dasar kop laporan pertanggungjawaban (LPJ), kwitansi, dan buku kas.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              NPSN: {formData.dataSekolah.npsn || '-'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Resmi Satuan Pendidikan / Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.dataSekolah.namaSekolah}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataSekolah: { ...formData.dataSekolah, namaSekolah: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: SD Negeri 01 Babakan"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.dataSekolah.npsn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataSekolah: { ...formData.dataSekolah, npsn: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: 20201842"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jenjang Pendidikan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.dataSekolah.jenjang}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataSekolah: {
                      ...formData.dataSekolah,
                      jenjang: e.target.value as typeof formData.dataSekolah.jenjang,
                    },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                <option value="SLB">SLB (Sekolah Luar Biasa)</option>
                <option value="Lainnya">Lainnya / Madrasah</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Sekolah <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.dataSekolah.statusSekolah}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataSekolah: {
                      ...formData.dataSekolah,
                      statusSekolah: e.target.value as 'NEGERI' | 'SWASTA',
                    },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="NEGERI">NEGERI</option>
                <option value="SWASTA">SWASTA</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor SK Pembentukan P2SP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.dataSekolah.nomorSkP2sp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataSekolah: { ...formData.dataSekolah, nomorSkP2sp: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: 421.2/015/P2SP-SDN01/2026"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Penetapan SK P2SP <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dataSekolah.tanggalSkP2sp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataSekolah: { ...formData.dataSekolah, tanggalSkP2sp: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Nama Program / Kegiatan Revitalisasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.namaProyek}
                onChange={(e) => setFormData({ ...formData, namaProyek: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: Revitalisasi Ruang Kelas & Sarana Prasarana Sekolah SDN 01 Babakan"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tahun Anggaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.tahunAnggaran}
                onChange={(e) => setFormData({ ...formData, tahunAnggaran: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="2026"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Total Pagu Anggaran Bantuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                required
                value={formData.totalPaguAnggaran}
                onChange={(e) =>
                  setFormData({ ...formData, totalPaguAnggaran: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <strong className="text-emerald-700 font-mono">
                  {formatRupiah(formData.totalPaguAnggaran)}
                </strong>
                <span className="text-slate-400 italic truncate max-w-[260px]">
                  {formData.totalPaguAnggaran > 0 ? `#${terbilangRupiah(formData.totalPaguAnggaran)}#` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Sekolah</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ALAMAT LENGKAP */}
      {activeSubTab === 'ALAMAT' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>Alamat Lengkap Satuan Pendidikan & Lokasi Kegiatan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Alamat domisili sekolah yang tercantum pada seluruh dokumen resmi, kwitansi toko, dan laporan berkala.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Jalan / Dusun / Gang / No. Bangunan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.alamatLengkap.jalan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, jalan: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: Jl. Raya Babakan No. 42, Dusun Babakan Kaum"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                RT / RW <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.alamatLengkap.rtRw}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, rtRw: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: RT 02 / RW 04"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Desa / Kelurahan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.alamatLengkap.desaKelurahan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, desaKelurahan: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: Babakan"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.alamatLengkap.kecamatan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, kecamatan: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: Babakan Madang"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kabupaten / Kota <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.alamatLengkap.kabupatenKota}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, kabupatenKota: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: Kabupaten Bogor"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Provinsi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.alamatLengkap.provinsi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, provinsi: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: Jawa Barat"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                value={formData.alamatLengkap.kodePos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamatLengkap: { ...formData.alamatLengkap, kodePos: e.target.value },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: 16810"
              />
            </div>
          </div>

          {/* Formatted Address Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <span className="font-bold text-slate-700 block mb-1">Pratinjau Alamat Lengkap Dokumen:</span>
            <p className="text-slate-800 leading-relaxed font-medium">
              {formData.dataSekolah.namaSekolah} · {formData.alamatLengkap.jalan} ({formData.alamatLengkap.rtRw}), Desa/Kel. {formData.alamatLengkap.desaKelurahan}, Kec. {formData.alamatLengkap.kecamatan}, {formData.alamatLengkap.kabupatenKota}, Prov. {formData.alamatLengkap.provinsi} {formData.alamatLengkap.kodePos ? `[${formData.alamatLengkap.kodePos}]` : ''}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Alamat Sekolah</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: STRUKTUR PERSONIL TIM P2SP (9 PERAN LENGKAP) */}
      {activeSubTab === 'TIM_P2SP' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-emerald-950 font-bold text-sm">
                9 Peran Pokok Panitia Pembangunan Satuan Pendidikan (P2SP)
              </strong>
              <p className="text-emerald-800 leading-relaxed">
                Struktur ini dirancang sesuai Petunjuk Operasional Pelaksanaan Bantuan Pembangunan Satuan Pendidikan (P2SP) Kemendikbudristek: 
                Penanggung Jawab, Ketua P2SP, Sekretaris/Logistik, Bendahara, Kepala Pelaksana, Keamanan, Perencana, Pengawas, dan Fasilitator.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. PENANGGUNG JAWAB */}
            <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                1. Penanggung Jawab
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Penanggung Jawab</h4>
                  <span className="text-[11px] text-slate-500">Kepala Satuan Pendidikan / Komite</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.penanggungJawab.nama}
                    onChange={(e) => updatePersonil('penanggungJawab', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Dra. Hj. Endang Rahayu, M.Pd."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.penanggungJawab.nipNik || ''}
                    onChange={(e) => updatePersonil('penanggungJawab', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="19740512 199803 2 004"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Jabatan Pokok</label>
                  <input
                    type="text"
                    value={formData.timP2sp.penanggungJawab.jabatanAsal}
                    onChange={(e) => updatePersonil('penanggungJawab', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Kepala Sekolah"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.penanggungJawab.noHp || ''}
                    onChange={(e) => updatePersonil('penanggungJawab', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0812-8877-6651"
                  />
                </div>
              </div>
            </div>

            {/* 2. KETUA P2SP */}
            <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                2. Ketua P2SP
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ketua Tim P2SP</h4>
                  <span className="text-[11px] text-slate-500">Ketua Pelaksana Pembangunan</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.ketuaP2sp.nama}
                    onChange={(e) => updatePersonil('ketuaP2sp', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="H. Rahmat Hidayat, S.T."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.ketuaP2sp.nipNik || ''}
                    onChange={(e) => updatePersonil('ketuaP2sp', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="3201081504780003"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Jabatan Pokok</label>
                  <input
                    type="text"
                    value={formData.timP2sp.ketuaP2sp.jabatanAsal}
                    onChange={(e) => updatePersonil('ketuaP2sp', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Ketua Komite Sekolah"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.ketuaP2sp.noHp || ''}
                    onChange={(e) => updatePersonil('ketuaP2sp', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0813-1122-3344"
                  />
                </div>
              </div>
            </div>

            {/* 3. SEKRETARIS / LOGISTIK */}
            <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                3. Sekretaris / Logistik
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Sekretaris / Logistik</h4>
                  <span className="text-[11px] text-slate-500">Administrasi & Pengadaan Material</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.sekretarisLogistik.nama}
                    onChange={(e) => updatePersonil('sekretarisLogistik', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Muhammad Rizki Fauzi, S.Pd."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.sekretarisLogistik.nipNik || ''}
                    onChange={(e) => updatePersonil('sekretarisLogistik', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="19890214 201903 1 008"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Jabatan Pokok</label>
                  <input
                    type="text"
                    value={formData.timP2sp.sekretarisLogistik.jabatanAsal}
                    onChange={(e) => updatePersonil('sekretarisLogistik', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Guru & Pengelola Sarpras"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.sekretarisLogistik.noHp || ''}
                    onChange={(e) => updatePersonil('sekretarisLogistik', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0857-1234-5678"
                  />
                </div>
              </div>
            </div>

            {/* 4. BENDAHARA */}
            <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                4. Bendahara
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Bendahara P2SP</h4>
                  <span className="text-[11px] text-slate-500">Pengelola Kas & Pembukuan SPJ</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.bendahara.nama}
                    onChange={(e) => updatePersonil('bendahara', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Siti Nurhalizah, S.E."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.bendahara.nipNik || ''}
                    onChange={(e) => updatePersonil('bendahara', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="3201085208850002"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Jabatan Pokok</label>
                  <input
                    type="text"
                    value={formData.timP2sp.bendahara.jabatanAsal}
                    onChange={(e) => updatePersonil('bendahara', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Bendahara Sekolah / BOS"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.bendahara.noHp || ''}
                    onChange={(e) => updatePersonil('bendahara', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0821-9988-7766"
                  />
                </div>
              </div>
            </div>

            {/* 5. KEPALA PELAKSANA */}
            <div className="bg-white border-2 border-orange-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                5. Kepala Pelaksana
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-orange-50 text-orange-700 rounded-lg">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Kepala Pelaksana</h4>
                  <span className="text-[11px] text-slate-500">Pelaksana Lapangan / Mandor Utama</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.kepalaPelaksana.nama}
                    onChange={(e) => updatePersonil('kepalaPelaksana', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Drs. Agus Sulaeman"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.kepalaPelaksana.nipNik || ''}
                    onChange={(e) => updatePersonil('kepalaPelaksana', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="3201082207700001"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Jabatan Pokok</label>
                  <input
                    type="text"
                    value={formData.timP2sp.kepalaPelaksana.jabatanAsal}
                    onChange={(e) => updatePersonil('kepalaPelaksana', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Pelaksana Lapangan Konstruksi"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.kepalaPelaksana.noHp || ''}
                    onChange={(e) => updatePersonil('kepalaPelaksana', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0815-7788-9900"
                  />
                </div>
              </div>
            </div>

            {/* 6. KEAMANAN */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                6. Keamanan
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Petugas Keamanan</h4>
                  <span className="text-[11px] text-slate-500">Kamtib & Pengamanan Aset / Material</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.timP2sp.keamanan.nama}
                    onChange={(e) => updatePersonil('keamanan', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Suparman Wijaya"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.keamanan.nipNik || ''}
                    onChange={(e) => updatePersonil('keamanan', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="3201080905750004"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Jabatan Pokok</label>
                  <input
                    type="text"
                    value={formData.timP2sp.keamanan.jabatanAsal}
                    onChange={(e) => updatePersonil('keamanan', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Petugas Keamanan / Kamtib"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.keamanan.noHp || ''}
                    onChange={(e) => updatePersonil('keamanan', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0858-6677-8899"
                  />
                </div>
              </div>
            </div>

            {/* 7. PERENCANA */}
            <div className="bg-white border-2 border-cyan-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                7. Perencana
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-cyan-50 text-cyan-700 rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Tim Teknis Perencana</h4>
                  <span className="text-[11px] text-slate-500">Penyusun Gambar Kerja, RAB & AHSP</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.perencana.nama}
                    onChange={(e) => updatePersonil('perencana', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Ir. Hendra Gunawan, M.T."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.perencana.nipNik || ''}
                    onChange={(e) => updatePersonil('perencana', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="3271031406800007"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Keahlian / Jabatan</label>
                  <input
                    type="text"
                    value={formData.timP2sp.perencana.jabatanAsal}
                    onChange={(e) => updatePersonil('perencana', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Perencana Teknis Sipil / Arsitek"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.perencana.noHp || ''}
                    onChange={(e) => updatePersonil('perencana', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0811-2233-4455"
                  />
                </div>
              </div>
            </div>

            {/* 8. PENGAWAS */}
            <div className="bg-white border-2 border-teal-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                8. Pengawas
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Tim Teknis Pengawas</h4>
                  <span className="text-[11px] text-slate-500">Pengawas Mutu Fisik & Progres Mingguan</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.pengawas.nama}
                    onChange={(e) => updatePersonil('pengawas', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Budi Santoso, S.T."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.pengawas.nipNik || ''}
                    onChange={(e) => updatePersonil('pengawas', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="3201081109830005"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Keahlian / Jabatan</label>
                  <input
                    type="text"
                    value={formData.timP2sp.pengawas.jabatanAsal}
                    onChange={(e) => updatePersonil('pengawas', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Pengawas Teknis Lapangan"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.pengawas.noHp || ''}
                    onChange={(e) => updatePersonil('pengawas', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0812-3456-7890"
                  />
                </div>
              </div>
            </div>

            {/* 9. FASILITATOR */}
            <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-700 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                9. Fasilitator
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Fasilitator Teknis</h4>
                  <span className="text-[11px] text-slate-500">Pendamping Dinas Pendidikan / Konsultan</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.timP2sp.fasilitator.nama}
                    onChange={(e) => updatePersonil('fasilitator', 'nama', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                    placeholder="Ir. Ahmad Zarkasih, M.Eng."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">NIP / NIK</label>
                  <input
                    type="text"
                    value={formData.timP2sp.fasilitator.nipNik || ''}
                    onChange={(e) => updatePersonil('fasilitator', 'nipNik', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-slate-800 text-[11px]"
                    placeholder="19800615 200801 1 012"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">Instansi / Asal Tugas</label>
                  <input
                    type="text"
                    value={formData.timP2sp.fasilitator.jabatanAsal}
                    onChange={(e) => updatePersonil('fasilitator', 'jabatanAsal', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="Fasilitator DAK Fisik Disdik"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-0.5">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.timP2sp.fasilitator.noHp || ''}
                    onChange={(e) => updatePersonil('fasilitator', 'noHp', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                    placeholder="0813-4567-8901"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Susunan Personil Tim P2SP</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: REKENING BANK */}
      {activeSubTab === 'BANK' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-700" />
                <span>Rekening Bank Operasional Satuan Pendidikan (P2SP)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Rekening bank resmi yang digunakan untuk menerima penyaluran dana bantuan pemerintah serta mutasi belanja proyek.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Lembaga Perbankan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.namaBank}
                onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none font-medium"
                placeholder="Contoh: Bank BJB Cabang Cibinong"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Rekening Bank <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nomorRekeningBank}
                onChange={(e) => setFormData({ ...formData, nomorRekeningBank: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: 0087-2311-2990-1"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Atas Nama Rekening (Sesuai Buku Tabungan) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.atasNamaRekening}
                onChange={(e) => setFormData({ ...formData, atasNamaRekening: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                placeholder="Contoh: P2SP SDN 01 BABAKAN"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-slate-800">Ketentuan Penarikan & Pengendalian Dana Bank:</span>
            <p className="text-slate-600 leading-relaxed">
              Berdasarkan juknis pengelolaan bantuan swakelola, penarikan dana dari rekening bank harus ditandatangani bersama (joint account) oleh <strong>Ketua P2SP</strong> ({formData.timP2sp.ketuaP2sp.nama || 'Ketua P2SP'}) dan <strong>Bendahara</strong> ({formData.timP2sp.bendahara.nama || 'Bendahara'}), serta diketahui oleh <strong>Penanggung Jawab / Kepala Sekolah</strong> ({formData.timP2sp.penanggungJawab.nama || 'Kepala Sekolah'}).
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Rekening Bank</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: BAGAN STRUKTUR & FORMAT CETAK SK P2SP */}
      {activeSubTab === 'CETAK_SK' && (
        <div className="space-y-6">
          <div className="no-print bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm">Lembar Struktur Organisasi & Lampiran SK P2SP</h4>
              <p className="text-xs text-slate-300">
                Tampilan format resmi siap cetak (A4) untuk dilampirkan dalam Dokumen Pelaksanaan dan LPJ.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>

          {/* Printable Official Document Sheet */}
          <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-xs text-slate-900 print:p-0 print:border-0">
            {/* Kop Resmi Satuan Pendidikan */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h2 className="text-xs uppercase font-bold tracking-widest text-slate-700">
                PEMERINTAH {formData.alamatLengkap.kabupatenKota?.toUpperCase() || 'KABUPATEN BOGOR'}
              </h2>
              <h2 className="text-xs uppercase font-bold tracking-widest text-slate-700">
                DINAS PENDIDIKAN
              </h2>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight mt-1">
                {formData.dataSekolah.namaSekolah?.toUpperCase()}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                NPSN: {formData.dataSekolah.npsn} · {formData.alamatLengkap.jalan}, Desa {formData.alamatLengkap.desaKelurahan}, Kec. {formData.alamatLengkap.kecamatan}, {formData.alamatLengkap.kabupatenKota}
              </p>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm font-bold uppercase underline tracking-wider">
                SUSUNAN PANITIA PEMBANGUNAN SATUAN PENDIDIKAN (P2SP)
              </h3>
              <p className="text-xs text-slate-700 mt-1">
                Lampiran Keputusan Kepala Satuan Pendidikan Nomor: <strong>{formData.dataSekolah.nomorSkP2sp}</strong>
              </p>
              <p className="text-xs text-slate-700">
                Kegiatan: {formData.namaProyek} · Tahun Anggaran {formData.tahunAnggaran}
              </p>
            </div>

            {/* Hierarchical Visual Flow Chart */}
            <div className="my-6 p-4 border border-slate-300 rounded-xl bg-slate-50/50 space-y-4">
              {/* Level 1: Penanggung Jawab & Fasilitator */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="w-64 p-3 bg-white border-2 border-blue-500 rounded-lg text-center shadow-xs">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Penanggung Jawab</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{formData.timP2sp.penanggungJawab.nama}</strong>
                  <span className="text-[10px] text-slate-500 block">NIP: {formData.timP2sp.penanggungJawab.nipNik || '-'}</span>
                </div>
                <div className="hidden sm:block text-slate-400 font-bold">↔</div>
                <div className="w-64 p-3 bg-white border-2 border-purple-500 rounded-lg text-center shadow-xs">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Fasilitator Teknis</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{formData.timP2sp.fasilitator.nama}</strong>
                  <span className="text-[10px] text-slate-500 block">{formData.timP2sp.fasilitator.jabatanAsal}</span>
                </div>
              </div>

              {/* Connecting line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-slate-400"></div>
              </div>

              {/* Level 2: Ketua P2SP */}
              <div className="flex justify-center">
                <div className="w-72 p-3 bg-white border-2 border-emerald-600 rounded-lg text-center shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Ketua P2SP</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{formData.timP2sp.ketuaP2sp.nama}</strong>
                  <span className="text-[10px] text-slate-500 block">{formData.timP2sp.ketuaP2sp.jabatanAsal}</span>
                </div>
              </div>

              {/* Connecting line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-slate-400"></div>
              </div>

              {/* Level 3: Sekretaris & Bendahara */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="p-3 bg-white border border-indigo-400 rounded-lg text-center shadow-xs">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">Sekretaris / Logistik</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{formData.timP2sp.sekretarisLogistik.nama}</strong>
                  <span className="text-[10px] text-slate-500 block">{formData.timP2sp.sekretarisLogistik.jabatanAsal}</span>
                </div>
                <div className="p-3 bg-white border border-amber-400 rounded-lg text-center shadow-xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Bendahara</span>
                  <strong className="text-xs text-slate-900 block mt-0.5">{formData.timP2sp.bendahara.nama}</strong>
                  <span className="text-[10px] text-slate-500 block">{formData.timP2sp.bendahara.jabatanAsal}</span>
                </div>
              </div>

              {/* Connecting line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-slate-400"></div>
              </div>

              {/* Level 4: Tim Pelaksana Teknis, Pengawas, Perencana, Keamanan */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-white border border-orange-300 rounded-lg text-center shadow-xs">
                  <span className="text-[9px] font-bold text-orange-800 uppercase block">Kepala Pelaksana</span>
                  <strong className="text-[11px] text-slate-900 block mt-0.5">{formData.timP2sp.kepalaPelaksana.nama}</strong>
                  <span className="text-[9px] text-slate-500 block">Mandor Konstruksi</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-300 rounded-lg text-center shadow-xs">
                  <span className="text-[9px] font-bold text-slate-800 uppercase block">Keamanan</span>
                  <strong className="text-[11px] text-slate-900 block mt-0.5">{formData.timP2sp.keamanan.nama}</strong>
                  <span className="text-[9px] text-slate-500 block">Kamtib & Aset</span>
                </div>
                <div className="p-2.5 bg-white border border-cyan-400 rounded-lg text-center shadow-xs">
                  <span className="text-[9px] font-bold text-cyan-800 uppercase block">Perencana</span>
                  <strong className="text-[11px] text-slate-900 block mt-0.5">{formData.timP2sp.perencana.nama}</strong>
                  <span className="text-[9px] text-slate-500 block">Gambar & RAB</span>
                </div>
                <div className="p-2.5 bg-white border border-teal-400 rounded-lg text-center shadow-xs">
                  <span className="text-[9px] font-bold text-teal-800 uppercase block">Pengawas</span>
                  <strong className="text-[11px] text-slate-900 block mt-0.5">{formData.timP2sp.pengawas.nama}</strong>
                  <span className="text-[9px] text-slate-500 block">Pengawas Mutu</span>
                </div>
              </div>
            </div>

            {/* Official List Table */}
            <div className="mt-8">
              <h4 className="font-bold text-xs uppercase mb-2">Daftar Personil & Tugas Pokok Tim P2SP:</h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                    <th className="py-2 px-2 border border-slate-400 text-center w-8">No</th>
                    <th className="py-2 px-3 border border-slate-400">Nama Lengkap & Gelar</th>
                    <th className="py-2 px-2 border border-slate-400">NIP / NIK</th>
                    <th className="py-2 px-3 border border-slate-400">Jabatan dalam Tim P2SP</th>
                    <th className="py-2 px-3 border border-slate-400">Jabatan Asal / Instansi</th>
                    <th className="py-2 px-2 border border-slate-400">No. Kontak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">1</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.penanggungJawab.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.penanggungJawab.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-blue-900">Penanggung Jawab</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.penanggungJawab.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.penanggungJawab.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">2</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.ketuaP2sp.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.ketuaP2sp.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-emerald-900">Ketua P2SP</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.ketuaP2sp.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.ketuaP2sp.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">3</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.sekretarisLogistik.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.sekretarisLogistik.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-indigo-900">Sekretaris / Logistik</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.sekretarisLogistik.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.sekretarisLogistik.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">4</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.bendahara.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.bendahara.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-amber-900">Bendahara</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.bendahara.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.bendahara.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">5</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.kepalaPelaksana.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.kepalaPelaksana.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-orange-900">Kepala Pelaksana</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.kepalaPelaksana.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.kepalaPelaksana.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">6</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.keamanan.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.keamanan.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-slate-800">Keamanan</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.keamanan.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.keamanan.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">7</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.perencana.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.perencana.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-cyan-900">Perencana Teknis</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.perencana.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.perencana.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">8</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.pengawas.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.pengawas.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-teal-900">Pengawas Teknis</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.pengawas.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.pengawas.noHp || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">9</td>
                    <td className="py-2 px-3 border border-slate-400 font-bold">{formData.timP2sp.fasilitator.nama}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.fasilitator.nipNik || '-'}</td>
                    <td className="py-2 px-3 border border-slate-400 font-medium text-purple-900">Fasilitator Teknis</td>
                    <td className="py-2 px-3 border border-slate-400">{formData.timP2sp.fasilitator.jabatanAsal}</td>
                    <td className="py-2 px-2 border border-slate-400 font-mono text-[11px]">{formData.timP2sp.fasilitator.noHp || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-900">
              <div>
                <p>Mengetahui / Menyetujui,</p>
                <p className="font-bold">Ketua Tim P2SP</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">{formData.timP2sp.ketuaP2sp.nama}</p>
                <p className="text-[10px] text-slate-500">{formData.timP2sp.ketuaP2sp.jabatanAsal}</p>
              </div>

              <div>
                <p>{formData.alamatLengkap.desaKelurahan}, {formatTanggalIndo(formData.dataSekolah.tanggalSkP2sp || new Date().toISOString().split('T')[0])}</p>
                <p className="font-bold">Kepala Satuan Pendidikan / Penanggung Jawab</p>
                <div className="h-20"></div>
                <p className="font-bold underline uppercase">{formData.timP2sp.penanggungJawab.nama}</p>
                <p className="text-[10px] text-slate-500">NIP: {formData.timP2sp.penanggungJawab.nipNik || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
