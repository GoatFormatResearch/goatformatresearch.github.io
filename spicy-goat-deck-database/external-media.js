'use strict';
// Public mode only. Original bytes stay on the publisher's server; blob URLs
// exist only in browser memory after a credentialless, integrity-checked GET.
(() => {
  if (!window.GOAT_SITE?.public_approved || window.GOAT_SITE.mode !== 'pages' || location.protocol === 'file:') return;
  const policy = window.GOAT_EXTERNAL_MEDIA;
  if (!policy || policy.version !== 1 || policy.authorization !== 'OWNER_EXPLICIT_AUTOMATIC_EXTERNAL_IMAGES_20261015' || !Array.isArray(policy.images)) return;
  const catalogIds=new Set((window.GOAT_CATALOG||[]).map(r=>r['Build ID']));
  const cache = new Map(), urls = new Set();
  const valid = r => {
    try {
      const u = new URL(r.url), s = new URL(r.source_page);
      return r.public_display === true && catalogIds.has(r.build_id) && /^BLD-\d+$/.test(r.build_id) && ['sha256','profile_sha256','source_page_sha256'].every(k=>/^[a-f0-9]{64}$/.test(r[k])) && typeof r.reviewed_by==='string' && !!r.reviewed_by.trim() && typeof r.reviewed_at==='string' && !!r.reviewed_at.trim() &&
        r.embedding_basis === 'PUBLIC_ORGANIZER_ORIGINAL_NO_RESTRICTION_OBSERVED' &&
        r.privacy_basis === 'MINIMIZED_CREDENTIALLESS_FETCH_PROJECT_ASSESSMENT' &&
        r.access_review === 'CORS_ANONYMOUS_PUBLIC_NO_BYPASS' &&
        [u,s].every(x => x.protocol === 'https:' && x.host === 'www.goatformat.com' && !x.username && !x.password && !x.search && !x.hash && !/%|\\/.test(x.pathname)) &&
        u.pathname.startsWith('/uploads/') && s.pathname.startsWith('/home/') && ['image/png','image/jpeg','image/webp'].includes(r.mime);
    } catch { return false; }
  };
  const records = policy.images.filter(valid);
  const byId = new Map();
  for (const r of records) { if (!byId.has(r.build_id)) byId.set(r.build_id,[]); byId.get(r.build_id).push(r); }
  async function load(r) {
    if (!cache.has(r.url)) cache.set(r.url, (async () => {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(),20000);
      try {
        const integrity = 'sha256-' + btoa(String.fromCharCode(...r.sha256.match(/../g).map(x => parseInt(x,16))));
        const res = await fetch(r.url,{mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',integrity,signal:controller.signal});
        if (!res.ok || res.url !== r.url || res.headers.get('content-type')?.split(';')[0] !== r.mime) throw Error('image response');
        const limit=10000000, advertised=Number(res.headers.get('content-length')||0);
        if (advertised>limit) throw Error('image too large');
        const reader=res.body.getReader(), chunks=[]; let size=0;
        while (true) {const {done,value}=await reader.read(); if(done)break; size+=value.byteLength; if(size>limit){await reader.cancel();throw Error('image too large')}chunks.push(value);}
        const blob = new Blob(chunks,{type:r.mime});
        const actual = [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');
        if(actual!==r.sha256) throw Error('image changed');
        const url=URL.createObjectURL(blob);
        try {const decoded=new Image();decoded.src=url;await decoded.decode();}
        catch(error){URL.revokeObjectURL(url);throw error;}
        urls.add(url);return url;
      } finally { clearTimeout(timer); }
    })());
    return cache.get(r.url);
  }
  function figure(r, detail) {
    const f=document.createElement('figure');f.className='external-media';
    const status=document.createElement('p');status.className='muted';status.textContent='Externes Originalbild wird geprüft und geladen …';f.append(status);
    const a=document.createElement('a');a.href=r.source_page;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Bildquelle: GoatFormat.com';f.append(a);
    load(r).then(url=>{
      const img=document.createElement('img');img.alt='Originaldeckliste '+r.build_id+' · GoatFormat.com';img.className=detail?'external-original':'deck-thumb';img.src=url;
      img.style.maxWidth='100%';img.style.objectFit='contain';
      img.addEventListener('error',()=>{status.textContent='Bild kann nicht angezeigt werden. Bitte die Bildquelle öffnen.';img.remove();});
      if (detail) {const b=document.createElement('button');b.type='button';b.dataset.image=url;b.setAttribute('aria-label','Externes Originalbild vergrößern');b.append(img);f.prepend(b);}
      else {img.dataset.deck=r.build_id;f.prepend(img);}
      status.textContent='Originalauflösung · SHA-256 geprüft · extern geladen';
    }).catch(()=>{status.textContent='Originalbild derzeit nicht verfügbar oder verändert. Bitte die Bildquelle öffnen.';});
    return f;
  }
  function refresh() {
    for (const card of document.querySelectorAll('#g .card')) {
      if (card.dataset.externalMedia) continue;
      card.dataset.externalMedia='checked';
      const id=card.querySelector('[data-deck]')?.dataset.deck, row=byId.get(id)?.[0];
      const placeholder=card.querySelector('.thumb-placeholder,.image-missing');
      if(row && placeholder) placeholder.replaceWith(figure(row,false));
    }
    for (const tr of document.querySelectorAll('#deck-table tbody tr')) {
      const cell=tr.querySelector('td');if(!cell || cell.dataset.externalMedia)continue;
      cell.dataset.externalMedia='checked';const row=byId.get(tr.querySelector('[data-deck]')?.dataset.deck)?.[0];
      if(row){cell.textContent='';cell.append(figure(row,false));}
    }
    const dialog=document.querySelector('#deck'), hero=document.querySelector('#content .hero > div');
    if(dialog?.open && hero && !hero.dataset.externalMedia) {
      hero.dataset.externalMedia='checked';
      const images=document.createDocumentFragment();
      for(const row of byId.get(document.querySelector('#deck-id')?.textContent)||[]) images.append(figure(row,true));
      hero.prepend(images);
    }
  }
  const stats=document.querySelector('#stats');if(stats)stats.textContent=stats.textContent.replace(/\d+ referenzierte Bilder/,`${records.length} externe Bildquellen (keine lokalen Bildkopien)`);
  const metric=document.querySelectorAll('.phase7-highlights article')[2];if(metric){metric.textContent='';const n=document.createElement('strong');n.textContent=byId.size;metric.append(n,document.createTextNode('Mit externer Bildquelle'));}
  const imageFilter=document.querySelector('#image');if(imageFilter?.parentElement?.firstChild?.nodeType===3)imageFilter.parentElement.firstChild.textContent='Bildkopie im Paket';
  const note=document.createElement('details');note.className='wrap';note.id='external-media-privacy';
  const summary=document.createElement('summary');summary.textContent='Externe Bilder und Datenschutz';note.append(summary);
  const text=document.createElement('p');text.textContent='Geprüfte Originalbilder werden automatisch direkt von www.goatformat.com abgerufen. Dabei werden IP-Adresse, Browserinformationen und unsere Website-Herkunft übertragen. Der Abruf sendet und speichert keine Anbieter-Cookies und übermittelt keinen Referrer. Zweck ist die überprüfbare Darstellung historischer Decklisten. Grundlage der Projektbewertung: berechtigtes Interesse an dieser Dokumentation mit minimiertem Abruf. Es werden keine Bilddateien auf GitHub gespeichert. Quellenlinks öffnen die fremde Website mit deren eigenen Datenschutzbedingungen. Verantwortlich für diesen Katalog ist GoatFormatResearch; Kontakt und Einwände sind über die Issues des öffentlichen Website-Repositorys möglich.';note.append(text);
  const privacy=document.createElement('a');privacy.href='https://www.goatformat.com/privacy-policy.html';privacy.textContent='Datenschutz beim Bildanbieter';privacy.rel='noopener noreferrer';privacy.target='_blank';note.append(privacy);document.body.append(note);
  let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;refresh();});}}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
  // Dialog contents are outside main in the shared frontend.
  const content=document.querySelector('#content');if(content)new MutationObserver(refresh).observe(content,{childList:true});
  refresh();window.addEventListener('beforeunload',()=>{for(const u of urls)URL.revokeObjectURL(u);});
})();
