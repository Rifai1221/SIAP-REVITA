import { GeneratedDailyPurchasePlan, MaterialItem, RABMasterItem } from '../types';

export interface WeeklyProgressSubmission {
  mingguKe: number;
  tanggalMulai: string; // YYYY-MM-DD (Senin)
  tanggalSelesai: string; // YYYY-MM-DD (Sabtu)
  modeDistribusi: 'SMART_STAGING' | 'HARI_TERTENTU' | 'RATA_BERTAHAP';
  hariAktifBelanja: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[];
  namaTokoDefault: string;
  items: {
    wbsId: string;
    persentaseTambah: number; // e.g. 5%
    volumeTambah: number; // e.g. 20 m2
  }[];
}

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function generateDailyPurchasesFromWeeklyProgress(
  submission: WeeklyProgressSubmission,
  rabMaster: RABMasterItem[],
  existingKwitansiCount: number
): GeneratedDailyPurchasePlan[] {
  // 1. Kumpulkan semua kebutuhan material berdasarkan progres fisik minggu ini
  const rawMaterialDemandMap = new Map<
    string,
    {
      namaBarang: string;
      satuan: string;
      hargaSatuan: number;
      volumeTotal: number;
      tokoDefault: string;
      preferensiHari: 'AWAL_MINGGU' | 'TENGAH_MINGGU' | 'AKHIR_MINGGU' | 'FLEKSIBEL';
      kategoriPekerjaan: string;
    }
  >();

  for (const itemProgress of submission.items) {
    if (itemProgress.volumeTambah <= 0 && itemProgress.persentaseTambah <= 0) continue;

    const rabItem = rabMaster.find((r) => r.id === itemProgress.wbsId);
    if (!rabItem || !rabItem.materialComponents) continue;

    // Tentukan volume fisik riil yang dikerjakan minggu ini
    let volumeFisik = itemProgress.volumeTambah;
    if (!volumeFisik || volumeFisik <= 0) {
      volumeFisik = (itemProgress.persentaseTambah / 100) * rabItem.volumeRAB;
    }

    // Hitung kebutuhan material dengan koefisien SNI
    for (const mat of rabItem.materialComponents) {
      const volumeKebutuhan = volumeFisik * mat.koefisienPerSatuanPekerjaan;
      if (volumeKebutuhan <= 0) continue;

      const existing = rawMaterialDemandMap.get(mat.namaMaterial);
      if (existing) {
        existing.volumeTotal += volumeKebutuhan;
      } else {
        rawMaterialDemandMap.set(mat.namaMaterial, {
          namaBarang: mat.namaMaterial,
          satuan: mat.satuan,
          hargaSatuan: mat.hargaSatuan,
          volumeTotal: volumeKebutuhan,
          tokoDefault: mat.tokoDefault || submission.namaTokoDefault || 'TB. Berkah Sentosa Abadi',
          preferensiHari: mat.preferensiHariBeli,
          kategoriPekerjaan: rabItem.namaPekerjaan,
        });
      }
    }
  }

  // Jika tidak ada material yang dibutuhkan
  if (rawMaterialDemandMap.size === 0) {
    return [];
  }

  // 2. Tentukan tanggal-tanggal kerja dalam rentang minggu tersebut (Senin s/d Sabtu)
  const workDays: { dateStr: string; dayName: string }[] = [];
  const start = new Date(submission.tanggalMulai);
  const end = new Date(submission.tanggalSelesai);

  let cur = new Date(start);
  while (cur <= end) {
    const dayIndex = cur.getDay();
    if (dayIndex !== 0) {
      // bukan hari Minggu
      const dayName = NAMA_HARI[dayIndex];
      // Jika mode hari tertentu dan hari ini tidak dipilih, lewati
      if (
        submission.modeDistribusi === 'HARI_TERTENTU' &&
        !submission.hariAktifBelanja.includes(dayName as any)
      ) {
        // skip
      } else {
        workDays.push({
          dateStr: cur.toISOString().split('T')[0],
          dayName,
        });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (workDays.length === 0) {
    workDays.push({
      dateStr: submission.tanggalMulai,
      dayName: 'Senin',
    });
  }

  // 3. Distribusikan material ke hari-hari kerja
  // Wadah kwitansi harian
  const dailyPlans: { [dateStr: string]: GeneratedDailyPurchasePlan } = {};

  let kwitansiCounter = existingKwitansiCount + 1;

  for (const day of workDays) {
    const noKwt = `KWT/REV/${new Date(day.dateStr).getFullYear()}/${String(
      new Date(day.dateStr).getMonth() + 1
    ).padStart(2, '0')}/${String(kwitansiCounter).padStart(3, '0')}`;
    kwitansiCounter++;

    dailyPlans[day.dateStr] = {
      id: `plan-${day.dateStr}-${Date.now().toString().slice(-4)}`,
      tanggal: day.dateStr,
      hari: day.dayName,
      nomorKwitansi: noKwt,
      namaToko: submission.namaTokoDefault || 'TB. Sumber Rejeki Jaya',
      kategoriPekerjaan: 'Belanja Material Progres Fisik Minggu ' + submission.mingguKe,
      jenisKas: 'TUNAI',
      items: [],
      totalNominal: 0,
      isApproved: true,
      statusEksekusi: 'DRAFT',
    };
  }

  const daysCount = workDays.length;

  rawMaterialDemandMap.forEach((mat) => {
    // Bulatkan volume ke bilangan yang wajar (misal: semen bulat ke sak, pasir bulat ke 0.5 m3)
    let roundedVol = Math.ceil(mat.volumeTotal * 10) / 10;
    if (['sak', 'btg', 'lembar', 'dus', 'pail', 'set', 'roll', 'bh'].includes(mat.satuan.toLowerCase())) {
      roundedVol = Math.ceil(mat.volumeTotal);
    }
    if (roundedVol <= 0) roundedVol = 1;

    if (submission.modeDistribusi === 'SMART_STAGING') {
      // Smart staging: Awal Minggu (Senin/Selasa), Tengah (Rabu/Kamis), Akhir (Jumat/Sabtu)
      let targetDays: { dateStr: string; dayName: string }[] = [];

      if (mat.preferensiHari === 'AWAL_MINGGU') {
        targetDays = workDays.slice(0, Math.max(1, Math.floor(daysCount * 0.4)));
      } else if (mat.preferensiHari === 'TENGAH_MINGGU') {
        const startMid = Math.max(0, Math.floor(daysCount * 0.3));
        const endMid = Math.min(daysCount, Math.ceil(daysCount * 0.7));
        targetDays = workDays.slice(startMid, endMid);
      } else if (mat.preferensiHari === 'AKHIR_MINGGU') {
        targetDays = workDays.slice(Math.max(0, Math.floor(daysCount * 0.6)));
      } else {
        targetDays = workDays;
      }

      if (targetDays.length === 0) targetDays = workDays;

      // Pecah volume ke target hari
      distributeMaterialToDays(mat, roundedVol, targetDays, dailyPlans);
    } else {
      // Rata bertahap
      distributeMaterialToDays(mat, roundedVol, workDays, dailyPlans);
    }
  });

  // Hitung total nominal dan filter hari yang punya item belanja
  const finalPlans: GeneratedDailyPurchasePlan[] = [];

  for (const day of workDays) {
    const plan = dailyPlans[day.dateStr];
    if (plan && plan.items.length > 0) {
      plan.totalNominal = plan.items.reduce((acc, it) => acc + it.subtotal, 0);
      // Gunakan toko dari item pertama jika seragam
      if (plan.items[0] && (plan.items[0] as any).tokoNama) {
        plan.namaToko = (plan.items[0] as any).tokoNama;
      }
      finalPlans.push(plan);
    }
  }

  return finalPlans;
}

function distributeMaterialToDays(
  mat: {
    namaBarang: string;
    satuan: string;
    hargaSatuan: number;
    tokoDefault: string;
  },
  totalVolume: number,
  targetDays: { dateStr: string; dayName: string }[],
  dailyPlans: { [dateStr: string]: GeneratedDailyPurchasePlan }
) {
  const parts = targetDays.length;
  if (parts === 1 || totalVolume === 1) {
    // Masukkan semua ke hari pertama target
    const targetDate = targetDays[0].dateStr;
    addItemToDay(dailyPlans[targetDate], mat, totalVolume);
    return;
  }

  // Bagi ke beberapa hari
  const baseVol = Math.floor(totalVolume / parts);
  let remainder = totalVolume % parts;

  for (let i = 0; i < parts; i++) {
    const dateStr = targetDays[i].dateStr;
    const volForThisDay = baseVol + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    if (volForThisDay > 0) {
      addItemToDay(dailyPlans[dateStr], mat, volForThisDay);
    }
  }
}

function addItemToDay(
  plan: GeneratedDailyPurchasePlan,
  mat: {
    namaBarang: string;
    satuan: string;
    hargaSatuan: number;
    tokoDefault: string;
  },
  volume: number
) {
  if (!plan) return;
  const subtotal = volume * mat.hargaSatuan;

  const existingItem = plan.items.find((it) => it.namaBarang === mat.namaBarang);
  if (existingItem) {
    existingItem.volume += volume;
    existingItem.subtotal = existingItem.volume * existingItem.hargaSatuan;
  } else {
    const newItem: MaterialItem & { tokoNama?: string } = {
      id: `item-${Date.now().toString().slice(-4)}-${Math.random().toString().slice(2, 5)}`,
      namaBarang: mat.namaBarang,
      volume,
      satuan: mat.satuan,
      hargaSatuan: mat.hargaSatuan,
      subtotal,
    };
    (newItem as any).tokoNama = mat.tokoDefault;
    plan.items.push(newItem);
  }
}
