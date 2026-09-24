/**
 * Indonesian Number to Words Converter (Terbilang)
 * Digunakan untuk Kwitansi resmi dan Laporan Pertanggungjawaban (LPJ).
 */

const bil: string[] = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
];

function angkaKeKata(nilai: number): string {
  nilai = Math.floor(Math.abs(nilai));
  if (nilai < 12) {
    return bil[nilai];
  } else if (nilai < 20) {
    return angkaKeKata(nilai - 10) + ' Belas';
  } else if (nilai < 100) {
    return angkaKeKata(Math.floor(nilai / 10)) + ' Puluh ' + angkaKeKata(nilai % 10);
  } else if (nilai < 200) {
    return 'Seratus ' + angkaKeKata(nilai - 100);
  } else if (nilai < 1000) {
    return angkaKeKata(Math.floor(nilai / 100)) + ' Ratus ' + angkaKeKata(nilai % 100);
  } else if (nilai < 2000) {
    return 'Seribu ' + angkaKeKata(nilai - 1000);
  } else if (nilai < 1000000) {
    return angkaKeKata(Math.floor(nilai / 1000)) + ' Ribu ' + angkaKeKata(nilai % 1000);
  } else if (nilai < 1000000000) {
    return angkaKeKata(Math.floor(nilai / 1000000)) + ' Juta ' + angkaKeKata(nilai % 1000000);
  } else if (nilai < 1000000000000) {
    return angkaKeKata(Math.floor(nilai / 1000000000)) + ' Miliar ' + angkaKeKata(nilai % 1000000000);
  } else if (nilai < 1000000000000000) {
    return angkaKeKata(Math.floor(nilai / 1000000000000)) + ' Triliun ' + angkaKeKata(nilai % 1000000000000);
  }
  return '';
}

export function terbilangRupiah(nominal: number): string {
  if (nominal === 0) return 'Nol Rupiah';
  const hasil = angkaKeKata(nominal).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
}

export function formatRupiah(nominal: number, withPrefix = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(nominal || 0);
  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function formatTanggalIndo(tanggalStr: string): string {
  if (!tanggalStr) return '-';
  try {
    const parts = tanggalStr.split('-');
    if (parts.length !== 3) return tanggalStr;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return tanggalStr;
  }
}

export function generateKodeBukti(prefix: string, index: number, tahun: string = '2026'): string {
  const padded = String(index).padStart(3, '0');
  return `${prefix}/${tahun}/${padded}`;
}
