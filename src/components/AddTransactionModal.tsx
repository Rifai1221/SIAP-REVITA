import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { CashType, ExpenseCategory, TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions, addTransaction } = useProject();

  const nextIndex = transactions.length + 1;
  const initialNoBukti = `BKU/${new Date().getFullYear()}/${String(nextIndex).padStart(3, '0')}`;

  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [noBukti, setNoBukti] = useState(initialNoBukti);
  const [jenisKas, setJenisKas] = useState<CashType>('TUNAI');
  const [jenisTransaksi, setJenisTransaksi] = useState<TransactionType>('PENGELUARAN');
  const [kategori, setKategori] = useState<ExpenseCategory>('BELANJA_MATERIAL');
  const [uraian, setUraian] = useState('');
  const [nominal, setNominal] = useState<number | ''>('');
  const [penerimaAtauPemberi, setPenerimaAtauPemberi] = useState('');
  const [kodeAkun, setKodeAkun] = useState('5.2.01');
  const [keterangan, setKeterangan] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraian.trim()) {
      alert('Uraian transaksi wajib diisi.');
      return;
    }
    const num = Number(nominal);
    if (!num || num <= 0) {
      alert('Nominal harus lebih dari Rp 0.');
      return;
    }

    addTransaction({
      tanggal,
      noBukti,
      uraian,
      jenisKas,
      jenisTransaksi,
      kategori,
      nominal: num,
      kodeAkun,
      penerimaAtauPemberi,
      keterangan,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Catat Transaksi Buku Kas
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tambahkan mutasi kas penerimaan atau pengeluaran ke BKU
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Jenis Transaksi</label>
              <select
                value={jenisTransaksi}
                onChange={(e) => {
                  const val = e.target.value as TransactionType;
                  setJenisTransaksi(val);
                  if (val === 'PENERIMAAN') {
                    setKategori('PENCAIRAN_DANA');
                    setKodeAkun('4.1.01');
                  } else {
                    setKategori('BELANJA_MATERIAL');
                    setKodeAkun('5.2.01');
                  }
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="PENGELUARAN">Pengeluaran Kas (-)</option>
                <option value="PENERIMAAN">Penerimaan Kas (+)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Buku Kas Tujuan</label>
              <select
                value={jenisKas}
                onChange={(e) => setJenisKas(e.target.value as CashType)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="TUNAI">Kas Tunai (Lapangan)</option>
                <option value="BANK">Kas Bank (Rekening)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nomor Bukti</label>
              <input
                type="text"
                required
                value={noBukti}
                onChange={(e) => setNoBukti(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kategori Transaksi</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as ExpenseCategory)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="BELANJA_MATERIAL">Belanja Bahan & Material</option>
                <option value="UPAH_TUKANG">Upah & Honor Tukang</option>
                <option value="PENCAIRAN_DANA">Penerimaan / Pencairan Dana</option>
                <option value="SEWA_ALAT">Sewa Peralatan / Armada</option>
                <option value="OPERASIONAL">Operasional & ATK TPK</option>
                <option value="PAJAK_RETRIBUSI">Pajak / Bea / Adm Bank</option>
                <option value="LAIN_LAIN">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Kode Akun / Rekening</label>
              <input
                type="text"
                value={kodeAkun}
                onChange={(e) => setKodeAkun(e.target.value)}
                placeholder="Misal: 5.2.01"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Uraian Transaksi Kas
            </label>
            <textarea
              required
              rows={2}
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Jelaskan peruntukan pengeluaran atau sumber penerimaan..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                min="1"
                required
                value={nominal}
                onChange={(e) => setNominal(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="Contoh: 1500000"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Penerima / Pemberi</label>
              <input
                type="text"
                value={penerimaAtauPemberi}
                onChange={(e) => setPenerimaAtauPemberi(e.target.value)}
                placeholder="Nama Toko / Pekerja / KPPN"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Keterangan Tambahan (Opsional)</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Nomor faktur, catatan nota, dll"
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
