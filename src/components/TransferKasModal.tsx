import React, { useState } from 'react';
import { ArrowRightLeft, Landmark, Coins, AlertCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah } from '../utils/terbilang';

interface TransferKasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferKasModal: React.FC<TransferKasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { summary, projectInfo, transferKasBankKeTunai } = useProject();

  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nominal, setNominal] = useState<number | ''>('');
  const [noBukti, setNoBukti] = useState(`SLIP-TRK/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`);
  const [uraian, setUraian] = useState('Pencairan Uang Kas dari Bank ke Kas Tunai untuk Operasional Lapangan');

  if (!isOpen) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(nominal);
    if (!num || num <= 0) {
      alert('Nominal penarikan harus lebih dari Rp 0.');
      return;
    }

    if (num > summary.saldoBank) {
      alert(`Saldo Kas Bank tidak mencukupi. Saldo saat ini: ${formatRupiah(summary.saldoBank)}`);
      return;
    }

    transferKasBankKeTunai(tanggal, num, noBukti, uraian);
    alert('Penarikan dana berhasil dibukukan! Kas Bank berkurang dan Kas Tunai bertambah.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-blue-700">
          <ArrowRightLeft className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Tarik Tunai dari Kas Bank
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Pencairan dana dari rekening Bank ke kas fisik tunai di brankas bendahara
        </p>

        {/* Balance Overview Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Saldo Kas Bank Saat Ini:</span>
            </span>
            <strong className="font-mono text-slate-900">{formatRupiah(summary.saldoBank)}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Saldo Kas Tunai Saat Ini:</span>
            </span>
            <strong className="font-mono text-slate-900">{formatRupiah(summary.saldoTunai)}</strong>
          </div>
        </div>

        <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nominal Penarikan Tunai (Rp)
            </label>
            <input
              type="number"
              min="10000"
              step="10000"
              max={summary.saldoBank}
              required
              placeholder="Contoh: 10000000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tanggal Penarikan</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">No. Slip / Cek Bank</label>
              <input
                type="text"
                required
                value={noBukti}
                onChange={(e) => setNoBukti(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Uraian / Keterangan</label>
            <textarea
              rows={2}
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
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
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs"
            >
              Eksekusi Penarikan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
