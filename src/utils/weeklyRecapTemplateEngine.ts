import * as XLSX from 'xlsx';
import { RABMasterItem } from '../types';

export interface WeeklyRecapProjectInfo {
  namaSekolah?: string;
  npsn?: string;
  namaProyek?: string;
  kabupatenKota?: string;
  provinsi?: string;
  mingguKe?: number;
  periodeTeks?: string;
  rencanaWaktuHK?: number;
  waktuTerlaksanaHK?: number;
  sisaWaktuHK?: number;
  namaKetuaP2SP?: string;
  namaPengawas?: string;
  tanggalSurat?: string;
}

export interface WeeklyRecapDivisionRow {
  no: string;
  uraianPekerjaan: string;
  bobotPersen: number;
  prestasiMingguLalu: number;
  prestasiMingguIni: number;
  prestasiSdMingguIni: number;
}

export const OFFICIAL_REKAP_MINGGUAN_DATA: {
  pekerjaanFisik: WeeklyRecapDivisionRow[];
  biayaManajemen: WeeklyRecapDivisionRow[];
  keterangan: {
    prestasiPelaksanaan: number;
    prestasiDirencanakan: number;
    lebihCepatDariRencana: number;
    rencanaWaktuHK: number;
    waktuSudahTerlaksanaHK: number;
    sisaWaktuHK: number;
  };
  tanggalSurat: string;
  ketuaP2SP: string;
  pengawas: string;
} = {
  pekerjaanFisik: [
    { no: 'I', uraianPekerjaan: 'PEKERJAAN PERSIAPAN', bobotPersen: 2.66, prestasiMingguLalu: 2.00, prestasiMingguIni: 0.25, prestasiSdMingguIni: 2.24 },
    { no: 'II', uraianPekerjaan: 'PEKERJAAN GALIAN & URUGAN', bobotPersen: 1.79, prestasiMingguLalu: 1.79, prestasiMingguIni: 0.00, prestasiSdMingguIni: 1.79 },
    { no: 'III', uraianPekerjaan: 'PEKERJAAN PASANGAN', bobotPersen: 14.96, prestasiMingguLalu: 1.80, prestasiMingguIni: 2.24, prestasiSdMingguIni: 4.03 },
    { no: 'IV', uraianPekerjaan: 'PEKERJAAN BETON', bobotPersen: 13.66, prestasiMingguLalu: 1.41, prestasiMingguIni: 2.21, prestasiSdMingguIni: 3.62 },
    { no: 'V', uraianPekerjaan: 'PEKERJAAN KAYU, KACA, DAN BESI', bobotPersen: 8.36, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
    { no: 'VI', uraianPekerjaan: 'PEKERJAAN ATAP', bobotPersen: 17.62, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
    { no: 'VII', uraianPekerjaan: 'PEKERJAAN LANGIT-LANGIT', bobotPersen: 9.94, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
    { no: 'VIII', uraianPekerjaan: 'PEKERJAAN LANTAI', bobotPersen: 10.05, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
    { no: 'X', uraianPekerjaan: 'PEKERJAAN CAT-CATAN', bobotPersen: 5.32, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
    { no: 'XI', uraianPekerjaan: 'PEKERJAAN INSTALASI LISTRIK', bobotPersen: 1.60, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
    { no: 'XII', uraianPekerjaan: 'PEKERJAAN MEBELER', bobotPersen: 7.62, prestasiMingguLalu: 0.00, prestasiMingguIni: 0.00, prestasiSdMingguIni: 0.00 },
  ],
  biayaManajemen: [
    { no: 'I', uraianPekerjaan: 'BIAYA PERENCANAAN', bobotPersen: 1.85, prestasiMingguLalu: 1.29, prestasiMingguIni: 0.18, prestasiSdMingguIni: 1.48 },
    { no: 'II', uraianPekerjaan: 'BIAYA PENGAWASAN', bobotPersen: 2.19, prestasiMingguLalu: 0.66, prestasiMingguIni: 0.22, prestasiSdMingguIni: 0.88 },
    { no: 'III', uraianPekerjaan: 'BIAYA PENGELOLAAN', bobotPersen: 2.41, prestasiMingguLalu: 0.72, prestasiMingguIni: 0.24, prestasiSdMingguIni: 0.96 },
  ],
  keterangan: {
    prestasiPelaksanaan: 15.00,
    prestasiDirencanakan: 6.90,
    lebihCepatDariRencana: 8.09,
    rencanaWaktuHK: 112,
    waktuSudahTerlaksanaHK: 28,
    sisaWaktuHK: 84,
  },
  tanggalSurat: 'Bogor, 02 Agustus 2026',
  ketuaP2SP: 'SURYADI, S.Pd.I.',
  pengawas: 'ERWIN RUSANDI, S.T.',
};

/**
 * Generate Excel Template Rekapitulasi Prestasi Laporan Mingguan persis seperti berkas fisik
 */
export const generateOfficialWeeklyRecapTemplateExcel = (
  info?: WeeklyRecapProjectInfo,
  currentRAB?: RABMasterItem[]
) => {
  const wb = XLSX.utils.book_new();

  const namaSekolah = info?.namaSekolah || 'TK NURIADEEN CENDEKIA';
  const jenisPendidikan = 'PENDIDIKAN ANAK USIA DINI';
  const ruang = info?.namaProyek || 'RUANG KELAS BARU';
  const kabKota = info?.kabupatenKota ? info.kabupatenKota.toUpperCase() : 'KAB/KOTA BOGOR';
  const provinsi = info?.provinsi ? info.provinsi.toUpperCase() : 'PROPINSI JAWA BARAT';
  const tanggalSurat = info?.tanggalSurat || 'Bogor, 02 Agustus 2026';
  const ketuaP2SP = info?.namaKetuaP2SP || 'SURYADI, S.Pd.I.';
  const pengawas = info?.namaPengawas || 'ERWIN RUSANDI, S.T.';

  // Sheet 1: Formulir Resmi Rekapitulasi Mingguan (Format PDF Pengawas)
  const ws1Data: (string | number)[][] = [
    ['REKAPITULASI'],
    [jenisPendidikan],
    [ruang],
    [namaSekolah],
    [`${kabKota} ${provinsi}`],
    [],
    [
      'NO.',
      'URAIAN PEKERJAAN',
      'BOBOT %',
      'PRESTASI MINGGU LALU (BOBOT %)',
      'PRESTASI MINGGU INI (BOBOT %)',
      'PRESTASI S.D MINGGU INI (BOBOT %)',
    ],
    ['', 'R E K A P I T U L A S I :', '', '', '', ''],
    ['', 'PEKERJAAN FISIK', '', '', '', ''],
  ];

  let totalBobotFisik = 0;
  let totalLaluFisik = 0;
  let totalIniFisik = 0;
  let totalSdIniFisik = 0;

  // Jika currentRAB diberikan dan terisi divisi, hitung atau gunakan template resmi
  const fisikList = OFFICIAL_REKAP_MINGGUAN_DATA.pekerjaanFisik;
  fisikList.forEach((row) => {
    totalBobotFisik += row.bobotPersen;
    totalLaluFisik += row.prestasiMingguLalu;
    totalIniFisik += row.prestasiMingguIni;
    totalSdIniFisik += row.prestasiSdMingguIni;
    ws1Data.push([
      row.no,
      row.uraianPekerjaan,
      row.bobotPersen,
      row.prestasiMingguLalu > 0 ? row.prestasiMingguLalu : '',
      row.prestasiMingguIni > 0 ? row.prestasiMingguIni : '',
      row.prestasiSdMingguIni > 0 ? row.prestasiSdMingguIni : '',
    ]);
  });

  // Biaya Manajemen
  ws1Data.push(['', 'RINCIAN BIAYA MANAJEMEN', '', '', '', '']);
  let totalBobotManajemen = 0;
  let totalLaluManajemen = 0;
  let totalIniManajemen = 0;
  let totalSdIniManajemen = 0;

  OFFICIAL_REKAP_MINGGUAN_DATA.biayaManajemen.forEach((row) => {
    totalBobotManajemen += row.bobotPersen;
    totalLaluManajemen += row.prestasiMingguLalu;
    totalIniManajemen += row.prestasiMingguIni;
    totalSdIniManajemen += row.prestasiSdMingguIni;
    ws1Data.push([
      row.no,
      row.uraianPekerjaan,
      row.bobotPersen,
      row.prestasiMingguLalu,
      row.prestasiMingguIni,
      row.prestasiSdMingguIni,
    ]);
  });

  // Baris TOTAL
  const grandTotalBobot = Math.round((totalBobotFisik + totalBobotManajemen) * 100) / 100;
  const grandTotalLalu = Math.round((totalLaluFisik + totalLaluManajemen) * 100) / 100;
  const grandTotalIni = Math.round((totalIniFisik + totalIniManajemen) * 100) / 100;
  const grandTotalSdIni = Math.round((totalSdIniFisik + totalSdIniManajemen) * 100) / 100;

  ws1Data.push([
    '',
    'TOTAL',
    grandTotalBobot,
    grandTotalLalu,
    grandTotalIni,
    grandTotalSdIni,
  ]);

  // Bagian KETERANGAN
  const deviasi = Math.round((grandTotalSdIni - OFFICIAL_REKAP_MINGGUAN_DATA.keterangan.prestasiDirencanakan) * 100) / 100;
  ws1Data.push([]);
  ws1Data.push(['KETERANGAN', '', '', '', '', '']);
  ws1Data.push(['PRESTASI PELAKSANAAN', ':', `${grandTotalSdIni.toFixed(2)} %`, '', '', '']);
  ws1Data.push(['PRESTASI YANG DIRENCANAKAN', ':', `${OFFICIAL_REKAP_MINGGUAN_DATA.keterangan.prestasiDirencanakan.toFixed(2)} %`, '', '', '']);
  ws1Data.push(['LEBIH CEPAT DARI RENCANA', ':', `${deviasi.toFixed(2)} %`, '', '', '']);
  ws1Data.push([]);
  ws1Data.push(['RENCANA WAKTU PELAKSANAAN', ':', `${OFFICIAL_REKAP_MINGGUAN_DATA.keterangan.rencanaWaktuHK} HK`, '', '', '']);
  ws1Data.push(['WAKTU YANG SUDAH DILAKSANAKAN', ':', `${OFFICIAL_REKAP_MINGGUAN_DATA.keterangan.waktuSudahTerlaksanaHK} HK`, '', '', '']);
  ws1Data.push(['SISA WAKTU PELAKSANAAN', ':', `${OFFICIAL_REKAP_MINGGUAN_DATA.keterangan.sisaWaktuHK} HK`, '', '', '']);
  ws1Data.push([]);

  // Tanda Tangan
  ws1Data.push(['', '', '', '', tanggalSurat, '']);
  ws1Data.push(['Diperiksa dan Disetujui', '', '', '', 'Dibuat Oleh', '']);
  ws1Data.push(['Ketua P2SP', '', '', '', 'Pengawas', '']);
  ws1Data.push([]);
  ws1Data.push([]);
  ws1Data.push([ketuaP2SP, '', '', '', pengawas, '']);

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 8 },  // NO.
    { wch: 42 }, // URAIAN PEKERJAAN
    { wch: 14 }, // BOBOT %
    { wch: 22 }, // PRESTASI MINGGU LALU
    { wch: 22 }, // PRESTASI MINGGU INI
    { wch: 24 }, // PRESTASI S.D MINGGU INI
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Rekapitulasi_Mingguan');

  // Sheet 2: Detail_Item_RAB (Format Sinkronisasi Volume & Bobot Per Item Realtime)
  if (currentRAB && currentRAB.length > 0) {
    const ws2Data: (string | number)[][] = [
      ['DETAIL PEKERJAAN RAB SINKRON LAPORAN MINGGUAN'],
      ['Satuan Pendidikan:', namaSekolah, 'Kegiatan:', ruang],
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

    currentRAB.forEach((it) => {
      ws2Data.push([
        it.kode,
        it.kategori || 'PEKERJAAN',
        it.namaPekerjaan,
        it.volumeRAB,
        it.satuan,
        Math.round(it.biayaRAB / (it.volumeRAB || 1)),
        it.biayaRAB,
        it.bobotRencana,
        it.progresRealisasi,
        0,
        0,
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    ws2['!cols'] = [
      { wch: 10 },
      { wch: 24 },
      { wch: 45 },
      { wch: 12 },
      { wch: 8 },
      { wch: 18 },
      { wch: 20 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Detail_Item_RAB');
  }

  // Sheet 3: Petunjuk
  const ws3Data: (string | number)[][] = [
    ['PANDUAN & PETUNJUK PENGISIAN TEMPLATE LAPORAN MINGGUAN REKAPITULASI'],
    [],
    ['1. Template ini dibuat persis sesuai format fisik "REKAPITULASI PRESTASI PEKERJAAN MINGGUAN".'],
    ['2. Anda dapat mengisi capaian bobot pada kolom "PRESTASI MINGGU INI (BOBOT %)".'],
    ['3. Kolom "PRESTASI S.D MINGGU INI" adalah penjumlahan kumulatif dari Minggu Lalu + Minggu Ini.'],
    ['4. Pada sheet "Detail_Item_RAB", Anda juga dapat mengisi volume atau bobot per item pekerjaan.'],
    ['5. Simpan file ini dan unggah melalui tombol "Pilih Berkas Dari Komputer" di menu Upload Laporan Mingguan.'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [{ wch: 85 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Petunjuk');

  const cleanSchool = namaSekolah.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Template_Rekapitulasi_Laporan_Mingguan_${cleanSchool}.xlsx`);
};

/**
 * Parser untuk membaca file Laporan Mingguan baik format Rekapitulasi Divisi maupun Detail Item RAB
 */
export const parseEnhancedWeeklyProgressFile = async (
  file: File,
  currentRAB: RABMasterItem[]
): Promise<{
  success: boolean;
  mingguKe?: number;
  rows: { kode: string; namaPekerjaan: string; volumeMingguIni: number; bobotMingguIniPersen: number }[];
  rekapDivisi?: WeeklyRecapDivisionRow[];
  biayaManajemen?: {
    bobotPerencana: number;
    bobotPengawas: number;
    bobotAdministrasi: number;
    prestasiPerencanaMingguIni: number;
    prestasiPengawasMingguIni: number;
    prestasiAdministrasiMingguIni: number;
  };
  totalBobotFisikMingguIni?: number;
  totalBobotManajemenMingguIni?: number;
  totalBobotMingguIni?: number;
  keterangan?: {
    prestasiPelaksanaan: number;
    prestasiDirencanakan: number;
    deviasi: number;
  };
  message: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Cek sheet yang tersedia
        const rekapSheetName = workbook.SheetNames.find((s) => s.toLowerCase().includes('rekap'));
        const detailSheetName = workbook.SheetNames.find((s) => s.toLowerCase().includes('detail') || s.toLowerCase().includes('laporan'));
        const activeSheetName = detailSheetName || rekapSheetName || workbook.SheetNames[0];

        const worksheet = workbook.Sheets[activeSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const rows: { kode: string; namaPekerjaan: string; volumeMingguIni: number; bobotMingguIniPersen: number }[] = [];
        const rekapDivisi: WeeklyRecapDivisionRow[] = [];

        // Deteksi mingguKe dari nama file atau sel
        let detectedMingguKe: number | undefined = undefined;
        const fileNameMatch = file.name.match(/minggu[_\s-]*([0-9]+)/i);
        if (fileNameMatch) {
          detectedMingguKe = parseInt(fileNameMatch[1]);
        }

        // Variabel untuk menampung bobot manajemen
        let perencanaBobot = 1.85;
        let perencanaMingguIni = 0;
        let pengawasBobot = 2.19;
        let pengawasMingguIni = 0;
        let administrasiBobot = 2.41;
        let administrasiMingguIni = 0;
        let totalFisikMingguIni = 0;

        // Periksa apakah ini format Rekapitulasi (Sheet Rekapitulasi)
        let isRekapFormat = false;
        for (let i = 0; i < Math.min(15, json.length); i++) {
          const joined = (json[i] || []).join(' ').toLowerCase();
          if (joined.includes('rekapitulasi') || joined.includes('prestasi minggu ini') || joined.includes('pekerjaan fisik')) {
            isRekapFormat = true;
          }
          const mMatch = joined.match(/minggu\s*ke\s*[:\-]?\s*([0-9]+)/i);
          if (mMatch) {
            detectedMingguKe = parseInt(mMatch[1]);
          }
        }

        if (isRekapFormat) {
          // Cari header rekapitulasi
          let headerRowIdx = -1;
          for (let i = 0; i < json.length; i++) {
            const r = json[i] || [];
            if (r.some((c: any) => typeof c === 'string' && c.toLowerCase().includes('prestasi minggu ini'))) {
              headerRowIdx = i;
              break;
            }
          }

          if (headerRowIdx !== -1) {
            for (let i = headerRowIdx + 1; i < json.length; i++) {
              const r = json[i];
              if (!r || r.length < 2) continue;

              const col0 = String(r[0] || '').trim();
              const col1 = String(r[1] || '').trim();
              const col2 = parseFloat(String(r[2] || '').replace(/,/g, '.')) || 0; // Bobot %
              const col3 = parseFloat(String(r[3] || '').replace(/,/g, '.')) || 0; // Prestasi Minggu Lalu
              const col4 = parseFloat(String(r[4] || '').replace(/,/g, '.')) || 0; // Prestasi Minggu Ini
              const col5 = parseFloat(String(r[5] || '').replace(/,/g, '.')) || 0; // Prestasi s.d Minggu Ini

              const lowerUraian = col1.toLowerCase();
              if (lowerUraian.includes('total') || lowerUraian.includes('keterangan') || lowerUraian.includes('diperiksa')) {
                break;
              }

              // Deteksi Biaya Manajemen
              if (lowerUraian.includes('perencana')) {
                if (col2 > 0) perencanaBobot = col2;
                perencanaMingguIni = col4;
              } else if (lowerUraian.includes('pengawas')) {
                if (col2 > 0) pengawasBobot = col2;
                pengawasMingguIni = col4;
              } else if (lowerUraian.includes('pengelola') || lowerUraian.includes('administrasi')) {
                if (col2 > 0) administrasiBobot = col2;
                administrasiMingguIni = col4;
              }

              if (col1 && (col2 > 0 || col4 > 0 || col5 > 0)) {
                rekapDivisi.push({
                  no: col0,
                  uraianPekerjaan: col1,
                  bobotPersen: col2,
                  prestasiMingguLalu: col3,
                  prestasiMingguIni: col4,
                  prestasiSdMingguIni: col5 > 0 ? col5 : col3 + col4,
                });

                // Jika ini adalah pekerjaan fisik (bukan biaya manajemen)
                const isManajemen =
                  lowerUraian.includes('perencana') ||
                  lowerUraian.includes('pengawas') ||
                  lowerUraian.includes('pengelola') ||
                  lowerUraian.includes('administrasi');

                if (!isManajemen) {
                  totalFisikMingguIni += col4;

                  // Pemetaan cerdas ke kelompok item RAB Master
                  const matchedRAB = currentRAB.filter((rab) => {
                    const rKat = (rab.kategori || '').toLowerCase();
                    const rNama = (rab.namaPekerjaan || '').toLowerCase();

                    if (lowerUraian.includes('persiapan')) {
                      return rKat.includes('persiapan') || rNama.includes('persiapan');
                    }
                    if (lowerUraian.includes('galian') || lowerUraian.includes('urugan') || lowerUraian.includes('pondasi')) {
                      return rKat.includes('pondasi') || rNama.includes('pondasi') || rNama.includes('galian');
                    }
                    if (lowerUraian.includes('pasangan') || lowerUraian.includes('dinding')) {
                      return rKat.includes('dinding') || rNama.includes('dinding') || rNama.includes('pasangan') || rNama.includes('hebel');
                    }
                    if (lowerUraian.includes('beton') || lowerUraian.includes('struktur')) {
                      return rKat.includes('struktur') || rNama.includes('beton') || rNama.includes('sloof') || rNama.includes('kolom');
                    }
                    if (lowerUraian.includes('atap') || lowerUraian.includes('kuda-kuda')) {
                      return rKat.includes('atap') || rNama.includes('atap') || rNama.includes('genteng');
                    }
                    if (lowerUraian.includes('langit') || lowerUraian.includes('plafon')) {
                      return rNama.includes('plafon') || rNama.includes('langit') || rKat.includes('finishing');
                    }
                    if (lowerUraian.includes('lantai') || lowerUraian.includes('keramik')) {
                      return rKat.includes('lantai') || rNama.includes('lantai') || rNama.includes('granit');
                    }
                    if (lowerUraian.includes('cat')) {
                      return rNama.includes('cat') || rNama.includes('pengecatan') || rKat.includes('finishing');
                    }
                    if (lowerUraian.includes('listrik') || lowerUraian.includes('lampu')) {
                      return rKat.includes('listrik') || rNama.includes('listrik') || rNama.includes('lampu');
                    }
                    if (lowerUraian.includes('mebeler') || lowerUraian.includes('mebel')) {
                      return rKat.includes('mebeler') || rNama.includes('mebel') || rNama.includes('meja');
                    }
                    if (lowerUraian.includes('kayu') || lowerUraian.includes('besi') || lowerUraian.includes('kaca')) {
                      return rNama.includes('pintu') || rNama.includes('kusen') || rNama.includes('jendela');
                    }

                    return rKat.includes(lowerUraian) || lowerUraian.includes(rKat);
                  });

                  if (matchedRAB.length > 0 && col4 > 0) {
                    const totalMatchedWeight = matchedRAB.reduce((sum, m) => sum + m.bobotRencana, 0) || 1;
                    matchedRAB.forEach((m) => {
                      const shareOfCol4 = (m.bobotRencana / totalMatchedWeight) * col4;
                      rows.push({
                        kode: m.kode,
                        namaPekerjaan: m.namaPekerjaan,
                        volumeMingguIni: 0,
                        bobotMingguIniPersen: Math.round(shareOfCol4 * 100) / 100,
                      });
                    });
                  }
                }
              }
            }
          }
        }

        // Jika tidak menghasilkan rows dari format rekap, coba format baris detail
        if (rows.length === 0) {
          let headerIdx = -1;
          for (let i = 0; i < json.length; i++) {
            const r = json[i] || [];
            if (r.some((c: any) => typeof c === 'string' && (c.toLowerCase().includes('uraian') || c.toLowerCase().includes('kode')))) {
              headerIdx = i;
              break;
            }
          }

          if (headerIdx === -1) headerIdx = 4;

          for (let i = headerIdx + 1; i < json.length; i++) {
            const r = json[i];
            if (!r || r.length < 3) continue;

            const kode = String(r[0] || '').trim();
            const nama = String(r[2] || r[1] || '').trim();
            const vol = parseFloat(String(r[9] || '').replace(/,/g, '.')) || 0;
            const bobot = parseFloat(String(r[10] || '').replace(/,/g, '.')) || 0;

            if (vol > 0 || bobot > 0) {
              totalFisikMingguIni += bobot;
              rows.push({
                kode,
                namaPekerjaan: nama,
                volumeMingguIni: vol,
                bobotMingguIniPersen: bobot,
              });
            }
          }

          // Fallback manajemen proporsional jika format detail murni
          if (totalFisikMingguIni > 0 && perencanaMingguIni === 0) {
            perencanaMingguIni = Math.round((totalFisikMingguIni * 0.038) * 100) / 100;
            pengawasMingguIni = Math.round((totalFisikMingguIni * 0.046) * 100) / 100;
            administrasiMingguIni = Math.round((totalFisikMingguIni * 0.051) * 100) / 100;
          }
        }

        const totalManajemenMingguIni =
          Math.round((perencanaMingguIni + pengawasMingguIni + administrasiMingguIni) * 100) / 100;
        const totalBobotMingguIni =
          Math.round((totalFisikMingguIni + totalManajemenMingguIni) * 100) / 100;

        resolve({
          success: true,
          mingguKe: detectedMingguKe,
          rows,
          rekapDivisi: rekapDivisi.length > 0 ? rekapDivisi : undefined,
          biayaManajemen: {
            bobotPerencana: perencanaBobot,
            bobotPengawas: pengawasBobot,
            bobotAdministrasi: administrasiBobot,
            prestasiPerencanaMingguIni: perencanaMingguIni,
            prestasiPengawasMingguIni: pengawasMingguIni,
            prestasiAdministrasiMingguIni: administrasiMingguIni,
          },
          totalBobotFisikMingguIni: Math.round(totalFisikMingguIni * 100) / 100,
          totalBobotManajemenMingguIni: totalManajemenMingguIni,
          totalBobotMingguIni,
          message: `Berhasil mengekstrak ${rows.length} capaian item fisik dan 3 pos upah manajemen sesuai berkas resmi!`,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
