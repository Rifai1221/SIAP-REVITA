import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  BookOpen,
  TrendingUp,
  Receipt,
  Users,
  FileCheck2,
  Settings,
  Printer,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  School,
  FolderDown,
  Upload,
  ChevronDown,
  Layers,
  Lock,
  Unlock,
  Check,
  Plus,
  Cloud,
  CloudCheck,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatRupiah } from '../utils/terbilang';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onPrintLPJ: () => void;
  onOpenWorkspaceManager: (tab?: 'switcher' | 'upload' | 'download' | 'pin') => void;
  onOpenAddTx?: () => void;
  onOpenTransfer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onPrintLPJ,
  onOpenWorkspaceManager,
  onOpenAddTx,
  onOpenTransfer,
}) => {
  const {
    summary,
    projectInfo,
    activeNpsn,
    activeWorkspace,
    workspaces,
    switchWorkspace,
    exportProjectFile,
    hasUnsavedExportChanges,
    cloudSyncStatus,
  } = useProject();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'overview', label: 'Ikhtisar', icon: Building2 },
    { id: 'data_master', label: 'Data Master P2SP', icon: School },
    { id: 'cashbooks', label: 'Buku Kas (BKU)', icon: BookOpen },
    { id: 'technical_docs', label: 'Berkas RAB & AHSP', icon: FileSpreadsheet },
    { id: 'rab_sync', label: 'RAB & Kwitansi Harian', icon: Sparkles },
    { id: 'progress', label: 'Progres Bangunan', icon: TrendingUp },
    { id: 'receipts', label: 'Daftar Kwitansi', icon: Receipt },
    { id: 'payroll', label: 'Honor Tukang', icon: Users },
    { id: 'lpj', label: 'Laporan LPJ', icon: FileCheck2 },
  ];

  const currentSchoolName =
    projectInfo.dataSekolah?.namaSekolah || activeWorkspace?.namaSekolah || 'Sekolah Revitalisasi';

  return (
    <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs w-full max-w-full">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 box-border min-w-0">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4 w-full min-w-0">
          {/* Zone 1: Wordmark & Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-xs shrink-0">
              SR
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 block leading-tight truncate">
                SIAP-Revita
              </span>
              <span className="text-[10px] text-slate-500 block leading-none font-medium truncate">
                P2SP Revitalisasi Terpadu
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as NavTab)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Multi-Workspace Switcher by NPSN & File Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
            {/* Cloud Sync Status Indicator */}
            <div
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border shrink-0 bg-slate-50 text-slate-600 border-slate-200"
              title={
                cloudSyncStatus === 'ONLINE_SYNCED'
                  ? 'Data tersinkron otomatis ke Cloud Firestore & Penyimpanan Lokal'
                  : cloudSyncStatus === 'SYNCING'
                  ? 'Sedang menyinkronkan data ke Cloud...'
                  : 'Penyimpanan Lokal Aktif'
              }
            >
              {cloudSyncStatus === 'SYNCING' ? (
                <>
                  <Cloud className="w-3 h-3 text-sky-500 animate-pulse shrink-0" />
                  <span className="hidden lg:inline text-sky-600">Menyimpan...</span>
                </>
              ) : cloudSyncStatus === 'ONLINE_SYNCED' ? (
                <>
                  <CloudCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="hidden lg:inline text-emerald-700 font-semibold">Cloud Aktif</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="hidden lg:inline text-slate-500">Lokal</span>
                </>
              )}
            </div>

            {/* Multi-Workspace Switcher Dropdown */}
            <div className="relative min-w-0" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 rounded-xl transition-all shadow-2xs text-xs font-medium max-w-[125px] xs:max-w-[160px] sm:max-w-[210px] md:max-w-[260px] min-w-0"
                title="Ganti Profil / Sekolah Aktif"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
                  {activeWorkspace?.jenjang || 'SD'}
                </div>
                <div className="text-left truncate min-w-0">
                  <span className="font-bold text-slate-900 block truncate leading-tight text-[11px] sm:text-xs">
                    {currentSchoolName}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-800 font-mono truncate">
                    <span className="truncate">NPSN: {activeNpsn === '20260001' ? 'Belum Diisi' : activeNpsn}</span>
                    {activeWorkspace?.isPinProtected ? (
                      <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                    ) : (
                      <Unlock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-700 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Ganti Profil Sekolah
                      </span>
                      <span className="text-xs text-slate-600">Database: <code className="text-emerald-700 font-mono">sekolah_{activeNpsn}_*</code></span>
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenWorkspaceManager('switcher');
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold"
                    >
                      Kelola Semua
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {workspaces.map((ws) => {
                      const isCur = ws.npsn === activeNpsn;
                      return (
                        <button
                          key={ws.npsn}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            if (ws.npsn !== activeNpsn) {
                              if (ws.isPinProtected) {
                                onOpenWorkspaceManager('switcher');
                              } else {
                                switchWorkspace(ws.npsn);
                              }
                            }
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                            isCur ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200">
                              {ws.jenjang || 'SD'}
                            </span>
                            <div className="truncate min-w-0">
                              <span className="block truncate text-xs">{ws.namaSekolah}</span>
                              <span className="block text-[10px] text-slate-400 font-mono truncate">
                                NPSN: {ws.npsn} • {formatRupiah(ws.paguAnggaran)}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1 ml-2">
                            {ws.isPinProtected && <Lock className="w-3 h-3 text-amber-600" />}
                            {isCur && <Check className="w-4 h-4 text-emerald-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenWorkspaceManager('switcher');
                      }}
                      className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+ Tambah Sekolah Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Button: Simpan / Download Berkas .revita */}
            <button
              onClick={() => exportProjectFile('revita')}
              className="relative hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs shrink-0"
              title="Simpan / Download Berkas Proyek (.revita) ke Komputer"
            >
              <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simpan .revita</span>
              {hasUnsavedExportChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Quick Button: Buka Berkas */}
            <button
              onClick={() => onOpenWorkspaceManager('upload')}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs shrink-0"
              title="Buka Berkas Sekolah (.revita / .json) dari Laptop / WhatsApp"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Buka Berkas</span>
            </button>

            {/* Print LPJ Quick Action */}
            <button
              onClick={onPrintLPJ}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs shrink-0"
              title="Cetak Dokumen LPJ Resmi"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cetak LPJ</span>
            </button>

            {/* Settings & Hub Trigger */}
            <button
              onClick={() => onOpenWorkspaceManager('switcher')}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Kelola Profil Sekolah & Berkas"
              aria-label="Kelola Profil Sekolah & Berkas"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Pengaturan Identitas & Penandatangan"
              aria-label="Pengaturan Identitas & Penandatangan"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Sub-Navigation Row */}
        <div className="xl:hidden w-full max-w-full overflow-x-auto py-2 border-t border-slate-100 scrollbar-none touch-pan-x overscroll-x-contain">
          <div className="flex items-center gap-1 min-w-max px-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as NavTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
