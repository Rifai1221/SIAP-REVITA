import * as XLSX from 'xlsx';
import { StandardWageRate } from '../types';

export interface WageTemplateInfo {
  namaSekolah?: string;
  kabupatenKota?: string;
  provinsi?: string;
  tahunAnggaran?: string | number;
  namaPerencana?: string;
  namaKetuaP2SP?: string;
}

export const OFFICIAL_BOGOR_WAGES_2025: {
  no: number;
  role: string;
  satuan: string;
  harga: number;
}[] = [
  { no: 1, role: 'Mandor', satuan: 'Hari', harga: 211379 },
  { no: 2, role: 'Kepala Tukang', satuan: 'Hari', harga: 199782 },
  { no: 3, role: 'Tukang Besi', satuan: 'Hari', harga: 183834 },
  { no: 4, role: 'Tukang Kayu', satuan: 'Hari', harga: 183834 },
  { no: 5, role: 'Tukang Batu', satuan: 'Hari', harga: 183834 },
  { no: 6, role: 'Tukang Cat', satuan: 'Hari', harga: 183834 },
  { no: 7, role: 'Kepala Tukang Listrik / Plumbing', satuan: 'Hari', harga: 199782 },
  { no: 8, role: 'Tukang Listrik / Plumbing', satuan: 'Hari', harga: 183834 },
  { no: 9, role: 'Pekerja', satuan: 'Hari', harga: 174748 },
  { no: 10, role: 'Tukang Gali', satuan: 'Hari', harga: 183834 },
  { no: 11, role: 'Juru Ukur', satuan: 'Hari', harga: 200000 },
  { no: 12, role: 'Pembantu Juru Ukur', satuan: 'Hari', harga: 190000 },
  { no: 13, role: 'Tenaga Terampil Operator', satuan: 'Hari', harga: 250000 },
  { no: 14, role: 'Tenaga ahli pratama', satuan: 'Hari', harga: 254864 },
  { no: 15, role: 'Tukang Kaca', satuan: 'Hari', harga: 183834 },
  { no: 16, role: 'Tukang Lantai', satuan: 'Hari', harga: 183834 },
];

/**
 * Generate Excel Template Standar Upah persis seperti berkas fisik yang diupload user
 */
