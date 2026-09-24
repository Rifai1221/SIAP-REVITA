export interface Berkas001RABItem {
  no: number;
  kode: string;
  divisi: string;
  nama: string;
  volume: number;
  satuan: string;
  hargaSatuan: number;
  jumlahHarga: number;
  bobot: number;
}

export interface Berkas001RABDivision {
  divisi: string;
  romawi: string;
  judul: string;
  items: Berkas001RABItem[];
}

export const BERKAS_001_RAB_RAW: {
  romawi: string;
  judul: string;
  items: { kode: string; nama: string; volume: number; satuan: string; hargaSatuan: number }[];
}[] = [
  {
    romawi: 'I',
    judul: 'PEKERJAAN PERSIAPAN',
    items: [
      { kode: 'A.1', nama: 'Papan Nama Kegiatan Revitalisasi & Informasi Publik Proyek', volume: 1, satuan: 'Ls', hargaSatuan: 850000 },
      { kode: 'A.2', nama: 'Pembersihan Lapangan, Pengupasan & Pembongkaran Awal', volume: 1, satuan: 'Ls', hargaSatuan: 1500000 },
      { kode: 'A.3', nama: 'Pengukuran Lapangan & Pemasangan Bowplank Kayu', volume: 48, satuan: 'm1', hargaSatuan: 42500 },
      { kode: 'A.4', nama: 'Penerapan Sistem Manajemen K3 Konstruksi (SMKK) & APD Kerja Lengkap', volume: 1, satuan: 'Ls', hargaSatuan: 1750000 },
      { kode: 'A.5', nama: 'Penyediaan Air Kerja dan Listrik Penerangan Sementara Proyek', volume: 1, satuan: 'Ls', hargaSatuan: 650000 },
    ],
  },
  {
    romawi: 'II',
    judul: 'PEKERJAAN TANAH DAN PASIR',
    items: [
      { kode: 'B.1', nama: 'Galian Tanah Pondasi Menerus & Pondasi Telapak', volume: 28.5, satuan: 'm3', hargaSatuan: 115000 },
      { kode: 'B.2', nama: 'Urugan Pasir Bawah Pondasi Tebal 5 cm', volume: 4.2, satuan: 'm3', hargaSatuan: 260000 },
      { kode: 'B.3', nama: 'Urugan Kembali Tanah Bekas Galian dipadatkan', volume: 9.5, satuan: 'm3', hargaSatuan: 55000 },
    ],
  },
  {
    romawi: 'III',
    judul: 'PEKERJAAN PONDASI DAN STRUKTUR BETON BERTULANG',
    items: [
      { kode: 'C.1', nama: 'Pasangan Pondasi Batu Kali Belah Campuran 1 : 5', volume: 18.4, satuan: 'm3', hargaSatuan: 1150000 },
      { kode: 'C.2', nama: 'Beton Sloof 15/20 cm Mutu f\'c 14.5 MPa (K-175)', volume: 3.6, satuan: 'm3', hargaSatuan: 1450000 },
      { kode: 'C.3', nama: 'Pembesian Sloof Besi Beton Polos / Ulir SNI', volume: 425, satuan: 'kg', hargaSatuan: 16500 },
      { kode: 'C.4', nama: 'Pasang Bekisting Sloof dengan Papan Kayu Kelas III', volume: 48, satuan: 'm2', hargaSatuan: 185000 },
      { kode: 'C.5', nama: 'Beton Kolom Praktis 15/15 cm Mutu K-175', volume: 2.7, satuan: 'm3', hargaSatuan: 1550000 },
      { kode: 'C.6', nama: 'Pembesian Kolom Praktis Besi Beton SNI', volume: 340, satuan: 'kg', hargaSatuan: 16500 },
      { kode: 'C.7', nama: 'Pasang Bekisting Kolom Praktis dengan Papan Kayu', volume: 36, satuan: 'm2', hargaSatuan: 210000 },
      { kode: 'C.8', nama: 'Beton Ringbalk 15/20 cm Mutu K-175', volume: 3.6, satuan: 'm3', hargaSatuan: 1500000 },
      { kode: 'C.9', nama: 'Pembesian Ringbalk Besi Beton SNI', volume: 390, satuan: 'kg', hargaSatuan: 16500 },
      { kode: 'C.10', nama: 'Pasang Bekisting Ringbalk dengan Papan Kayu', volume: 48, satuan: 'm2', hargaSatuan: 195000 },
    ],
  },
  {
    romawi: 'IV',
    judul: 'PEKERJAAN DINDING, PLESTERAN & ACIAN',
    items: [
      { kode: 'D.1', nama: 'Pasangan Dinding Bata Ringan (Hebel) t = 10 cm + Perekat Mortar', volume: 185, satuan: 'm2', hargaSatuan: 145000 },
      { kode: 'D.2', nama: 'Plesteran Dinding Adukan 1 : 4 tebal 15 mm', volume: 370, satuan: 'm2', hargaSatuan: 72000 },
      { kode: 'D.3', nama: 'Acian Dinding Semen Instan / PC Halus', volume: 370, satuan: 'm2', hargaSatuan: 38000 },
      { kode: 'D.4', nama: 'Pasangan Keramik Dinding Kamar Mandi/Wudhu 20x25 cm', volume: 32, satuan: 'm2', hargaSatuan: 195000 },
    ],
  },
  {
    romawi: 'V',
    judul: 'PEKERJAAN KUSEN, PINTU & JENDELA',
    items: [
      { kode: 'E.1', nama: 'Pasang Kusen Aluminium 4 Inch (Anodized/Powder Coating)', volume: 64, satuan: 'm1', hargaSatuan: 140000 },
      { kode: 'E.2', nama: 'Pasang Daun Pintu Panel Kayu Solid / HPL Komplit Finishing', volume: 4, satuan: 'Unit', hargaSatuan: 1250000 },
      { kode: 'E.3', nama: 'Pasang Daun Jendela Rangka Aluminium + Kaca Polos 5 mm', volume: 12, satuan: 'Unit', hargaSatuan: 450000 },
      { kode: 'E.4', nama: 'Pasang Kunci Pintu Tanam Standar 2 Slag High Security', volume: 4, satuan: 'Set', hargaSatuan: 245000 },
      { kode: 'E.5', nama: 'Pasang Engsel Pintu & Jendela Heavy Duty Stainless Steel', volume: 28, satuan: 'Set', hargaSatuan: 48000 },
      { kode: 'E.6', nama: 'Pasang Hak Angin Sikutan & Grendel Tanam Jendela', volume: 12, satuan: 'Set', hargaSatuan: 38000 },
    ],
  },
  {
    romawi: 'VI',
    judul: 'PEKERJAAN RANGKA & PENUTUP ATAP',
    items: [
      { kode: 'F.1', nama: 'Rangka Kuda-Kuda Atap Baja Ringan Kanal C.75 t=0.75 mm SNI', volume: 165, satuan: 'm2', hargaSatuan: 175000 },
      { kode: 'F.2', nama: 'Reng Baja Ringan R.32 t=0.45 mm SNI', volume: 165, satuan: 'm2', hargaSatuan: 42000 },
      { kode: 'F.3', nama: 'Penutup Atap Genteng Metal Berpasir tebal 0.35 mm', volume: 165, satuan: 'm2', hargaSatuan: 135000 },
      { kode: 'F.4', nama: 'Pasang Nok / Bubungan Genteng Metal Berpasir', volume: 24, satuan: 'm1', hargaSatuan: 85000 },
      { kode: 'F.5', nama: 'Pasang Lisplank GRC Board tebal 8 mm lebar 20 cm', volume: 36, satuan: 'm1', hargaSatuan: 75000 },
    ],
  },
  {
    romawi: 'VII',
    judul: 'PEKERJAAN PLAFON / LANGIT-LANGIT',
    items: [
      { kode: 'G.1', nama: 'Rangka Plafon Besi Hollow Galvanis 40x40 & 20x40 mm', volume: 144, satuan: 'm2', hargaSatuan: 88000 },
      { kode: 'G.2', nama: 'Penutup Plafon PVC Tebal 8 mm motif serat kayu minimalis', volume: 144, satuan: 'm2', hargaSatuan: 155000 },
      { kode: 'G.3', nama: 'Pasang Lis Profil Plafon PVC keliling ruangan', volume: 72, satuan: 'm1', hargaSatuan: 25000 },
    ],
  },
  {
    romawi: 'VIII',
    judul: 'PEKERJAAN LANTAI & KERAMIK',
    items: [
      { kode: 'H.1', nama: 'Urugan Pasir Bawah Lantai dipadatkan t = 10 cm', volume: 14.4, satuan: 'm3', hargaSatuan: 250000 },
      { kode: 'H.2', nama: 'Cor Beton Rabat Bawah Lantai Campuran 1:3:5 t = 5 cm', volume: 7.2, satuan: 'm3', hargaSatuan: 980000 },
      { kode: 'H.3', nama: 'Pasangan Lantai Granit Tile 60x60 cm Polish Homogenous', volume: 144, satuan: 'm2', hargaSatuan: 285000 },
      { kode: 'H.4', nama: 'Pasang Plint Lantai Granit 10x60 cm', volume: 72, satuan: 'm1', hargaSatuan: 45000 },
      { kode: 'H.5', nama: 'Pasangan Keramik Lantai Toilet Anti Selip 25x25 cm', volume: 12, satuan: 'm2', hargaSatuan: 180000 },
    ],
  },
  {
    romawi: 'IX',
    judul: 'PEKERJAAN PENGECATAN',
    items: [
      { kode: 'I.1', nama: 'Pengecatan Tembok Dinding Interior 3 Lapis (Plamir + Cat Dasar + Cat Akhir)', volume: 370, satuan: 'm2', hargaSatuan: 36000 },
      { kode: 'I.2', nama: 'Pengecatan Tembok Dinding Eksterior Tahan Cuaca (Weathershield)', volume: 160, satuan: 'm2', hargaSatuan: 48000 },
      { kode: 'I.3', nama: 'Pengecatan Lisplank Eksterior', volume: 36, satuan: 'm1', hargaSatuan: 28000 },
    ],
  },
  {
    romawi: 'X',
    judul: 'PEKERJAAN ELEKTRIKAL & PENERANGAN',
    items: [
      { kode: 'J.1', nama: 'Titik Instalasi Penerangan Lampu Kabel NYM 3x2.5 mm dlm Conduit', volume: 14, satuan: 'Titik', hargaSatuan: 240000 },
      { kode: 'J.2', nama: 'Titik Instalasi Stop Kontak Dinding Kabel NYM 3x2.5 mm', volume: 6, satuan: 'Titik', hargaSatuan: 260000 },
      { kode: 'J.3', nama: 'Lampu LED Tube T8 18 Watt + Kap Batten (Setara Philips)', volume: 14, satuan: 'Set', hargaSatuan: 115000 },
      { kode: 'J.4', nama: 'Pasang Saklar Tunggal & Ganda Standar SNI', volume: 6, satuan: 'Bh', hargaSatuan: 48000 },
      { kode: 'J.5', nama: 'Pasang Stop Kontak Dinding Arde Standar SNI', volume: 6, satuan: 'Bh', hargaSatuan: 52000 },
      { kode: 'J.6', nama: 'Pasang Box Panel Sekring MCB 4 Group + MCB Pengaman Utama', volume: 1, satuan: 'Unit', hargaSatuan: 550000 },
    ],
  },
  {
    romawi: 'XI',
    judul: 'PEKERJAAN SANITAIR & AIR BERSIH/KOTOR',
    items: [
      { kode: 'K.1', nama: 'Pasang Kloset Jongkok Porselen Standar SNI', volume: 2, satuan: 'Bh', hargaSatuan: 475000 },
      { kode: 'K.2', nama: 'Pipa Air Bersih PVC Type AW Dia. 3/4"', volume: 24, satuan: 'm1', hargaSatuan: 38000 },
      { kode: 'K.3', nama: 'Pipa Saluran Air Kotor PVC Type D Dia. 3"', volume: 18, satuan: 'm1', hargaSatuan: 68000 },
      { kode: 'K.4', nama: 'Pipa Saluran Tinja PVC Type D Dia. 4" ke Septictank', volume: 12, satuan: 'm1', hargaSatuan: 95000 },
      { kode: 'K.5', nama: 'Pasang Keran Air Stainless Steel 1/2" & Floor Drain Kamar Mandi', volume: 4, satuan: 'Bh', hargaSatuan: 95000 },
    ],
  },
  {
    romawi: 'XII',
    judul: 'PEKERJAAN AKHIR & PEMBERSIHAN',
    items: [
      { kode: 'L.1', nama: 'Pembersihan Akhir Lokasi Proyek & Pembuangan Puing Sisa Konstruksi', volume: 1, satuan: 'Ls', hargaSatuan: 1200000 },
    ],
  },
];

