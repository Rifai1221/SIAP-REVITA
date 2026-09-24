import {
  CashTransaction,
  DailyWorkLog,
  Kwitansi,
  MultiSchoolBackupBundle,
  PayrollHarianBatch,
  ProjectInfo,
  RABMasterItem,
  RevitaProjectFile,
  SchoolWorkspaceMeta,
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
} from './initialData';
import { INITIAL_RAB_MASTER } from './rabMasterData';

const WORKSPACE_REGISTRY_KEY = 'siap_revita_workspaces_registry_v2';
const ACTIVE_WORKSPACE_KEY = 'siap_revita_active_workspace_npsn_v2';

export const getWorkspaceStorageKey = (npsn: string, category: string): string => {
  return `siap_ws_${npsn}_${category}_v2`;
};

export interface WorkspaceFullData {
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
}

export const getDefaultWorkspaceMeta = (): SchoolWorkspaceMeta => ({
  id: 'ws_20201842',
  npsn: '20201842',
  namaSekolah: 'SDN 01 Babakan',
  jenjang: 'SD',
  paguAnggaran: 185000000,
  tahunAnggaran: '2026',
  kabupaten: 'Kabupaten Bogor',
  hasPin: false,
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

// Initialize and migrate legacy single-workspace data if needed
export const initializeWorkspaceRegistry = (): {
  workspaces: SchoolWorkspaceMeta[];
  activeNpsn: string;
} => {
  try {
    const savedRegistry = localStorage.getItem(WORKSPACE_REGISTRY_KEY);
    const savedActiveNpsn = localStorage.getItem(ACTIVE_WORKSPACE_KEY);

    if (savedRegistry) {
      const parsedWorkspaces: SchoolWorkspaceMeta[] = JSON.parse(savedRegistry);
      if (Array.isArray(parsedWorkspaces) && parsedWorkspaces.length > 0) {
        const validActive =
          savedActiveNpsn && parsedWorkspaces.some((w) => w.npsn === savedActiveNpsn)
            ? savedActiveNpsn
            : parsedWorkspaces[0].npsn;
        return {
          workspaces: parsedWorkspaces,
          activeNpsn: validActive,
        };
      }
    }

    // Check for legacy v1 data to migrate
    const legacyProject = localStorage.getItem('siap_revita_project_v1');
    let initialProjectInfo = INITIAL_PROJECT_INFO;
    let npsn = '20201842';
    let namaSekolah = 'SDN 01 Babakan';

    if (legacyProject) {
      try {
        const parsed = JSON.parse(legacyProject);
        initialProjectInfo = { ...INITIAL_PROJECT_INFO, ...parsed };
        if (parsed.dataSekolah?.npsn) npsn = parsed.dataSekolah.npsn;
        if (parsed.dataSekolah?.namaSekolah) namaSekolah = parsed.dataSekolah.namaSekolah;
        else if (parsed.namaInstansi) namaSekolah = parsed.namaInstansi;
      } catch (e) {
        console.error('Error parsing legacy project:', e);
      }
    }

    const defaultWorkspace: SchoolWorkspaceMeta = {
      id: `ws_${npsn}`,
      npsn,
      namaSekolah,
      jenjang: (initialProjectInfo.dataSekolah?.jenjang as any) || 'SD',
      paguAnggaran: initialProjectInfo.totalPaguAnggaran || 185000000,
      tahunAnggaran: initialProjectInfo.tahunAnggaran || '2026',
      kabupaten: initialProjectInfo.kabupaten || 'Kabupaten Bogor',
      hasPin: false,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const initialWorkspaces = [defaultWorkspace];
    localStorage.setItem(WORKSPACE_REGISTRY_KEY, JSON.stringify(initialWorkspaces));
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, npsn);

    // Migrate or initialize keys for this workspace
    saveWorkspaceDataToStorage(npsn, {
      projectInfo: initialProjectInfo,
      transactions: getLegacyOrInitial('siap_revita_transactions_v1', INITIAL_TRANSACTIONS),
      kwitansiList: getLegacyOrInitial('siap_revita_kwitansi_v1', INITIAL_KWITANSI_LIST),
      payrollHarian: getLegacyOrInitial('siap_revita_payroll_h_v1', INITIAL_PAYROLL_HARIAN),
      payrollBorongan: getLegacyOrInitial('siap_revita_payroll_b_v1', INITIAL_BORONGAN_LIST),
      wbsList: getLegacyOrInitial('siap_revita_wbs_v1', INITIAL_WBS),
      rabMaster: getLegacyOrInitial('siap_revita_rab_master_v1', INITIAL_RAB_MASTER),
      dailyLogs: getLegacyOrInitial('siap_revita_daily_v1', INITIAL_DAILY_LOGS),
      weeklyRecaps: getLegacyOrInitial('siap_revita_weekly_v1', INITIAL_WEEKLY_RECAPS),
      standardWages: getLegacyOrInitial('siap_revita_wages_v1', INITIAL_STANDARD_WAGES),
      standardMaterials: getLegacyOrInitial('siap_revita_materials_v1', INITIAL_STANDARD_MATERIALS),
    });

    return {
      workspaces: initialWorkspaces,
      activeNpsn: npsn,
    };
  } catch (error) {
    console.error('Failed to initialize workspace registry:', error);
    const def = getDefaultWorkspaceMeta();
    return {
      workspaces: [def],
      activeNpsn: def.npsn,
    };
  }
};

const getLegacyOrInitial = <T,>(legacyKey: string, defaultValue: T): T => {
  const saved = localStorage.getItem(legacyKey);
  if (!saved) return defaultValue;
  try {
    return JSON.parse(saved);
  } catch {
    return defaultValue;
  }
};

export const saveWorkspaceRegistry = (workspaces: SchoolWorkspaceMeta[], activeNpsn?: string) => {
  localStorage.setItem(WORKSPACE_REGISTRY_KEY, JSON.stringify(workspaces));
  if (activeNpsn) {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeNpsn);
  }
};

export const loadWorkspaceDataFromStorage = (npsn: string): WorkspaceFullData => {
  const getItem = <T,>(cat: string, fallback: T): T => {
    const raw = localStorage.getItem(getWorkspaceStorageKey(npsn, cat));
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const projectInfo = getItem<ProjectInfo>('project', {
    ...INITIAL_PROJECT_INFO,
    dataSekolah: {
      ...INITIAL_PROJECT_INFO.dataSekolah,
      npsn,
    },
  });

  return {
    projectInfo,
    transactions: getItem<CashTransaction[]>('transactions', INITIAL_TRANSACTIONS),
    kwitansiList: getItem<Kwitansi[]>('kwitansi', INITIAL_KWITANSI_LIST),
    payrollHarian: getItem<PayrollHarianBatch[]>('payroll_h', INITIAL_PAYROLL_HARIAN),
    payrollBorongan: getItem<WorkerBoronganItem[]>('payroll_b', INITIAL_BORONGAN_LIST),
    wbsList: getItem<WBSItem[]>('wbs', INITIAL_WBS),
    rabMaster: getItem<RABMasterItem[]>('rab_master', INITIAL_RAB_MASTER),
    dailyLogs: getItem<DailyWorkLog[]>('daily', INITIAL_DAILY_LOGS),
    weeklyRecaps: getItem<WeeklyRecap[]>('weekly', INITIAL_WEEKLY_RECAPS),
    standardWages: getItem<StandardWageRate[]>('wages', INITIAL_STANDARD_WAGES),
    standardMaterials: getItem<StandardMaterialPrice[]>('materials', INITIAL_STANDARD_MATERIALS),
  };
};

export const saveWorkspaceDataToStorage = (npsn: string, data: WorkspaceFullData) => {
  try {
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'project'), JSON.stringify(data.projectInfo));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'transactions'), JSON.stringify(data.transactions));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'kwitansi'), JSON.stringify(data.kwitansiList));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'payroll_h'), JSON.stringify(data.payrollHarian));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'payroll_b'), JSON.stringify(data.payrollBorongan));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'wbs'), JSON.stringify(data.wbsList));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'rab_master'), JSON.stringify(data.rabMaster));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'daily'), JSON.stringify(data.dailyLogs));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'weekly'), JSON.stringify(data.weeklyRecaps));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'wages'), JSON.stringify(data.standardWages));
    localStorage.setItem(getWorkspaceStorageKey(npsn, 'materials'), JSON.stringify(data.standardMaterials));
  } catch (error) {
    console.error(`Failed to save data for workspace ${npsn}:`, error);
  }
};