export const generateStandardWagesTemplateExcel = (
  info?: WageTemplateInfo,
  currentWages?: StandardWageRate[]
) => {
  const wb = XLSX.utils.book_new();

  const namaSekolah = info?.namaSekolah || 'TK NURIADEEN CENDEKIA';
  const kabKota = info?.kabupatenKota ? info.kabupatenKota.toUpperCase() : 'KAB/KOTA BOGOR';
  const provinsi = info?.provinsi ? info.provinsi.toUpperCase() : 'PROPINSI JAWA BARAT';
  const tahun = info?.tahunAnggaran ? String(info.tahunAnggaran) : '2025';
  const perencana = info?.namaPerencana || 'DZIKRY IMAM MAJID,ST';
  const ketuaP2sp = info?.namaKetuaP2SP || 'DZIKRY IMAM MAJID,ST';

  // Siapkan data baris upah
  const wagesList =
    currentWages && currentWages.length > 0
      ? currentWages.map((w, idx) => ({
          no: idx + 1,
          role: w.role,
          satuan: w.satuan || 'Hari',
          harga: w.harga,
        }))
      : OFFICIAL_BOGOR_WAGES_2025;

  // Sheet 1: Format Resmi Dokumen Fisik
  const ws1Data: (string | number)[][] = [
    ['DAFTAR HARGA SATUAN UPAH'],
    [`${kabKota} ${provinsi}`],
    [`PROYEK PEMBANGUNAN PER TAHUN ${tahun}`],
    [],
    ['NO.', 'U R A I A N', 'SATUAN', 'HARGA (Rp.)'],
  ];

  wagesList.forEach((item) => {
    ws1Data.push([item.no, item.role, item.satuan, item.harga]);
  });

  // Tanda Tangan & Footer
  ws1Data.push([]);
  ws1Data.push(['', '', namaSekolah, '']);
  ws1Data.push([]);
  ws1Data.push([]);
  ws1Data.push(['', '', perencana, '']);
  ws1Data.push(['', '', 'Perencana', '']);
  ws1Data.push([]);
  ws1Data.push(['Daftar Analisa Pekerjaan', '', '', 'Hal : 1']);

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 8 },  // NO.
    { wch: 38 }, // U R A I A N
    { wch: 14 }, // SATUAN
    { wch: 20 }, // HARGA (Rp.)
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Daftar_Harga_Satuan_Upah');

  // Sheet 2: Lembar Pengesahan P2SP (Page 2 dokumen fisik)
  const ws2Data: (string | number)[][] = [
    [namaSekolah],
    [`${kabKota} ${provinsi}`],
    [],
    ['Nama Ketua P2SP'],
    [],
    [`Bogor, .............................. ${tahun}`],
    [],
    [],
    [ketuaP2sp],
    [namaSekolah],
    [],
    ['Daftar Analisa Pekerjaan', '', '', 'Hal : 2'],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [{ wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Lembar_Pengesahan_P2SP');

  // Sheet 3: Petunjuk Pengisian
  const ws3Data: (string | number)[][] = [
    ['PANDUAN & PETUNJUK PENGISIAN TEMPLATE STANDAR UPAH TUKANG'],
    [],
    ['1. Template ini dibuat sesuai format fisik "DAFTAR HARGA SATUAN UPAH".'],
    ['2. Anda dapat mengubah nominal HARGA (Rp.) pada kolom 4 sesuai standar upah riil di wilayah sekolah Anda.'],
    ['3. Anda juga dapat menambahkan baris baru dengan mengisi Nomor, Uraian Profesi, Satuan (Hari/HOK), dan Harga.'],
    ['4. Simpan berkas ini setelah selesai disunting (.xlsx / .xls / .csv).'],
    ['5. Gunakan tombol "Upload Format Standar" di menu Standar Upah untuk menerapkan otomatis ke sistem.'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Petunjuk');

  const cleanSchool = namaSekolah.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Template_Daftar_Harga_Satuan_Upah_${cleanSchool}.xlsx`);
};

/**
 * Parser untuk membaca file upload Standar Upah Tukang (.xlsx, .xls, .csv)
 */
export const parseStandardWagesFile = async (
  file: File
): Promise<{ success: boolean; wages: StandardWageRate[]; message: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Cari baris header tabel (yang mengandung 'uraian' atau 'satuan' atau 'harga')
        let headerRowIndex = -1;
        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          if (
            row &&
            row.some(
              (cell) =>
                typeof cell === 'string' &&
                (cell.toLowerCase().includes('uraian') ||
                  cell.toLowerCase().includes('profesi') ||
                  (cell.toLowerCase().includes('harga') && !cell.toLowerCase().includes('daftar')))
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 4; // Fallback sesuai template baris ke-5 (index 4)
        }

        const wages: StandardWageRate[] = [];

        for (let i = headerRowIndex + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length < 2) continue;

          // Periksa apakah baris tanda tangan / footer
          const joined = row.map((c) => String(c || '').toLowerCase()).join(' ');
          if (
            joined.includes('hal :') ||
            joined.includes('daftar analisa') ||
            joined.includes('perencana') ||
            joined.includes('p2sp') ||
            joined.includes('ketua') ||
            joined.includes('tk ') ||
            joined.includes('sd ') ||
            joined.includes('smp ')
          ) {
            continue;
          }

          // Cari kolom uraian (profesi) dan harga
          let role = '';
          let satuan = 'Hari';
          let harga = 0;

          // Format template: Col 0: No, Col 1: Uraian, Col 2: Satuan, Col 3: Harga
          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();
          const col3 = String(row[3] || '').trim();

          if (col1 && isNaN(parseFloat(col1.replace(/,/g, '')))) {
            role = col1;
            satuan = col2 || 'Hari';
            const rawHarga = col3 || col2;
            harga = parseFloat(String(rawHarga).replace(/[^0-9.-]/g, '')) || 0;
          } else if (col0 && isNaN(parseFloat(col0))) {
            role = col0;
            satuan = col1 || 'Hari';
            harga = parseFloat(String(col2).replace(/[^0-9.-]/g, '')) || 0;
          }

          // Normalisasi harga jika ada desimal Indonesia
          if (harga > 0 && role) {
            wages.push({
              id: `wage-up-${Date.now()}-${i}`,
              role,
              satuan: satuan || 'Hari',
              harga,
              desc: `Standar upah ${role} (${satuan})`,
            });
          }
        }

        if (wages.length === 0) {
          resolve({
            success: false,
            wages: [],
            message: 'Tidak ada baris upah yang terbaca. Pastikan terdapat kolom Uraian dan Harga.',
          });
          return;
        }

        resolve({
          success: true,
          wages,
          message: `Berhasil mengunggah ${wages.length} standar upah tenaga kerja sesuai format berkas!`,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
