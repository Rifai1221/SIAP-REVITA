import { WorkerHarian, StandardWageRate } from '../types';
import { terbilangRupiah } from './terbilang';

export interface WeeklyWageItem {
  id: string;
  pos: 'UPAH_TUKANG' | 'UPAH_PERENCANA' | 'UPAH_PENGAWAS' | 'UPAH_ADMINISTRASI';
  judul: string;
  uraian: string;
  bobotMingguIniPersen: number;
  paguAlokasi: number;
  nominal: number;
  terbilang: string;
  penerima: string;
  penerimaJabatan: string;
  nomorKwitansi: string;
  tanggalBayar: string;
  workersDetail?: WorkerHarian[];
}

export interface WeeklyWagesCalculationResult {
  mingguKe: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalPaguAnggaran: number;
  bobotFisikMingguIni: number;
  bobotPerencanaMingguIni: number;
  bobotPengawasMingguIni: number;
  bobotAdministrasiMingguIni: number;
  totalBobotMingguIni: number;
  upahTukang: WeeklyWageItem;
  upahPerencana: WeeklyWageItem;
  upahPengawas: WeeklyWageItem;
  upahAdministrasi: WeeklyWageItem;
  totalNominalUpahMingguan: number;
}

export interface WeeklyWagesCalculationParams {
  mingguKe: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  totalPaguAnggaran: number;
  bobotFisikMingguIni: number;
  bobotPerencanaMingguIni?: number;
  bobotPengawasMingguIni?: number;
  bobotAdministrasiMingguIni?: number;
  projectInfo?: any;
  standardWages?: StandardWageRate[];
}

/**
 * Menghitung upah mingguan berdasarkan bobot capaian laporan mingguan:
 * 1. Upah Tukang: dihitung dari capaian bobot fisik (proporsi upah tenaga kerja ~35% dari nilai fisik mingguan)
 * 2. Upah Perencana: dihitung mingguan sesuai bobot perencanaan (Biaya Perencanaan)
 * 3. Upah Pengawas: dihitung mingguan sesuai bobot pengawasan (Biaya Pengawasan)
 * 4. Upah Administrasi: dihitung mingguan sesuai bobot administrasi/pengelolaan (Biaya Pengelolaan P2SP)
 */
