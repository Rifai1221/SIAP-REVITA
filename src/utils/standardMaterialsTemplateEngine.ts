import * as XLSX from 'xlsx';
import { StandardMaterialPrice } from '../types';

export interface MaterialTemplateInfo {
  namaSekolah?: string;
  kabupatenKota?: string;
  provinsi?: string;
  tahunAnggaran?: string | number;
  namaPerencana?: string;
}

export interface OfficialMaterialItem {
  kategoriRomawi: string;
  kategoriNama: string;
  items: {
    no?: number | string;
    nama: string;
    satuan: string;
    harga: number;
    kategoriBahan?: 'STRUKTUR' | 'FINISHING' | 'ATAP' | 'MEP';
  }[];
}

export const OFFICIAL_BOGOR_MATERIALS_2025: OfficialMaterialItem[] = [
  {
    kategoriRomawi: 'I',
    kategoriNama: 'PASIR DAN BATU',
    items: [
      { no: 1, nama: 'Batu Kali (Bulat Belah)', satuan: 'M³', harga: 234247, kategoriBahan: 'STRUKTUR' },
      { no: 2, nama: 'Batu Pecah/Split Ukr. 2-3 cm', satuan: 'M³', harga: 234247, kategoriBahan: 'STRUKTUR' },
      { no: 3, nama: 'Kerikil', satuan: 'M³', harga: 310000, kategoriBahan: 'STRUKTUR' },
      { no: 4, nama: 'Pasir Beton', satuan: 'M³', harga: 375000, kategoriBahan: 'STRUKTUR' },
      { no: 5, nama: 'Pasir Pasang', satuan: 'M³', harga: 309351, kategoriBahan: 'STRUKTUR' },
      { no: 6, nama: 'Pasir Urug', satuan: 'M³', harga: 245854, kategoriBahan: 'STRUKTUR' },
      { no: 7, nama: 'Tanah Timbun/Material Tanah Timbunan', satuan: 'M³', harga: 125000, kategoriBahan: 'STRUKTUR' },
      { no: 8, nama: 'Air', satuan: 'l', harga: 1130, kategoriBahan: 'STRUKTUR' },
      { no: 9, nama: 'Batu Bata Merah Ukr. Besar 22x11x5', satuan: 'bh', harga: 1149, kategoriBahan: 'STRUKTUR' },
      { no: 10, nama: 'Bataco 10x20x40 cm', satuan: 'bh', harga: 2750, kategoriBahan: 'STRUKTUR' },
      { no: 11, nama: 'Tanah biasa/ liat', satuan: 'M³', harga: 209600, kategoriBahan: 'STRUKTUR' },
    ],
  },
  {
    kategoriRomawi: 'II',
    kategoriNama: 'SEMEN DAN KAPUR',
    items: [
      { no: 12, nama: 'Semen Portland', satuan: 'Kg', harga: 1550, kategoriBahan: 'STRUKTUR' },
      { no: 13, nama: 'Semen Warna', satuan: 'Kg', harga: 15000, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'III',
    kategoriNama: 'K A Y U',
    items: [
      { nama: 'Kayu (Papan) Klas II', satuan: 'M³', harga: 4857000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kayu (Balok) Klas II', satuan: 'M³', harga: 4857000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kayu (Papan) Klas III', satuan: 'M³', harga: 4857000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Plywood tebal 12 mm', satuan: 'M³', harga: 144207, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kayu Bekisting (Papan) Klas IV', satuan: 'M³', harga: 4857000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kayu Bekisting (Balok) Klas IV', satuan: 'M³', harga: 4857000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Dolken dia. 8 cm Ukr. 350 - 400 cm', satuan: 'btg', harga: 41021, kategoriBahan: 'STRUKTUR' },
      { nama: 'Pintu Kayu', satuan: 'Set', harga: 2637542, kategoriBahan: 'FINISHING' },
      { nama: 'kosen bovenligh kayu keruing (j2) = 2 BH', satuan: 'buah', harga: 370000, kategoriBahan: 'FINISHING' },
      { nama: 'kosen bovenligh kayu keruing (j2) = 4 BH', satuan: 'buah', harga: 400000, kategoriBahan: 'FINISHING' },
      { nama: 'Daun jendela kaca kayu jati', satuan: 'buah', harga: 1240000, kategoriBahan: 'FINISHING' },
      { nama: 'Kaso-kaso 5x7 cm', satuan: 'M³', harga: 4857000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Tiang kayu 8/12 kelas 2 tinggi 4', satuan: 'M³', harga: 189000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kayu papan 3/20 cm', satuan: 'M³', harga: 1696000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Jendela Alumunium', satuan: 'm', harga: 362500, kategoriBahan: 'FINISHING' },
      { nama: 'Kursi Siswa', satuan: 'bh', harga: 362500, kategoriBahan: 'FINISHING' },
      { nama: 'Meja Setengah Lingkaran', satuan: 'bh', harga: 750000, kategoriBahan: 'FINISHING' },
      { nama: 'Rak Mainan', satuan: 'bh', harga: 1300000, kategoriBahan: 'FINISHING' },
      { nama: 'Loker', satuan: 'bh', harga: 1750000, kategoriBahan: 'FINISHING' },
      { nama: 'Rak Buku uk. 60x120 cm', satuan: 'bh', harga: 1500000, kategoriBahan: 'FINISHING' },
      { nama: 'Karpet', satuan: 'bh', harga: 500000, kategoriBahan: 'FINISHING' },
      { nama: 'Papan Kreasi', satuan: 'bh', harga: 687500, kategoriBahan: 'FINISHING' },
      { nama: 'Rak Sepatu', satuan: 'bh', harga: 1952500, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'IV',
    kategoriNama: 'BAJA, BESI & KAWAT',
    items: [
      { nama: 'Besi Strip', satuan: 'Kg', harga: 19116, kategoriBahan: 'STRUKTUR' },
      { nama: 'Baja Tulangan Sirip', satuan: 'Kg', harga: 15175, kategoriBahan: 'STRUKTUR' },
      { nama: 'Besi Beton Ulir (BJTS)', satuan: 'Kg', harga: 15175, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kawat Tali Beton', satuan: 'Kg', harga: 15000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Paku Triplex', satuan: 'Kg', harga: 30628, kategoriBahan: 'STRUKTUR' },
      { nama: 'Paku segala Ukuran (rata-rata)', satuan: 'Kg', harga: 33221, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kawat Las', satuan: 'Kg', harga: 57213, kategoriBahan: 'STRUKTUR' },
      { nama: 'reng 2x3 cm', satuan: 'M³', harga: 3250000, kategoriBahan: 'ATAP' },
      { nama: 'Baja Ringan C 75', satuan: 'btg', harga: 125000, kategoriBahan: 'ATAP' },
      { nama: 'Reng Baja Ringan', satuan: 'btg', harga: 45000, kategoriBahan: 'ATAP' },
      { nama: 'Hollow Plafond', satuan: 'm2', harga: 125000, kategoriBahan: 'FINISHING' },
      { nama: 'Frame besi L.30.30.3', satuan: 'Kg', harga: 18000, kategoriBahan: 'STRUKTUR' },
      { nama: 'Kusen Alumunium Natural 3"', satuan: "m'", harga: 115000, kategoriBahan: 'FINISHING' },
      { nama: 'Kusen Alumunium Natural 4"', satuan: "m'", harga: 135000, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'V',
    kategoriNama: 'C A T',
    items: [
      { nama: 'Cat Plafond', satuan: 'kg', harga: 85000, kategoriBahan: 'FINISHING' },
      { nama: 'Cat Besi/Kayu dasar', satuan: 'kg', harga: 90367, kategoriBahan: 'FINISHING' },
      { nama: 'Cat tembok dasar', satuan: 'kg', harga: 42000, kategoriBahan: 'FINISHING' },
      { nama: 'Cat interior', satuan: 'kg', harga: 80000, kategoriBahan: 'FINISHING' },
      { nama: 'Cat eksterior', satuan: 'kg', harga: 95000, kategoriBahan: 'FINISHING' },
      { nama: 'Minyak bekisting', satuan: 'ltr', harga: 68580, kategoriBahan: 'STRUKTUR' },
      { nama: 'Lem Kayu', satuan: 'kg', harga: 34543, kategoriBahan: 'FINISHING' },
      { nama: 'Silicone sealant 300 ml', satuan: 'tube', harga: 123000, kategoriBahan: 'FINISHING' },
      { nama: 'Cat Zyncromate', satuan: 'kg', harga: 89189, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'VI',
    kategoriNama: 'U B I N',
    items: [
      { nama: 'Ubin Keramik Ukr. 40/40', satuan: 'M²', harga: 9053, kategoriBahan: 'FINISHING' },
      { nama: 'Guiding Block', satuan: 'bh', harga: 35000, kategoriBahan: 'FINISHING' },
      { nama: 'Lantai Granite Ukr. 60/60 Setara Roman', satuan: 'M²', harga: 285000, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'VII',
    kategoriNama: 'KAYU LAPIS / AKUSTIK / GYPSUMBOARD',
    items: [
      { nama: 'Triplek Ukr. 4x8 FT x 4 mm', satuan: 'lbr', harga: 226000, kategoriBahan: 'FINISHING' },
      { nama: 'Multiplek Ukr. 4x8 FT x 6 mm', satuan: 'lbr', harga: 105000, kategoriBahan: 'FINISHING' },
      { nama: 'Calsiboard 120x240x4 mm', satuan: 'lbr', harga: 65000, kategoriBahan: 'FINISHING' },
      { nama: 'Gypum Board tebal 9 mm', satuan: 'M²', harga: 12857, kategoriBahan: 'FINISHING' },
      { nama: 'GRC tebal 4 mm termasuk alat pasang', satuan: 'M²', harga: 125000, kategoriBahan: 'FINISHING' },
      { nama: 'List Gypsum', satuan: 'M', harga: 125000, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'VIII',
    kategoriNama: 'ALAT PENGUNCI & ATAP',
    items: [
      { nama: 'Kaca t=5 mm, polos', satuan: 'm²', harga: 45000, kategoriBahan: 'FINISHING' },
      { nama: 'Spandek Galvalum 0,35', satuan: 'm²', harga: 145000, kategoriBahan: 'ATAP' },
      { nama: 'Nok Spandek 0,35', satuan: 'm', harga: 131880, kategoriBahan: 'ATAP' },
      { nama: 'Kunci Tanam Cilinder', satuan: 'bh', harga: 115940, kategoriBahan: 'FINISHING' },
      { nama: 'Engsel pintu stainless 4', satuan: 'bh', harga: 20000, kategoriBahan: 'FINISHING' },
      { nama: 'Engsel jendela stainless 3', satuan: 'bh', harga: 35000, kategoriBahan: 'FINISHING' },
      { nama: 'Grendel jendela', satuan: 'bh', harga: 3940, kategoriBahan: 'FINISHING' },
      { nama: 'Grendel pintu', satuan: 'bh', harga: 87500, kategoriBahan: 'FINISHING' },
      { nama: 'Genteng Palentong', satuan: 'bh', harga: 217332, kategoriBahan: 'ATAP' },
      { nama: 'Nok Genteng', satuan: 'bh', harga: 105242, kategoriBahan: 'ATAP' },
      { nama: 'Pipa Besi Hitam 3"', satuan: 'm', harga: 4997, kategoriBahan: 'STRUKTUR' },
      { nama: 'Pipa Besi Hitam 2"', satuan: 'm', harga: 23490, kategoriBahan: 'STRUKTUR' },
      { nama: 'Genteng Bubung', satuan: 'bh', harga: 148450, kategoriBahan: 'ATAP' },
      { nama: 'Kait Angin', satuan: 'bh', harga: 154405, kategoriBahan: 'FINISHING' },
      { nama: 'Handle jendela uk panjang 10 cm', satuan: 'bh', harga: 732000, kategoriBahan: 'FINISHING' },
      { nama: 'Kunci tanam biasa', satuan: 'bh', harga: 45750, kategoriBahan: 'FINISHING' },
    ],
  },
  {
    kategoriRomawi: 'IX',
    kategoriNama: 'LAMPU, KABEL & SAKLAR (ALAT LISTRIK)',
    items: [
      { nama: 'MCB Box dan aksesor', satuan: 'Unit', harga: 32199, kategoriBahan: 'MEP' },
      { nama: 'Saklar Ganda dan aksesoris', satuan: 'bh', harga: 4594044, kategoriBahan: 'MEP' },
      { nama: 'Saklar Tunggal dan aksesoris', satuan: 'bh', harga: 44978, kategoriBahan: 'MEP' },
      { nama: 'Pompa Jet', satuan: 'Set', harga: 1239315, kategoriBahan: 'MEP' },
      { nama: 'Pipa Besi Hitam 1.5"', satuan: 'm', harga: 9733, kategoriBahan: 'MEP' },
      { nama: 'Generator Genset', satuan: 'Set', harga: 52500, kategoriBahan: 'MEP' },
      { nama: 'Kabel NYM 3 x 2,5 mm2', satuan: 'm¹', harga: 125000, kategoriBahan: 'MEP' },
      { nama: 'Lampu LED 15 watt (philip )', satuan: 'bh', harga: 12000, kategoriBahan: 'MEP' },
      { nama: 'Lampu TL 18 Watt', satuan: 'bh', harga: 25000, kategoriBahan: 'MEP' },
      { nama: 'Fitting lampu dan aksesoris', satuan: 'bh', harga: 6171, kategoriBahan: 'MEP' },
      { nama: 'Stop Kontak', satuan: 'bh', harga: 10041, kategoriBahan: 'MEP' },
      { nama: 'Pipa Conduit HI 20 mm', satuan: 'm¹', harga: 550206, kategoriBahan: 'MEP' },
      { nama: 'Accesoriess 5%', satuan: '-', harga: 2500000, kategoriBahan: 'MEP' },
    ],
  },
  {
    kategoriRomawi: 'X',
    kategoriNama: 'SMKK',
    items: [
      { nama: 'Tali keselamatan', satuan: 'roll', harga: 912302, kategoriBahan: 'STRUKTUR' },
      { nama: 'Peralatan P3K', satuan: 'set', harga: 83431, kategoriBahan: 'STRUKTUR' },
      { nama: 'Rambu-Rambu dan Pengendalian Resiko K3', satuan: 'set', harga: 88852, kategoriBahan: 'STRUKTUR' },
      { nama: 'Helm kepala', satuan: 'bh', harga: 134195, kategoriBahan: 'STRUKTUR' },
      { nama: 'Rompi', satuan: 'bh', harga: 59763, kategoriBahan: 'STRUKTUR' },
      { nama: 'Sepatu boot', satuan: 'bh', harga: 234247, kategoriBahan: 'STRUKTUR' },
      { nama: 'Sarung tangan', satuan: 'bh', harga: 15000, kategoriBahan: 'STRUKTUR' },
    ],
  },
];

export function getAllOfficialBogorFlatMaterials(): StandardMaterialPrice[] {
  const result: StandardMaterialPrice[] = [];
  OFFICIAL_BOGOR_MATERIALS_2025.forEach((cat) => {
    cat.items.forEach((it, idx) => {
      result.push({
        id: `mat-bogor-${cat.kategoriRomawi}-${idx + 1}-${Date.now()}`,
        nama: it.nama,
        satuan: it.satuan,
        harga: it.harga,
        kategori: it.kategoriBahan || 'STRUKTUR',
        spesifikasi: `Kategori ${cat.kategoriRomawi}: ${cat.kategoriNama} (Standar Kab/Kota Bogor 2025)`,
      });
    });
  });
  return result;
}

/**
 * Generate Excel Template Standar Bahan persis sesuai format berkas fisik yang diupload
 */
export const generateStandardMaterialsTemplateExcel = (
  info?: MaterialTemplateInfo,
  currentMaterials?: StandardMaterialPrice[]
) => {
  const wb = XLSX.utils.book_new();

  const namaSekolah = info?.namaSekolah || 'TK NURIADEEN CENDEKIA';
  const kabKota = info?.kabupatenKota ? info.kabupatenKota.toUpperCase() : 'KAB/KOTA BOGOR';
  const provinsi = info?.provinsi ? info.provinsi.toUpperCase() : 'PROPINSI JAWA BARAT';
  const tahun = info?.tahunAnggaran ? String(info.tahunAnggaran) : '2025';
  const perencana = info?.namaPerencana || 'DZIKRY IMAM MAJID,ST';

  // Sheet 1: Format Resmi Dokumen Fisik
  const ws1Data: (string | number)[][] = [
    ['DAFTAR HARGA SATUAN BAHAN'],
    [`${kabKota} ${provinsi}`],
    [`PROYEK PEMBANGUNAN PER TAHUN ${tahun}`],
    [],
    ['NO.', 'U R A I A N', 'SATUAN', 'HARGA (Rp.)'],
  ];

  let itemCounter = 1;

  if (currentMaterials && currentMaterials.length > 0 && currentMaterials.length !== 88) {
    // Kelompokkan currentMaterials berdasarkan kategori
    const groups: { [key: string]: StandardMaterialPrice[] } = {};
    currentMaterials.forEach((m) => {
      const cat = m.kategori || 'STRUKTUR';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(m);
    });

    Object.entries(groups).forEach(([catName, list], gIdx) => {
      const romawiList = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const romawi = romawiList[gIdx] || `${gIdx + 1}`;
      ws1Data.push([romawi, catName.toUpperCase(), '', '']);
      list.forEach((m) => {
        ws1Data.push([itemCounter++, m.nama, m.satuan, m.harga]);
      });
    });
  } else {
    // Format standar sesuai 10 Kategori berkas fisik Bogor 2025
    OFFICIAL_BOGOR_MATERIALS_2025.forEach((cat) => {
      ws1Data.push([cat.kategoriRomawi, cat.kategoriNama, '', '']);
      cat.items.forEach((it) => {
        const noVal = it.no !== undefined ? it.no : itemCounter++;
        ws1Data.push([noVal, it.nama, it.satuan, it.harga]);
      });
    });
  }

  // Tanda Tangan & Footer
  ws1Data.push([]);
  ws1Data.push(['*catatan: Menyesuaikan dengan ketentuan daerah atau hasil survey', '', namaSekolah, '']);
  ws1Data.push([]);
  ws1Data.push([]);
  ws1Data.push(['', '', perencana, '']);
  ws1Data.push(['', '', 'Perencana', '']);
  ws1Data.push([]);
  ws1Data.push(['SATBHN', '', '', 'Hal : 1']);

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 8 },  // NO.
    { wch: 45 }, // U R A I A N
    { wch: 12 }, // SATUAN
    { wch: 20 }, // HARGA (Rp.)
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Daftar_Harga_Satuan_Bahan');

  // Sheet 2: Petunjuk
  const ws2Data: (string | number)[][] = [
    ['PANDUAN & PETUNJUK PENGISIAN TEMPLATE STANDAR HARGA BAHAN'],
    [],
    ['1. Template ini dibuat persis sesuai format resmi "DAFTAR HARGA SATUAN BAHAN".'],
    ['2. Anda dapat mengubah nominal HARGA (Rp.) pada kolom 4 sesuai hasil survei toko/rekanan di daerah Anda.'],
    ['3. Baris judul kategori berhuruf Romawi (I, II, III, dst.) otomatis dikenali sebagai kelompok bahan.'],
    ['4. Simpan berkas ini setelah disunting (.xlsx / .xls / .csv).'],
    ['5. Gunakan tombol "Upload Bahan" di menu Standar Harga untuk menerapkan otomatis ke database material proyek.'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [{ wch: 85 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Petunjuk');

  const cleanSchool = namaSekolah.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Template_Daftar_Harga_Satuan_Bahan_${cleanSchool}.xlsx`);
};

/**
 * Parser untuk membaca file upload Standar Harga Bahan (.xlsx, .xls, .csv)
 */
export const parseStandardMaterialsFile = async (
  file: File
): Promise<{ success: boolean; materials: StandardMaterialPrice[]; message: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Cari baris header tabel
        let headerRowIndex = -1;
        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          if (
            row &&
            row.some(
              (cell) =>
                typeof cell === 'string' &&
                (cell.toLowerCase().includes('uraian') ||
                  (cell.toLowerCase().includes('satuan') && !cell.toLowerCase().includes('daftar')) ||
                  (cell.toLowerCase().includes('harga') && !cell.toLowerCase().includes('daftar')))
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 4;
        }

        const materials: StandardMaterialPrice[] = [];
        let currentCategory = 'STRUKTUR';
        let currentCategoryTitle = 'PASIR DAN BATU';

        for (let i = headerRowIndex + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length < 2) continue;

          const joined = row.map((c) => String(c || '').toLowerCase()).join(' ');
          if (
            joined.includes('hal :') ||
            joined.includes('satbhn') ||
            joined.includes('catatan:') ||
            joined.includes('perencana') ||
            joined.includes('dzikry') ||
            joined.includes('tk ') ||
            joined.includes('sd ') ||
            joined.includes('smp ')
          ) {
            continue;
          }

          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();
          const col3 = String(row[3] || '').trim();

          // Deteksi baris Judul Kategori Romawi (I, II, III, IV, V, VI, VII, VIII, IX, X)
          const isRomawi = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i.test(col0);
          if (isRomawi && col1 && (!col3 || isNaN(parseFloat(String(col3).replace(/[^0-9.-]/g, ''))))) {
            currentCategoryTitle = col1;
            const upper = col1.toUpperCase();
            if (upper.includes('PASIR') || upper.includes('BATU') || upper.includes('SEMEN') || upper.includes('BESI') || upper.includes('STRUKTUR')) {
              currentCategory = 'STRUKTUR';
            } else if (upper.includes('ATAP') || upper.includes('GENTENG') || upper.includes('SPANDEK') || upper.includes('BAJA RINGAN')) {
              currentCategory = 'ATAP';
            } else if (upper.includes('LISTRIK') || upper.includes('LAMPU') || upper.includes('KABEL') || upper.includes('PIPA') || upper.includes('MEP')) {
              currentCategory = 'MEP';
            } else {
              currentCategory = 'FINISHING';
            }
            continue;
          }

          // Baris Item Bahan
          let nama = '';
          let satuan = 'bh';
          let harga = 0;

          if (col1 && isNaN(parseFloat(col1.replace(/,/g, '')))) {
            nama = col1;
            satuan = col2 || 'bh';
            const rawHarga = col3 || col2;
            harga = parseFloat(String(rawHarga).replace(/[^0-9.-]/g, '')) || 0;
          } else if (col0 && isNaN(parseFloat(col0))) {
            nama = col0;
            satuan = col1 || 'bh';
            harga = parseFloat(String(col2).replace(/[^0-9.-]/g, '')) || 0;
          }

          if (nama && harga > 0) {
            materials.push({
              id: `mat-up-${Date.now()}-${i}`,
              nama,
              satuan: satuan || 'bh',
              harga,
              kategori: currentCategory as any,
              spesifikasi: `Kategori: ${currentCategoryTitle}`,
            });
          }
        }

        if (materials.length === 0) {
          resolve({
            success: false,
            materials: [],
            message: 'Tidak ada baris material yang terbaca. Pastikan terdapat kolom Uraian, Satuan, dan Harga.',
          });
          return;
        }

        resolve({
          success: true,
          materials,
          message: `Berhasil mengunggah ${materials.length} standar harga bahan & material konstruksi!`,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
