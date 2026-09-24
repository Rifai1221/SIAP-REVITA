import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { SchoolWorkspaceProfile } from '../types';
import { WorkspaceFullData } from './workspaceStorage';

export type CloudSyncStatus = 'ONLINE_SYNCED' | 'SYNCING' | 'OFFLINE_LOCAL' | 'ERROR';

// Save school workspace metadata to Firestore
export async function syncWorkspaceMetaToCloud(workspace: SchoolWorkspaceProfile): Promise<void> {
  try {
    if (!workspace.npsn || workspace.npsn.trim() === '') return;
    const docRef = doc(db, 'workspaces', workspace.npsn);
    await setDoc(
      docRef,
      {
        ...workspace,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn(`[Cloud Sync] Error saving workspace meta ${workspace.npsn}:`, error);
  }
}

// Save complete school data to Firestore
export async function syncSchoolDataToCloud(npsn: string, data: WorkspaceFullData): Promise<void> {
  try {
    if (!npsn || npsn.trim() === '') return;
    const docRef = doc(db, 'schools_data', npsn);
    const sanitizedPayload = JSON.parse(
      JSON.stringify({
        npsn,
        projectInfo: data.projectInfo,
        transactions: data.transactions || [],
        kwitansiList: data.kwitansiList || [],
        payrollHarian: data.payrollHarian || [],
        payrollBorongan: data.payrollBorongan || [],
        wbsList: data.wbsList || [],
        rabMaster: data.rabMaster || [],
        dailyLogs: data.dailyLogs || [],
        weeklyRecaps: data.weeklyRecaps || [],
        standardWages: data.standardWages || [],
        standardMaterials: data.standardMaterials || [],
        updatedAt: new Date().toISOString(),
      })
    );

    await setDoc(docRef, sanitizedPayload, { merge: true });
  } catch (error) {
    console.warn(`[Cloud Sync] Error saving school data for ${npsn}:`, error);
  }
}

// Fetch all workspaces from Firestore
export async function fetchWorkspacesFromCloud(): Promise<SchoolWorkspaceProfile[] | null> {
  try {
    const colRef = collection(db, 'workspaces');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;

    const list: SchoolWorkspaceProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.npsn && data.namaSekolah) {
        list.push({
          npsn: data.npsn,
          namaSekolah: data.namaSekolah,
          jenjang: data.jenjang || 'SD',
          paguAnggaran: data.paguAnggaran || 0,
          kabupatenKota: data.kabupatenKota || data.kabupaten || 'Kabupaten Bogor',
          pin: data.pin || '',
          isPinProtected: !!data.isPinProtected || !!data.hasPin,
          lastActive: data.lastActive || data.lastModified || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
          warnaTema: data.warnaTema || 'emerald',
          catatanFasilitator: data.catatanFasilitator || '',
        });
      }
    });

    return list.length > 0 ? list : null;
  } catch (error) {
    console.warn('[Cloud Sync] Error fetching cloud workspaces:', error);
    return null;
  }
}

// Fetch specific school data from Firestore
export async function fetchSchoolDataFromCloud(npsn: string): Promise<WorkspaceFullData | null> {
  try {
    if (!npsn || npsn.trim() === '') return null;
    const docRef = doc(db, 'schools_data', npsn);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const val = snap.data();
    return {
      projectInfo: val.projectInfo,
      transactions: val.transactions || [],
      kwitansiList: val.kwitansiList || [],
      payrollHarian: val.payrollHarian || [],
      payrollBorongan: val.payrollBorongan || [],
      wbsList: val.wbsList || [],
      rabMaster: val.rabMaster || [],
      dailyLogs: val.dailyLogs || [],
      weeklyRecaps: val.weeklyRecaps || [],
      standardWages: val.standardWages || [],
      standardMaterials: val.standardMaterials || [],
    };
  } catch (error) {
    console.warn(`[Cloud Sync] Error fetching cloud data for ${npsn}:`, error);
    return null;
  }
}

// Known demo transaction and item IDs
export const DEMO_TRANSACTION_IDS = new Set([
  'tx-001',
  'tx-002',
  'tx-003',
  'tx-004',
  'tx-005',
  'tx-006',
  'tx-007',
  'tx-008',
  'tx-009',
  'tx-010',
  'tx-011',
  'tx-012',
  'tx-013',
  'tx-smp-001',
  'tx-smp-002',
  'tx-smp-003',
]);

export function isDemoTransactions(transactions?: any[] | null): boolean {
  if (!transactions || transactions.length === 0) return false;
  return transactions.every((t) => DEMO_TRANSACTION_IDS.has(t.id));
}

export function hasRealUserTransactions(transactions?: any[] | null): boolean {
  if (!transactions || transactions.length === 0) return false;
  return transactions.some((t) => !DEMO_TRANSACTION_IDS.has(t.id));
}

// Helper to determine if a workspace dataset is the sample demo dataset
export function isDemoSchoolData(
  npsn: string,
  schoolName?: string,
  hasRealTransactions?: boolean
): boolean {
  // If user entered real transactions, it is definitely real user data
  if (hasRealTransactions) return false;

  const normalizedName = (schoolName || '').toLowerCase();
  if (npsn === '20209999' && (normalizedName === '' || normalizedName.includes('sukaraja'))) {
    return true;
  }
  if (npsn === '20201842' && (normalizedName === '' || normalizedName.includes('babakan'))) {
    return true;
  }
  return false;
}

// Delete school data from Firestore
export async function deleteSchoolFromCloud(npsn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'workspaces', npsn));
    await deleteDoc(doc(db, 'schools_data', npsn));
  } catch (error) {
    console.warn(`[Cloud Sync] Error deleting school ${npsn} from cloud:`, error);
  }
}

