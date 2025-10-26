export function getGoogleDriveDownloadLink(url, type = 'zip') {
  if (!url || typeof url !== 'string') return null;

  const match = url.match(/[-\w]{25,}/);
  const fileId = match ? match[0] : null;
  if (!fileId) return null;

  // === Google Docs → PDF ===
  if (type === 'pdf' && url.includes('document')) {
    return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
  }

  // === Google Sheets → Excel ===
  if (type === 'excel' && url.includes('spreadsheets')) {
    return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
  }

  // === File thường (ZIP, EXE, PDF upload) ===
  if (
    ['zip', 'exe', 'pdf'].includes(type) &&
    url.includes('drive.google.com/file')
  ) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return null;
}
