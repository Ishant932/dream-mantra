/** Reliable blob download — append anchor to DOM (required in many browsers). */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadText(text, filename, mime = 'text/csv;charset=utf-8;') {
  const content = String(text || '').replace(/^\ufeff/, '');
  const blob = new Blob(['\ufeff', content], { type: mime });
  downloadBlob(blob, filename);
}
