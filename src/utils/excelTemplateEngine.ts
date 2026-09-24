import * as XLSX from 'xlsx';
import { RABMasterItem, WeeklyProgressInput } from '../types';
import { getBerkas001StructuredData } from './berkas001RABTemplateData';
import { BERKAS_002_AHSP_DATA, getBerkas002FlatBOMRows } from './berkas002AHSPTemplateData';
import { generateOfficialWeeklyRecapTemplateExcel } from './weeklyRecapTemplateEngine';
import { terbilangRupiah } from './terbilang';

/**
 * Technical Document Excel Template Generators & Parsers
 * Client-side only using 'xlsx' (SheetJS) - 100% Free, zero billing, zero server calls.
 */

export interface RABTemplateProjectInfo {
  namaSekolah?: string;
  npsn?: string;
  desaKelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  namaProyek?: string;
  tahunAnggaran?: number | string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  ketuaPelaksana?: string;
  totalPaguAnggaran?: number;
  dataSekolah?: any;
  alamatLengkap?: any;
  timP2sp?: any;
  namaInstansi?: string;
  namaPimpinan?: string;
  namaKetuaTPK?: string;
  desa?: string;
  kabupaten?: string;
}

// 1. Template RAB Induk (BOQ) - Berkas 001 Standar Revitalisasi
export const generateRABTemplateExcel = (
  projectInfo?: RABTemplateProjectInfo | any,
  currentRAB?: RABMasterItem[],
  mode: 'standard_001' | 'current' | 'blank' = 'standard_001'
) => {
  const namaSekolah =
    projectInfo?.dataSekolah?.namaSekolah ||
    projectInfo?.namaSekolah ||
    projectInfo?.namaInstansi ||
    'SD/SMP NEGERI PELAKSANA REVITALISASI';
  const npsn = projectInfo?.dataSekolah?.npsn || projectInfo?.npsn || '20260001';
  const desa =
    projectInfo?.alamatLengkap?.desaKelurahan ||
    projectInfo?.desaKelurahan ||
    projectInfo?.desa ||
    'Babakan';
  const kec = projectInfo?.alamatLengkap?.kecamatan || projectInfo?.kecamatan || 'Sukaraja';
  const kab =
    projectInfo?.alamatLengkap?.kabupatenKota ||
    projectInfo?.kabupatenKota ||
    projectInfo?.kabupaten ||
    'Kabupaten Bogor';
  const prov = projectInfo?.alamatLengkap?.provinsi || projectInfo?.provinsi || 'Jawa Barat';
  const alamat = `${desa}, Kec. ${kec}, ${kab}, Prov. ${prov}`;
  const namaProyek = projectInfo?.namaProyek || 'Rehabilitasi Ruang Kelas & Prasarana Pembelajaran Sekolah';
  const tahunAnggaran = projectInfo?.tahunAnggaran || 2026;
  const kepalaSekolah =
    projectInfo?.timP2sp?.penanggungJawab?.nama ||
    projectInfo?.namaKepalaSekolah ||
    projectInfo?.namaPimpinan ||
    'Drs. H. Ahmad Dahlan, M.Pd.';
  const nipKepalaSekolah =
    projectInfo?.timP2sp?.penanggungJawab?.nipNik ||
    projectInfo?.nipKepalaSekolah ||
    '19750812 200212 1 003';
  const ketuaTPK =
    projectInfo?.timP2sp?.ketuaP2sp?.nama ||
    projectInfo?.ketuaPelaksana ||
    projectInfo?.namaKetuaTPK ||
    'Bambang Irawan, S.T.';

  const wb = XLSX.utils.book_new();

  // Ambil dataset standar Berkas 001
  const standardData = getBerkas001StructuredData();

  // SHEET 1: 001_Formulir_RAB
  const ws1Data: (string | number)[][] = [
    ['KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI'],
    ['DIREKTORAT JENDERAL PENDIDIKAN ANAK USIA DINI, PENDIDIKAN DASAR, DAN PENDIDIKAN MENENGAH'],
    ['PROGRAM BANTUAN REVITALISASI / REHABILITASI SATUAN PENDIDIKAN'],
    ['FORMULIR 001 - RENCANA ANGGARAN BIAYA (RAB) / BILL OF QUANTITY (BOQ)'],
    [],
    ['Nama Satuan Pendidikan', ':', namaSekolah, '', '', 'Tahun Anggaran', ':', String(tahunAnggaran), ''],
    ['NPSN / Identitas', ':', npsn, '', '', 'Sumber Anggaran', ':', 'DAK Fisik / Bantuan Revitalisasi', ''],
    ['Lokasi Proyek', ':', alamat, '', '', 'Nama Kegiatan', ':', namaProyek, ''],
    [],
    [
      'NO',
      'KODE ANALISA',
      'DIVISI / KELOMPOK PEKERJAAN',
      'URAIAN ITEM PEKERJAAN',
      'VOLUME',
      'SATUAN',
      'HARGA SATUAN (Rp)',
      'JUMLAH HARGA (Rp)',
      'BOBOT (%)',
    ],
  ];

  let totalRAB = 0;

  if (mode === 'current' && currentRAB && currentRAB.length > 0) {
    // Mode export RAB saat ini
    totalRAB = currentRAB.reduce((acc, curr) => acc + curr.biayaRAB, 0);
    let runningCategory = '';
    let itemCounter = 1;

    currentRAB.forEach((it) => {
      const cat = it.kategori || 'PEKERJAAN';
      if (cat !== runningCategory) {
        runningCategory = cat;
        ws1Data.push(['', '', runningCategory, runningCategory, '', '', '', '', '']);
      }
      const hargaSatuan = it.volumeRAB > 0 ? Math.round(it.biayaRAB / it.volumeRAB) : it.biayaRAB;
      const bobot = totalRAB > 0 ? Math.round((it.biayaRAB / totalRAB) * 10000) / 100 : it.bobotRencana;
      ws1Data.push([
        itemCounter++,
        it.kode,
        runningCategory,
        it.namaPekerjaan,
        it.volumeRAB,
        it.satuan,
        hargaSatuan,
        it.biayaRAB,
        bobot,
      ]);
    });
  } else if (mode === 'blank') {
    // Mode blanko kosong dengan struktur divisi
    totalRAB = 0;
    let itemCounter = 1;
    standardData.divisions.forEach((div) => {
      ws1Data.push(['', '', div.divisi, div.divisi, '', '', '', '', '']);
      ws1Data.push([
        itemCounter++,
        `${div.romawi}.1`,
        div.divisi,
        `Item Contoh pada ${div.judul}`,
        1,
        'Ls',
        0,
        0,
        0,
      ]);
    });
  } else {
    // Default: Mode Berkas 001 RAB Standar Lengkap (56 items, 12 divisi)
    totalRAB = standardData.totalCost;
    standardData.divisions.forEach((div) => {
      // Header divisi
      ws1Data.push(['', '', div.divisi, div.divisi, '', '', '', '', '']);

      div.items.forEach((it) => {
        ws1Data.push([
          it.no,
          it.kode,
          div.divisi,
          it.nama,
          it.volume,
          it.satuan,
          it.hargaSatuan,
          it.volume * it.hargaSatuan,
          it.bobot,
        ]);
      });

      // Subtotal per divisi
      ws1Data.push([
        '',
        '',
        '',
        `SUBTOTAL ${div.divisi}`,
        '',
        '',
        '',
        div.subtotal,
        div.bobotSubtotal,
      ]);
    });
  }

  // Footer Total & Terbilang
  ws1Data.push([]);
  ws1Data.push([
    '',
    '',
    '',
    'TOTAL RENCANA ANGGARAN BIAYA (RAB)',
    '',
    '',
    '',
    totalRAB,
    100.0,
  ]);
  ws1Data.push(['Terbilang:', terbilangRupiah(totalRAB), '', '', '', '', '', '', '']);
  ws1Data.push([]);

  // Lembar Pengesahan
  ws1Data.push([
    '',
    '',
    'Mengetahui / Menyetujui:',
    '',
    '',
    '',
    '',
    'Dibuat & Disusun Oleh:',
    '',
  ]);
  ws1Data.push([
    '',
    '',
    'Kepala Satuan Pendidikan',
    '',
    '',
    '',
    '',
    'Tim Pelaksana Kegiatan (TPK)',
    '',
  ]);
  ws1Data.push([
    '',
    '',
    namaSekolah,
    '',
    '',
    '',
    '',
    'Ketua Pelaksana / Tim Teknis',
    '',
  ]);
  ws1Data.push([]);
  ws1Data.push([]);
  ws1Data.push([
    '',
    '',
    `( ${kepalaSekolah} )`,
    '',
    '',
    '',
    '',
    `( ${ketuaTPK} )`,
    '',
  ]);
  ws1Data.push([
    '',
    '',
    `NIP. ${nipKepalaSekolah}`,
    '',
    '',
    '',
    '',
    'NIP/NIK. -',
    '',
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 6 }, // NO
    { wch: 15 }, // KODE ANALISA
    { wch: 32 }, // DIVISI
    { wch: 50 }, // URAIAN ITEM PEKERJAAN
    { wch: 12 }, // VOLUME
    { wch: 10 }, // SATUAN
    { wch: 18 }, // HARGA SATUAN
    { wch: 22 }, // JUMLAH HARGA
    { wch: 12 }, // BOBOT
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '001_Formulir_RAB');

  // SHEET 2: Rekapitulasi_RAB
  const ws2Data: (string | number)[][] = [
    ['REKAPITULASI RENCANA ANGGARAN BIAYA (RAB) - BERKAS 001'],
    ['PROGRAM REVITALISASI / REHABILITASI SATUAN PENDIDIKAN'],
    [],
    ['Nama Satuan Pendidikan', ':', namaSekolah],
    ['NPSN / Identitas', ':', npsn],
    ['Kegiatan', ':', namaProyek],
    ['Tahun Anggaran', ':', String(tahunAnggaran)],
    [],
    ['NO', 'DIVISI / URAIAN KELOMPOK PEKERJAAN', 'JUMLAH BIAYA (Rp)', 'BOBOT (%)'],
  ];

  standardData.divisions.forEach((div, idx) => {
    ws2Data.push([idx + 1, div.divisi, div.subtotal, div.bobotSubtotal]);
  });

  ws2Data.push([]);
  ws2Data.push(['', 'TOTAL KESELURUHAN BIAYA RAB', totalRAB, 100.0]);
  ws2Data.push(['Terbilang:', terbilangRupiah(totalRAB), '', '']);
  ws2Data.push([]);
  ws2Data.push(['', 'Menyetujui,', '', 'Disusun Oleh,']);
  ws2Data.push(['', 'Kepala Satuan Pendidikan', '', 'Ketua Tim Pelaksana (TPK)']);
  ws2Data.push([]);
  ws2Data.push([]);
  ws2Data.push(['', `( ${kepalaSekolah} )`, '', `( ${ketuaTPK} )`]);
  ws2Data.push(['', `NIP. ${nipKepalaSekolah}`, '', 'NIP/NIK. -']);

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 42 },
    { wch: 22 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Rekapitulasi_RAB');

  // SHEET 3: Petunjuk_Pengisian
  const ws3Data: (string | number)[][] = [
    ['PETUNJUK PENGISIAN & PANDUAN IMPORT BERKAS 001 RAB'],
    [],
    ['1. Berkas ini adalah format resmi Dokumen 001 RAB Revitalisasi Satuan Pendidikan.'],
    ['2. Anda dapat mengubah angka Volume dan Harga Satuan sesuai kondisi riil dan dokumen lelang/swakelola sekolah.'],
    ['3. Pastikan kolom urutan (NO, KODE ANALISA, DIVISI, URAIAN, VOLUME, SATUAN, HARGA SATUAN) tidak diubah letaknya.'],
    ['4. Baris Judul Divisi (contoh: I. PEKERJAAN PERSIAPAN) otomatis dideteksi sebagai kelompok pekerjaan di sistem.'],
    ['5. Baris subtotal dan total akan dihitung dan disinkronkan kembali secara otomatis saat diunggah ke aplikasi.'],
    ['6. Setelah selesai diedit, simpan file ini dan gunakan tombol "Upload Berkas RAB (.xlsx)" di menu Pusat Berkas Teknis.'],
    ['7. Hasil upload akan langsung terintegrasi dengan Buku Kas Umum (BKU), modul Laporan Mingguan, dan Kwitansi Material.'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Petunjuk_Pengisian');

  const cleanSchool = (namaSekolah || 'Revitalisasi').replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Template_Berkas_001_RAB_${cleanSchool}.xlsx`);
};

// 2. Template Analisa Satuan Pekerjaan (Berkas 002 AHSP / SNI Koefisien BOM)
export const generateAHSPTemplateExcel = (projectInfo?: RABTemplateProjectInfo) => {
  const wb = XLSX.utils.book_new();

  const namaSekolah =
    projectInfo?.namaSekolah ||
    projectInfo?.dataSekolah?.namaSekolah ||
    projectInfo?.namaInstansi ||
    'SD/SMP NEGERI PELAKSANA REVITALISASI';
  const npsn = projectInfo?.npsn || projectInfo?.dataSekolah?.npsn || '20260001';
  const desa =
    projectInfo?.desaKelurahan ||
    projectInfo?.alamatLengkap?.desaKelurahan ||
    projectInfo?.desa ||
    'Babakan';
  const kec =
    projectInfo?.kecamatan ||
    projectInfo?.alamatLengkap?.kecamatan ||
    'Sukaraja';
  const kab =
    projectInfo?.kabupatenKota ||
    projectInfo?.alamatLengkap?.kabupatenKota ||
    projectInfo?.kabupaten ||
    'Kabupaten Bogor';
  const prov =
    projectInfo?.provinsi ||
    projectInfo?.alamatLengkap?.provinsi ||
    'Jawa Barat';
  const alamat = `${desa}, Kec. ${kec}, ${kab}, Prov. ${prov}`;
  const namaProyek =
    projectInfo?.namaProyek ||
    'Rehabilitasi Ruang Kelas & Prasarana Pembelajaran Sekolah';
  const tahunAnggaran = projectInfo?.tahunAnggaran || '2026';
  const kepalaSekolah =
    projectInfo?.namaKepalaSekolah ||
    projectInfo?.timP2sp?.penanggungJawab?.nama ||
    projectInfo?.namaPimpinan ||
    'Drs. H. Ahmad Dahlan, M.Pd.';
  const nipKepalaSekolah =
    projectInfo?.nipKepalaSekolah ||
    projectInfo?.timP2sp?.penanggungJawab?.nipNik ||
    '19750812 200212 1 003';
  const ketuaTPK =
    projectInfo?.ketuaPelaksana ||
    projectInfo?.timP2sp?.ketuaP2sp?.nama ||
    projectInfo?.namaKetuaTPK ||
    'Bambang Irawan, S.T.';

  // SHEET 1: 002_Formulir_AHSP
  const ws1Data: (string | number)[][] = [
    ['KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH'],
    ['DIREKTORAT JENDERAL PENDIDIKAN ANAK USIA DINI, PENDIDIKAN DASAR, DAN MENENGAH'],
    ['PROGRAM REVITALISASI / BANTUAN FISIK SATUAN PENDIDIKAN'],
    [],
    ['BERKAS 002: ANALISA HARGA SATUAN PEKERJAAN (AHSP)'],
    ['STANDAR NASIONAL INDONESIA (SNI) & PERMEN PUPR BIDANG CIPTA KARYA'],
    [],
    ['Nama Satuan Pendidikan', ':', namaSekolah],
    ['NPSN / Identitas', ':', npsn],
    ['Alamat Lokasi', ':', alamat],
    ['Nama Kegiatan / Pekerjaan', ':', namaProyek],
    ['Tahun Anggaran', ':', String(tahunAnggaran)],
    [],
  ];

  BERKAS_002_AHSP_DATA.forEach((ahsp, idx) => {
    ws1Data.push([
      `ANALISA NO. ${idx + 1} (${ahsp.kode}): ${ahsp.namaPekerjaan.toUpperCase()}`,
      '',
      '',
      '',
      '',
      `SATUAN: 1 ${ahsp.satuanPekerjaan}`,
    ]);
    ws1Data.push(['NO', 'URAIAN KOMPONEN', 'KODE / SATUAN', 'KOEFISIEN', 'HARGA DASAR (Rp)', 'JUMLAH HARGA (Rp)']);

    // A. TENAGA KERJA
    ws1Data.push(['A', 'TENAGA KERJA (UPAH)', '', '', '', '']);
    const upahItems = ahsp.komponen.filter((k) => k.kategori === 'UPAH');
    upahItems.forEach((u, uIdx) => {
      ws1Data.push([
        uIdx + 1,
        u.uraian,
        u.satuan,
        u.koefisien,
        u.hargaDasar,
        u.jumlah,
      ]);
    });
    ws1Data.push(['', 'JUMLAH TENAGA KERJA (A)', '', '', '', ahsp.totalUpah]);

    // B. BAHAN
    ws1Data.push(['B', 'BAHAN / MATERIAL', '', '', '', '']);
    const bahanItems = ahsp.komponen.filter((k) => k.kategori === 'BAHAN');
    bahanItems.forEach((b, bIdx) => {
      ws1Data.push([
        bIdx + 1,
        b.uraian,
        b.satuan,
        b.koefisien,
        b.hargaDasar,
        b.jumlah,
      ]);
    });
    ws1Data.push(['', 'JUMLAH BAHAN / MATERIAL (B)', '', '', '', ahsp.totalBahan]);

    // C. PERALATAN
    ws1Data.push(['C', 'PERALATAN (ALAT BANTU)', '', '', '', '']);
    const alatItems = ahsp.komponen.filter((k) => k.kategori === 'ALAT');
    if (alatItems.length > 0) {
      alatItems.forEach((al, aIdx) => {
        ws1Data.push([aIdx + 1, al.uraian, al.satuan, al.koefisien, al.hargaDasar, al.jumlah]);
      });
      ws1Data.push(['', 'JUMLAH PERALATAN (C)', '', '', '', ahsp.totalAlat]);
    } else {
      ws1Data.push(['-', 'Tidak menggunakan alat berat / alat bantu sewa', 'Ls', 0, 0, 0]);
      ws1Data.push(['', 'JUMLAH PERALATAN (C)', '', '', '', 0]);
    }

    // D. JUMLAH TOTAL HARGA SATUAN
    ws1Data.push(['D', `JUMLAH HARGA SATUAN PEKERJAAN (A + B + C) per 1 ${ahsp.satuanPekerjaan}`, '', '', '', ahsp.hargaSatuan]);
    ws1Data.push([]);
  });

  // Lembar Pengesahan
  ws1Data.push([
    '',
    '',
    'Mengetahui / Menyetujui:',
    '',
    'Dibuat & Disusun Oleh:',
    '',
  ]);
  ws1Data.push([
    '',
    '',
    'Kepala Satuan Pendidikan',
    '',
    'Tim Pelaksana Kegiatan (TPK)',
    '',
  ]);
  ws1Data.push([
    '',
    '',
    namaSekolah,
    '',
    'Ketua Pelaksana / Tim Teknis',
    '',
  ]);
  ws1Data.push([]);
  ws1Data.push([]);
  ws1Data.push([
    '',
    '',
    `( ${kepalaSekolah} )`,
    '',
    `( ${ketuaTPK} )`,
    '',
  ]);
  ws1Data.push([
    '',
    '',
    `NIP. ${nipKepalaSekolah}`,
    '',
    'NIP/NIK. -',
    '',
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 8 },  // NO
    { wch: 45 }, // URAIAN
    { wch: 15 }, // KODE/SATUAN
    { wch: 14 }, // KOEFISIEN
    { wch: 20 }, // HARGA DASAR
    { wch: 22 }, // JUMLAH
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '002_Formulir_AHSP');

  // SHEET 2: Tabel_Koefisien_BOM (Format Flat Siap Import Aplikasi)
  const flatRows = getBerkas002FlatBOMRows();
  const ws2Data: (string | number)[][] = [
    ['TABEL KOEFISIEN ANALISA HARGA SATUAN (AHSP) - BERKAS 002'],
    ['Format ini kompatibel untuk diimpor kembali ke Master RAB Proyek via tombol "Upload AHSP"'],
    [],
    ['Kode Analisa', 'Uraian Pekerjaan Induk', 'Tipe (BAHAN/UPAH)', 'Uraian Komponen', 'Koefisien', 'Satuan Komponen', 'Harga Satuan Dasar (Rp)', 'Total (Rp)'],
  ];

  flatRows.forEach((r) => {
    ws2Data.push([
      r.kodeAnalisa,
      r.namaPekerjaan,
      r.tipe,
      r.uraianKomponen,
      r.koefisien,
      r.satuan,
      r.hargaDasar,
      r.jumlah,
    ]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [
    { wch: 14 },
    { wch: 40 },
    { wch: 18 },
    { wch: 35 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Tabel_Koefisien_BOM');

  // SHEET 3: Rekap_Harga_Satuan_AHSP
  const ws3Data: (string | number)[][] = [
    ['REKAPITULASI ANALISA HARGA SATUAN PEKERJAAN (AHSP) - BERKAS 002'],
    ['Satuan Pendidikan:', namaSekolah, 'NPSN:', npsn, 'Tahun Anggaran:', String(tahunAnggaran)],
    [],
    ['NO', 'KODE', 'DIVISI', 'URAIAN ITEM PEKERJAAN', 'SATUAN', 'UPAH (Rp)', 'BAHAN (Rp)', 'ALAT (Rp)', 'HARGA SATUAN (Rp)'],
  ];

  BERKAS_002_AHSP_DATA.forEach((item, i) => {
    ws3Data.push([
      i + 1,
      item.kode,
      item.divisi,
      item.namaPekerjaan,
      item.satuanPekerjaan,
      item.totalUpah,
      item.totalBahan,
      item.totalAlat,
      item.hargaSatuan,
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 30 },
    { wch: 45 },
    { wch: 10 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Rekap_Harga_Satuan_AHSP');

  // SHEET 4: Petunjuk_Pengisian
  const ws4Data: (string | number)[][] = [
    ['PETUNJUK PENGISIAN & PENGGUNAAN DOKUMEN BERKAS 002 AHSP'],
    [],
    ['1. Berkas ini merupakan Dokumen 002: Analisa Harga Satuan Pekerjaan (AHSP) Resmi Bantuan Revitalisasi.'],
    ['2. Standar koefisien mengacu pada SNI / Permen PUPR Cipta Karya terbaru untuk pekerjaan bangunan sekolah.'],
    ['3. Sheet "002_Formulir_AHSP" memuat rincian fisik A. Tenaga Kerja, B. Bahan, C. Alat dan Lembar Pengesahan.'],
    ['4. Sheet "Tabel_Koefisien_BOM" memuat tabel flat data yang dapat Anda sesuaikan koefisien atau harga dasarnya.'],
    ['5. Sheet "Rekap_Harga_Satuan_AHSP" menyajikan rangkuman harga satuan yang terkoneksi langsung dengan Berkas 001 RAB.'],
    ['6. Setelah selesai diedit, simpan file ini dan gunakan tombol "Upload AHSP" untuk menyinkronkan komponen material ke proyek aktif.'],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
  ws4['!cols'] = [{ wch: 85 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Petunjuk_Pengisian');

  const cleanSchool = (namaSekolah || 'Revitalisasi').replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Template_Berkas_002_AHSP_${cleanSchool}.xlsx`);
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
export const generateLaporanMingguanTemplateExcel = (
  currentRAB: RABMasterItem[],
  projectInfo?: any
) => {
  generateOfficialWeeklyRecapTemplateExcel(
    {
      namaSekolah:
        projectInfo?.dataSekolah?.namaSekolah ||
        projectInfo?.namaSekolah ||
        projectInfo?.namaInstansi ||
        'TK NURIADEEN CENDEKIA',
      namaProyek: projectInfo?.namaProyek || 'RUANG KELAS BARU',
      kabupatenKota:
        projectInfo?.alamatLengkap?.kabupatenKota ||
        projectInfo?.kabupatenKota ||
        projectInfo?.kabupaten ||
        'KAB/KOTA BOGOR',
      provinsi:
        projectInfo?.alamatLengkap?.provinsi ||
        projectInfo?.provinsi ||
        'PROPINSI JAWA BARAT',
      tanggalSurat: 'Bogor, 02 Agustus 2026',
      namaKetuaP2SP:
        projectInfo?.timP2sp?.ketuaP2sp?.nama ||
        projectInfo?.namaKetuaTPK ||
        'SURYADI, S.Pd.I.',
      namaPengawas: 'ERWIN RUSANDI, S.T.',
    },
    currentRAB
  );
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

        // Prioritaskan sheet bernama '001_Formulir_RAB' atau sheet pertama
        let targetSheetName = workbook.SheetNames[0];
        const rabSheet = workbook.SheetNames.find((s: string) =>
          s.toLowerCase().includes('001') ||
          s.toLowerCase().includes('rab') ||
          s.toLowerCase().includes('boq')
        );
        if (rabSheet) {
          targetSheetName = rabSheet;
        }

        const worksheet = workbook.Sheets[targetSheetName];
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
                  cell.toLowerCase().includes('kode analisa'))
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 9; // Fallback jika format 001
        }

        const items: RABMasterItem[] = [];
        let runningCategory = 'I. PEKERJAAN PERSIAPAN';

        for (let i = headerRowIndex + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length < 3) continue;

          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();
          const col3 = String(row[3] || '').trim();

          const combinedText = `${col0} ${col1} ${col2} ${col3}`.toLowerCase();

          // Deteksi judul bab/divisi jika ada nomor romawi (contoh: "I. PEKERJAAN PERSIAPAN")
          if (
            (col2.match(/^[I|V|X]+\./i) || col3.match(/^[I|V|X]+\./i) || col0.match(/^[I|V|X]+\./i)) &&
            (!row[4] || isNaN(parseFloat(String(row[4]).replace(/,/g, '.'))))
          ) {
            runningCategory = col2 || col3 || col1 || col0;
            continue;
          }

          // Abaikan baris subtotal, total, terbilang, dan tanda tangan
          if (
            combinedText.includes('total') ||
            combinedText.includes('jumlah') ||
            combinedText.includes('subtotal') ||
            combinedText.includes('terbilang') ||
            combinedText.includes('mengetahui') ||
            combinedText.includes('dibuat') ||
            combinedText.includes('kepala satuan') ||
            combinedText.includes('kepala sekolah') ||
            combinedText.includes('tim pelaksana') ||
            combinedText.includes('pelaksana kegiatan') ||
            combinedText.includes('nip.') ||
            combinedText.includes('petunjuk') ||
            combinedText.includes('catatan')
          ) {
            continue;
          }

          // Kode analisa & divisi
          const kode = col1 || (col0.length <= 8 && !isNaN(parseInt(col0)) ? `A.${col0}` : `WBS-${i}`);
          const divisi = col2 && col2.length > 3 && isNaN(parseFloat(col2)) ? col2 : runningCategory;
          const nama = col3 || col2 || col1;

          if (!nama || nama.length < 2) continue;

          // Parsing volume, satuan, harga
          const rawVol = String(row[4] || '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
          const volume = parseFloat(rawVol) || 1;

          const satuan = String(row[5] || 'Ls').trim();

          const rawHarga = String(row[6] || '').replace(/[^0-9.-]/g, '');
          const hargaSatuan = parseFloat(rawHarga) || 0;

          const rawBiaya = String(row[7] || '').replace(/[^0-9.-]/g, '');
          const biayaCol = parseFloat(rawBiaya) || 0;

          const biayaRAB = biayaCol > 0 ? biayaCol : hargaSatuan > 0 ? Math.round(volume * hargaSatuan) : 1000000;

          if (volume <= 0 && hargaSatuan <= 0 && biayaCol <= 0) continue;

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
        const targetSheetName =
          workbook.SheetNames.find(
            (s) =>
              s.toLowerCase().includes('tabel_koefisien') ||
              s.toLowerCase().includes('koefisien') ||
              s.toLowerCase().includes('ahsp')
          ) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[targetSheetName];
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

