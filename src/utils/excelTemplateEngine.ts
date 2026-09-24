import * as XLSX from 'xlsx';
import { RABMasterItem, WeeklyProgressInput } from '../types';

/**
 * Technical Document Excel Template Generators & Parsers
 * Client-side only using 'xlsx' (SheetJS) - 100% Free, zero billing, zero server calls.
 */

// 1. Template RAB Induk (BOQ)
export const generateRABTemplateExcel = () => {
  const wsData = [
    ['RENCANA ANGGARAN BIAYA (RAB) - FORMAT STANDAR PROYEK REVITALISASI'],
    ['Petunjuk: Isi data uraian pekerjaan, kode analisa AHSP, volume, satuan, dan harga satuan.'],
    [],
    ['No', 'Kode Analisa', 'Divisi / Kelompok Pekerjaan', 'Uraian Item Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan (Rp)'],
    [1, 'A1', 'I. PEK. PERSIAPAN', 'Pek. Papan Nama Program + Papan Informasi', 1, 'ls', 800000],
    [2, 'A3', 'I. PEK. PERSIAPAN', 'Pengadaan Air Kerja / listrik kerja', 1, 'ls', 500000],
    [3, 'A4', 'I. PEK. PERSIAPAN', 'Penyediaan APD & Penerapan K3', 1, 'ls', 1316000],
    [4, 'A5', 'I. PEK. PERSIAPAN', 'Pembongkaran Dinding Tembok Bata Merah', 150.71, 'm2', 7460],
    [5, 'A10', 'I. PEK. PERSIAPAN', 'Pek. Pemasangan Bowplank', 36.96, 'm1', 40010],
    [6, 'B1', 'II. PEK. TANAH', 'Pek. Galian Tanah Pondasi', 9.22, 'm3', 131250],
    [7, 'B2', 'II. PEK. TANAH', 'Pek. Urugan Kembali bekas Galian', 4.61, 'm3', 52500],
    [8, 'B3', 'II. PEK. TANAH', 'Pek. Urugan Pasir Bawah Pondasi', 0.29, 'm3', 292500],
    [9, 'C5', 'IV. PEK. STRUKTUR', 'Pek. Beton Sloof Utama 1:2:3 (S1 20/30)', 1.06, 'm3', 1431950],
    [10, 'D1', 'IV. PEK. STRUKTUR', 'Pasang bekisting untuk sloof + bongkar', 21.12, 'm2', 197300],
    [11, 'C7', 'IV. PEK. STRUKTUR', 'Pembesian dengan besi polos atau ulir', 137.29, 'kg', 14660],
    [12, 'E1', 'V. PEK. DINDING', 'Pas. Dinding Batubata 1:6', 22.81, 'm2', 157570],
    [13, 'E7', 'V. PEK. DINDING', 'Pek. Plesteran Dinding 1 : 4', 149.19, 'm2', 74540],
    [14, 'E9', 'V. PEK. DINDING', 'Pek. Acian Tembok PC 1 : 4', 149.19, 'm2', 36120],
    [15, 'G30', 'VII. PEK. ATAP', 'Pek. Rangka Atap Baja Ringan (type Pelana)', 115.22, 'm2', 181500],
    [16, 'G16', 'VII. PEK. ATAP', 'Pek. Penutup Atap Genteng Metal 0,4mm', 115.22, 'm2', 217610],
    [17, 'H2', 'VIII. PEK. PLAFOND', 'Pek. Rangka hollow 40.40 modul 60x120', 186.18, 'm2', 89400],
    [18, 'H5', 'VIII. PEK. PLAFOND', 'Pek. Pasang Plafon PVC', 186.18, 'm2', 236990],
    [19, 'I5', 'IX. PEK. LANTAI', 'Pek. Lantai granit 60x60 cm', 111.57, 'm2', 301570],
    [20, 'J1', 'X. PEK. CAT', 'Pek. Cat Dinding Interior berikut plamir', 442.56, 'm2', 45060],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Lebar kolom
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 24 },
    { wch: 45 },
    { wch: 12 },
    { wch: 10 },
    { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RAB_Induk');
  XLSX.writeFile(wb, 'Template_RAB_Induk_Revitalisasi.xlsx');
};

// 2. Template Analisa Satuan Pekerjaan (AHSP SNI / Koefisien BOM)
export const generateAHSPTemplateExcel = () => {
  const wsData = [
    ['DAFTAR ANALISA HARGA SATUAN PEKERJAAN (AHSP / SNI)'],
    ['Petunjuk: Kolom Kategori diisi BAHAN atau UPAH. Koefisien menunjukkan konsumsi per 1 unit pekerjaan.'],
    [],
    ['Kode Analisa', 'Uraian Pekerjaan Induk', 'Tipe (BAHAN/UPAH)', 'Uraian Komponen', 'Koefisien', 'Satuan Komponen', 'Harga Satuan Dasar (Rp)'],
    ['E1', '1 M2 PASANGAN BATA MERAH 1:6', 'BAHAN', 'Bata Merah Bakar Kelas I', 71.91, 'bh', 1000],
    ['E1', '1 M2 PASANGAN BATA MERAH 1:6', 'BAHAN', 'Semen PC 50kg', 8.32, 'kg', 1500],
    ['E1', '1 M2 PASANGAN BATA MERAH 1:6', 'BAHAN', 'Pasir Pasang', 0.049, 'm3', 320000],
    ['E1', '1 M2 PASANGAN BATA MERAH 1:6', 'UPAH', 'Pekerja', 0.20, 'OH', 175000],
    ['E1', '1 M2 PASANGAN BATA MERAH 1:6', 'UPAH', 'Tukang Batu', 0.10, 'OH', 200000],
    ['C5', '1 M3 BETON BERTULANG 1:2:3', 'BAHAN', 'Semen PC 50kg', 368.0, 'kg', 1500],
    ['C5', '1 M3 BETON BERTULANG 1:2:3', 'BAHAN', 'Pasir Beton', 770.0, 'kg', 245.45],
    ['C5', '1 M3 BETON BERTULANG 1:2:3', 'BAHAN', 'Batu Split / Kerikil 2/3 cm', 1009.0, 'kg', 337.17],
    ['C5', '1 M3 BETON BERTULANG 1:2:3', 'UPAH', 'Pekerja', 1.65, 'OH', 175000],
    ['C5', '1 M3 BETON BERTULANG 1:2:3', 'UPAH', 'Tukang Batu', 0.275, 'OH', 200000],
    ['C7', '1 KG PEMBESIAN BESI BETON', 'BAHAN', 'Besi Beton Polos / Ulir', 1.05, 'kg', 10500],
    ['C7', '1 KG PEMBESIAN BESI BETON', 'BAHAN', 'Kawat Beton (Bendrat)', 0.028, 'kg', 30000],
    ['C7', '1 KG PEMBESIAN BESI BETON', 'UPAH', 'Tukang Besi', 0.007, 'OH', 200000],
    ['E7', '1 M2 PLESTERAN DINDING 1:4 (25 mm)', 'BAHAN', 'Semen PC 50kg', 6.24, 'kg', 1500],
    ['E7', '1 M2 PLESTERAN DINDING 1:4 (25 mm)', 'BAHAN', 'Pasir Pasang', 0.024, 'm3', 320000],
    ['E9', '1 M2 ACIAN DINDING PC', 'BAHAN', 'Semen PC 50kg', 3.25, 'kg', 1500],
    ['G30', '1 M2 RANGKA ATAP BAJA RINGAN', 'BAHAN', 'Baja Ringan Profil C75', 0.9603, 'btg', 138000],
    ['H5', '1 M2 PASANG PLAFON PVC', 'BAHAN', 'Plafon PVC L=20cm', 5.0, 'm1', 23000],
    ['H5', '1 M2 PASANG PLAFON PVC', 'BAHAN', 'Baut Screw 3/4', 11.0, 'bh', 1961.82],
    ['I5', '1 M2 LANTAI GRANIT 60x60 CM', 'BAHAN', 'Granit 60x60 cm', 3.0, 'bh', 62500],
    ['I5', '1 M2 LANTAI GRANIT 60x60 CM', 'BAHAN', 'Semen PC 50kg', 13.63, 'kg', 1500],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 35 },
    { wch: 16 },
    { wch: 30 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'AHSP_Koefisien');
  XLSX.writeFile(wb, 'Template_AHSP_Koefisien_Material.xlsx');
};

// 3. Template Standar Harga Upah & Bahan
export const generateHargaBahanUpahTemplateExcel = () => {
  const wsData = [
    ['DAFTAR HARGA SATUAN UPAH & BAHAN (STANDAR DAERAH / KABUPATEN)'],
    ['Petunjuk: Kolom Kategori diisi: UPAH_TENAGA, AGREGAT_KASAR, FINISHING, KAYU_BAJA, ELEKTRIKAL, SANITAIR'],
    [],
    ['No', 'Kategori', 'Uraian Jenis Bahan / Upah', 'Satuan', 'Harga Satuan (Rp)', 'Keterangan'],
    [1, 'UPAH_TENAGA', 'Mandor', 'org-hari', 302250, 'Standar UMK Kab. Bogor'],
    [2, 'UPAH_TENAGA', 'Kepala Tukang', 'org-hari', 250000, 'Standar UMK Kab. Bogor'],
    [3, 'UPAH_TENAGA', 'Tukang Batu', 'org-hari', 200000, 'Standar UMK Kab. Bogor'],
    [4, 'UPAH_TENAGA', 'Tukang Kayu', 'org-hari', 200000, 'Standar UMK Kab. Bogor'],
    [5, 'UPAH_TENAGA', 'Tukang Besi / Tukang Pipa', 'org-hari', 200000, 'Standar UMK Kab. Bogor'],
    [6, 'UPAH_TENAGA', 'Tukang Cat', 'org-hari', 200000, 'Standar UMK Kab. Bogor'],
    [7, 'UPAH_TENAGA', 'Tukang Listrik', 'org-hari', 200000, 'Standar UMK Kab. Bogor'],
    [8, 'UPAH_TENAGA', 'Pekerja (Laden)', 'org-hari', 175000, 'Standar UMK Kab. Bogor'],
    [9, 'AGREGAT_KASAR', 'Pasir Urug', 'm3', 200000, 'Kondisi sampai lokasi'],
    [10, 'AGREGAT_KASAR', 'Pasir Pasang', 'm3', 320000, 'Pasir ayak bersih'],
    [11, 'AGREGAT_KASAR', 'Pasir Beton', 'm3', 350000, 'Pasir cor'],
    [12, 'AGREGAT_KASAR', 'Batu Kali / Belah Belah', 'm3', 340000, 'Batu pondasi'],
    [13, 'AGREGAT_KASAR', 'Batu Kerikil / Split 2/3 cm', 'm3', 420000, 'Split cor beton'],
    [14, 'AGREGAT_KASAR', 'Bata Merah Bakar Kelas I', 'bh', 1000, 'Bakar oven pres'],
    [15, 'AGREGAT_KASAR', 'Hebel / Bata Ringan T: 7.5 cm', 'bh', 5500, 'Presisi'],
    [16, 'AGREGAT_KASAR', 'Hebel / Bata Ringan T: 10 cm', 'bh', 7800, 'Presisi'],
    [17, 'AGREGAT_KASAR', 'Semen PC (50 kg)', 'sak', 75000, 'Tipe I SNI (Gresik/Tiga Roda)'],
    [18, 'AGREGAT_KASAR', 'Semen Warna / Oker Nat', 'kg', 15000, 'Warna abu/putih'],
    [19, 'KAYU_BAJA', 'Besi Beton Polos Dia. 10 mm SNI', 'kg', 10500, 'Panjang 12 m'],
    [20, 'KAYU_BAJA', 'Besi Beton Polos Dia. 8 mm SNI', 'kg', 10500, 'Panjang 12 m'],
    [21, 'KAYU_BAJA', 'Kawat Beton (Bendrat)', 'kg', 30000, 'Roll kawat ikat'],
    [22, 'KAYU_BAJA', 'Baja Ringan Profil C 75', 'btg', 138000, 'Panjang 6 meter'],
    [23, 'KAYU_BAJA', 'Reng Baja Ringan 0.45mm', 'btg', 35000, 'Panjang 6 meter'],
    [24, 'FINISHING', 'Cat Tembok Interior (Vinilex/Setara)', 'kg', 30000, 'Galon / Pail'],
    [25, 'FINISHING', 'Plamir Tembok', 'kg', 25000, 'Zak / Kaleng'],
    [26, 'FINISHING', 'Granit 60 x 60 cm Polish', 'doz', 250000, 'Isi 4 keping (1.44 m2)'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 38 },
    { wch: 12 },
    { wch: 18 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar_Harga_Upah_Bahan');
  XLSX.writeFile(wb, 'Template_Daftar_Harga_Upah_Bahan.xlsx');
};

// 4. Template Laporan Mingguan & Progres Fisik (Sesuai Form Rekapitulasi & Mingguan yang Dilampirkan)
export const generateLaporanMingguanTemplateExcel = (currentRAB: RABMasterItem[]) => {
  const wsData: (string | number)[][] = [
    ['LAPORAN MINGGUAN & PRESTASI PROGRES FISIK PEKERJAAN'],
    ['Petunjuk: Isi hanya kolom "Volume Minggu Ini" atau "Bobot Minggu Ini (%)". Sistem akan menghitung otomatis kumulatifnya.'],
    ['Minggu Ke: 4', 'Periode: 27 Juli 2026 s/d 02 Agustus 2026'],
    [],
    [
      'Kode',
      'Divisi',
      'Uraian Pekerjaan',
      'Volume RAB',
      'Satuan',
      'Harga Satuan (Rp)',
      'Total Biaya RAB (Rp)',
      'Bobot RAB (%)',
      'Progres Minggu Lalu (%)',
      'Volume Minggu Ini',
      'Bobot Minggu Ini (%)',
    ],
  ];

  currentRAB.forEach((item) => {
    wsData.push([
      item.kode,
      item.kategori || 'PEKERJAAN',
      item.namaPekerjaan,
      item.volumeRAB,
      item.satuan,
      Math.round(item.biayaRAB / (item.volumeRAB || 1)),
      item.biayaRAB,
      item.bobotRencana,
      item.progresRealisasi,
      0, // default volume minggu ini
      0, // default bobot minggu ini
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 42 },
    { wch: 12 },
    { wch: 8 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Mingguan');
  XLSX.writeFile(wb, 'Template_Laporan_Progres_Mingguan.xlsx');
};

// Parser File Excel / CSV Client-Side
export interface ParsedWeeklyProgressRow {
  kode: string;
  namaPekerjaan: string;
  volumeMingguIni: number;
  bobotMingguIniPersen: number;
}

export const parseWeeklyProgressFile = async (
  file: File
): Promise<{ mingguKe?: number; rentangTanggal?: string; rows: ParsedWeeklyProgressRow[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const rows: ParsedWeeklyProgressRow[] = [];
        let headerRowIndex = -1;

        // Cari header
        for (let i = 0; i < json.length; i++) {
          const r = json[i];
          if (r && r.some((cell) => typeof cell === 'string' && (cell.toLowerCase().includes('uraian') || cell.toLowerCase().includes('kode')))) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 4; // fallback
        }

        for (let i = headerRowIndex + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length < 3) continue;

          const kode = String(row[0] || '').trim();
          const nama = String(row[2] || row[1] || '').trim();
          if (!nama && !kode) continue;

          // Cari kolom Volume Minggu Ini dan Bobot Minggu Ini
          // Sesuai template: index 9 adalah Volume Minggu Ini, index 10 adalah Bobot Minggu Ini
          const volMingguIni = parseFloat(row[9]) || 0;
          const bobotMingguIni = parseFloat(row[10]) || 0;

          if (volMingguIni > 0 || bobotMingguIni > 0) {
            rows.push({
              kode,
              namaPekerjaan: nama,
              volumeMingguIni: volMingguIni,
              bobotMingguIniPersen: bobotMingguIni,
            });
          }
        }

        resolve({
          mingguKe: 4,
          rentangTanggal: '27 Juli 2026 s/d 02 Agustus 2026',
          rows,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

// Parser File RAB Induk (.xlsx / .csv)
export const parseRABFile = async (
  file: File
): Promise<{ success: boolean; items: RABMasterItem[]; message?: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let headerRowIndex = -1;
        for (let i = 0; i < json.length; i++) {
          const r = json[i];
          if (
            r &&
            r.some(
              (cell) =>
                typeof cell === 'string' &&
                (cell.toLowerCase().includes('uraian') ||
                  cell.toLowerCase().includes('pekerjaan') ||
                  cell.toLowerCase().includes('kode'))
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 3;
        }

        const items: RABMasterItem[] = [];
        let runningCategory = 'PEKERJAAN';

        for (let i = headerRowIndex + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length < 3) continue;

          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();
          const col3 = String(row[3] || '').trim();

          // Deteksi judul bab/divisi jika hanya ada uraian tanpa volume (contoh: "I. PEK. PERSIAPAN")
          if ((col0.match(/^[I|V|X]+\./i) || col1.match(/^[I|V|X]+\./i)) && (!row[4] || isNaN(parseFloat(row[4])))) {
            runningCategory = col2 || col1 || col0;
            continue;
          }

          const kode = col1 || (col0.length <= 6 ? col0 : `WBS-${i}`);
          const divisi = col2 && isNaN(parseFloat(col2)) && col2.length > 3 ? col2 : runningCategory;
          const nama = col3 || col2 || col1;
          if (!nama || nama.toLowerCase().includes('total') || nama.toLowerCase().includes('jumlah')) continue;

          // Parsing volume, satuan, harga
          const volume = parseFloat(row[4]) || parseFloat(row[3]) || 1;
          const satuan = String(row[5] || row[4] || 'ls').trim();
          const hargaSatuan = parseFloat(row[6]) || parseFloat(row[5]) || 0;
          const biayaRAB = hargaSatuan > 0 ? Math.round(volume * hargaSatuan) : parseFloat(row[7]) || 1000000;

          items.push({
            id: `wbs-up-${Date.now()}-${i}`,
            kode: kode.length > 0 ? kode : `P.${items.length + 1}`,
            namaPekerjaan: nama,
            kategori: divisi || 'PEKERJAAN',
            bobotRencana: 0, // Akan dihitung proporsional dari total biaya nanti
            progresRealisasi: 0,
            volumeRAB: volume,
            satuan: satuan || 'unit',
            biayaRAB: biayaRAB,
            biayaRealisasi: 0,
            materialComponents: [], // Diisi default atau sinkron dengan AHSP
          });
        }

        // Kalkulasi bobot rencana (%)
        const totalPagu = items.reduce((acc, curr) => acc + curr.biayaRAB, 0);
        if (totalPagu > 0) {
          items.forEach((item) => {
            item.bobotRencana = Math.round((item.biayaRAB / totalPagu) * 10000) / 100;
          });
        }

        resolve({
          success: true,
          items,
          message: `Berhasil mengekstrak ${items.length} item pekerjaan RAB (Total Pagu: Rp ${totalPagu.toLocaleString('id-ID')}).`,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

// Parser File AHSP SNI (.xlsx / .csv)
export interface ParsedAHSPRow {
  kodeAnalisa: string;
  namaPekerjaan: string;
  tipe: 'BAHAN' | 'UPAH';
  uraianKomponen: string;
  koefisien: number;
  satuan: string;
  hargaDasar: number;
}

export const parseAHSPFile = async (
  file: File
): Promise<{ success: boolean; rows: ParsedAHSPRow[]; message?: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let headerRowIndex = -1;
        for (let i = 0; i < json.length; i++) {
          const r = json[i];
          if (
            r &&
            r.some(
              (cell) =>
                typeof cell === 'string' &&
                (cell.toLowerCase().includes('koefisien') ||
                  cell.toLowerCase().includes('komponen') ||
                  cell.toLowerCase().includes('analisa'))
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 3;
        }

        const rows: ParsedAHSPRow[] = [];
        let currentKode = 'A1';
        let currentNama = '';

        for (let i = headerRowIndex + 1; i < json.length; i++) {
          const r = json[i];
          if (!r || r.length < 4) continue;

          const col0 = String(r[0] || '').trim();
          const col1 = String(r[1] || '').trim();
          if (col0) currentKode = col0;
          if (col1 && isNaN(parseFloat(col1))) currentNama = col1;

          const tipeStr = String(r[2] || '').trim().toUpperCase();
          const tipe: 'BAHAN' | 'UPAH' = tipeStr.includes('UPAH') ? 'UPAH' : 'BAHAN';
          const uraianKomponen = String(r[3] || r[2] || '').trim();
          if (!uraianKomponen || uraianKomponen.toLowerCase().includes('jumlah')) continue;

          const koef = parseFloat(r[4]) || 0;
          const sat = String(r[5] || 'bh').trim();
          const harga = parseFloat(r[6]) || 0;

          if (koef > 0) {
            rows.push({
              kodeAnalisa: currentKode,
              namaPekerjaan: currentNama,
              tipe,
              uraianKomponen,
              koefisien: koef,
              satuan: sat,
              hargaDasar: harga,
            });
          }
        }

        resolve({
          success: true,
          rows,
          message: `Berhasil mengekstrak ${rows.length} koefisien analisa AHSP.`,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

