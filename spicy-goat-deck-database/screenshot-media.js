'use strict';
// Local, individually authorized archive captures supplement external images.
(() => {
  if (!window.GOAT_SITE?.public_approved || window.GOAT_SITE.mode!=='pages') return;
  const policy=window.GOAT_SCREENSHOT_MEDIA;
  if(policy?.version!==1 || !Array.isArray(policy.images))return;
  const ids=new Set((window.GOAT_CATALOG||[]).map(r=>r['Build ID']));
  const externalIds=new Set((window.GOAT_EXTERNAL_MEDIA?.images||[]).filter(r=>r.public_display===true).map(r=>r.build_id));
  const rows=policy.images.filter(r=>ids.has(r.build_id)&&!externalIds.has(r.build_id)&&/^BLD-\d{3}$/.test(r.build_id)&&/^[a-f0-9]{64}$/.test(r.sha256)&&r.path===`images/screenshots/${r.build_id}-${r.anonymized===true?r.source_sha256:r.sha256}.jpg`&&(!r.anonymized||/^[a-f0-9]{64}$/.test(r.source_sha256))&&Array.isArray(r.dimensions)&&r.dimensions.length===2&&r.dimensions.every(n=>Number.isInteger(n)&&n>0)&&typeof r.source_url==='string'&&r.source_url.startsWith('https://'));
  const byId=new Map(rows.map(r=>[r.build_id,r]));
  window.GOAT_SCREENSHOT_IDS=new Set(byId.keys());
  function figure(row,detail){
    const box=document.createElement('figure');box.className='screenshot-media';
    const img=document.createElement('img');img.src=row.path+(row.anonymized?'?privacy='+row.sha256:'');img.alt='Archivierte Deckabbildung '+row.build_id+' · Screenshot-Ersatz';img.className=detail?'external-original':'deck-thumb';img.style.maxWidth='100%';img.style.objectFit='contain';
    const caption=document.createElement('p');caption.className='muted';caption.textContent=`${row.anonymized?'Anonymisierter':'Archivierter'} Screenshot-Ersatz${row.anonymized?' · Personen abgedeckt; keine Karten rekonstruiert':''}`;
    img.addEventListener('error',()=>{window.GOAT_IMAGE_DETAILS?.clear(box,caption);caption.textContent='Screenshot-Ersatz derzeit nicht verfügbar. Bitte die Quelle öffnen.';img.remove()});
    if(detail){const button=document.createElement('button');button.type='button';button.dataset.image=img.src;button.dataset.anonymized=String(row.anonymized===true);button.setAttribute('aria-label','Screenshot-Ersatz vergrößern');button.append(img);box.append(button)}else{img.dataset.deck=row.build_id;box.append(img)}
    const link=document.createElement('a');link.href=row.source_url;link.textContent='Quelle der archivierten Deckabbildung';link.target='_blank';link.rel='noopener noreferrer';box.append(caption,link);
    const technical=document.createElement('p');technical.className='muted';technical.textContent='Technische Angaben aus dem geprüften Website-Export.';
    window.GOAT_IMAGE_DETAILS?.show(box,technical,[['Bildmaße (Export)',`${row.dimensions[0]} × ${row.dimensions[1]} Pixel`],['Dateityp','image/jpeg'],['SHA-256 (erwartet)',row.sha256]]);
    return box;
  }
  document.addEventListener('click',event=>{const b=event.target.closest('[data-image]');if(!b)return;const download=document.querySelector('#original-image-download');if(download)download.textContent=b.dataset.anonymized==='true'?'Anonymisierten Screenshot speichern':'Angezeigtes Bild speichern';});
  function refresh(){
    for(const card of document.querySelectorAll('#g .card')){
      if(card.dataset.screenshotMedia)continue;card.dataset.screenshotMedia='checked';const row=byId.get(card.querySelector('[data-deck]')?.dataset.deck),placeholder=card.querySelector('.thumb-placeholder,.image-missing');if(row&&placeholder)placeholder.replaceWith(figure(row,false));
    }
    for(const tr of document.querySelectorAll('#deck-table tbody tr')){
      const cell=tr.querySelector('td');if(!cell||cell.dataset.screenshotMedia)continue;cell.dataset.screenshotMedia='checked';const row=byId.get(tr.querySelector('[data-deck]')?.dataset.deck);if(row){cell.textContent='';cell.append(figure(row,false))}
    }
    const dialog=document.querySelector('#deck'),hero=document.querySelector('#content .hero > div'),id=document.querySelector('#deck-id')?.textContent,row=byId.get(id);
    if(dialog?.open&&hero&&row&&!hero.dataset.screenshotMedia){
      hero.dataset.screenshotMedia='checked';hero.prepend(figure(row,true));
      for(const note of hero.querySelectorAll('.note:not(.external-source-only)'))note.textContent='Archivierte Deckabbildung als freigegebener Screenshot-Ersatz. Die Quellenangaben und historischen Unsicherheiten bleiben bestehen.';
      const note=hero.querySelector('.external-source-only p');if(note)note.textContent='Die archivierte Deckabbildung wird als Screenshot-Ersatz angezeigt. Ergänzende Original- und Anbieteransichten sind hier verlinkt. '+(id==='BLD-135'?'Die Anbieterbilddatei wird nicht direkt abgerufen.':note.textContent);
    }
  }
  const stats=document.querySelector('#stats');if(stats)stats.textContent=stats.textContent.replace('(keine lokalen Bildkopien)',`und ${rows.length} Screenshot-Ersatzbilder`);
  const metric=document.querySelectorAll('.phase7-highlights article')[2];if(metric){metric.textContent='';const n=document.createElement('strong');n.textContent=new Set([...externalIds,...byId.keys()]).size;metric.append(n,document.createTextNode('Mit Deckbild'))}
  const privacy=document.querySelector('#external-media-privacy p');if(privacy)privacy.textContent=privacy.textContent.replace('Es werden keine Bilddateien auf GitHub gespeichert.',`${rows.length} freigegebene Screenshot-Ersatzbilder werden lokal über GitHub Pages bereitgestellt; dafür findet kein Abruf beim ursprünglichen Bildanbieter statt.`);
  let queued=false;const update=()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;refresh()})}};
  new MutationObserver(update).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
  const content=document.querySelector('#content');if(content)new MutationObserver(update).observe(content,{childList:true,subtree:true});if(typeof render==='function')render();refresh();
})();
