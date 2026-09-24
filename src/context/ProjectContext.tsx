import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  CashTransaction,
  CashType,
  DailyWorkLog,
  GeneratedDailyPurchasePlan,
  Kwitansi,
  PayrollHarianBatch,
  ProjectFileBundle,
  ProjectInfo,
  RABMasterItem,
  SchoolWorkspaceProfile,
  StandardMaterialPrice,
  StandardWageRate,
  WBSItem,
  WeeklyRecap,
  WorkerBoronganItem,
  ProgressPhotoItem,
} from '../types';
import { createDemoProgressPhotos } from '../utils/photoStorageEngine';
import {
  INITIAL_BORONGAN_LIST,
  INITIAL_DAILY_LOGS,
  INITIAL_KWITANSI_LIST,
  INITIAL_PAYROLL_HARIAN,
  INITIAL_PROJECT_INFO,
  CLEAN_PROJECT_INFO,
  CLEAN_WBS,
  INITIAL_STANDARD_MATERIALS,
  INITIAL_STANDARD_WAGES,
  INITIAL_TRANSACTIONS,
  INITIAL_WBS,
  INITIAL_WEEKLY_RECAPS,
  isPublishedApp,
} from '../utils/initialData';
import {
  syncWorkspaceMetaToCloud,
  syncSchoolDataToCloud,
  fetchWorkspacesFromCloud,
  fetchSchoolDataFromCloud,
  deleteSchoolFromCloud,
  isDemoSchoolData,
  isDemoTransactions,
  hasRealUserTransactions,
  CloudSyncStatus,
} from '../utils/firestoreSync';
import { INITIAL_RAB_MASTER } from '../utils/rabMasterData';
import { terbilangRupiah } from '../utils/terbilang';
import { WeeklyWagesCalculationResult } from '../utils/weeklyWagesEngine';

interface FinancialSummary {
  penerimaanBKU: number;
  pengeluaranBKU: number;
  saldoBKU: number;
  penerimaanBank: number;
  pengeluaranBank: number;
  saldoBank: number;
  penerimaanTunai: number;
  pengeluaranTunai: number;
  saldoTunai: number;
  isBalanceSynced: boolean;
  selisihSaldo: number;
  totalSerapanAnggaran: number;
  persentaseSerapanAnggaran: number;
  sisaPaguAnggaran: number;
  persentasePenerimaan: number;
  sisaPaguBelumCair: number;
  progresFisikKumulatif: number;
}

export interface WorkspaceSummaryStat {
  npsn: string;
  namaSekolah: string;
  jenjang: string;
  paguAnggaran: number;
  bkuCount: number;
  kwitansiCount: number;
  saldoBKU: number;
  progressPersen: number;
  isPinProtected: boolean;
}

interface ProjectContextType {
  // Active Data
  projectInfo: ProjectInfo;
  transactions: CashTransaction[];
  kwitansiList: Kwitansi[];
  payrollHarian: PayrollHarianBatch[];
  payrollBorongan: WorkerBoronganItem[];
  wbsList: WBSItem[];
  rabMaster: RABMasterItem[];
  dailyLogs: DailyWorkLog[];
  weeklyRecaps: WeeklyRecap[];
  standardWages: StandardWageRate[];
  standardMaterials: StandardMaterialPrice[];
  progressPhotos: ProgressPhotoItem[];
  summary: FinancialSummary;

  // Multi-Workspace State & Actions
  workspaces: SchoolWorkspaceProfile[];
  activeNpsn: string;
  activeWorkspace: SchoolWorkspaceProfile | undefined;
  switchWorkspace: (npsn: string, enteredPin?: string) => { success: boolean; message?: string };
  createWorkspace: (
    profile: Omit<SchoolWorkspaceProfile, 'createdAt' | 'lastActive'>,
    templateType?: 'sd_lengkap' | 'smp_rehab' | 'blank'
  ) => boolean;
  deleteWorkspace: (npsn: string) => boolean;
  updateWorkspaceProfile: (npsn: string, updates: Partial<SchoolWorkspaceProfile>) => void;
  getWorkspaceStats: (npsn: string) => WorkspaceSummaryStat;

  // File-Based Save & Load (.revita / .json)
  exportProjectFile: (fileType?: 'revita' | 'json') => void;
  importProjectFile: (fileContent: string) => { success: boolean; npsn?: string; namaSekolah?: string; error?: string };
  lastExportedAt: string | null;
  hasUnsavedExportChanges: boolean;

  // Project Actions
  updateProjectInfo: (info: Partial<ProjectInfo>) => void;
  addTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  transferKasBankKeTunai: (tanggal: string, nominal: number, noCek: string, uraian?: string) => void;
  addKwitansi: (kwitansi: Omit<Kwitansi, 'id'>) => void;
  addBatchKwitansi: (plans: GeneratedDailyPurchasePlan[], updateProgress?: boolean, mingguKe?: number) => void;
  addBatchKwitansiAndWeeklyWages: (
    plans: GeneratedDailyPurchasePlan[],
    wages: WeeklyWagesCalculationResult,
    mingguKe: number,
    updatedRAB?: RABMasterItem[],
    photos?: ProgressPhotoItem[]
  ) => void;
  deleteKwitansi: (id: string) => void;
  addProgressPhotos: (photos: ProgressPhotoItem[]) => void;
  deleteProgressPhoto: (id: string) => void;
  updateProgressPhotoCaption: (id: string, caption: string) => void;
  addPayrollHarianBatch: (batch: Omit<PayrollHarianBatch, 'id'>) => void;
  deletePayrollHarianBatch: (id: string) => void;
  addWorkerBorongan: (item: Omit<WorkerBoronganItem, 'id'>) => void;
  payWorkerBorongan: (id: string, jenisKas: CashType) => void;
  deleteWorkerBorongan: (id: string) => void;
  addDailyLog: (log: Omit<DailyWorkLog, 'id'>) => void;
  deleteDailyLog: (id: string) => void;
  updateWBSItem: (id: string, fields: Partial<WBSItem>) => void;
  updateRABMaster: (newList: RABMasterItem[]) => void;
  addStandardWage: (wage: Omit<StandardWageRate, 'id'>) => void;
  updateStandardWage: (id: string, wage: Partial<StandardWageRate>) => void;
  updateStandardWages: (wages: StandardWageRate[]) => void;
  deleteStandardWage: (id: string) => void;
  addStandardMaterial: (material: Omit<StandardMaterialPrice, 'id'>) => void;
  updateStandardMaterial: (id: string, material: Partial<StandardMaterialPrice>) => void;
  updateStandardMaterials: (materials: StandardMaterialPrice[]) => void;
  deleteStandardMaterial: (id: string) => void;
  resetToDefaultData: () => void;
  resetToCleanData: () => void;
  loadDemoSimulationData: () => void;
  cloudSyncStatus: CloudSyncStatus;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Helper keys for local storage prefix
const GLOBAL_STORAGE_KEYS = {
  WORKSPACES_LIST: 'siap_revita_workspaces_list_v2',
  ACTIVE_NPSN: 'siap_revita_active_npsn_v2',
  LAST_EXPORT_PREFIX: 'siap_revita_last_export_',
};

const getSchoolStorageKey = (npsn: string, keyName: string) => {
  return `sekolah_${npsn}_${keyName}`;
};

// Clean Default Workspace Profile for production / live apps
const CLEAN_INITIAL_WORKSPACE: SchoolWorkspaceProfile = {
  npsn: '20260001',
  namaSekolah: 'Sekolah Pelaksana Revitalisasi',
  jenjang: 'SD',
  kabupatenKota: 'Kabupaten Bogor',
  pin: '',
  isPinProtected: false,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  paguAnggaran: 0,
  warnaTema: 'emerald',
  catatanFasilitator: 'Program Revitalisasi Sarpras Sekolah P2SP',
};

// Check if a school saved locally contains real custom user transactions
const checkSchoolHasRealTransactions = (npsn: string): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const raw = localStorage.getItem(getSchoolStorageKey(npsn, 'bku'));
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && hasRealUserTransactions(parsed);
  } catch {
    return false;
  }
};

// Default Workspace Profiles for local simulation
const DEFAULT_INITIAL_WORKSPACES: SchoolWorkspaceProfile[] = [
  {
    npsn: '20201842',
    namaSekolah: 'SD Negeri 01 Babakan',
    jenjang: 'SD',
    kabupatenKota: 'Kabupaten Bogor',
    pin: '1234',
    isPinProtected: true,
    createdAt: '2026-01-15T08:00:00.000Z',
    lastActive: new Date().toISOString(),
    paguAnggaran: 185000000,
    warnaTema: 'emerald',
    catatanFasilitator: 'Program Revitalisasi Sarpras & Ruang Kelas P2SP 2026',
  },
  {
    npsn: '20209999',
    namaSekolah: 'SMP Negeri 2 Sukaraja',
    jenjang: 'SMP',
    kabupatenKota: 'Kabupaten Bogor',
    pin: '2026',
    isPinProtected: true,
    createdAt: '2026-02-01T08:00:00.000Z',
    lastActive: new Date().toISOString(),
    paguAnggaran: 210000000,
    warnaTema: 'blue',
    catatanFasilitator: 'Rehabilitasi Ruang Laboratorium IPA & Toilet Siswa',
  },
];