export function getBerkas001StructuredData(): {
  divisions: (Berkas001RABDivision & { subtotal: number; bobotSubtotal: number })[];
  itemsFlat: (Berkas001RABItem & { jumlahHarga: number; bobot: number })[];
  totalCost: number;
} {
  let counter = 1;
  const itemsFlat: (Berkas001RABItem & { jumlahHarga: number; bobot: number })[] = [];

  // Hitung total dulu
  let totalCost = 0;
  BERKAS_001_RAB_RAW.forEach((group) => {
    group.items.forEach((it) => {
      totalCost += it.volume * it.hargaSatuan;
    });
  });

  const divisions = BERKAS_001_RAB_RAW.map((group) => {
    const divisiTitle = `${group.romawi}. ${group.judul}`;
    let subtotal = 0;
    const divisionItems: Berkas001RABItem[] = [];

    group.items.forEach((it) => {
      const itemCost = it.volume * it.hargaSatuan;
      subtotal += itemCost;
      const bobot = totalCost > 0 ? Math.round((itemCost / totalCost) * 10000) / 100 : 0;

      const fullItem: Berkas001RABItem & { jumlahHarga: number; bobot: number } = {
        no: counter++,
        kode: it.kode,
        divisi: divisiTitle,
        nama: it.nama,
        volume: it.volume,
        satuan: it.satuan,
        hargaSatuan: it.hargaSatuan,
        jumlahHarga: itemCost,
        bobot,
      };

      divisionItems.push(fullItem);
      itemsFlat.push(fullItem);
    });

    const bobotSubtotal = totalCost > 0 ? Math.round((subtotal / totalCost) * 10000) / 100 : 0;

    return {
      divisi: divisiTitle,
      romawi: group.romawi,
      judul: group.judul,
      items: divisionItems,
      subtotal,
      bobotSubtotal,
    };
  });

  return {
    divisions,
    itemsFlat,
    totalCost,
  };
}
