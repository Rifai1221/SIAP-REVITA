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
  Sparkles,
  Zap,
  ArrowRightLeft,
  Camera,
  Search,
  Wallet,
  CheckCircle2,
  AlertTriangle,
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
    transactions,
    kwitansiList,
    payrollHarian,
    progressPhotos,
  } = useProject();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [searchWorkspaceQuery, setSearchWorkspaceQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    {
      id: 'overview' as NavTab,
      label: 'Ikhtisar',
      icon: Building2,
      badge: null,
    },
    {
      id: 'data_master' as NavTab,
      label: 'Data Master P2SP',
      icon: School,
      badge: null,
    },
    {
      id: 'cashbooks' as NavTab,
      label: 'Buku Kas (BKU)',
      icon: BookOpen,
      badge: transactions.length > 0 ? `${transactions.length}` : null,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'technical_docs' as NavTab,
      label: 'Berkas RAB & AHSP',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'rab_sync' as NavTab,
      label: 'RAB & Kwitansi Harian',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'progress' as NavTab,
      label: 'Progres Fisik',
      icon: TrendingUp,
      badge: summary.progresFisikKumulatif > 0 ? `${summary.progresFisikKumulatif.toFixed(1)}%` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'receipts' as NavTab,
      label: 'Kwitansi SPJ',
      icon: Receipt,
      badge: kwitansiList.length > 0 ? `${kwitansiList.length}` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'payroll' as NavTab,
      label: 'Honor Tukang',
      icon: Users,
      badge: payrollHarian.length > 0 ? `${payrollHarian.length} SPJ` : null,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'lpj' as NavTab,
      label: 'Laporan LPJ',
      icon: FileCheck2,
      badge: 'Cetak',
      badgeColor: 'bg-emerald-700 text-white font-semibold',
    },
  ];

  const currentSchoolName =
    projectInfo.dataSekolah?.namaSekolah || activeWorkspace?.namaSekolah || 'Sekolah Revitalisasi';

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.namaSekolah.toLowerCase().includes(searchWorkspaceQuery.toLowerCase()) ||
      ws.npsn.includes(searchWorkspaceQuery)
  );

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs w-full max-w-full transition-all">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 box-border min-w-0 overscroll-x-contain">
        {/* Main Navbar Row - Horizontally scrollable if contents exceed screen width */}
        <div className="w-full max-w-full overflow-x-auto overflow-y-visible py-0 scrollbar-none touch-pan-x overscroll-x-contain">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 min-w-max sm:min-w-0 sm:w-full">
            
            {/* Zone 1: Wordmark & Brand with dynamic active status */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
                title="Kembali ke Dashboard Utama"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-sm ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  SR
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight truncate">
                      SIAP-Revita
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-full border border-emerald-200">
                      2026
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-none font-medium truncate mt-0.5">
                    P2SP Revitalisasi Terpadu
                  </span>
                </div>
              </button>
            </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs border border-emerald-200/80 ring-1 ring-emerald-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full leading-tight font-medium ${
                        link.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Interactive Hub, Workspace Switcher & Dynamic Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
            
            {/* Dynamic Quick Actions Dropdown Menu ("+ Aksi Cepat") */}
            <div className="relative" ref={quickActionsRef}>
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm ring-2 ring-emerald-600/20 active:scale-95 shrink-0"
                title="Aksi Cepat: Catat Transaksi, Kwitansi, SPJ Upah, atau Foto"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Aksi Cepat</span>
                <ChevronDown className={`w-3 h-3 text-white/80 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Quick Actions Menu Modal Dropdown */}
              {isQuickActionsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-800">Menu Pintas & Aksi Cepat</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      Instan
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        onOpenAddTx && onOpenAddTx();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-900">
                          Catat Kas BKU (Masuk / Keluar)
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Input belanja material, honor, atau penerimaan termin
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        onOpenTransfer && onOpenTransfer();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-sky-900">
                          Tarik Tunai / Transfer Kas
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Pindah buku dari Rekening Bank ke Kas Tunai
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        setActiveTab('receipts');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-amber-950">
                          Buat Kwitansi & Nota Pembelian
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Kompilasi kwitansi terbilang otomatis untuk toko
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        setActiveTab('payroll');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-900">
                          Input Daftar Hadir & SPJ Upah Tukang
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Hitung lembur, kasbon, & cetak tanda tangan mingguan
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        setActiveTab('progress');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-teal-900">
                          Upload Foto Progres Fisik Mingguan
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Multi-upload foto dokumentasi untuk SPJ & LPJ
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsQuickActionsOpen(false);
                        onPrintLPJ();
                      }}
                      className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Seluruh Berkas LPJ (PDF)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cloud Sync Status Indicator */}
            <div
              className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-medium border shrink-0 bg-slate-50 text-slate-600 border-slate-200 shadow-2xs"
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
                  <Cloud className="w-3.5 h-3.5 text-sky-500 animate-pulse shrink-0" />
                  <span className="text-sky-600">Sync...</span>
                </>
              ) : cloudSyncStatus === 'ONLINE_SYNCED' ? (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-bold">Cloud Aktif</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500">Lokal</span>
                </>
              )}
            </div>

            {/* Multi-Workspace Switcher Dropdown */}
            <div className="relative min-w-0" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 rounded-xl transition-all shadow-2xs text-xs font-medium max-w-[125px] xs:max-w-[160px] sm:max-w-[210px] md:max-w-[260px] min-w-0"
                title="Ganti Profil / Sekolah Aktif"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0 shadow-2xs">
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
                <ChevronDown className={`w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-xs sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Ganti Profil Sekolah
                      </span>
                      <span className="text-xs text-slate-600">Database: <code className="text-emerald-700 font-mono">sekolah_{activeNpsn}</code></span>
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

                  {/* Search inside school list if multiple */}
                  {workspaces.length > 2 && (
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchWorkspaceQuery}
                          onChange={(e) => setSearchWorkspaceQuery(e.target.value)}
                          placeholder="Cari nama sekolah atau NPSN..."
                          className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredWorkspaces.map((ws) => {
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

            {/* Quick Save / Download Berkas .revita */}
            <button
              onClick={() => exportProjectFile('revita')}
              className="relative hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs shrink-0 active:scale-95"
              title="Simpan / Download Berkas Cadangan Proyek (.revita) ke Laptop"
            >
              <FolderDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simpan .revita</span>
              {hasUnsavedExportChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Quick Open File */}
            <button
              onClick={() => onOpenWorkspaceManager('upload')}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs shrink-0"
              title="Buka Berkas Sekolah (.revita / .json)"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Buka Berkas</span>
            </button>

            {/* Print LPJ Quick Action */}
            <button
              onClick={onPrintLPJ}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-xs shrink-0"
              title="Cetak Dokumen LPJ Resmi"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
      </div>

        {/* Dynamic Live Status & Metric Strip */}
        <div className="w-full max-w-full overflow-x-auto py-1.5 px-1 border-t border-slate-100 scrollbar-none touch-pan-x overscroll-x-contain">
          <div className="flex items-center justify-between gap-2 text-xs min-w-max">
            {/* Left: Quick Financial Status Pills */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Saldo Kas Pill */}
              <div
                onClick={() => setActiveTab('cashbooks')}
                className="cursor-pointer flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors shadow-2xs shrink-0"
                title="Klik untuk melihat rincian Buku Kas Umum"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium text-slate-500">Saldo BKU:</span>
                <span className="font-bold text-slate-900 text-[11px] font-mono">
                  {formatRupiah(summary.saldoBKU)}
                </span>
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 border-l border-slate-200 pl-1.5">
                  <span>Bank: <b className="text-slate-700 font-mono">{formatRupiah(summary.saldoBank)}</b></span>
                  <span>•</span>
                  <span>Tunai: <b className="text-slate-700 font-mono">{formatRupiah(summary.saldoTunai)}</b></span>
                </div>
              </div>

              {/* Serapan Anggaran Meter */}
              <div
                onClick={() => setActiveTab('overview')}
                className="cursor-pointer flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors shadow-2xs shrink-0"
                title="Serapan Anggaran vs Pagu Keseluruhan"
              >
                <span className="text-[11px] font-medium text-slate-500">Serapan:</span>
                <div className="w-16 sm:w-20 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, summary.persentaseSerapanAnggaran))}%` }}
                  />
                </div>
                <span className="font-bold text-emerald-800 text-[11px] font-mono">
                  {summary.persentaseSerapanAnggaran.toFixed(1)}%
                </span>
              </div>

              {/* Progres Fisik Pill */}
              <div
                onClick={() => setActiveTab('progress')}
                className="cursor-pointer flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors shadow-2xs shrink-0"
                title="Klik untuk membuka laporan progres mingguan & dokumentasi foto"
              >
                <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="text-[11px] font-medium text-slate-500">Fisik:</span>
                <span className="font-bold text-teal-800 text-[11px] font-mono">
                  {summary.progresFisikKumulatif.toFixed(1)}%
                </span>
                {progressPhotos.length > 0 && (
                  <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-teal-100 text-teal-800 px-1 rounded font-medium">
                    <Camera className="w-2.5 h-2.5" />
                    {progressPhotos.length} foto
                  </span>
                )}
              </div>
            </div>

            {/* Right: Balance Integrity & Shortcut Helpers */}
            <div className="flex items-center gap-2 shrink-0">
              {summary.isBalanceSynced ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Kas Seimbang
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md font-bold animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Selisih Kas ({formatRupiah(summary.selisihSaldo)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Sub-Navigation Row - Scrollable horizontally without shifting whole page */}
        <div className="xl:hidden w-full max-w-full overflow-x-auto py-2 border-t border-slate-100 scrollbar-none touch-pan-x overscroll-x-contain select-none">
          <div className="flex items-center gap-1.5 min-w-max px-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl shrink-0 transition-all whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/60 border border-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : link.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
