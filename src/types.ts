export type CashType = 'BANK' | 'TUNAI';
export type TransactionType = 'PENERIMAAN' | 'PENGELUARAN';

export type ExpenseCategory =
  | 'PENCAIRAN_DANA'
  | 'BELANJA_MATERIAL'
  | 'UPAH_TUKANG'
  | 'SEWA_ALAT'
  | 'OPERASIONAL'
  | 'PAJAK_RETRIBUSI'
  | 'BUNGA_BANK'
  | 'LAIN_LAIN';

export interface CashTransaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  noBukti: string; // e.g. BKU-001, KWT-002
  uraian: string;
  jenisKas: CashType;
  jenisTransaksi: TransactionType;
  kategori: ExpenseCategory;
  nominal: number;
  kodeAkun?: string;
  penerimaAtauPemberi?: string;
  keterangan?: string;
  linkedDocId?: string; // ID of Kwitansi or Payroll for cross-referencing
  linkedDocType?: 'KWITANSI' | 'PAYROLL_HARIAN' | 'PAYROLL_BORONGAN' | 'PENCAIRAN_BANK';
}

export interface MaterialItem {
  id: string;
  namaBarang: string;
  spesifikasi?: string;
  volume: number;
  satuan: string; // sak, m3, btg, kg, bh, rit, lonjor, dll
  hargaSatuan: number;
  subtotal: number;
}

export interface Kwitansi {
  id: string;
  nomorKwitansi: string; // e.g. KWT/REV/2026/03/001
  tanggal: string;
  telahTerimaDari: string; // e.g. Bendahara Program Revitalisasi
  uangSebanyak: number;
  terbilang: string;
  untukPembayaran: string;
  penerimaNama: string; // e.g. TB. Sumber Makmur Abadi
  penerimaAlamat?: string;
  tempatTtd: string; // e.g. Babakan
  items: MaterialItem[];
  jenisKasPembayaran: CashType;
  isBookedToBKU: boolean;
  bkuTransactionId?: string;
  status: 'LUNAS' | 'MENUNGGU';
  progressCategory?: string; // e.g. "Pekerjaan Struktur & Pondasi"
}

export interface WorkerHarian {
  id: string;
  nama: string;
  peran: 'MANDOR' | 'TUKANG' | 'LADEN'; // Laden = Kenek / Pembantu Tukang
  upahHarian: number;
  hariKerja: number;
  jamLembur: number;
  upahLemburPerJam: number;
  kasbon: number;
  totalUpahKotor: number;
  totalUpahBersih: number;
  keterangan?: string;
}

export interface ProgressPhotoItem {
  id: string;
  url: string; // Base64 data URL
  caption: string;
  tanggal: string;
  mingguKe: number;
}

export interface PayrollHarianBatch {
  id: string;
  noSpj: string; // e.g. SPJ-UPAH/2026/W03
  periodeAwal: string;
  periodeAkhir: string;
  mingguKe: number;
  pekerjaanTerkait: string;
  workers: WorkerHarian[];
  totalDibayarkan: number;
  tanggalBayar: string;
  jenisKas: CashType;
  isBookedToBKU: boolean;
  bkuTransactionId?: string;
  photos?: ProgressPhotoItem[];
}

export interface WorkerBoronganItem {
  id: string;
  noKontrak: string; // e.g. BRG/2026/01
  namaMandor: string;
  itemPekerjaan: string;
  volume: number;
  satuan: string; // m2, m3, titik, ls
  hargaSatuan: number;
  nilaiKontrak: number;
  persentaseSelesai: number; // 0 - 100%
  tahapTermin: string; // e.g. "Termin I (DP 30%)"
  nominalTermin: number;
  tanggalBayar: string;
  status: 'DRAFT' | 'DIBAYAR';
  jenisKas: CashType;
  isBookedToBKU: boolean;
  bkuTransactionId?: string;
}

