import React, { useState } from 'react';
import { Lock, KeyRound, AlertTriangle, School, ArrowRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface PINLockModalProps {
  onOpenWorkspaceSwitcher: () => void;
}

export const PINLockModal: React.FC<PINLockModalProps> = ({ onOpenWorkspaceSwitcher }) => {
  const { activeWorkspaceMeta, unlockWorkspace } = useProject();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeWorkspaceMeta?.hasPin) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockWorkspace(pinInput.trim());
    if (success) {
      setPinInput('');
      setErrorMsg(null);
    } else {
      setErrorMsg('Kupon Sandi / PIN salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 font-mono">
            NPSN: {activeWorkspaceMeta.npsn}
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-2">
            Profil Sekolah Terkunci
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Data untuk <strong className="text-slate-800">{activeWorkspaceMeta.namaSekolah}</strong> dilindungi dengan kunci akses sandi lokal.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3 pt-2">
          <div>
            <input
              type="password"
              maxLength={10}
              autoFocus
              placeholder="Masukkan PIN sandi..."
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full p-3 text-center tracking-widest text-xl font-mono font-bold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Buka Akses Sekolah</span>
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenWorkspaceSwitcher}
            className="text-xs font-semibold text-slate-600 hover:text-emerald-800 flex items-center justify-center gap-1.5 mx-auto"
          >
            <School className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ganti ke Sekolah Lain</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
