import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Search,
  Eye,
  Building,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { CashType, Kwitansi, MaterialItem } from '../types';
import { formatRupiah, formatTanggalIndo, terbilangRupiah } from '../utils/terbilang';
import { Sparkles } from 'lucide-react';

interface ReceiptGeneratorProps {
  onNavigateToRabSync?: () => void;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ onNavigateToRabSync }) => {
  const { projectInfo, kwitansiList, addKwitansi, deleteKwitansi } = useProject();

  const [activeSubTab, setActiveSubTab] = useState<'DAFTAR' | 'BUAT_BARU'>('DAFTAR');
  const [selectedKwitansiForPrint, setSelectedKwitansiForPrint] = useState<Kwitansi | null>(
    kwitansiList[0] || null
  );

  // Form State for new Kwitansi
  const nextNum = kwitansiList.length + 1;
  const initialNoKwt = `KWT/REV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(nextNum).padStart(3, '0')}`;

  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formNomor, setFormNomor] = useState(initialNoKwt);
  const [formTelahTerimaDari, setFormTelahTerimaDari] = useState(
    `Bendahara TPK Program Revitalisasi ${projectInfo.desa}`
  );
  const [formPenerimaNama, setFormPenerimaNama] = useState('');
  const [formPenerimaAlamat, setFormPenerimaAlamat] = useState('');
  const [formUntukPembayaran, setFormUntukPembayaran] = useState('');
  const [formProgressCategory, setFormProgressCategory] = useState(
    'Pekerjaan Dinding & Plesteran'
  );
  const [formJenisKas, setFormJenisKas] = useState<CashType>('TUNAI');
  const [formIsBooked, setFormIsBooked] = useState(true);

  // Material item list
  const [items, setItems] = useState<MaterialItem[]>([
    {
      id: '1',
      namaBarang: 'Semen Portland 50 Kg',
      spesifikasi: 'Tipe I SNI',
      volume: 40,
      satuan: 'sak',
      hargaSatuan: 68000,
      subtotal: 2720000,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Update item
  const handleItemChange = (
    id: string,
    field: keyof MaterialItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === 'volume' || field === 'hargaSatuan') {
          updated.subtotal = Number(updated.volume || 0) * Number(updated.hargaSatuan || 0);
        }
        return updated;
      })
    );
  };

  const handleAddItem = () => {
    const newItem: MaterialItem = {
      id: String(Date.now()),
      namaBarang: '',
      spesifikasi: '',
      volume: 1,
      satuan: 'sak',
      hargaSatuan: 0,
      subtotal: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Compute total
  const totalNomorUang = items.reduce((sum, it) => sum + (it.subtotal || 0), 0);
  const liveTerbilang = terbilangRupiah(totalNomorUang);

  const handleSubmitKwitansi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPenerimaNama.trim()) {
      alert('Nama penerima / Toko Penyedia wajib diisi.');
      return;
    }
    if (totalNomorUang <= 0) {
      alert('Total kwitansi harus lebih dari Rp 0.');
      return;
    }

    const newKwt: Omit<Kwitansi, 'id'> = {
      nomorKwitansi: formNomor,
      tanggal: formTanggal,
      telahTerimaDari: formTelahTerimaDari,
      uangSebanyak: totalNomorUang,
      terbilang: liveTerbilang,
      untukPembayaran: formUntukPembayaran || `Pembelian Material Kebutuhan ${formProgressCategory}`,
      penerimaNama: formPenerimaNama,
      penerimaAlamat: formPenerimaAlamat,
      tempatTtd: projectInfo.desa,
      items: items.filter((it) => it.namaBarang.trim() !== ''),
      jenisKasPembayaran: formJenisKas,
      isBookedToBKU: formIsBooked,
      status: 'LUNAS',
      progressCategory: formProgressCategory,
    };

    addKwitansi(newKwt);
    alert('Kwitansi berhasil diterbitkan dan otomatis dicatat ke Buku Kas!');
    setActiveSubTab('DAFTAR');
  };

  const filteredKwitansi = kwitansiList.filter(
    (k) =>
      k.nomorKwitansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.penerimaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.untukPembayaran.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>Administrasi Pengadaan & Bukti Pengeluaran Riil</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Generator Kwitansi Pembelian Barang Otomatis
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Menghasilkan kwitansi resmi berstandar hukum dengan terbilang otomatis dan pembukuan langsung ke BKU
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToRabSync && (
              <button
                type="button"
                onClick={onNavigateToRabSync}
                className="px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-700 text-white shadow-xs hover:from-emerald-700 hover:to-teal-800"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Pecah dari Progres Mingguan</span>
              </button>
            )}

            <button
              onClick={() => setActiveSubTab('BUAT_BARU')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                activeSubTab === 'BUAT_BARU'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Terbitkan Kwitansi Baru</span>
            </button>

            <button
              onClick={() => setActiveSubTab('DAFTAR')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeSubTab === 'DAFTAR'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <span>Arsip Kwitansi ({kwitansiList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: FORM BUAT KWITANSI BARU */}
      {activeSubTab === 'BUAT_BARU' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Formulir Pembuatan Kwitansi Material
            </h2>

            <form onSubmit={handleSubmitKwitansi} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nomor Bukti Kwitansi
                  </label>
                  <input
                    type="text"
                    required
                    value={formNomor}
                    onChange={(e) => setFormNomor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Sudah Terima Dari (Instansi / Pembayar)
                </label>
                <input
                  type="text"
                  required
                  value={formTelahTerimaDari}
                  onChange={(e) => setFormTelahTerimaDari(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Toko Penyedia / Nama Penerima Uang
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: TB. Sumber Jaya Makmur (Bpk. Joko)"
                    value={formPenerimaNama}
                    onChange={(e) => setFormPenerimaNama(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Alamat Toko / Penjual
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Jl. Raya Babakan No. 12"
                    value={formPenerimaAlamat}
                    onChange={(e) => setFormPenerimaAlamat(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kategori Pekerjaan Bangunan Terkait
                </label>
                <select
                  value={formProgressCategory}
                  onChange={(e) => setFormProgressCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Pekerjaan Pondasi & Galian Tanah">Pekerjaan Pondasi & Galian Tanah</option>
                  <option value="Pekerjaan Struktur Kolom & Balok Beton">Pekerjaan Struktur Kolom & Balok Beton</option>
                  <option value="Pekerjaan Dinding Bata Ringan & Plesteran">Pekerjaan Dinding Bata Ringan & Plesteran</option>
                  <option value="Pekerjaan Rangka Atap Baja Ringan & Genteng">Pekerjaan Rangka Atap Baja Ringan & Genteng</option>
                  <option value="Pekerjaan Lantai Granit & Plafon">Pekerjaan Lantai Granit & Plafon</option>
                  <option value="Pekerjaan Pengecatan & Finishing">Pekerjaan Pengecatan & Finishing</option>
                  <option value="Pekerjaan Instalasi Listrik & Sanitasi">Pekerjaan Instalasi Listrik & Sanitasi</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan Uraian Pembayaran
                </label>
                <input
                  type="text"
                  placeholder="Misal: Pembelian semen, pasir, dan besi beton tahap pondasi balai kemasyarakatan"
                  value={formUntukPembayaran}
                  onChange={(e) => setFormUntukPembayaran(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Dynamic Material Items Table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-900">
                    Rincian Barang & Material Pembelian
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Barang</span>
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-200"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Nama Barang (misal: Semen Gresik)"
                          value={it.namaBarang}
                          onChange={(e) => handleItemChange(it.id, 'namaBarang', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          required
                          placeholder="Volume"
                          value={it.volume}
                          onChange={(e) =>
                            handleItemChange(it.id, 'volume', parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Satuan (sak/m3/bh)"
                          value={it.satuan}
                          onChange={(e) => handleItemChange(it.id, 'satuan', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded text-xs text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          placeholder="Harga Satuan (Rp)"
                          value={it.hargaSatuan}
                          onChange={(e) =>
                            handleItemChange(it.id, 'hargaSatuan', parseInt(e.target.value) || 0)
                          }
                          className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method & Auto-Book Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">
                    Sumber Dana Pembayaran:
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="jenisKas"
                        checked={formJenisKas === 'TUNAI'}
                        onChange={() => setFormJenisKas('TUNAI')}
                        className="text-emerald-600"
                      />
                      <span>Kas Tunai Lapangan</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="jenisKas"
                        checked={formJenisKas === 'BANK'}
                        onChange={() => setFormJenisKas('BANK')}
                        className="text-emerald-600"
                      />
                      <span>Transfer Bank ({projectInfo.namaBank})</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBooked}
                      onChange={(e) => setFormIsBooked(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="text-slate-700">
                      Otomatis catat pengeluaran ini ke Buku Kas Umum (BKU) & Kas {formJenisKas}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('DAFTAR')}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  Terbitkan & Simpan Kwitansi
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview of Kwitansi (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pratinjau Langsung (Live Preview)
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  {formNomor}
                </span>
              </div>

              {/* Authentic Kwitansi Layout Card */}
              <div className="border border-slate-800 p-4 rounded bg-amber-50/20 text-slate-900 text-xs space-y-3 font-serif">
                <div className="flex justify-between items-start border-b border-slate-400 pb-2">
                  <div>
                    <h3 className="font-bold text-sm tracking-wide uppercase font-sans">
                      KWITANSI PEMBAYARAN
                    </h3>
                    <p className="text-[10px] text-slate-600 font-sans">{projectInfo.namaInstansi}</p>
                  </div>
                  <div className="text-right text-[11px] font-mono">
                    <div>No: {formNomor}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-600">Telah Terima Dari</span>
                    <span className="col-span-2 font-medium">: {formTelahTerimaDari}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-600">Uang Sebanyak</span>
                    <span className="col-span-2 italic font-semibold text-slate-800">
                      : # {liveTerbilang} #
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-600">Untuk Pembayaran</span>
                    <span className="col-span-2 font-medium">
                      : {formUntukPembayaran || `Pembelian barang untuk ${formProgressCategory}`}
                    </span>
                  </div>
                </div>

                {/* Items Mini-list */}
                <div className="border-t border-b border-slate-300 py-1.5 my-2 font-sans text-[11px]">
                  <div className="font-semibold mb-1">Rincian Barang:</div>
                  <ul className="space-y-0.5">
                    {items.map((it, idx) => (
                      <li key={idx} className="flex justify-between text-slate-700">
                        <span>
                          {idx + 1}. {it.namaBarang || 'Item'} ({it.volume} {it.satuan})
                        </span>
                        <span className="font-mono">{formatRupiah(it.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nominal and Stamp note */}
                <div className="flex justify-between items-center pt-2">
                  <div className="border-2 border-slate-900 px-3 py-1.5 font-bold font-mono text-base bg-slate-100">
                    {formatRupiah(totalNomorUang)}
                  </div>
                  {totalNomorUang >= 5000000 && (
                    <div className="border border-slate-400 border-dashed text-[9px] text-slate-500 px-2 py-1 text-center font-sans">
                      Bea Materai<br />Rp 10.000,-
                    </div>
                  )}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-4 font-sans">
                  <div>
                    <p>Lunas Dibayar,</p>
                    <p className="font-bold">Bendahara TPK</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline uppercase">{projectInfo.namaBendahara}</p>
                  </div>
                  <div>
                    <p>{projectInfo.desa}, {formatTanggalIndo(formTanggal)}</p>
                    <p className="font-bold">Penerima Uang / Toko</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline uppercase">{formPenerimaNama || '(Toko / Rekanan)'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DAFTAR & CETAK KWITANSI */}
      {activeSubTab === 'DAFTAR' && (
        <div className="space-y-6">
          <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari no kwitansi, toko rekanan, barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="text-xs text-slate-500">
              Total Kwitansi Terbit: <strong>{filteredKwitansi.length} Berkas</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kwitansi List (5 Cols) */}
            <div className="no-print lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 pb-2 border-b border-slate-200">
                Pilih Berkas Kwitansi
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredKwitansi.map((kwt) => {
                  const isSelected = selectedKwitansiForPrint?.id === kwt.id;
                  return (
                    <div
                      key={kwt.id}
                      onClick={() => setSelectedKwitansiForPrint(kwt)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {kwt.nomorKwitansi}
                        </span>
                        <span className="font-mono font-bold text-xs text-emerald-800">
                          {formatRupiah(kwt.uangSebanyak)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 truncate font-medium">
                        {kwt.penerimaNama}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {kwt.untukPembayaran}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                        <span>{formatTanggalIndo(kwt.tanggal)}</span>
                        <span>Kas: {kwt.jenisKasPembayaran}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Kwitansi Print Sheet (7 Cols / Full width on print) */}
            <div className="lg:col-span-7">
              {selectedKwitansiForPrint ? (
                <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs print:p-0 print:border-0">
                  <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
                    <span className="text-xs text-slate-500">
                      Format Siap Cetak (Kwitansi & Faktur Rincian)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Kwitansi Ini</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus kwitansi ${selectedKwitansiForPrint.nomorKwitansi}?`)) {
                            deleteKwitansi(selectedKwitansiForPrint.id);
                            setSelectedKwitansiForPrint(null);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Formal Printable Document */}
                  <div className="border-2 border-slate-800 p-6 rounded-lg text-slate-900 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                      <div>
                        <h2 className="text-xs uppercase tracking-widest font-bold text-slate-600">
                          {projectInfo.namaInstansi}
                        </h2>
                        <h1 className="text-lg font-bold uppercase tracking-tight">
                          BUKTI KWITANSI PENGELUARAN
                        </h1>
                        <p className="text-[11px] text-slate-600">
                          Kegiatan: {projectInfo.namaProyek}
                        </p>
                      </div>
                      <div className="text-right text-xs font-mono">
                        <div className="font-bold">{selectedKwitansiForPrint.nomorKwitansi}</div>
                        <div className="text-slate-500">{formatTanggalIndo(selectedKwitansiForPrint.tanggal)}</div>
                      </div>
                    </div>

                    {/* Core Statement */}
                    <div className="space-y-2 text-xs pt-2">
                      <div className="grid grid-cols-12 gap-2">
                        <span className="col-span-3 text-slate-600">Telah Terima Dari</span>
                        <span className="col-span-9 font-semibold">
                          : {selectedKwitansiForPrint.telahTerimaDari}
                        </span>
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <span className="col-span-3 text-slate-600">Uang Sejumlah</span>
                        <span className="col-span-9 italic font-serif font-bold text-slate-900 bg-slate-50 p-1 rounded">
                          : # {selectedKwitansiForPrint.terbilang} #
                        </span>
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <span className="col-span-3 text-slate-600">Untuk Pembayaran</span>
                        <span className="col-span-9">
                          : {selectedKwitansiForPrint.untukPembayaran}
                        </span>
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <span className="col-span-3 text-slate-600">Toko / Rekanan</span>
                        <span className="col-span-9 font-medium">
                          : {selectedKwitansiForPrint.penerimaNama}{' '}
                          {selectedKwitansiForPrint.penerimaAlamat && `(${selectedKwitansiForPrint.penerimaAlamat})`}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="pt-2">
                      <table className="w-full text-xs border border-slate-300">
                        <thead className="bg-slate-100 text-slate-800">
                          <tr>
                            <th className="py-1.5 px-2 border border-slate-300 text-center w-8">No</th>
                            <th className="py-1.5 px-2 border border-slate-300">Rincian Uraian Barang / Bahan</th>
                            <th className="py-1.5 px-2 border border-slate-300 text-center">Vol</th>
                            <th className="py-1.5 px-2 border border-slate-300 text-center">Sat</th>
                            <th className="py-1.5 px-2 border border-slate-300 text-right">Harga Satuan</th>
                            <th className="py-1.5 px-2 border border-slate-300 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedKwitansiForPrint.items.map((it, i) => (
                            <tr key={i}>
                              <td className="py-1 px-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                              <td className="py-1 px-2 border border-slate-300 font-medium">{it.namaBarang}</td>
                              <td className="py-1 px-2 border border-slate-300 text-center font-mono">{it.volume}</td>
                              <td className="py-1 px-2 border border-slate-300 text-center">{it.satuan}</td>
                              <td className="py-1 px-2 border border-slate-300 text-right font-mono">
                                {formatRupiah(it.hargaSatuan, false)}
                              </td>
                              <td className="py-1 px-2 border border-slate-300 text-right font-mono font-bold">
                                {formatRupiah(it.subtotal, false)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-bold bg-slate-50">
                            <td colSpan={5} className="py-2 px-2 border border-slate-300 text-right uppercase">
                              Jumlah Total:
                            </td>
                            <td className="py-2 px-2 border border-slate-300 text-right font-mono text-sm">
                              {formatRupiah(selectedKwitansiForPrint.uangSebanyak)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Footer Box with Total & Signatures */}
                    <div className="pt-4 grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5 space-y-2">
                        <div className="border-2 border-slate-900 p-2 font-mono font-bold text-lg bg-slate-100 text-center">
                          {formatRupiah(selectedKwitansiForPrint.uangSebanyak)}
                        </div>
                        {selectedKwitansiForPrint.uangSebanyak >= 5000000 && (
                          <div className="text-[10px] text-slate-500 text-center italic border border-slate-300 p-1">
                            (Wajib dibubuhi Materai Tempel Rp 10.000,- saat tanda tangan)
                          </div>
                        )}
                      </div>

                      <div className="col-span-7 grid grid-cols-2 gap-4 text-center text-[11px]">
                        <div>
                          <p>Setuju Dibayar,</p>
                          <p className="font-bold">Bendahara TPK</p>
                          <div className="h-16"></div>
                          <p className="font-bold underline uppercase">{projectInfo.namaBendahara}</p>
                        </div>
                        <div>
                          <p>{selectedKwitansiForPrint.tempatTtd}, {formatTanggalIndo(selectedKwitansiForPrint.tanggal)}</p>
                          <p className="font-bold">Penerima Pembayaran</p>
                          <div className="h-16"></div>
                          <p className="font-bold underline uppercase">{selectedKwitansiForPrint.penerimaNama}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
                  Pilih salah satu kwitansi di sebelah kiri untuk melihat dan mencetak dokumen.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