export function calculateWeeklyWagesFromProgress(
  params: WeeklyWagesCalculationParams
): WeeklyWagesCalculationResult {
  const {
    mingguKe,
    tanggalMulai,
    tanggalSelesai,
    totalPaguAnggaran,
    bobotFisikMingguIni,
    projectInfo,
  } = params;

  // Default bobot jika tidak disediakan (mengacu pada template resmi Lap. Mingguan: 0.18%, 0.22%, 0.24%)
  const bobotPerencana =
    typeof params.bobotPerencanaMingguIni === 'number'
      ? params.bobotPerencanaMingguIni
      : bobotFisikMingguIni > 0
      ? 0.18
      : 0;

  const bobotPengawas =
    typeof params.bobotPengawasMingguIni === 'number'
      ? params.bobotPengawasMingguIni
      : bobotFisikMingguIni > 0
      ? 0.22
      : 0;

  const bobotAdministrasi =
    typeof params.bobotAdministrasiMingguIni === 'number'
      ? params.bobotAdministrasiMingguIni
      : bobotFisikMingguIni > 0
      ? 0.24
      : 0;

  const totalBobotMingguIni =
    Math.round(
      (bobotFisikMingguIni + bobotPerencana + bobotPengawas + bobotAdministrasi) * 100
    ) / 100;

  const yearStr = new Date(tanggalSelesai).getFullYear() || 2026;
  const padMinggu = String(mingguKe).padStart(2, '0');

  // --- 1. UPAH TUKANG & TENAGA KERJA MINGGUAN ---
  // Nilai fisik yang dicapai minggu ini = (bobotFisikMingguIni / 100) * totalPaguAnggaran
  // Komponen Upah Tenaga Kerja adalah ~35% dari total nilai fisik pekerjaan (SNI standard konstruksi gedung/sarpras)
  const nilaiFisikMingguIni = (bobotFisikMingguIni / 100) * totalPaguAnggaran;
  let nominalUpahTukang = Math.round(nilaiFisikMingguIni * 0.35);

  // Jika progres fisik terisi tapi nominalnya terlalu kecil karena pembulatan, buat batas wajar
  if (bobotFisikMingguIni > 0 && nominalUpahTukang < 250000) {
    nominalUpahTukang = Math.round(nilaiFisikMingguIni);
  }

  // Nama personil dari data master atau default
  const namaPerencana =
    projectInfo?.timP2sp?.perencana?.nama || 'DZIKRY IMAM MAJID, S.T.';
  const namaPengawas =
    projectInfo?.timP2sp?.pengawas?.nama || 'ERWIN RUSANDI, S.T.';
  const namaAdministrasi =
    projectInfo?.timP2sp?.sekretarisLogistik?.nama ||
    projectInfo?.namaBendahara ||
    'TIM PENGELOLA & ADMINISTRASI P2SP';
  const namaMandor = 'Suparman';

  // Rincian daftar pekerja harian mingguan untuk SPJ Upah
  const workersDetail: WorkerHarian[] = [];
  if (nominalUpahTukang > 0) {
    // Alokasi proporsional: Mandor (28%), Kepala Tukang (24%), Tukang (26%), Laden (22%)
    const mdrShare = Math.round(nominalUpahTukang * 0.28);
    const kptShare = Math.round(nominalUpahTukang * 0.24);
    const tkgShare = Math.round(nominalUpahTukang * 0.26);
    const ldnShare = nominalUpahTukang - (mdrShare + kptShare + tkgShare);

    workersDetail.push({
      id: `w-mdr-${mingguKe}`,
      nama: namaMandor,
      peran: 'MANDOR',
      upahHarian: Math.round(mdrShare / 6),
      hariKerja: 6,
      jamLembur: 0,
      upahLemburPerJam: 0,
      kasbon: 0,
      totalUpahKotor: mdrShare,
      totalUpahBersih: mdrShare,
      keterangan: 'Mandor Pelaksana Lapangan',
    });

    workersDetail.push({
      id: `w-kpt-${mingguKe}`,
      nama: 'Slamet Riyadi',
      peran: 'TUKANG',
      upahHarian: Math.round(kptShare / 6),
      hariKerja: 6,
      jamLembur: 0,
      upahLemburPerJam: 0,
      kasbon: 0,
      totalUpahKotor: kptShare,
      totalUpahBersih: kptShare,
      keterangan: 'Kepala Tukang Konstruksi',
    });

    workersDetail.push({
      id: `w-tkg-${mingguKe}`,
      nama: 'Karyo Utomo',
      peran: 'TUKANG',
      upahHarian: Math.round(tkgShare / 6),
      hariKerja: 6,
      jamLembur: 0,
      upahLemburPerJam: 0,
      kasbon: 0,
      totalUpahKotor: tkgShare,
      totalUpahBersih: tkgShare,
      keterangan: 'Tukang Batu & Besi',
    });

    workersDetail.push({
      id: `w-ldn-${mingguKe}`,
      nama: 'Junaedi / Asep',
      peran: 'LADEN',
      upahHarian: Math.round(ldnShare / 6),
      hariKerja: 6,
      jamLembur: 0,
      upahLemburPerJam: 0,
      kasbon: 0,
      totalUpahKotor: ldnShare,
      totalUpahBersih: ldnShare,
      keterangan: 'Pekerja / Laden Pembantu',
    });
  }

  const paguFisikTotal = Math.round(totalPaguAnggaran * 0.9355);
  const paguUpahTukangTotal = Math.round(paguFisikTotal * 0.35);

  const upahTukang: WeeklyWageItem = {
    id: `wage-tukang-w${mingguKe}`,
    pos: 'UPAH_TUKANG',
    judul: 'Upah Tukang & Tenaga Kerja (Mingguan)',
    uraian: `Pembayaran Upah Mandor, Kepala Tukang, Tukang & Pekerja Minggu Ke-${mingguKe} (Prestasi Fisik ${bobotFisikMingguIni.toFixed(2)}%)`,
    bobotMingguIniPersen: bobotFisikMingguIni,
    paguAlokasi: paguUpahTukangTotal,
    nominal: nominalUpahTukang,
    terbilang: terbilangRupiah(nominalUpahTukang),
    penerima: `${namaMandor} (Mandor) & Tim Tukang`,
    penerimaJabatan: 'Mandor & Pekerja Lapangan P2SP',
    nomorKwitansi: `SPJ-UPAH/${yearStr}/W${padMinggu}`,
    tanggalBayar: tanggalSelesai,
    workersDetail,
  };

  // --- 2. UPAH / HONOR TENAGA PERENCANA MINGGUAN ---
  // Pagu Perencanaan standar = 1.85% dari total pagu
  const paguPerencanaTotal = Math.round(totalPaguAnggaran * 0.0185);
  const nominalPerencana = Math.round((bobotPerencana / 100) * totalPaguAnggaran);

  const upahPerencana: WeeklyWageItem = {
    id: `wage-perencana-w${mingguKe}`,
    pos: 'UPAH_PERENCANA',
    judul: 'Upah / Honor Tenaga Perencana (Mingguan)',
    uraian: `Honorarium Jasa Konsultansi Perencanaan Teknis Revitalisasi Minggu Ke-${mingguKe} (Bobot ${bobotPerencana.toFixed(2)}%)`,
    bobotMingguIniPersen: bobotPerencana,
    paguAlokasi: paguPerencanaTotal,
    nominal: nominalPerencana,
    terbilang: terbilangRupiah(nominalPerencana),
    penerima: namaPerencana,
    penerimaJabatan: 'Tenaga Ahli Perencana P2SP',
    nomorKwitansi: `KWT/HON-PLAN/${yearStr}/${padMinggu}`,
    tanggalBayar: tanggalSelesai,
  };

  // --- 3. UPAH / HONOR TENAGA PENGAWAS MINGGUAN ---
  // Pagu Pengawasan standar = 2.19% dari total pagu
  const paguPengawasTotal = Math.round(totalPaguAnggaran * 0.0219);
  const nominalPengawas = Math.round((bobotPengawas / 100) * totalPaguAnggaran);

  const upahPengawas: WeeklyWageItem = {
    id: `wage-pengawas-w${mingguKe}`,
    pos: 'UPAH_PENGAWAS',
    judul: 'Upah / Honor Tenaga Pengawas (Mingguan)',
    uraian: `Honorarium Jasa Pengawasan Lapangan & Verifikasi Progres Fisik Minggu Ke-${mingguKe} (Bobot ${bobotPengawas.toFixed(2)}%)`,
    bobotMingguIniPersen: bobotPengawas,
    paguAlokasi: paguPengawasTotal,
    nominal: nominalPengawas,
    terbilang: terbilangRupiah(nominalPengawas),
    penerima: namaPengawas,
    penerimaJabatan: 'Tenaga Ahli Pengawas Lapangan P2SP',
    nomorKwitansi: `KWT/HON-WAS/${yearStr}/${padMinggu}`,
    tanggalBayar: tanggalSelesai,
  };

  // --- 4. UPAH / HONOR ADMINISTRASI & PENGELOLAAN (JIKA ADA) ---
  // Pagu Pengelolaan / Administrasi standar = 2.41% dari total pagu
  const paguAdministrasiTotal = Math.round(totalPaguAnggaran * 0.0241);
  const nominalAdministrasi = Math.round((bobotAdministrasi / 100) * totalPaguAnggaran);

  const upahAdministrasi: WeeklyWageItem = {
    id: `wage-admin-w${mingguKe}`,
    pos: 'UPAH_ADMINISTRASI',
    judul: 'Upah / Honor Administrasi & Pengelolaan (Mingguan)',
    uraian: `Honorarium Pengelolaan, ATK, Pelaporan & Administrasi P2SP Minggu Ke-${mingguKe} (Bobot ${bobotAdministrasi.toFixed(2)}%)`,
    bobotMingguIniPersen: bobotAdministrasi,
    paguAlokasi: paguAdministrasiTotal,
    nominal: nominalAdministrasi,
    terbilang: terbilangRupiah(nominalAdministrasi),
    penerima: namaAdministrasi,
    penerimaJabatan: 'Tim Pengelola Administrasi & Logistik P2SP',
    nomorKwitansi: `KWT/HON-ADM/${yearStr}/${padMinggu}`,
    tanggalBayar: tanggalSelesai,
  };

  const totalNominalUpahMingguan =
    nominalUpahTukang + nominalPerencana + nominalPengawas + nominalAdministrasi;

  return {
    mingguKe,
    tanggalMulai,
    tanggalSelesai,
    totalPaguAnggaran,
    bobotFisikMingguIni,
    bobotPerencanaMingguIni: bobotPerencana,
    bobotPengawasMingguIni: bobotPengawas,
    bobotAdministrasiMingguIni: bobotAdministrasi,
    totalBobotMingguIni,
    upahTukang,
    upahPerencana,
    upahPengawas,
    upahAdministrasi,
    totalNominalUpahMingguan,
  };
}