// Helper to safely resolve initial workspaces without overwriting existing data
const resolveInitialWorkspacesState = (): { workspaces: SchoolWorkspaceProfile[]; activeNpsn: string } => {
  let list: SchoolWorkspaceProfile[] = [];

  // 1. Check current list in localStorage
  const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.WORKSPACES_LIST);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    } catch (e) {
      console.error('Failed to parse workspaces list', e);
    }
  }

  // 2. Also check legacy registry key
  if (list.length === 0) {
    const registry = localStorage.getItem('siap_revita_workspaces_registry_v2');
    if (registry) {
      try {
        const parsed = JSON.parse(registry);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map((item: any) => ({
            npsn: item.npsn,
            namaSekolah: item.namaSekolah,
            jenjang: item.jenjang || 'SD',
            kabupatenKota: item.kabupaten || 'Kabupaten Bogor',
            pin: item.pin || '',
            isPinProtected: !!item.hasPin,
            createdAt: item.createdAt || new Date().toISOString(),
            lastActive: item.lastModified || new Date().toISOString(),
            paguAnggaran: item.paguAnggaran || 0,
            warnaTema: 'emerald',
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 3. Scan localStorage for any school projects previously filled to ensure zero data loss
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sekolah_') && key.endsWith('_project')) {
          const matchedNpsn = key.replace('sekolah_', '').replace('_project', '');
          if (matchedNpsn && !list.some((w) => w.npsn === matchedNpsn)) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const p = JSON.parse(raw);
                list.push({
                  npsn: matchedNpsn,
                  namaSekolah: p.dataSekolah?.namaSekolah || p.namaInstansi || `Sekolah ${matchedNpsn}`,
                  jenjang: p.dataSekolah?.jenjang || 'SD',
                  kabupatenKota: p.alamatLengkap?.kabupatenKota || p.kabupaten || 'Kabupaten Bogor',
                  isPinProtected: false,
                  createdAt: new Date().toISOString(),
                  lastActive: new Date().toISOString(),
                  paguAnggaran: p.totalPaguAnggaran || 0,
                  warnaTema: 'emerald',
                });
              }
            } catch (err) {}
          }
        }
      }
    } catch (err) {}
  }

  const isPublished = isPublishedApp();

  // If in published mode, NEVER force fake demo schools if real user data exists
  if (isPublished) {
    const userSchools = list.filter((w) => !isDemoSchoolData(w.npsn, w.namaSekolah, checkSchoolHasRealTransactions(w.npsn)));
    if (userSchools.length > 0) {
      list = userSchools;
    } else {
      list = [CLEAN_INITIAL_WORKSPACE];
    }
  } else if (list.length === 0) {
    list = DEFAULT_INITIAL_WORKSPACES;
  }

  const savedActive = localStorage.getItem(GLOBAL_STORAGE_KEYS.ACTIVE_NPSN);
  const active =
    savedActive && list.some((w) => w.npsn === savedActive)
      ? savedActive
      : list[0]?.npsn || '20260001';

  return { workspaces: list, activeNpsn: active };
};