export interface DailyWorkLog {
  id: string;
  tanggal: string;
  mingguKe: number;
  cuaca: 'CERAH' | 'BERAWAN' | 'HUJAN_RINGAN' | 'HUJAN_DERAS';
  jumlahTenagaKerja: {
    mandor: number;
    tukang: number;
    laden: number;
  };
  uraianPekerjaan: string;
  progresHariIniPersen: number; // e.g. 0.8%
  kendalaDanSolusi?: string;
  catatanMaterial?: string;
}

export interface WBSItem {
  id: string;
  kode: string;
  namaPekerjaan: string;
  bobotRencana: number; // e.g. 25%
  progresRealisasi: number; // e.g. 23.5%
  volumeRAB: number;
  satuan: string;
  biayaRAB: number;
  biayaRealisasi: number;
}

// Analisa SNI / Komponen Material per Item Pekerjaan
export interface RABMaterialComponent {
  id: string;
  namaMaterial: string;
  spesifikasi?: string;
  satuan: string;
  koefisienPerSatuanPekerjaan: number; // e.g. 0.22 sak semen per m2 atau 70 buah bata per m2
  hargaSatuan: number;
  tokoDefault?: string;
  kategoriBahan: 'STRUKTUR' | 'DINDING' | 'ATAP' | 'LANTAI' | 'FINISHING' | 'LAINNYA';
  preferensiHariBeli: 'AWAL_MINGGU' | 'TENGAH_MINGGU' | 'AKHIR_MINGGU' | 'FLEKSIBEL';
}

export interface RABMasterItem extends WBSItem {
  kategori: string;
  materialComponents: RABMaterialComponent[];
}

export interface StandardWageRate {
  id: string;
  role: string;
  harga: number;
  desc?: string;
  satuan?: string; // default 'HOK'
}

export interface StandardMaterialPrice {
  id: string;
  nama: string;
  satuan: string;
  harga: number;
  kategori?: string;
  spesifikasi?: string;
}

export interface WeeklyProgressInput {
  mingguKe: number;
  tanggalMulai: string; // e.g. Senin
  tanggalSelesai: string; // e.g. Sabtu
  itemsProgress: {
    wbsId: string;
    persentaseTambahMingguIni: number; // e.g. 8%
    volumeTambahMingguIni: number; // e.g. 35 m2
    catatan?: string;
  }[];
}

export interface GeneratedDailyPurchasePlan {
  id: string;
  tanggal: string; // e.g. 2026-03-16
  hari: string; // Senin, Selasa, dst.
  nomorKwitansi: string;
  namaToko: string;
  alamatToko?: string;
  kategoriPekerjaan: string;
  jenisKas: CashType;
  items: MaterialItem[];
  totalNominal: number;
  isApproved: boolean;
  statusEksekusi?: 'DRAFT' | 'DIBUKUKAN_KE_BKU';
}

export interface WeeklyRecap {
  mingguKe: number;
  rentangTanggal: string;
  targetKumulatif: number; // %
  realisasiKumulatif: number; // %
  deviasi: number; // Realisasi - Target
  serapanBiayaKumulatif: number;
  status: 'SESUAI_JADWAL' | 'TERLAMBAT' | 'MENDAHULUI';
  catatanEvaluasi: string;
  photos?: ProgressPhotoItem[];
}

export interface PersonilP2SP {
  nama: string;
  nipNik?: string;
  jabatanAsal: string; // e.g. "Kepala Sekolah", "Ketua Komite", "Guru", "Tenaga Ahli", "Warga Masyarakat"
  noHp?: string;
  alamat?: string;
}

export type JenjangSekolah = 'TK/PAUD' | 'SD' | 'SMP/MTs' | 'SMA/SMK' | 'SLB' | 'Lainnya' | string;

export interface DataSekolah {
  namaSekolah: string;
  npsn: string;
  jenjang: JenjangSekolah;
  statusSekolah: 'NEGERI' | 'SWASTA';
  nomorSkP2sp: string;
  tanggalSkP2sp: string;
}

