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
} from '../types';
import {
  INITIAL_BORONGAN_LIST,
  INITIAL_DAILY_LOGS,
  INITIAL_KWITANSI_LIST,
  INITIAL_PAYROLL_HARIAN,
  INITIAL_PROJECT_INFO,
  INITIAL_STANDARD_MATERIALS,
  INITIAL_STANDARD_WAGES,
  INITIAL_TRANSACTIONS,
  INITIAL_WBS,
  INITIAL_WEEKLY_RECAPS,
} from '../utils/initialData';
import { INITIAL_RAB_MASTER } from '../utils/rabMasterData';
import { terbilangRupiah } from '../utils/terbilang';

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
  deleteKwitansi: (id: string) => void;
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
  deleteStandardWage: (id: string) => void;
  addStandardMaterial: (material: Omit<StandardMaterialPrice, 'id'>) => void;
  updateStandardMaterial: (id: string, material: Partial<StandardMaterialPrice>) => void;
  deleteStandardMaterial: (id: string) => void;
  resetToDefaultData: () => void;
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

// Default Workspace Profiles
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
  // 1. Initialize Workspaces List
  const [workspaces, setWorkspaces] = useState<SchoolWorkspaceProfile[]>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.WORKSPACES_LIST);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse workspaces list', e);
      }
    }
    return DEFAULT_INITIAL_WORKSPACES;
  });

  // 2. Initialize Active NPSN
  const [activeNpsn, setActiveNpsn] = useState<string>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.ACTIVE_NPSN);
    if (saved && saved.trim().length > 0) return saved;
    return '20201842';
  });

  // 3. Helper to load school data by NPSN
  const loadSchoolDataset = (npsn: string) => {
    // Migration check: If old un-prefixed keys exist and active NPSN is 20201842, check if we need to migrate
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

    // Load Project Info
    const savedProject = localStorage.getItem(getSchoolStorageKey(npsn, 'project'));
    let loadedProjectInfo = INITIAL_PROJECT_INFO;
    if (savedProject) {
      try {
        const p = JSON.parse(savedProject);
        loadedProjectInfo = {
          ...INITIAL_PROJECT_INFO,
          ...p,
          dataSekolah: { ...INITIAL_PROJECT_INFO.dataSekolah, ...(p.dataSekolah || {}), npsn },
          alamatLengkap: { ...INITIAL_PROJECT_INFO.alamatLengkap, ...(p.alamatLengkap || {}) },
          timP2sp: {
            ...INITIAL_PROJECT_INFO.timP2sp,
            ...(p.timP2sp || {}),
          },
        };
      } catch (e) {
        console.error('Error loading project info', e);
      }
    } else if (npsn === '20209999') {
      const smpData = createSampleSecondarySchool();
      loadedProjectInfo = smpData.projectInfo;
    }

    // Load BKU Transactions
    const savedTx = localStorage.getItem(getSchoolStorageKey(npsn, 'bku'));
    let loadedTx: CashTransaction[] = INITIAL_TRANSACTIONS;
    if (savedTx) {
      try {
        loadedTx = JSON.parse(savedTx);
      } catch (e) {
        console.error(e);
      }
    } else if (npsn === '20209999') {
      loadedTx = createSampleSecondarySchool().transactions;
    }

    // Load Kwitansi
    const savedKw = localStorage.getItem(getSchoolStorageKey(npsn, 'kwitansi'));
    let loadedKw: Kwitansi[] = INITIAL_KWITANSI_LIST;
    if (savedKw) {
      try {
        loadedKw = JSON.parse(savedKw);
      } catch (e) {
        console.error(e);
      }
    } else if (npsn === '20209999') {
      loadedKw = [];
    }

    // Load Payroll Harian
    const savedPh = localStorage.getItem(getSchoolStorageKey(npsn, 'payroll_h'));
    let loadedPh: PayrollHarianBatch[] = INITIAL_PAYROLL_HARIAN;
    if (savedPh) {
      try {
        loadedPh = JSON.parse(savedPh);
      } catch (e) {
        console.error(e);
      }
    } else if (npsn === '20209999') {
      loadedPh = [];
    }

    // Load Payroll Borongan
    const savedPb = localStorage.getItem(getSchoolStorageKey(npsn, 'payroll_b'));
    let loadedPb: WorkerBoronganItem[] = INITIAL_BORONGAN_LIST;
    if (savedPb) {
      try {
        loadedPb = JSON.parse(savedPb);
      } catch (e) {
        console.error(e);
      }
    } else if (npsn === '20209999') {
      loadedPb = [];
    }

    // Load WBS
    const savedWbs = localStorage.getItem(getSchoolStorageKey(npsn, 'wbs'));
    let loadedWbs: WBSItem[] = INITIAL_WBS;
    if (savedWbs) {
      try {
        loadedWbs = JSON.parse(savedWbs);
      } catch (e) {
        console.error(e);
      }
    }

    // Load RAB Master
    const savedRab = localStorage.getItem(getSchoolStorageKey(npsn, 'rab_master'));
    let loadedRab: RABMasterItem[] = INITIAL_RAB_MASTER;
    if (savedRab) {
      try {
        loadedRab = JSON.parse(savedRab);
      } catch (e) {
        console.error(e);
      }
    }

    // Load Daily Logs
    const savedDaily = localStorage.getItem(getSchoolStorageKey(npsn, 'daily'));
    let loadedDaily: DailyWorkLog[] = INITIAL_DAILY_LOGS;
    if (savedDaily) {
      try {
        loadedDaily = JSON.parse(savedDaily);
      } catch (e) {
        console.error(e);
      }
    } else if (npsn === '20209999') {
      loadedDaily = [];
    }

    // Load Weekly Recaps
    const savedWeekly = localStorage.getItem(getSchoolStorageKey(npsn, 'weekly'));
    let loadedWeekly: WeeklyRecap[] = INITIAL_WEEKLY_RECAPS;
    if (savedWeekly) {
      try {
        loadedWeekly = JSON.parse(savedWeekly);
      } catch (e) {
        console.error(e);
      }
    } else if (npsn === '20209999') {
      loadedWeekly = [];
    }

    // Load Wages & Materials
    const savedWages = localStorage.getItem(getSchoolStorageKey(npsn, 'wages'));
    let loadedWages: StandardWageRate[] = INITIAL_STANDARD_WAGES;
    if (savedWages) {
      try {
        loadedWages = JSON.parse(savedWages);
      } catch (e) {
        console.error(e);
      }
    }

    const savedMaterials = localStorage.getItem(getSchoolStorageKey(npsn, 'materials'));
    let loadedMaterials: StandardMaterialPrice[] = INITIAL_STANDARD_MATERIALS;
    if (savedMaterials) {
      try {
        loadedMaterials = JSON.parse(savedMaterials);
      } catch (e) {
        console.error(e);
      }
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

    // Prepare initial data based on template
    let newProjectInfo: ProjectInfo;
    let newTx: CashTransaction[] = [];
    let newKw: Kwitansi[] = [];
    let newPh: PayrollHarianBatch[] = [];
    let newPb: WorkerBoronganItem[] = [];
    let newWbs: WBSItem[] = INITIAL_WBS;
    let newRab: RABMasterItem[] = INITIAL_RAB_MASTER;
    let newDaily: DailyWorkLog[] = [];
    let newWeekly: WeeklyRecap[] = [];

    if (templateType === 'smp_rehab') {
      const sample = createSampleSecondarySchool();
      newProjectInfo = {
        ...sample.projectInfo,
        dataSekolah: {
          ...sample.projectInfo.dataSekolah,
          namaSekolah: profileData.namaSekolah,
          npsn: cleanNpsn,
          jenjang: profileData.jenjang,
        },
        totalPaguAnggaran: profileData.paguAnggaran,
        namaInstansi: `${profileData.namaSekolah} (Tim P2SP)`,
      };
      newTx = sample.transactions;
    } else if (templateType === 'blank') {
      newProjectInfo = {
        ...INITIAL_PROJECT_INFO,
        namaProyek: `Program Revitalisasi Sarpras ${profileData.namaSekolah}`,
        totalPaguAnggaran: profileData.paguAnggaran,
        namaInstansi: profileData.namaSekolah,
        dataSekolah: {
          ...INITIAL_PROJECT_INFO.dataSekolah,
          namaSekolah: profileData.namaSekolah,
          npsn: cleanNpsn,
          jenjang: profileData.jenjang,
        },
      };
      newWbs = INITIAL_WBS.map((w) => ({ ...w, progresRealisasi: 0, biayaRealisasi: 0 }));
      newRab = INITIAL_RAB_MASTER.map((r) => ({ ...r, progresRealisasi: 0, biayaRealisasi: 0 }));
    } else {
      // SD Lengkap
      newProjectInfo = {
        ...INITIAL_PROJECT_INFO,
        namaProyek: `Revitalisasi Ruang Kelas & Sarana Prasarana ${profileData.namaSekolah}`,
        totalPaguAnggaran: profileData.paguAnggaran,
        namaInstansi: `${profileData.namaSekolah} (Tim P2SP)`,
        dataSekolah: {
          ...INITIAL_PROJECT_INFO.dataSekolah,
          namaSekolah: profileData.namaSekolah,
          npsn: cleanNpsn,
          jenjang: profileData.jenjang,
        },
      };
      newTx = INITIAL_TRANSACTIONS;
      newKw = INITIAL_KWITANSI_LIST;
      newPh = INITIAL_PAYROLL_HARIAN;
      newPb = INITIAL_BORONGAN_LIST;
      newDaily = INITIAL_DAILY_LOGS;
      newWeekly = INITIAL_WEEKLY_RECAPS;
    }

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
    setProjectInfo((prev) => ({ ...prev, ...info }));
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

  const deleteStandardMaterial = (id: string) => {
    setStandardMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToDefaultData = () => {
    if (
      window.confirm(
        `Kembalikan semua data sekolah ${projectInfo.dataSekolah?.namaSekolah || activeNpsn} ke contoh awal? Data saat ini akan direset.`
      )
    ) {
      if (activeNpsn === '20209999') {
        const sample = createSampleSecondarySchool();
        setProjectInfo(sample.projectInfo);
        setTransactions(sample.transactions);
        setKwitansiList(sample.kwitansiList);
        setPayrollHarian(sample.payrollHarian);
        setPayrollBorongan(sample.payrollBorongan);
        setWbsList(sample.wbsList);
        setDailyLogs(sample.dailyLogs);
        setWeeklyRecaps(sample.weeklyRecaps);
      } else {
        setProjectInfo(INITIAL_PROJECT_INFO);
        setTransactions(INITIAL_TRANSACTIONS);
        setKwitansiList(INITIAL_KWITANSI_LIST);
        setPayrollHarian(INITIAL_PAYROLL_HARIAN);
        setPayrollBorongan(INITIAL_BORONGAN_LIST);
        setWbsList(INITIAL_WBS);
        setDailyLogs(INITIAL_DAILY_LOGS);
        setWeeklyRecaps(INITIAL_WEEKLY_RECAPS);
        setStandardWages(INITIAL_STANDARD_WAGES);
        setStandardMaterials(INITIAL_STANDARD_MATERIALS);
      }
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
        deleteKwitansi,
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
        deleteStandardWage,
        addStandardMaterial,
        updateStandardMaterial,
        deleteStandardMaterial,
        resetToDefaultData,
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