export const deleteWorkspaceDataFromStorage = (npsn: string) => {
  const categories = [
    'project',
    'transactions',
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
  categories.forEach((cat) => {
    localStorage.removeItem(getWorkspaceStorageKey(npsn, cat));
  });
};

// Create a sanitized project export object
export const createRevitaProjectFile = (
  meta: SchoolWorkspaceMeta,
  data: WorkspaceFullData
): RevitaProjectFile => {
  const totalPenerimaan = data.transactions
    .filter((t) => t.jenisTransaksi === 'PENERIMAAN' && t.linkedDocType !== 'PENCAIRAN_BANK')
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = data.transactions
    .filter((t) => t.jenisTransaksi === 'PENGELUARAN' && t.linkedDocType !== 'PENCAIRAN_BANK')
    .reduce((sum, t) => sum + t.nominal, 0);

  const progresFisik = data.wbsList.reduce(
    (sum, w) => sum + w.bobotRencana * (w.progresRealisasi / 100),
    0
  );

  return {
    fileSignature: 'SIAP_REVITA_PROJECT_FILE',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    npsn: meta.npsn,
    namaSekolah: meta.namaSekolah,
    paguAnggaran: meta.paguAnggaran,
    projectInfo: data.projectInfo,
    transactions: data.transactions,
    kwitansiList: data.kwitansiList,
    payrollHarian: data.payrollHarian,
    payrollBorongan: data.payrollBorongan,
    dailyLogs: data.dailyLogs,
    weeklyRecaps: data.weeklyRecaps,
    wbsList: data.wbsList,
    rabMaster: data.rabMaster,
    standardWages: data.standardWages,
    standardMaterials: data.standardMaterials,
    summaryCheck: {
      totalPenerimaan,
      totalPengeluaran,
      saldoAkhir: totalPenerimaan - totalPengeluaran,
      progresFisik,
    },
  };
};

export const downloadRevitaFile = (projectFile: RevitaProjectFile, extension: 'revita' | 'json' = 'revita') => {
  const jsonContent = JSON.stringify(projectFile, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const sanitizedSchool = projectFile.namaSekolah.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `P2SP_${projectFile.npsn}_${sanitizedSchool}_${dateStr}.${extension}`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const parseRevitaFile = (
  rawText: string
): { valid: boolean; data?: RevitaProjectFile; error?: string } => {
  try {
    const parsed = JSON.parse(rawText);

    // Support v2 format
    if (parsed.fileSignature === 'SIAP_REVITA_PROJECT_FILE' && parsed.projectInfo) {
      return { valid: true, data: parsed as RevitaProjectFile };
    }

    // Support legacy JSON export format
    if (parsed.projectInfo && (parsed.transactions || parsed.kwitansiList)) {
      const npsn = parsed.projectInfo?.dataSekolah?.npsn || '20201842';
      const namaSekolah =
        parsed.projectInfo?.dataSekolah?.namaSekolah ||
        parsed.projectInfo?.namaInstansi ||
        'Sekolah Revitalisasi';

      const adapted: RevitaProjectFile = {
        fileSignature: 'SIAP_REVITA_PROJECT_FILE',
        version: '2.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        npsn,
        namaSekolah,
        paguAnggaran: parsed.projectInfo?.totalPaguAnggaran || 0,
        projectInfo: { ...INITIAL_PROJECT_INFO, ...parsed.projectInfo },
        transactions: parsed.transactions || [],
        kwitansiList: parsed.kwitansiList || [],
        payrollHarian: parsed.payrollHarian || [],
        payrollBorongan: parsed.payrollBorongan || [],
        dailyLogs: parsed.dailyLogs || [],
        weeklyRecaps: parsed.weeklyRecaps || [],
        wbsList: parsed.wbsList || INITIAL_WBS,
        rabMaster: parsed.rabMaster || INITIAL_RAB_MASTER,
        standardWages: parsed.standardWages || INITIAL_STANDARD_WAGES,
        standardMaterials: parsed.standardMaterials || INITIAL_STANDARD_MATERIALS,
      };
      return { valid: true, data: adapted };
    }

    return {
      valid: false,
      error: 'Format berkas tidak dikenali. Pastikan Anda mengunggah file berkas SIAP-Revita (.revita atau .json) yang valid.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Gagal membaca isi berkas: ${err?.message || 'Format JSON rusak'}`,
    };
  }
};