export interface AlamatLengkap {
  jalan: string;
  rtRw: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
}

export interface TimP2SP {
  penanggungJawab: PersonilP2SP;
  ketuaP2sp: PersonilP2SP;
  sekretarisLogistik: PersonilP2SP;
  bendahara: PersonilP2SP;
  kepalaPelaksana: PersonilP2SP;
  keamanan: PersonilP2SP;
  perencana: PersonilP2SP;
  pengawas: PersonilP2SP;
  fasilitator: PersonilP2SP;
}

export interface ProjectInfo {
  namaProyek: string;
  nomorSuratTugas: string;
  lokasi: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  tahunAnggaran: string;
  totalPaguAnggaran: number;
  namaInstansi: string; // e.g. "SDN 01 Babakan" atau "Pemerintah Desa Babakan"
  namaKetuaTPK: string;
  namaBendahara: string;
  namaPelaksanaTeknis: string;
  namaPimpinan: string; // e.g. Kepala Sekolah / Direktur BUMDes
  nomorRekeningBank: string;
  namaBank: string;
  atasNamaRekening: string;
  targetMulai: string;
  targetSelesai: string;
  // Master Data Terintegrasi Sekolah & P2SP
  dataSekolah: DataSekolah;
  alamatLengkap: AlamatLengkap;
  timP2sp: TimP2SP;
}

export type NavTab =
  | 'overview'
  | 'data_master'
  | 'cashbooks'
  | 'progress'
  | 'technical_docs'
  | 'rab_sync'
  | 'receipts'
  | 'payroll'
  | 'lpj';

export interface SchoolWorkspaceProfile {
  npsn: string;
  namaSekolah: string;
  jenjang: JenjangSekolah;
  kabupatenKota: string;
  pin?: string; // 4-digit PIN access key
  isPinProtected: boolean;
  createdAt: string;
  lastActive: string;
  paguAnggaran: number;
  warnaTema?: string;
  catatanFasilitator?: string;
}

export interface ProjectFileBundle {
  format: 'SIAP-REVITA-PROJECT' | 'SIAP-REVITA-BACKUP';
  version: string;
  fileExtension: 'revita' | 'json';
  exportedAt: string;
  checksum?: string;
  school: {
    npsn: string;
    namaSekolah: string;
    jenjang: string;
    kabupatenKota: string;
  };
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

export interface SchoolWorkspaceMeta {
  id?: string;
  npsn: string;
  namaSekolah: string;
  jenjang: string;
  paguAnggaran: number;
  tahunAnggaran?: string;
  kabupaten?: string;
  hasPin?: boolean;
  pin?: string;
  pinHash?: string;
  lastModified?: string;
  createdAt?: string;
  kabupatenKota?: string;
  isPinProtected?: boolean;
  lastActive?: string;
  warnaTema?: string;
  catatanFasilitator?: string;
}

export interface RevitaProjectFile {
  fileSignature: string;
  version: string;
  exportedAt: string;
  npsn: string;
  namaSekolah: string;
  paguAnggaran: number;
  projectInfo: ProjectInfo;
  transactions: CashTransaction[];
  kwitansiList: Kwitansi[];
  payrollHarian: PayrollHarianBatch[];
  payrollBorongan: WorkerBoronganItem[];
  dailyLogs: DailyWorkLog[];
  weeklyRecaps: WeeklyRecap[];
  wbsList: WBSItem[];
  rabMaster: RABMasterItem[];
  standardWages: StandardWageRate[];
  standardMaterials: StandardMaterialPrice[];
  summaryCheck?: {
    totalPenerimaan: number;
    totalPengeluaran: number;
    saldoAkhir: number;
    progresFisik: number;
  };
}

export interface MultiSchoolBackupBundle {
  fileSignature: string;
  version: string;
  exportedAt: string;
  workspaces: SchoolWorkspaceMeta[];
  schoolsData: Record<string, any>;
}

