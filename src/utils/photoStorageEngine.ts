import { ProgressPhotoItem } from '../types';

/**
 * Kompres gambar sebelum disimpan ke Base64 / LocalStorage
 * Mengoptimalkan resolusi (maksimal 1280px) dan kualitas JPEG agar ringan dan tidak membebani memori browser
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Gambar ke canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark waktu & tanggal pada foto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, height - 32, width, 32);
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          `Dokumentasi Fisik Proyek P2SP · ${new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}`,
          12,
          height - 12
        );

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        // Fallback jika decode gagal
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Menghasilkan item foto progres mingguan
 */
export const createProgressPhotoItem = async (
  file: File,
  mingguKe: number,
  customCaption?: string
): Promise<ProgressPhotoItem> => {
  const compressedUrl = await compressImageFile(file);
  const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    url: compressedUrl,
    caption: customCaption || `Progres Fisik: ${baseName}`,
    tanggal: new Date().toISOString().split('T')[0],
    mingguKe,
  };
};

/**
 * Contoh foto dokumentasi fisik konstruksi untuk simulasi / demo
 */
export const createDemoProgressPhotos = (mingguKe: number): ProgressPhotoItem[] => {
  // SVG Generator untuk ilustrasi foto lapangan konstruksi realistis
  const svgPhoto1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><rect y="220" width="600" height="180" fill="%2394a3b8"/><rect x="80" y="80" width="440" height="240" fill="%23cbd5e1" stroke="%2364748b" stroke-width="4"/><line x1="80" y1="140" x2="520" y2="140" stroke="%2394a3b8" stroke-width="2"/><line x1="80" y1="200" x2="520" y2="200" stroke="%2394a3b8" stroke-width="2"/><line x1="80" y1="260" x2="520" y2="260" stroke="%2394a3b8" stroke-width="2"/><rect x="180" y="140" width="100" height="160" fill="%23e2e8f0" stroke="%23047857" stroke-width="4"/><rect x="340" y="120" width="120" height="100" fill="%23e2e8f0" stroke="%23047857" stroke-width="4"/><text x="300" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a" text-anchor="middle">DOKUMENTASI PEKERJAAN PASANGAN DINDING HEBEL</text><text x="300" y="70" font-family="sans-serif" font-size="12" fill="%23475569" text-anchor="middle">Minggu Ke-${mingguKe} · Capaian Fisik Bangunan Ruang Kelas</text><rect y="360" width="600" height="40" fill="%230f172a"/><text x="20" y="385" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">P2SP BANTUAN REVITALISASI SEKOLAH</text></svg>`;

  const svgPhoto2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><rect y="240" width="600" height="160" fill="%2364748b"/><polygon points="80,180 300,60 520,180" fill="%23e2e8f0" stroke="%230369a1" stroke-width="6"/><line x1="160" y1="140" x2="160" y2="180" stroke="%230284c7" stroke-width="4"/><line x1="240" y1="90" x2="240" y2="180" stroke="%230284c7" stroke-width="4"/><line x1="360" y1="90" x2="360" y2="180" stroke="%230284c7" stroke-width="4"/><line x1="440" y1="140" x2="440" y2="180" stroke="%230284c7" stroke-width="4"/><text x="300" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a" text-anchor="middle">DOKUMENTASI PERAKITAN RANGKA KUDA-KUDA BAJA RINGAN</text><text x="300" y="70" font-family="sans-serif" font-size="12" fill="%23475569" text-anchor="middle">Minggu Ke-${mingguKe} · Pemasangan Kanal C.75 & Reng Zincalume SNI</text><rect y="360" width="600" height="40" fill="%230f172a"/><text x="20" y="385" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">P2SP BANTUAN REVITALISASI SEKOLAH</text></svg>`;

  return [
    {
      id: `demo-p1-${mingguKe}`,
      url: svgPhoto1,
      caption: `Pemasangan Dinding Bata Ringan & Pengecoran Kolom Praktis (Minggu Ke-${mingguKe})`,
      tanggal: new Date().toISOString().split('T')[0],
      mingguKe,
    },
    {
      id: `demo-p2-${mingguKe}`,
      url: svgPhoto2,
      caption: `Perakitan Rangka Kuda-Kuda Baja Ringan & Pengukuran Nok Atap (Minggu Ke-${mingguKe})`,
      tanggal: new Date().toISOString().split('T')[0],
      mingguKe,
    },
  ];
};