// Helper to create sample secondary school data
const createSampleSecondarySchool = (): {
  projectInfo: ProjectInfo;
  transactions: CashTransaction[];
  kwitansiList: Kwitansi[];
  payrollHarian: PayrollHarianBatch[];
  payrollBorongan: WorkerBoronganItem[];
  wbsList: WBSItem[];
  rabMaster: RABMasterItem[];
  dailyLogs: DailyWorkLog[];
  weeklyRecaps: WeeklyRecap[];
  standardWages: StandardWageRate[];
  standardMaterials: StandardMaterialPrice[];
} => {
  const info: ProjectInfo = {
    ...INITIAL_PROJECT_INFO,
    namaProyek: 'Rehabilitasi Gedung Laboratorium IPA & Sanitasi SMPN 2 Sukaraja',
    nomorSuratTugas: '421.3/088/P2SP-SMPN2/2026',
    lokasi: 'Jl. Raya Sukaraja No. 88',
    desa: 'Cikeas',
    kecamatan: 'Sukaraja',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    tahunAnggaran: '2026',
    totalPaguAnggaran: 210000000,
    namaInstansi: 'SMP Negeri 2 Sukaraja',
    namaKetuaTPK: 'Bambang Sudibyo, M.Pd.',
    namaBendahara: 'Rina Marlina, S.Ak.',
    namaPelaksanaTeknis: 'Ir. Ahmad Zaelani',
    namaPimpinan: 'Drs. H. Mulyadi, M.M.',
    namaBank: 'Bank BJB KCP Sukaraja',
    nomorRekeningBank: '0092-8812-4410-2',
    atasNamaRekening: 'P2SP SMPN 2 SUKARAJA',
    dataSekolah: {
      namaSekolah: 'SMP Negeri 2 Sukaraja',
      npsn: '20209999',
      jenjang: 'SMP',
      statusSekolah: 'NEGERI',
      nomorSkP2sp: '421.3/088/P2SP-SMPN2/2026',
      tanggalSkP2sp: '2026-02-01',
    },
    alamatLengkap: {
      jalan: 'Jl. Raya Sukaraja No. 88, Cikeas',
      rtRw: 'RT 03 / RW 01',
      desaKelurahan: 'Cikeas',
      kecamatan: 'Sukaraja',
      kabupatenKota: 'Kabupaten Bogor',
      provinsi: 'Jawa Barat',
      kodePos: '16710',
    },
    timP2sp: {
      ...INITIAL_PROJECT_INFO.timP2sp,
      penanggungJawab: {
        nama: 'Drs. H. Mulyadi, M.M.',
        nipNik: '19700315 199503 1 002',
        jabatanAsal: 'Kepala Sekolah',
        noHp: '0813-8899-7711',
        alamat: 'Jl. Cikeas Indah No. 5',
      },
      ketuaP2sp: {
        nama: 'Bambang Sudibyo, M.Pd.',
        nipNik: '3201091503750001',
        jabatanAsal: 'Ketua Komite SMPN 2',
        noHp: '0812-3344-5566',
        alamat: 'Kp. Sukaraja RT 02/RW 01',
      },
      bendahara: {
        nama: 'Rina Marlina, S.Ak.',
        nipNik: '19870820 201402 2 001',
        jabatanAsal: 'Bendahara Sekolah',
        noHp: '0857-1122-8899',
        alamat: 'Perumahan Griya Sukaraja Blok B4',
      },
    },
  };

  const sampleTx: CashTransaction[] = [
    {
      id: 'tx-smp-001',
      tanggal: '2026-02-10',
      noBukti: 'SP2D/SMP2/2026/01',
      uraian: 'Penerimaan Dana Hibah Revitalisasi Sarpras Tahap I (70%) ke Rekening Bank',
      jenisKas: 'BANK',
      jenisTransaksi: 'PENERIMAAN',
      kategori: 'PENCAIRAN_DANA',
      nominal: 147000000,
      kodeAkun: '4.1.01',
      penerimaAtauPemberi: 'Kas Daerah Prov. Jawa Barat',
      keterangan: 'Pencairan Tahap I 70%',
    },
    {
      id: 'tx-smp-002',
      tanggal: '2026-02-12',
      noBukti: 'BKT/TRF/01',
      uraian: 'Penarikan Dana Kas Bank ke Kas Tunai untuk Pekerjaan Pembongkaran Atap Lab',
      jenisKas: 'BANK',
      jenisTransaksi: 'PENGELUARAN',
      kategori: 'PENCAIRAN_DANA',
      nominal: 25000000,
      kodeAkun: '1.1.01',
      penerimaAtauPemberi: 'Rina Marlina, S.Ak.',
      keterangan: 'Cek No. 44921',
      linkedDocId: 'tx-smp-003',
      linkedDocType: 'PENCAIRAN_BANK',
    },
    {
      id: 'tx-smp-003',
      tanggal: '2026-02-12',
      noBukti: 'BKT/IN/01',
      uraian: 'Penerimaan Kas Tunai dari Penarikan Bank Cek No. 44921',
      jenisKas: 'TUNAI',
      jenisTransaksi: 'PENERIMAAN',
      kategori: 'PENCAIRAN_DANA',
      nominal: 25000000,
      kodeAkun: '1.1.02',
      penerimaAtauPemberi: 'Bank BJB KCP Sukaraja',
      keterangan: 'Penarikan Kas Operasional',
      linkedDocId: 'tx-smp-002',
      linkedDocType: 'PENCAIRAN_BANK',
    },
  ];

  return {
    projectInfo: info,
    transactions: sampleTx,
    kwitansiList: [],
    payrollHarian: [],
    payrollBorongan: [],
    wbsList: INITIAL_WBS,
    rabMaster: INITIAL_RAB_MASTER,
    dailyLogs: [],
    weeklyRecaps: [],
    standardWages: INITIAL_STANDARD_WAGES,
    standardMaterials: INITIAL_STANDARD_MATERIALS,
  };
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize Workspaces List & Active NPSN with clean & persistent fallback
  const initialResolved = useMemo(() => resolveInitialWorkspacesState(), []);

  const [workspaces, setWorkspaces] = useState<SchoolWorkspaceProfile[]>(initialResolved.workspaces);
  const [activeNpsn, setActiveNpsn] = useState<string>(initialResolved.activeNpsn);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('ONLINE_SYNCED');

  // 2. Helper to safely load school data by NPSN without demo pollution
  const loadSchoolDataset = (npsn: string) => {
    // Migration check: If old un-prefixed keys exist and active NPSN is 20201842, migrate once
    const legacyProject = localStorage.getItem('siap_revita_project_v1');
    const existingNpsnProject = localStorage.getItem(getSchoolStorageKey(npsn, 'project'));

    if (legacyProject && !existingNpsnProject && npsn === '20201842') {
      try {
        const parsedProj = JSON.parse(legacyProject);
        localStorage.setItem(getSchoolStorageKey(npsn, 'project'), JSON.stringify(parsedProj));

        const legacyTx = localStorage.getItem('siap_revita_transactions_v1');
        if (legacyTx) localStorage.setItem(getSchoolStorageKey(npsn, 'bku'), legacyTx);

        const legacyKw = localStorage.getItem('siap_revita_kwitansi_v1');
        if (legacyKw) localStorage.setItem(getSchoolStorageKey(npsn, 'kwitansi'), legacyKw);

        const legacyPh = localStorage.getItem('siap_revita_payroll_h_v1');
        if (legacyPh) localStorage.setItem(getSchoolStorageKey(npsn, 'payroll_h'), legacyPh);

        const legacyPb = localStorage.getItem('siap_revita_payroll_b_v1');
        if (legacyPb) localStorage.setItem(getSchoolStorageKey(npsn, 'payroll_b'), legacyPb);

        const legacyWbs = localStorage.getItem('siap_revita_wbs_v1');
        if (legacyWbs) localStorage.setItem(getSchoolStorageKey(npsn, 'wbs'), legacyWbs);

        const legacyRab = localStorage.getItem('siap_revita_rab_master_v1');
        if (legacyRab) localStorage.setItem(getSchoolStorageKey(npsn, 'rab_master'), legacyRab);

        const legacyDaily = localStorage.getItem('siap_revita_daily_v1');
        if (legacyDaily) localStorage.setItem(getSchoolStorageKey(npsn, 'daily'), legacyDaily);

        const legacyWeekly = localStorage.getItem('siap_revita_weekly_v1');
        if (legacyWeekly) localStorage.setItem(getSchoolStorageKey(npsn, 'weekly'), legacyWeekly);
      } catch (e) {
        console.error('Migration error:', e);
      }
    }

    const isPublished = isPublishedApp();

    // Load Project Info (Use CLEAN_PROJECT_INFO by default)
    const savedProject = localStorage.getItem(getSchoolStorageKey(npsn, 'project'));
    let loadedProjectInfo = CLEAN_PROJECT_INFO;
    if (savedProject) {
      try {
        const p = JSON.parse(savedProject);
        const isDemoProj =
          isPublished &&
          isDemoSchoolData(
            npsn,
            p.dataSekolah?.namaSekolah || p.namaInstansi,
            checkSchoolHasRealTransactions(npsn)
          );
        if (!isDemoProj) {
          loadedProjectInfo = {
            ...CLEAN_PROJECT_INFO,
            ...p,
            dataSekolah: { ...CLEAN_PROJECT_INFO.dataSekolah, ...(p.dataSekolah || {}), npsn },
            alamatLengkap: { ...CLEAN_PROJECT_INFO.alamatLengkap, ...(p.alamatLengkap || {}) },
            timP2sp: {
              ...CLEAN_PROJECT_INFO.timP2sp,
              ...(p.timP2sp || {}),
            },
          };
        }
      } catch (e) {
        console.error('Error loading project info', e);
      }
    } else {
      const wsProfile = workspaces?.find((w) => w.npsn === npsn);
      if (wsProfile) {
        loadedProjectInfo = {
          ...CLEAN_PROJECT_INFO,
          namaProyek: wsProfile.namaSekolah ? `Program Revitalisasi Sarpras ${wsProfile.namaSekolah}` : CLEAN_PROJECT_INFO.namaProyek,
          totalPaguAnggaran: wsProfile.paguAnggaran || 0,
          namaInstansi: wsProfile.namaSekolah ? `${wsProfile.namaSekolah} (Tim P2SP)` : 'Tim P2SP Revitalisasi Sekolah',
          dataSekolah: {
            ...CLEAN_PROJECT_INFO.dataSekolah,
            namaSekolah: wsProfile.namaSekolah || '',
            npsn: npsn,
            jenjang: wsProfile.jenjang || 'SD',
          },
          alamatLengkap: {
            ...CLEAN_PROJECT_INFO.alamatLengkap,
            kabupatenKota: wsProfile.kabupatenKota || 'Kabupaten Bogor',
          },
        };
      }
    }

    // Load BKU Transactions - Defaults to clean empty array []
    const savedTx = localStorage.getItem(getSchoolStorageKey(npsn, 'bku'));
    let loadedTx: CashTransaction[] = [];
    if (savedTx) {
      try {
        const parsed = JSON.parse(savedTx);
        if (Array.isArray(parsed)) {
          if (isPublished && isDemoTransactions(parsed)) {
            loadedTx = [];
          } else {
            loadedTx = parsed;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load Kwitansi - Defaults to clean empty array []
    const savedKw = localStorage.getItem(getSchoolStorageKey(npsn, 'kwitansi'));
    let loadedKw: Kwitansi[] = [];
    if (savedKw) {
      try {
        const parsed = JSON.parse(savedKw);
        if (Array.isArray(parsed)) {
          const isDemoKw = isPublished && parsed.every((k: any) => ['kwt-001', 'kwt-002', 'kwt-003'].includes(k.id));
          if (!isDemoKw) loadedKw = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load Payroll Harian - Defaults to clean empty array []
    const savedPh = localStorage.getItem(getSchoolStorageKey(npsn, 'payroll_h'));
    let loadedPh: PayrollHarianBatch[] = [];
    if (savedPh) {
      try {
        const parsed = JSON.parse(savedPh);
        if (Array.isArray(parsed)) {
          const isDemoPh = isPublished && parsed.every((p: any) => p.id === 'pr-batch-001');
          if (!isDemoPh) loadedPh = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load Payroll Borongan - Defaults to clean empty array []
    const savedPb = localStorage.getItem(getSchoolStorageKey(npsn, 'payroll_b'));
    let loadedPb: WorkerBoronganItem[] = [];
    if (savedPb) {
      try {
        const parsed = JSON.parse(savedPb);
        if (Array.isArray(parsed)) {
          const isDemoPb = isPublished && parsed.every((b: any) => ['brg-001', 'brg-002'].includes(b.id));
          if (!isDemoPb) loadedPb = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load WBS - Defaults to CLEAN_WBS (0% realisasi)
    const savedWbs = localStorage.getItem(getSchoolStorageKey(npsn, 'wbs'));
    let loadedWbs: WBSItem[] = CLEAN_WBS;
    if (savedWbs) {
      try {
        const parsed = JSON.parse(savedWbs);
        if (Array.isArray(parsed) && parsed.length > 0) loadedWbs = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    // Load RAB Master
    const savedRab = localStorage.getItem(getSchoolStorageKey(npsn, 'rab_master'));
    let loadedRab: RABMasterItem[] = INITIAL_RAB_MASTER;
    if (savedRab) {
      try {
        const parsed = JSON.parse(savedRab);
        if (Array.isArray(parsed) && parsed.length > 0) loadedRab = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    // Load Daily Logs - Defaults to clean empty array []
    const savedDaily = localStorage.getItem(getSchoolStorageKey(npsn, 'daily'));
    let loadedDaily: DailyWorkLog[] = [];
    if (savedDaily) {
      try {
        const parsed = JSON.parse(savedDaily);
        if (Array.isArray(parsed)) loadedDaily = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    // Load Weekly Recaps - Defaults to clean empty array []
    const savedWeekly = localStorage.getItem(getSchoolStorageKey(npsn, 'weekly'));
    let loadedWeekly: WeeklyRecap[] = [];
    if (savedWeekly) {
      try {
        const parsed = JSON.parse(savedWeekly);
        if (Array.isArray(parsed)) loadedWeekly = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    // Load Wages & Materials
    const savedWages = localStorage.getItem(getSchoolStorageKey(npsn, 'wages'));
    let loadedWages: StandardWageRate[] = INITIAL_STANDARD_WAGES;
    if (savedWages) {
      try {
        const parsed = JSON.parse(savedWages);
        if (Array.isArray(parsed) && parsed.length > 0) loadedWages = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    const savedMaterials = localStorage.getItem(getSchoolStorageKey(npsn, 'materials'));
    let loadedMaterials: StandardMaterialPrice[] = INITIAL_STANDARD_MATERIALS;
    if (savedMaterials) {
      try {
        const parsed = JSON.parse(savedMaterials);
        if (Array.isArray(parsed) && parsed.length > 0) loadedMaterials = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    const savedPhotos = localStorage.getItem(getSchoolStorageKey(npsn, 'photos'));
    let loadedPhotos: ProgressPhotoItem[] = [];
    if (savedPhotos) {
      try {
        const parsed = JSON.parse(savedPhotos);
        if (Array.isArray(parsed)) loadedPhotos = parsed;
      } catch (e) {
        console.error(e);
      }
    }
    // Jika masih kosong pada proyek awal, sediakan 2 foto demo resmi
    if (loadedPhotos.length === 0) {
      loadedPhotos = createDemoProgressPhotos(4);
    }

    return {
      projectInfo: loadedProjectInfo,
      transactions: loadedTx,
      kwitansiList: loadedKw,
      payrollHarian: loadedPh,
      payrollBorongan: loadedPb,
      wbsList: loadedWbs,
      rabMaster: loadedRab,
      dailyLogs: loadedDaily,
      weeklyRecaps: loadedWeekly,
      standardWages: loadedWages,
      standardMaterials: loadedMaterials,
      progressPhotos: loadedPhotos,
    };
  };

  // State initialization
  const initialData = useMemo(() => loadSchoolDataset(activeNpsn), [activeNpsn]);

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(initialData.projectInfo);
  const [transactions, setTransactions] = useState<CashTransaction[]>(initialData.transactions);
  const [kwitansiList, setKwitansiList] = useState<Kwitansi[]>(initialData.kwitansiList);
  const [payrollHarian, setPayrollHarian] = useState<PayrollHarianBatch[]>(initialData.payrollHarian);
  const [payrollBorongan, setPayrollBorongan] = useState<WorkerBoronganItem[]>(initialData.payrollBorongan);
  const [wbsList, setWbsList] = useState<WBSItem[]>(initialData.wbsList);
  const [rabMaster, setRabMaster] = useState<RABMasterItem[]>(initialData.rabMaster);
  const [dailyLogs, setDailyLogs] = useState<DailyWorkLog[]>(initialData.dailyLogs);
  const [weeklyRecaps, setWeeklyRecaps] = useState<WeeklyRecap[]>(initialData.weeklyRecaps);
  const [standardWages, setStandardWages] = useState<StandardWageRate[]>(initialData.standardWages);
  const [standardMaterials, setStandardMaterials] = useState<StandardMaterialPrice[]>(initialData.standardMaterials);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhotoItem[]>(initialData.progressPhotos || []);

  // Track export state
  const [lastExportedAt, setLastExportedAt] = useState<string | null>(() => {
    return localStorage.getItem(GLOBAL_STORAGE_KEYS.LAST_EXPORT_PREFIX + activeNpsn);
  });
  const [hasUnsavedExportChanges, setHasUnsavedExportChanges] = useState<boolean>(false);

  // Sync workspace list to localStorage
  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.WORKSPACES_LIST, JSON.stringify(workspaces));
  }, [workspaces]);

  // Sync active NPSN to localStorage
  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.ACTIVE_NPSN, activeNpsn);
  }, [activeNpsn]);

  // Cloud Sync on Mount: Fetch from Firestore & preserve previously filled data
  useEffect(() => {
    let isMounted = true;

    async function initializeFromCloud() {
      try {
        setCloudSyncStatus('SYNCING');
        const cloudWorkspaces = await fetchWorkspacesFromCloud();
        if (!isMounted) return;

        if (cloudWorkspaces && cloudWorkspaces.length > 0) {
          const isPublished = isPublishedApp();
          // In published mode, filter out fake demo schools if real user data exists
          const validCloudWorkspaces = isPublished
            ? cloudWorkspaces.filter((w) => !isDemoSchoolData(w.npsn, w.namaSekolah))
            : cloudWorkspaces;

          if (validCloudWorkspaces.length > 0) {
            setWorkspaces((prev) => {
              const merged = [...validCloudWorkspaces];
              prev.forEach((localW) => {
                if (!merged.some((m) => m.npsn === localW.npsn)) {
                  if (
                    !isPublished ||
                    !isDemoSchoolData(
                      localW.npsn,
                      localW.namaSekolah,
                      checkSchoolHasRealTransactions(localW.npsn)
                    )
                  ) {
                    merged.push(localW);
                  }
                }
              });
              return merged;
            });

            const targetNpsn =
              activeNpsn && validCloudWorkspaces.some((w) => w.npsn === activeNpsn)
                ? activeNpsn
                : validCloudWorkspaces[0].npsn;

            if (targetNpsn) {
              setActiveNpsn(targetNpsn);
              const cloudData = await fetchSchoolDataFromCloud(targetNpsn);
              if (isMounted && cloudData) {
                if (isPublished && isDemoTransactions(cloudData.transactions)) {
                  cloudData.transactions = [];
                }
                const hasLocalRealTx = checkSchoolHasRealTransactions(targetNpsn);
                // If local has no custom data or cloud has transactions, populate from cloud
                if (!hasLocalRealTx || (cloudData.transactions && cloudData.transactions.length > 0)) {
                  if (cloudData.projectInfo) setProjectInfo(cloudData.projectInfo);
                  if (cloudData.transactions) setTransactions(cloudData.transactions);
                  if (cloudData.kwitansiList) setKwitansiList(cloudData.kwitansiList);
                  if (cloudData.payrollHarian) setPayrollHarian(cloudData.payrollHarian);
                  if (cloudData.payrollBorongan) setPayrollBorongan(cloudData.payrollBorongan);
                  if (cloudData.wbsList) setWbsList(cloudData.wbsList);
                  if (cloudData.rabMaster) setRabMaster(cloudData.rabMaster);
                  if (cloudData.dailyLogs) setDailyLogs(cloudData.dailyLogs);
                  if (cloudData.weeklyRecaps) setWeeklyRecaps(cloudData.weeklyRecaps);
                  if (cloudData.standardWages) setStandardWages(cloudData.standardWages);
                  if (cloudData.standardMaterials) setStandardMaterials(cloudData.standardMaterials);
                }
              }
            }
          }
        }
        setCloudSyncStatus('ONLINE_SYNCED');
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
        setCloudSyncStatus('OFFLINE_LOCAL');
      }
    }

    initializeFromCloud();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-sync to Cloud Firestore on any data changes
  useEffect(() => {
    if (!activeNpsn || activeNpsn.trim() === '') return;
    if (
      isPublishedApp() &&
      isDemoSchoolData(
        activeNpsn,
        projectInfo.dataSekolah?.namaSekolah,
        hasRealUserTransactions(transactions)
      )
    ) {
      // Avoid polluting Firestore with demo data in published mode
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCloudSyncStatus('SYNCING');
        const currentWs = workspaces.find((w) => w.npsn === activeNpsn);
        if (currentWs) {
          await syncWorkspaceMetaToCloud(currentWs);
        }
        await syncSchoolDataToCloud(activeNpsn, {
          projectInfo,
          transactions,
          kwitansiList,
          payrollHarian,
          payrollBorongan,
          wbsList,
          rabMaster,
          dailyLogs,
          weeklyRecaps,
          standardWages,
          standardMaterials,
        });
        setCloudSyncStatus('ONLINE_SYNCED');
      } catch (e) {
        console.warn('Cloud sync save failed:', e);
        setCloudSyncStatus('OFFLINE_LOCAL');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    activeNpsn,
    projectInfo,
    transactions,
    kwitansiList,
    payrollHarian,
    payrollBorongan,
    wbsList,
    rabMaster,
    dailyLogs,
    weeklyRecaps,
    standardWages,
    standardMaterials,
    workspaces,
  ]);

  // When activeNpsn changes, reload dataset into state
  const applyLoadedDataset = useCallback((npsn: string) => {
    const data = loadSchoolDataset(npsn);
    setProjectInfo(data.projectInfo);
    setTransactions(data.transactions);
    setKwitansiList(data.kwitansiList);
    setPayrollHarian(data.payrollHarian);
    setPayrollBorongan(data.payrollBorongan);
    setWbsList(data.wbsList);
    setRabMaster(data.rabMaster);
    setDailyLogs(data.dailyLogs);
    setWeeklyRecaps(data.weeklyRecaps);
    setStandardWages(data.standardWages);
    setStandardMaterials(data.standardMaterials);
    setProgressPhotos(data.progressPhotos);
    setLastExportedAt(localStorage.getItem(GLOBAL_STORAGE_KEYS.LAST_EXPORT_PREFIX + npsn));
    setHasUnsavedExportChanges(false);
  }, []);

  // Save current active school state to prefixed localStorage
  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'project'), JSON.stringify(projectInfo));
    setHasUnsavedExportChanges(true);
  }, [projectInfo, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'bku'), JSON.stringify(transactions));
    setHasUnsavedExportChanges(true);
  }, [transactions, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'kwitansi'), JSON.stringify(kwitansiList));
    setHasUnsavedExportChanges(true);
  }, [kwitansiList, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'payroll_h'), JSON.stringify(payrollHarian));
    setHasUnsavedExportChanges(true);
  }, [payrollHarian, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'payroll_b'), JSON.stringify(payrollBorongan));
    setHasUnsavedExportChanges(true);
  }, [payrollBorongan, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'wbs'), JSON.stringify(wbsList));
    setHasUnsavedExportChanges(true);
  }, [wbsList, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'rab_master'), JSON.stringify(rabMaster));
    setHasUnsavedExportChanges(true);
  }, [rabMaster, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'daily'), JSON.stringify(dailyLogs));
    setHasUnsavedExportChanges(true);
  }, [dailyLogs, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'weekly'), JSON.stringify(weeklyRecaps));
    setHasUnsavedExportChanges(true);
  }, [weeklyRecaps, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'wages'), JSON.stringify(standardWages));
  }, [standardWages, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'materials'), JSON.stringify(standardMaterials));
  }, [standardMaterials, activeNpsn]);

  useEffect(() => {
    if (!activeNpsn) return;
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'photos'), JSON.stringify(progressPhotos));
    setHasUnsavedExportChanges(true);
  }, [progressPhotos, activeNpsn]);

  // Keep workspace profile in sync with project info updates
  useEffect(() => {
    if (!activeNpsn) return;
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.npsn === activeNpsn) {
          return {
            ...w,
            namaSekolah: projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi || w.namaSekolah,
            jenjang: projectInfo.dataSekolah?.jenjang || w.jenjang,
            paguAnggaran: projectInfo.totalPaguAnggaran || w.paguAnggaran,
            kabupatenKota: projectInfo.alamatLengkap?.kabupatenKota || projectInfo.kabupaten || w.kabupatenKota,
            lastActive: new Date().toISOString(),
          };
        }
        return w;
      })
    );
  }, [projectInfo, activeNpsn]);

  // Active Workspace
  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.npsn === activeNpsn) || workspaces[0];
  }, [workspaces, activeNpsn]);

  // Financial Calculations
  const bankTransactions = useMemo(() => transactions.filter((t) => t.jenisKas === 'BANK'), [transactions]);
  const penerimaanBank = useMemo(
    () => bankTransactions.filter((t) => t.jenisTransaksi === 'PENERIMAAN').reduce((sum, t) => sum + t.nominal, 0),
    [bankTransactions]
  );
  const pengeluaranBank = useMemo(
    () => bankTransactions.filter((t) => t.jenisTransaksi === 'PENGELUARAN').reduce((sum, t) => sum + t.nominal, 0),
    [bankTransactions]
  );
  const saldoBank = penerimaanBank - pengeluaranBank;

  const tunaiTransactions = useMemo(() => transactions.filter((t) => t.jenisKas === 'TUNAI'), [transactions]);
  const penerimaanTunai = useMemo(
    () => tunaiTransactions.filter((t) => t.jenisTransaksi === 'PENERIMAAN').reduce((sum, t) => sum + t.nominal, 0),
    [tunaiTransactions]
  );
  const pengeluaranTunai = useMemo(
    () => tunaiTransactions.filter((t) => t.jenisTransaksi === 'PENGELUARAN').reduce((sum, t) => sum + t.nominal, 0),
    [tunaiTransactions]
  );
  const saldoTunai = penerimaanTunai - pengeluaranTunai;

  const realPenerimaanExternal = useMemo(
    () =>
      transactions
        .filter((t) => t.jenisTransaksi === 'PENERIMAAN' && t.linkedDocType !== 'PENCAIRAN_BANK')
        .reduce((sum, t) => sum + t.nominal, 0),
    [transactions]
  );

  const realPengeluaranExternal = useMemo(
    () =>
      transactions
        .filter((t) => t.jenisTransaksi === 'PENGELUARAN' && t.linkedDocType !== 'PENCAIRAN_BANK')
        .reduce((sum, t) => sum + t.nominal, 0),
    [transactions]
  );

  const saldoBKU = realPenerimaanExternal - realPengeluaranExternal;
  const selisihSaldo = Math.abs(saldoBKU - (saldoBank + saldoTunai));
  const isBalanceSynced = selisihSaldo < 1;

  const totalSerapanAnggaran = realPengeluaranExternal;
  const persentaseSerapanAnggaran =
    projectInfo.totalPaguAnggaran > 0 ? (totalSerapanAnggaran / projectInfo.totalPaguAnggaran) * 100 : 0;

  const sisaPaguAnggaran = Math.max(0, projectInfo.totalPaguAnggaran - totalSerapanAnggaran);
  const persentasePenerimaan =
    projectInfo.totalPaguAnggaran > 0 ? (realPenerimaanExternal / projectInfo.totalPaguAnggaran) * 100 : 0;
  const sisaPaguBelumCair = Math.max(0, projectInfo.totalPaguAnggaran - realPenerimaanExternal);

  const progresFisikKumulatif = useMemo(() => {
    return wbsList.reduce((sum, w) => {
      return sum + w.bobotRencana * (w.progresRealisasi / 100);
    }, 0);
  }, [wbsList]);

  const summary: FinancialSummary = {
    penerimaanBKU: realPenerimaanExternal,
    pengeluaranBKU: realPengeluaranExternal,
    saldoBKU,
    penerimaanBank,
    pengeluaranBank,
    saldoBank,
    penerimaanTunai,
    pengeluaranTunai,
    saldoTunai,
    isBalanceSynced,
    selisihSaldo,
    totalSerapanAnggaran,
    persentaseSerapanAnggaran,
    sisaPaguAnggaran,
    persentasePenerimaan,
    sisaPaguBelumCair,
    progresFisikKumulatif,
  };

  // Switch Workspace Function
  const switchWorkspace = (targetNpsn: string, enteredPin?: string): { success: boolean; message?: string } => {
    const targetWs = workspaces.find((w) => w.npsn === targetNpsn);
    if (!targetWs) {
      return { success: false, message: `Sekolah dengan NPSN ${targetNpsn} tidak ditemukan.` };
    }

    if (targetWs.isPinProtected && targetWs.pin && targetWs.pin.trim() !== '') {
      if (!enteredPin || enteredPin.trim() !== targetWs.pin.trim()) {
        return { success: false, message: 'PIN / Kunci Akses Sekolah Salah! Silakan masukkan 4-digit PIN yang benar.' };
      }
    }

    // Persist active NPSN & switch
    setActiveNpsn(targetNpsn);
    applyLoadedDataset(targetNpsn);

    // Update lastActive
    setWorkspaces((prev) =>
      prev.map((w) => (w.npsn === targetNpsn ? { ...w, lastActive: new Date().toISOString() } : w))
    );

    return { success: true, message: `Berhasil berganti ke profil ${targetWs.namaSekolah} (${targetWs.npsn})` };
  };

  // Create Workspace Function
  const createWorkspace = (
    profileData: Omit<SchoolWorkspaceProfile, 'createdAt' | 'lastActive'>,
    templateType: 'sd_lengkap' | 'smp_rehab' | 'blank' = 'sd_lengkap'
  ): boolean => {
    const cleanNpsn = profileData.npsn.trim();
    if (!cleanNpsn) return false;

    // Check if already exists
    const exists = workspaces.some((w) => w.npsn === cleanNpsn);
    if (exists) return false;

    const newProfile: SchoolWorkspaceProfile = {
      ...profileData,
      npsn: cleanNpsn,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      warnaTema: profileData.warnaTema || 'emerald',
    };

    // Prepare initial data based on template - always clean empty records
    const newProjectInfo: ProjectInfo = {
      ...CLEAN_PROJECT_INFO,
      namaProyek: `Program Revitalisasi Sarpras ${profileData.namaSekolah}`,
      totalPaguAnggaran: profileData.paguAnggaran,
      namaInstansi: `${profileData.namaSekolah} (Tim P2SP)`,
      dataSekolah: {
        ...CLEAN_PROJECT_INFO.dataSekolah,
        namaSekolah: profileData.namaSekolah,
        npsn: cleanNpsn,
        jenjang: profileData.jenjang,
      },
      alamatLengkap: {
        ...CLEAN_PROJECT_INFO.alamatLengkap,
        kabupatenKota: profileData.kabupatenKota || 'Kabupaten Bogor',
      },
    };
    const newTx: CashTransaction[] = [];
    const newKw: Kwitansi[] = [];
    const newPh: PayrollHarianBatch[] = [];
    const newPb: WorkerBoronganItem[] = [];
    const newWbs: WBSItem[] = CLEAN_WBS;
    const newRab: RABMasterItem[] = INITIAL_RAB_MASTER;
    const newDaily: DailyWorkLog[] = [];
    const newWeekly: WeeklyRecap[] = [];

    // Save newly created school to localStorage prefix
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'project'), JSON.stringify(newProjectInfo));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'bku'), JSON.stringify(newTx));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'kwitansi'), JSON.stringify(newKw));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'payroll_h'), JSON.stringify(newPh));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'payroll_b'), JSON.stringify(newPb));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'wbs'), JSON.stringify(newWbs));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'rab_master'), JSON.stringify(newRab));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'daily'), JSON.stringify(newDaily));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'weekly'), JSON.stringify(newWeekly));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'wages'), JSON.stringify(INITIAL_STANDARD_WAGES));
    localStorage.setItem(getSchoolStorageKey(cleanNpsn, 'materials'), JSON.stringify(INITIAL_STANDARD_MATERIALS));

    // Sync new workspace to cloud
    syncWorkspaceMetaToCloud(newProfile);
    syncSchoolDataToCloud(cleanNpsn, {
      projectInfo: newProjectInfo,
      transactions: newTx,
      kwitansiList: newKw,
      payrollHarian: newPh,
      payrollBorongan: newPb,
      wbsList: newWbs,
      rabMaster: newRab,
      dailyLogs: newDaily,
      weeklyRecaps: newWeekly,
      standardWages: INITIAL_STANDARD_WAGES,
      standardMaterials: INITIAL_STANDARD_MATERIALS,
    });

    // Update list & switch to newly created
    setWorkspaces((prev) => [newProfile, ...prev]);
    setActiveNpsn(cleanNpsn);
    applyLoadedDataset(cleanNpsn);

    return true;
  };

  // Delete Workspace
  const deleteWorkspace = (targetNpsn: string): boolean => {
    if (workspaces.length <= 1) {
      alert('Tidak dapat menghapus profil. Aplikasi minimal harus memiliki satu profil sekolah.');
      return false;
    }

    // Remove local storage keys for this school
    const keysToRemove = [
      'project',
      'bku',
      'kwitansi',
      'payroll_h',
      'payroll_b',
      'wbs',
      'rab_master',
      'daily',
      'weekly',
      'wages',
      'materials',
    ];
    keysToRemove.forEach((k) => {
      localStorage.removeItem(getSchoolStorageKey(targetNpsn, k));
    });
    localStorage.removeItem(GLOBAL_STORAGE_KEYS.LAST_EXPORT_PREFIX + targetNpsn);

    // Delete from cloud
    deleteSchoolFromCloud(targetNpsn);

    const remaining = workspaces.filter((w) => w.npsn !== targetNpsn);
    setWorkspaces(remaining);

    // If currently active is deleted, switch to the first remaining
    if (activeNpsn === targetNpsn) {
      const nextWs = remaining[0];
      setActiveNpsn(nextWs.npsn);
      applyLoadedDataset(nextWs.npsn);
    }

    return true;
  };

  // Update Workspace Profile
  const updateWorkspaceProfile = (targetNpsn: string, updates: Partial<SchoolWorkspaceProfile>) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.npsn === targetNpsn) {
          return { ...w, ...updates };
        }
        return w;
      })
    );
  };

  // Get Summary Stats for a specific workspace without loading everything to main state
  const getWorkspaceStats = useCallback(
    (npsn: string): WorkspaceSummaryStat => {
      const ws = workspaces.find((w) => w.npsn === npsn);
      const defaultName = ws ? ws.namaSekolah : `Sekolah (${npsn})`;
      const defaultJenjang = ws ? ws.jenjang : 'SD';
      const defaultPagu = ws ? ws.paguAnggaran : 0;
      const isPinProtected = ws ? ws.isPinProtected : false;

      try {
        const txSaved = localStorage.getItem(getSchoolStorageKey(npsn, 'bku'));
        const txArr: CashTransaction[] = txSaved ? JSON.parse(txSaved) : [];

        const kwSaved = localStorage.getItem(getSchoolStorageKey(npsn, 'kwitansi'));
        const kwArr: Kwitansi[] = kwSaved ? JSON.parse(kwSaved) : [];

        const wbsSaved = localStorage.getItem(getSchoolStorageKey(npsn, 'wbs'));
        const wbsArr: WBSItem[] = wbsSaved ? JSON.parse(wbsSaved) : [];

        const realIn = txArr
          .filter((t) => t.jenisTransaksi === 'PENERIMAAN' && t.linkedDocType !== 'PENCAIRAN_BANK')
          .reduce((sum, t) => sum + t.nominal, 0);

        const realOut = txArr
          .filter((t) => t.jenisTransaksi === 'PENGELUARAN' && t.linkedDocType !== 'PENCAIRAN_BANK')
          .reduce((sum, t) => sum + t.nominal, 0);

        const progress = wbsArr.reduce((sum, w) => sum + w.bobotRencana * (w.progresRealisasi / 100), 0);

        return {
          npsn,
          namaSekolah: defaultName,
          jenjang: defaultJenjang,
          paguAnggaran: defaultPagu,
          bkuCount: txArr.length,
          kwitansiCount: kwArr.length,
          saldoBKU: realIn - realOut,
          progressPersen: progress,
          isPinProtected,
        };
      } catch (e) {
        return {
          npsn,
          namaSekolah: defaultName,
          jenjang: defaultJenjang,
          paguAnggaran: defaultPagu,
          bkuCount: 0,
          kwitansiCount: 0,
          saldoBKU: 0,
          progressPersen: 0,
          isPinProtected,
        };
      }
    },
    [workspaces]
  );

  // File-Based Portable Save (.revita & .json)
  const exportProjectFile = (fileType: 'revita' | 'json' = 'revita') => {
    const timestamp = new Date().toISOString();
    const cleanSchoolName = (projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi || 'Sekolah')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');

    const fileBundle: ProjectFileBundle = {
      format: 'SIAP-REVITA-PROJECT',
      version: '2.0',
      fileExtension: fileType,
      exportedAt: timestamp,
      school: {
        npsn: projectInfo.dataSekolah?.npsn || activeNpsn,
        namaSekolah: projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi,
        jenjang: projectInfo.dataSekolah?.jenjang || 'SD',
        kabupatenKota: projectInfo.alamatLengkap?.kabupatenKota || projectInfo.kabupaten,
      },
      projectInfo,
      transactions,
      kwitansiList,
      payrollHarian,
      payrollBorongan,
      wbsList,
      rabMaster,
      dailyLogs,
      weeklyRecaps,
      standardWages,
      standardMaterials,
    };

    const serializedData = JSON.stringify(fileBundle, null, 2);
    const mimeType = fileType === 'revita' ? 'application/x-siap-revita' : 'application/json';
    const blob = new Blob([serializedData], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const dateStr = timestamp.split('T')[0];
    const fileName = `P2SP-${cleanSchoolName}-${activeNpsn}-${dateStr}.${fileType}`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = fileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    // Save last export record
    localStorage.setItem(GLOBAL_STORAGE_KEYS.LAST_EXPORT_PREFIX + activeNpsn, timestamp);
    setLastExportedAt(timestamp);
    setHasUnsavedExportChanges(false);
  };

  // File-Based Portable Load (.revita & .json)
  const importProjectFile = (
    fileContent: string
  ): { success: boolean; npsn?: string; namaSekolah?: string; error?: string } => {
    try {
      const parsed = JSON.parse(fileContent);

      // Validate basic structure
      if (!parsed.projectInfo && !parsed.school && !parsed.transactions) {
        return {
          success: false,
          error: 'Format berkas tidak valid. Pastikan memilih berkas proyek SIAP-Revita (.revita atau .json).',
        };
      }

      const importedProj: ProjectInfo = parsed.projectInfo || INITIAL_PROJECT_INFO;
      const importedNpsn =
        parsed.school?.npsn ||
        importedProj.dataSekolah?.npsn ||
        `NPSN-${Date.now().toString().slice(-6)}`;
      const importedNamaSekolah =
        parsed.school?.namaSekolah ||
        importedProj.dataSekolah?.namaSekolah ||
        importedProj.namaInstansi ||
        'Sekolah Revitalisasi';
      const importedJenjang = parsed.school?.jenjang || importedProj.dataSekolah?.jenjang || 'SD';
      const importedKabupaten =
        parsed.school?.kabupatenKota ||
        importedProj.alamatLengkap?.kabupatenKota ||
        importedProj.kabupaten ||
        'Kabupaten';

      const importedTx: CashTransaction[] = Array.isArray(parsed.transactions) ? parsed.transactions : [];
      const importedKw: Kwitansi[] = Array.isArray(parsed.kwitansiList) ? parsed.kwitansiList : [];
      const importedPh: PayrollHarianBatch[] = Array.isArray(parsed.payrollHarian) ? parsed.payrollHarian : [];
      const importedPb: WorkerBoronganItem[] = Array.isArray(parsed.payrollBorongan) ? parsed.payrollBorongan : [];
      const importedWbs: WBSItem[] = Array.isArray(parsed.wbsList) ? parsed.wbsList : INITIAL_WBS;
      const importedRab: RABMasterItem[] = Array.isArray(parsed.rabMaster) ? parsed.rabMaster : INITIAL_RAB_MASTER;
      const importedDaily: DailyWorkLog[] = Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [];
      const importedWeekly: WeeklyRecap[] = Array.isArray(parsed.weeklyRecaps) ? parsed.weeklyRecaps : [];
      const importedWages: StandardWageRate[] = Array.isArray(parsed.standardWages)
        ? parsed.standardWages
        : INITIAL_STANDARD_WAGES;
      const importedMaterials: StandardMaterialPrice[] = Array.isArray(parsed.standardMaterials)
        ? parsed.standardMaterials
        : INITIAL_STANDARD_MATERIALS;

      // Save imported dataset to prefixed local storage for this NPSN
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'project'), JSON.stringify(importedProj));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'bku'), JSON.stringify(importedTx));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'kwitansi'), JSON.stringify(importedKw));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'payroll_h'), JSON.stringify(importedPh));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'payroll_b'), JSON.stringify(importedPb));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'wbs'), JSON.stringify(importedWbs));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'rab_master'), JSON.stringify(importedRab));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'daily'), JSON.stringify(importedDaily));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'weekly'), JSON.stringify(importedWeekly));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'wages'), JSON.stringify(importedWages));
      localStorage.setItem(getSchoolStorageKey(importedNpsn, 'materials'), JSON.stringify(importedMaterials));

      // Register / update in workspaces list
      setWorkspaces((prev) => {
        const existingIdx = prev.findIndex((w) => w.npsn === importedNpsn);
        const updatedProfile: SchoolWorkspaceProfile = {
          npsn: importedNpsn,
          namaSekolah: importedNamaSekolah,
          jenjang: importedJenjang as any,
          kabupatenKota: importedKabupaten,
          pin: existingIdx >= 0 ? prev[existingIdx].pin : '1234',
          isPinProtected: existingIdx >= 0 ? prev[existingIdx].isPinProtected : false,
          createdAt: existingIdx >= 0 ? prev[existingIdx].createdAt : new Date().toISOString(),
          lastActive: new Date().toISOString(),
          paguAnggaran: importedProj.totalPaguAnggaran || 0,
          warnaTema: existingIdx >= 0 ? prev[existingIdx].warnaTema : 'emerald',
          catatanFasilitator: `Diimpor dari berkas ${parsed.fileExtension || 'revita'} pada ${new Date().toLocaleDateString('id-ID')}`,
        };

        if (existingIdx >= 0) {
          const clone = [...prev];
          clone[existingIdx] = updatedProfile;
          return clone;
        } else {
          return [updatedProfile, ...prev];
        }
      });

      // Switch active workspace to this imported school
      setActiveNpsn(importedNpsn);
      setProjectInfo(importedProj);
      setTransactions(importedTx);
      setKwitansiList(importedKw);
      setPayrollHarian(importedPh);
      setPayrollBorongan(importedPb);
      setWbsList(importedWbs);
      setRabMaster(importedRab);
      setDailyLogs(importedDaily);
      setWeeklyRecaps(importedWeekly);
      setStandardWages(importedWages);
      setStandardMaterials(importedMaterials);

      const timestamp = new Date().toISOString();
      localStorage.setItem(GLOBAL_STORAGE_KEYS.LAST_EXPORT_PREFIX + importedNpsn, timestamp);
      setLastExportedAt(timestamp);
      setHasUnsavedExportChanges(false);

      return {
        success: true,
        npsn: importedNpsn,
        namaSekolah: importedNamaSekolah,
      };
    } catch (err: any) {
      console.error('Import error:', err);
      return {
        success: false,
        error: `Gagal membaca isi berkas: ${err.message || 'Format data JSON rusak'}`,
      };
    }
  };

  // State manipulation methods for Project Data
  const updateProjectInfo = (info: Partial<ProjectInfo>) => {
    setProjectInfo((prev) => {
      const next = { ...prev, ...info };
      const newNpsn = next.dataSekolah?.npsn?.trim();
      if (newNpsn && newNpsn !== '' && newNpsn !== activeNpsn) {
        // Move local storage keys from activeNpsn to newNpsn
        const oldNpsn = activeNpsn;
        const keysToCopy = ['bku', 'kwitansi', 'payroll_h', 'payroll_b', 'wbs', 'rab_master', 'daily', 'weekly', 'wages', 'materials'];
        keysToCopy.forEach((k) => {
          const val = localStorage.getItem(getSchoolStorageKey(oldNpsn, k));
          if (val) {
            localStorage.setItem(getSchoolStorageKey(newNpsn, k), val);
          }
        });
        localStorage.setItem(getSchoolStorageKey(newNpsn, 'project'), JSON.stringify(next));

        setWorkspaces((prevWs) =>
          prevWs.map((w) =>
            w.npsn === oldNpsn
              ? {
                  ...w,
                  npsn: newNpsn,
                  namaSekolah: next.dataSekolah?.namaSekolah || w.namaSekolah,
                  jenjang: next.dataSekolah?.jenjang || w.jenjang,
                }
              : w
          )
        );
        setActiveNpsn(newNpsn);
      }
      return next;
    });
  };

  const addTransaction = (tx: Omit<CashTransaction, 'id'>) => {
    const newTx: CashTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [...prev, newTx]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const transferKasBankKeTunai = (
    tanggal: string,
    nominal: number,
    noCek: string,
    uraian: string = 'Penarikan Kas Bank ke Kas Tunai untuk Operasional Fisik'
  ) => {
    const bankTxId = `tx-${Date.now()}-bnk`;
    const tunaiTxId = `tx-${Date.now()}-tni`;

    const bankTx: CashTransaction = {
      id: bankTxId,
      tanggal,
      noBukti: `BKU/TRF/${Date.now().toString().slice(-4)}`,
      uraian: `${uraian} (Cek No: ${noCek})`,
      jenisKas: 'BANK',
      jenisTransaksi: 'PENGELUARAN',
      kategori: 'PENCAIRAN_DANA',
      nominal,
      kodeAkun: '1.1.01',
      penerimaAtauPemberi: projectInfo.namaBendahara,
      keterangan: `Penarikan Cek ${noCek}`,
      linkedDocId: tunaiTxId,
      linkedDocType: 'PENCAIRAN_BANK',
    };

    const tunaiTx: CashTransaction = {
      id: tunaiTxId,
      tanggal,
      noBukti: `BKT/TRF/${Date.now().toString().slice(-4)}`,
      uraian: `Penerimaan Uang Tunai dari Cek Bank ${noCek}`,
      jenisKas: 'TUNAI',
      jenisTransaksi: 'PENERIMAAN',
      kategori: 'PENCAIRAN_DANA',
      nominal,
      kodeAkun: '1.1.02',
      penerimaAtauPemberi: projectInfo.namaBank,
      keterangan: `Mutasi Kas dari Bank Cek ${noCek}`,
      linkedDocId: bankTxId,
      linkedDocType: 'PENCAIRAN_BANK',
    };

    setTransactions((prev) => [...prev, bankTx, tunaiTx]);
  };

  const addKwitansi = (kwData: Omit<Kwitansi, 'id'>) => {
    const kwtId = `kwt-${Date.now()}`;
    const txId = `tx-${Date.now()}-kwt`;

    let bookedTxId: string | undefined = undefined;

    if (kwData.isBookedToBKU) {
      bookedTxId = txId;
      const newTx: CashTransaction = {
        id: txId,
        tanggal: kwData.tanggal,
        noBukti: kwData.nomorKwitansi,
        uraian: `Pembayaran Belanja Material: ${kwData.untukPembayaran}`,
        jenisKas: kwData.jenisKasPembayaran,
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'BELANJA_MATERIAL',
        nominal: kwData.uangSebanyak,
        kodeAkun: '5.2.01',
        penerimaAtauPemberi: kwData.penerimaNama,
        keterangan: `Kwitansi No: ${kwData.nomorKwitansi}`,
        linkedDocId: kwtId,
        linkedDocType: 'KWITANSI',
      };
      setTransactions((prev) => [...prev, newTx]);
    }

    const newKwitansi: Kwitansi = {
      ...kwData,
      id: kwtId,
      bkuTransactionId: bookedTxId,
    };

    setKwitansiList((prev) => [newKwitansi, ...prev]);
  };

  const addBatchKwitansi = (
    plans: GeneratedDailyPurchasePlan[],
    _updateProgress?: boolean,
    _mingguKe?: number
  ) => {
    const approvedPlans = plans.filter((p) => p.isApproved && p.items.length > 0 && p.totalNominal > 0);
    if (approvedPlans.length === 0) return;

    const newTransactions: CashTransaction[] = [];
    const newKwitansis: Kwitansi[] = [];

    approvedPlans.forEach((plan, idx) => {
      const kwtId = `kwt-batch-${Date.now()}-${idx}`;
      const txId = `tx-bku-${Date.now()}-${idx}`;

      const tx: CashTransaction = {
        id: txId,
        tanggal: plan.tanggal,
        noBukti: plan.nomorKwitansi,
        uraian: `Belanja Material Harian (${plan.namaToko}): ${plan.items.map((i) => `${i.namaBarang} (${i.volume} ${i.satuan})`).join(', ')}`,
        jenisKas: plan.jenisKas,
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'BELANJA_MATERIAL',
        nominal: plan.totalNominal,
        kodeAkun: '5.2.01',
        penerimaAtauPemberi: plan.namaToko,
        keterangan: `Kwitansi Harian Progres Fisik (${plan.kategoriPekerjaan})`,
        linkedDocId: kwtId,
        linkedDocType: 'KWITANSI',
      };
      newTransactions.push(tx);

      const kw: Kwitansi = {
        id: kwtId,
        nomorKwitansi: plan.nomorKwitansi,
        tanggal: plan.tanggal,
        telahTerimaDari: `Bendahara TPK Program Revitalisasi ${projectInfo.desa || 'Sekolah'}`,
        uangSebanyak: plan.totalNominal,
        terbilang: terbilangRupiah(plan.totalNominal),
        untukPembayaran: `Pembelian Bahan/Material Konstruksi Revitalisasi (${plan.kategoriPekerjaan})`,
        penerimaNama: plan.namaToko,
        penerimaAlamat: plan.alamatToko || 'Jl. Lokasi Proyek Sekolah',
        tempatTtd: projectInfo.desa || projectInfo.alamatLengkap?.desaKelurahan || 'Sekolah',
        items: plan.items,
        jenisKasPembayaran: plan.jenisKas,
        isBookedToBKU: true,
        bkuTransactionId: txId,
        status: 'LUNAS',
        progressCategory: plan.kategoriPekerjaan,
      };
      newKwitansis.push(kw);
    });

    setTransactions((prev) => [...prev, ...newTransactions]);
    setKwitansiList((prev) => [...newKwitansis, ...prev]);
  };

  const addBatchKwitansiAndWeeklyWages = (
    plans: GeneratedDailyPurchasePlan[],
    wages: WeeklyWagesCalculationResult,
    mingguKe: number,
    updatedRAB?: RABMasterItem[],
    photos?: ProgressPhotoItem[]
  ) => {
    const approvedPlans = plans.filter((p) => p.isApproved && p.items.length > 0 && p.totalNominal > 0);
    const newTransactions: CashTransaction[] = [];
    const newKwitansis: Kwitansi[] = [];
    let newPayrollBatch: PayrollHarianBatch | null = null;
    const schoolName = projectInfo.dataSekolah?.namaSekolah || projectInfo.namaInstansi || 'Sekolah';
    const desaName = projectInfo.desa || projectInfo.alamatLengkap?.desaKelurahan || 'Bogor';

    // 1. Material Plans (Kwitansi Pembelian Bahan Harian Senin s/d Sabtu)
    approvedPlans.forEach((plan, idx) => {
      const kwtId = `kwt-batch-${Date.now()}-${idx}`;
      const txId = `tx-bku-${Date.now()}-${idx}`;

      const tx: CashTransaction = {
        id: txId,
        tanggal: plan.tanggal,
        noBukti: plan.nomorKwitansi,
        uraian: `Belanja Material Harian (${plan.namaToko}): ${plan.items.map((i) => `${i.namaBarang} (${i.volume} ${i.satuan})`).join(', ')}`,
        jenisKas: plan.jenisKas,
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'BELANJA_MATERIAL',
        nominal: plan.totalNominal,
        kodeAkun: '5.2.01',
        penerimaAtauPemberi: plan.namaToko,
        keterangan: `Kwitansi Harian Progres Fisik (${plan.kategoriPekerjaan})`,
        linkedDocId: kwtId,
        linkedDocType: 'KWITANSI',
      };
      newTransactions.push(tx);

      const kw: Kwitansi = {
        id: kwtId,
        nomorKwitansi: plan.nomorKwitansi,
        tanggal: plan.tanggal,
        telahTerimaDari: `Bendahara P2SP Program Revitalisasi ${schoolName}`,
        uangSebanyak: plan.totalNominal,
        terbilang: terbilangRupiah(plan.totalNominal),
        untukPembayaran: `Pembelian Bahan/Material Konstruksi Revitalisasi (${plan.kategoriPekerjaan})`,
        penerimaNama: plan.namaToko,
        penerimaAlamat: plan.alamatToko || 'Jl. Lokasi Proyek Sekolah',
        tempatTtd: desaName,
        items: plan.items,
        jenisKasPembayaran: plan.jenisKas,
        isBookedToBKU: true,
        bkuTransactionId: txId,
        status: 'LUNAS',
        progressCategory: plan.kategoriPekerjaan,
      };
      newKwitansis.push(kw);
    });

    // 2. Upah Tukang & Tenaga Kerja (Mingguan)
    if (wages.upahTukang && wages.upahTukang.nominal > 0) {
      const spjId = `spj-wages-${Date.now()}`;
      const txId = `tx-bku-tukang-${Date.now()}`;

      const tx: CashTransaction = {
        id: txId,
        tanggal: wages.tanggalSelesai,
        noBukti: wages.upahTukang.nomorKwitansi,
        uraian: wages.upahTukang.uraian,
        jenisKas: 'TUNAI',
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'UPAH_TUKANG',
        nominal: wages.upahTukang.nominal,
        kodeAkun: '5.2.02',
        penerimaAtauPemberi: wages.upahTukang.penerima,
        keterangan: `SPJ Upah Kerja Mingguan W${mingguKe}`,
        linkedDocId: spjId,
        linkedDocType: 'PAYROLL_HARIAN',
      };
      newTransactions.push(tx);

      newPayrollBatch = {
        id: spjId,
        noSpj: wages.upahTukang.nomorKwitansi,
        periodeAwal: wages.tanggalMulai,
        periodeAkhir: wages.tanggalSelesai,
        mingguKe,
        pekerjaanTerkait: `Pekerjaan Fisik Konstruksi Minggu Ke-${mingguKe}`,
        workers: wages.upahTukang.workersDetail || [],
        totalDibayarkan: wages.upahTukang.nominal,
        tanggalBayar: wages.tanggalSelesai,
        jenisKas: 'TUNAI',
        isBookedToBKU: true,
        bkuTransactionId: txId,
        photos: photos || [],
      };
    }

    // 3. Upah / Honor Tenaga Perencana (Mingguan)
    if (wages.upahPerencana && wages.upahPerencana.nominal > 0) {
      const kwtId = `kwt-plan-${Date.now()}`;
      const txId = `tx-bku-plan-${Date.now()}`;

      const tx: CashTransaction = {
        id: txId,
        tanggal: wages.tanggalSelesai,
        noBukti: wages.upahPerencana.nomorKwitansi,
        uraian: wages.upahPerencana.uraian,
        jenisKas: 'TUNAI',
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'OPERASIONAL',
        nominal: wages.upahPerencana.nominal,
        kodeAkun: '5.2.03',
        penerimaAtauPemberi: wages.upahPerencana.penerima,
        keterangan: `Honorarium Perencanaan W${mingguKe}`,
        linkedDocId: kwtId,
        linkedDocType: 'KWITANSI',
      };
      newTransactions.push(tx);

      const kw: Kwitansi = {
        id: kwtId,
        nomorKwitansi: wages.upahPerencana.nomorKwitansi,
        tanggal: wages.tanggalSelesai,
        telahTerimaDari: `Bendahara P2SP Program Revitalisasi ${schoolName}`,
        uangSebanyak: wages.upahPerencana.nominal,
        terbilang: wages.upahPerencana.terbilang,
        untukPembayaran: wages.upahPerencana.uraian,
        penerimaNama: wages.upahPerencana.penerima,
        penerimaAlamat: 'Konsultan / Tenaga Teknis Perencana P2SP',
        tempatTtd: desaName,
        items: [],
        jenisKasPembayaran: 'TUNAI',
        isBookedToBKU: true,
        bkuTransactionId: txId,
        status: 'LUNAS',
        progressCategory: 'Honor Tenaga Perencana',
      };
      newKwitansis.push(kw);
    }

    // 4. Upah / Honor Tenaga Pengawas (Mingguan)
    if (wages.upahPengawas && wages.upahPengawas.nominal > 0) {
      const kwtId = `kwt-was-${Date.now()}`;
      const txId = `tx-bku-was-${Date.now()}`;

      const tx: CashTransaction = {
        id: txId,
        tanggal: wages.tanggalSelesai,
        noBukti: wages.upahPengawas.nomorKwitansi,
        uraian: wages.upahPengawas.uraian,
        jenisKas: 'TUNAI',
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'OPERASIONAL',
        nominal: wages.upahPengawas.nominal,
        kodeAkun: '5.2.04',
        penerimaAtauPemberi: wages.upahPengawas.penerima,
        keterangan: `Honorarium Pengawasan W${mingguKe}`,
        linkedDocId: kwtId,
        linkedDocType: 'KWITANSI',
      };
      newTransactions.push(tx);

      const kw: Kwitansi = {
        id: kwtId,
        nomorKwitansi: wages.upahPengawas.nomorKwitansi,
        tanggal: wages.tanggalSelesai,
        telahTerimaDari: `Bendahara P2SP Program Revitalisasi ${schoolName}`,
        uangSebanyak: wages.upahPengawas.nominal,
        terbilang: wages.upahPengawas.terbilang,
        untukPembayaran: wages.upahPengawas.uraian,
        penerimaNama: wages.upahPengawas.penerima,
        penerimaAlamat: 'Tenaga Pengawas Lapangan P2SP',
        tempatTtd: desaName,
        items: [],
        jenisKasPembayaran: 'TUNAI',
        isBookedToBKU: true,
        bkuTransactionId: txId,
        status: 'LUNAS',
        progressCategory: 'Honor Tenaga Pengawas',
      };
      newKwitansis.push(kw);
    }

    // 5. Upah Administrasi & Pengelolaan (Mingguan)
    if (wages.upahAdministrasi && wages.upahAdministrasi.nominal > 0) {
      const kwtId = `kwt-adm-${Date.now()}`;
      const txId = `tx-bku-adm-${Date.now()}`;

      const tx: CashTransaction = {
        id: txId,
        tanggal: wages.tanggalSelesai,
        noBukti: wages.upahAdministrasi.nomorKwitansi,
        uraian: wages.upahAdministrasi.uraian,
        jenisKas: 'TUNAI',
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'OPERASIONAL',
        nominal: wages.upahAdministrasi.nominal,
        kodeAkun: '5.2.05',
        penerimaAtauPemberi: wages.upahAdministrasi.penerima,
        keterangan: `Biaya Pengelolaan & Administrasi P2SP W${mingguKe}`,
        linkedDocId: kwtId,
        linkedDocType: 'KWITANSI',
      };
      newTransactions.push(tx);

      const kw: Kwitansi = {
        id: kwtId,
        nomorKwitansi: wages.upahAdministrasi.nomorKwitansi,
        tanggal: wages.tanggalSelesai,
        telahTerimaDari: `Bendahara P2SP Program Revitalisasi ${schoolName}`,
        uangSebanyak: wages.upahAdministrasi.nominal,
        terbilang: wages.upahAdministrasi.terbilang,
        untukPembayaran: wages.upahAdministrasi.uraian,
        penerimaNama: wages.upahAdministrasi.penerima,
        penerimaAlamat: 'Sekretariat P2SP',
        tempatTtd: desaName,
        items: [],
        jenisKasPembayaran: 'TUNAI',
        isBookedToBKU: true,
        bkuTransactionId: txId,
        status: 'LUNAS',
        progressCategory: 'Biaya Pengelolaan P2SP',
      };
      newKwitansis.push(kw);
    }

    // Simpan seluruh data ke state kas & kwitansi & payroll
    setTransactions((prev) => [...prev, ...newTransactions]);
    setKwitansiList((prev) => [...newKwitansis, ...prev]);
    if (newPayrollBatch) {
      setPayrollHarian((prev) => [newPayrollBatch!, ...prev]);
    }
    if (photos && photos.length > 0) {
      setProgressPhotos((prev) => [...photos, ...prev]);
    }

    if (updatedRAB) {
      setRabMaster(updatedRAB);
      setWbsList(
        updatedRAB.map((item) => ({
          id: item.id,
          kode: item.kode,
          namaPekerjaan: item.namaPekerjaan,
          bobotRencana: item.bobotRencana,
          progresRealisasi: item.progresRealisasi,
          volumeRAB: item.volumeRAB,
          satuan: item.satuan,
          biayaRAB: item.biayaRAB,
          biayaRealisasi: item.biayaRealisasi,
        }))
      );
    }
  };

  const addProgressPhotos = (newPhotos: ProgressPhotoItem[]) => {
    setProgressPhotos((prev) => [...newPhotos, ...prev]);
  };

  const deleteProgressPhoto = (id: string) => {
    setProgressPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProgressPhotoCaption = (id: string, caption: string) => {
    setProgressPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const updateRABMaster = (newList: RABMasterItem[]) => {
    setRabMaster(newList);
    setWbsList(
      newList.map((item) => ({
        id: item.id,
        kode: item.kode,
        namaPekerjaan: item.namaPekerjaan,
        bobotRencana: item.bobotRencana,
        progresRealisasi: item.progresRealisasi,
        volumeRAB: item.volumeRAB,
        satuan: item.satuan,
        biayaRAB: item.biayaRAB,
        biayaRealisasi: item.biayaRealisasi,
      }))
    );
  };

  const deleteKwitansi = (id: string) => {
    const item = kwitansiList.find((k) => k.id === id);
    if (item?.bkuTransactionId) {
      setTransactions((prev) => prev.filter((t) => t.id !== item.bkuTransactionId));
    }
    setKwitansiList((prev) => prev.filter((k) => k.id !== id));
  };

  const addPayrollHarianBatch = (batchData: Omit<PayrollHarianBatch, 'id'>) => {
    const spjId = `spj-${Date.now()}`;
    const txId = `tx-${Date.now()}-spj`;
    let bookedTxId: string | undefined = undefined;

    if (batchData.isBookedToBKU) {
      bookedTxId = txId;
      const newTx: CashTransaction = {
        id: txId,
        tanggal: batchData.tanggalBayar,
        noBukti: batchData.noSpj,
        uraian: `Pembayaran Honor Tukang & Laden Harian Minggu Ke-${batchData.mingguKe} (${batchData.pekerjaanTerkait})`,
        jenisKas: batchData.jenisKas,
        jenisTransaksi: 'PENGELUARAN',
        kategori: 'UPAH_TUKANG',
        nominal: batchData.totalDibayarkan,
        kodeAkun: '5.2.02',
        penerimaAtauPemberi: `Pekerja (${batchData.workers.length} Orang)`,
        keterangan: `SPJ Upah Harian W${batchData.mingguKe}`,
        linkedDocId: spjId,
        linkedDocType: 'PAYROLL_HARIAN',
      };
      setTransactions((prev) => [...prev, newTx]);
    }

    const newBatch: PayrollHarianBatch = {
      ...batchData,
      id: spjId,
      bkuTransactionId: bookedTxId,
    };

    setPayrollHarian((prev) => [newBatch, ...prev]);
  };

  const deletePayrollHarianBatch = (id: string) => {
    const item = payrollHarian.find((p) => p.id === id);
    if (item?.bkuTransactionId) {
      setTransactions((prev) => prev.filter((t) => t.id !== item.bkuTransactionId));
    }
    setPayrollHarian((prev) => prev.filter((p) => p.id !== id));
  };

  const addWorkerBorongan = (itemData: Omit<WorkerBoronganItem, 'id'>) => {
    const brgId = `brg-${Date.now()}`;
    const newItem: WorkerBoronganItem = {
      ...itemData,
      id: brgId,
    };
    setPayrollBorongan((prev) => [newItem, ...prev]);
  };

  const payWorkerBorongan = (id: string, jenisKas: CashType) => {
    const item = payrollBorongan.find((b) => b.id === id);
    if (!item) return;

    const txId = `tx-${Date.now()}-brg`;
    const newTx: CashTransaction = {
      id: txId,
      tanggal: item.tanggalBayar || new Date().toISOString().split('T')[0],
      noBukti: item.noKontrak,
      uraian: `Pembayaran Borongan: ${item.itemPekerjaan} (${item.tahapTermin})`,
      jenisKas,
      jenisTransaksi: 'PENGELUARAN',
      kategori: 'UPAH_TUKANG',
      nominal: item.nominalTermin,
      kodeAkun: '5.2.02',
      penerimaAtauPemberi: item.namaMandor,
      keterangan: `Kontrak Borongan ${item.noKontrak}`,
      linkedDocId: id,
      linkedDocType: 'PAYROLL_BORONGAN',
    };

    setTransactions((prev) => [...prev, newTx]);
    setPayrollBorongan((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'DIBAYAR',
              jenisKas,
              isBookedToBKU: true,
              bkuTransactionId: txId,
            }
          : b
      )
    );
  };

  const deleteWorkerBorongan = (id: string) => {
    const item = payrollBorongan.find((b) => b.id === id);
    if (item?.bkuTransactionId) {
      setTransactions((prev) => prev.filter((t) => t.id !== item.bkuTransactionId));
    }
    setPayrollBorongan((prev) => prev.filter((b) => b.id !== id));
  };

  const addDailyLog = (logData: Omit<DailyWorkLog, 'id'>) => {
    const newLog: DailyWorkLog = {
      ...logData,
      id: `log-${Date.now()}`,
    };
    setDailyLogs((prev) => [newLog, ...prev]);
  };

  const deleteDailyLog = (id: string) => {
    setDailyLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const updateWBSItem = (id: string, fields: Partial<WBSItem>) => {
    setWbsList((prev) => prev.map((w) => (w.id === id ? { ...w, ...fields } : w)));
  };

  const addStandardWage = (wage: Omit<StandardWageRate, 'id'>) => {
    const newWage: StandardWageRate = {
      ...wage,
      id: `w-${Date.now()}`,
      satuan: wage.satuan || 'HOK',
    };
    setStandardWages((prev) => [...prev, newWage]);
  };

  const updateStandardWage = (id: string, wage: Partial<StandardWageRate>) => {
    setStandardWages((prev) => prev.map((w) => (w.id === id ? { ...w, ...wage } : w)));
  };

  const updateStandardWages = (wages: StandardWageRate[]) => {
    setStandardWages(wages);
  };

  const deleteStandardWage = (id: string) => {
    setStandardWages((prev) => prev.filter((w) => w.id !== id));
  };

  const addStandardMaterial = (material: Omit<StandardMaterialPrice, 'id'>) => {
    const newMat: StandardMaterialPrice = {
      ...material,
      id: `m-${Date.now()}`,
    };
    setStandardMaterials((prev) => [...prev, newMat]);
  };

  const updateStandardMaterial = (id: string, material: Partial<StandardMaterialPrice>) => {
    setStandardMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...material } : m)));
  };

  const updateStandardMaterials = (materials: StandardMaterialPrice[]) => {
    setStandardMaterials(materials);
  };

  const deleteStandardMaterial = (id: string) => {
    setStandardMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToCleanData = () => {
    setTransactions([]);
    setKwitansiList([]);
    setPayrollHarian([]);
    setPayrollBorongan([]);
    setDailyLogs([]);
    setWeeklyRecaps([]);
    setWbsList(CLEAN_WBS);

    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'bku'), JSON.stringify([]));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'kwitansi'), JSON.stringify([]));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'payroll_h'), JSON.stringify([]));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'payroll_b'), JSON.stringify([]));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'daily'), JSON.stringify([]));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'weekly'), JSON.stringify([]));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'wbs'), JSON.stringify(CLEAN_WBS));
    setHasUnsavedExportChanges(true);
  };

  const loadDemoSimulationData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setKwitansiList(INITIAL_KWITANSI_LIST);
    setPayrollHarian(INITIAL_PAYROLL_HARIAN);
    setPayrollBorongan(INITIAL_BORONGAN_LIST);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setWeeklyRecaps(INITIAL_WEEKLY_RECAPS);
    setWbsList(INITIAL_WBS);
    setStandardWages(INITIAL_STANDARD_WAGES);
    setStandardMaterials(INITIAL_STANDARD_MATERIALS);

    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'bku'), JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'kwitansi'), JSON.stringify(INITIAL_KWITANSI_LIST));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'payroll_h'), JSON.stringify(INITIAL_PAYROLL_HARIAN));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'payroll_b'), JSON.stringify(INITIAL_BORONGAN_LIST));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'daily'), JSON.stringify(INITIAL_DAILY_LOGS));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'weekly'), JSON.stringify(INITIAL_WEEKLY_RECAPS));
    localStorage.setItem(getSchoolStorageKey(activeNpsn, 'wbs'), JSON.stringify(INITIAL_WBS));
    setHasUnsavedExportChanges(true);
  };

  const resetToDefaultData = () => {
    if (
      window.confirm(
        `Kosongkan seluruh data transaksi, kwitansi, dan payroll untuk ${projectInfo.dataSekolah?.namaSekolah || activeNpsn}? Data akan dibersihkan mulai dari nol.`
      )
    ) {
      resetToCleanData();
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projectInfo,
        transactions,
        kwitansiList,
        payrollHarian,
        payrollBorongan,
        wbsList,
        rabMaster,
        dailyLogs,
        weeklyRecaps,
        standardWages,
        standardMaterials,
        progressPhotos,
        summary,
        workspaces,
        activeNpsn,
        activeWorkspace,
        switchWorkspace,
        createWorkspace,
        deleteWorkspace,
        updateWorkspaceProfile,
        getWorkspaceStats,
        exportProjectFile,
        importProjectFile,
        lastExportedAt,
        hasUnsavedExportChanges,
        updateProjectInfo,
        addTransaction,
        deleteTransaction,
        transferKasBankKeTunai,
        addKwitansi,
        addBatchKwitansi,
        addBatchKwitansiAndWeeklyWages,
        deleteKwitansi,
        addProgressPhotos,
        deleteProgressPhoto,
        updateProgressPhotoCaption,
        addPayrollHarianBatch,
        deletePayrollHarianBatch,
        addWorkerBorongan,
        payWorkerBorongan,
        deleteWorkerBorongan,
        addDailyLog,
        deleteDailyLog,
        updateWBSItem,
        updateRABMaster,
        addStandardWage,
        updateStandardWage,
        updateStandardWages,
        deleteStandardWage,
        addStandardMaterial,
        updateStandardMaterial,
        updateStandardMaterials,
        deleteStandardMaterial,
        resetToDefaultData,
        resetToCleanData,
        loadDemoSimulationData,
        cloudSyncStatus,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
