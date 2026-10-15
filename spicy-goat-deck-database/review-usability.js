/* Derived enhancements only; no requests and no alteration of preserved data. */
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.querySelector('#lightbox');
  const image = document.querySelector('#full-image');
  const content = document.querySelector('#content');
  if (!lightbox || !image || !content) return;
  let imageOpener = null;
  const status = document.createElement('p');
  status.id = 'image-dimensions';
  status.setAttribute('aria-live', 'polite');
  const original = document.createElement('a');
  original.id = 'original-image-download';
  original.textContent = 'Unverändertes Originalbild speichern';
  original.setAttribute('download', '');
  lightbox.append(status, original);
  const update = () => {
    if (!image.complete) {
      status.textContent = 'Originalbild wird geladen …';
      original.removeAttribute('href');
      original.hidden = true;
      return;
    }
    if (image.complete && image.naturalWidth) {
      status.textContent = `Originalauflösung: ${image.naturalWidth} × ${image.naturalHeight} Pixel`;
      original.href = image.src;
      original.hidden = false;
    } else {
      status.textContent = 'Das lokale Originalbild ist nicht verfügbar. Bitte das vollständige Offline-Paket prüfen.';
      original.removeAttribute('href');
      original.hidden = true;
    }
  };
  image.addEventListener('load', update);
  image.addEventListener('error', update);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-image]');
    if (button) { imageOpener = button; update(); }
  });
  lightbox.addEventListener('close', () => imageOpener?.focus());
  const annotate = () => {
    if (content.querySelector('#deck-review-status')) return;
    const id = new URLSearchParams(location.hash.slice(1)).get('deck');
    const record = window.GOAT_CATALOG?.find(x => x['Build ID'] === id);
    if (!record) return;
    const note = document.createElement('p');
    note.id = 'deck-review-status';
    note.className = 'note';
    note.textContent = `Dokumentation: ${record.Documentation || 'Ungeklärt'} · Decklistenabdeckung: ${record['Decklist Coverage'] || 'Ungeklärt'}. Technische Vorschau; fachliche Freigabe ausstehend.`;
    content.prepend(note);
  };
  new MutationObserver(annotate).observe(content, {childList: true});
  annotate();
});
