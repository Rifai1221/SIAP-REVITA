import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { SchoolWorkspaceMeta } from '../types';
import { WorkspaceFullData } from './workspaceStorage';

export type CloudSyncStatus = 'ONLINE_SYNCED' | 'SYNCING' | 'OFFLINE_LOCAL' | 'ERROR';

// Save school workspace metadata to Firestore
export async function syncWorkspaceMetaToCloud(workspace: SchoolWorkspaceMeta): Promise<void> {
  try {
    const docRef = doc(db, 'workspaces', workspace.npsn);
    await setDoc(docRef, {
      ...workspace,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn(`[Cloud Sync] Error saving workspace meta ${workspace.npsn}:`, error);
  }
}

// Save complete school data to Firestore
export async function syncSchoolDataToCloud(npsn: string, data: WorkspaceFullData): Promise<void> {
  try {
    const docRef = doc(db, 'schools_data', npsn);
    const sanitizedPayload = JSON.parse(JSON.stringify({
      npsn,
      projectInfo: data.projectInfo,
      transactions: data.transactions,
      kwitansiList: data.kwitansiList,
      payrollHarian: data.payrollHarian,
      payrollBorongan: data.payrollBorongan,
      wbsList: data.wbsList,
      rabMaster: data.rabMaster,
      dailyLogs: data.dailyLogs,
      weeklyRecaps: data.weeklyRecaps,
      standardWages: data.standardWages,
      standardMaterials: data.standardMaterials,
      updatedAt: new Date().toISOString(),
    }));

    await setDoc(docRef, sanitizedPayload, { merge: true });
  } catch (error) {
    console.warn(`[Cloud Sync] Error saving school data for ${npsn}:`, error);
  }
}

// Fetch all workspaces from Firestore
export async function fetchWorkspacesFromCloud(): Promise<SchoolWorkspaceMeta[] | null> {
  try {
    const colRef = collection(db, 'workspaces');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;

    const list: SchoolWorkspaceMeta[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.npsn && data.namaSekolah) {
        list.push({
          id: data.id || `ws_${data.npsn}`,
          npsn: data.npsn,
          namaSekolah: data.namaSekolah,
          jenjang: data.jenjang || 'SD',
          paguAnggaran: data.paguAnggaran || 0,
          tahunAnggaran: data.tahunAnggaran || '2026',
          kabupaten: data.kabupaten || 'Kabupaten Bogor',
          hasPin: !!data.hasPin,
          pinHash: data.pinHash,
          lastModified: data.lastModified || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
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

// Delete school data from Firestore
export async function deleteSchoolFromCloud(npsn: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'workspaces', npsn));
    await deleteDoc(doc(db, 'schools_data', npsn));
  } catch (error) {
    console.warn(`[Cloud Sync] Error deleting school ${npsn} from cloud:`, error);
  }
}
