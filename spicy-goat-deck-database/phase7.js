/* One enhancement layer for both modes; no network calls, no canonical edits. */
(() => {
 const config=window.GOAT_SITE||{}, records=window.GOAT_CATALOG||[];
 const status=document.querySelector('#publication-status');
 status.textContent=config.private_preview?'PRIVATE VORSCHAU MIT ECHTEN DECKS · Keine öffentliche Inhalts- oder Bildfreigabe · '+config.version:config.mode==='offline'?'Privater Offline-Bestand · '+config.version:config.test_only?'NICHT PRODUKTIVE PAGES-VORSCHAU · ausschließlich UI-Testdaten · keine Veröffentlichungsfreigabe':'Freigegebener öffentlicher Metadatenkatalog · '+records.length+' explizit freigegebene Profile';
 document.querySelector('.eyebrow').textContent='SPICY GOAT · '+(config.mode==='offline'?'PRIVATE FORSCHUNG':config.public_approved?'ÖFFENTLICHER KATALOG':'PAGES-VORSCHAU');
 const imgs=new Set(records.flatMap(r=>r.images));
 document.querySelector('#stats').textContent=`${records.length} Profile · ${new Set(records.map(r=>r['Concept ID'])).size} Konzepte · ${new Set(records.map(r=>r['Family ID'])).size} Familien · ${imgs.size} referenzierte Bilder · ${config.version}`;
 const landing=document.createElement('section');landing.id='phase7-home';landing.className='phase7-landing';
 landing.innerHTML='<h2>Deckideen, Belege und offene Fragen.</h2><p>Erkunde ungewöhnliche Strategien und ihre dokumentierten Quellen. Fehlende Informationen bleiben sichtbar unbekannt. Turniererfolg, Belegqualität und redaktionelle Einschätzung sind getrennte Angaben.</p><div class="phase7-highlights"></div><p><a href="#browser">Deckübersicht öffnen ↓</a> · <a href="#phase7-method">Datenqualität verstehen</a></p>';
 for(const [label,count] of [['Profile',records.length],['Familien',new Set(records.map(r=>r['Family ID'])).size],['Mit Bild',records.filter(r=>r.images.length).length],['Mit Kartenzeilen',records.filter(r=>r['Deck Cards'].length).length]]){const box=document.createElement('article'),n=document.createElement('strong');n.textContent=count;box.append(n,document.createTextNode(label));landing.querySelector('.phase7-highlights').append(box)}
 // Keep the first deck row ahead of project statistics and secondary tools.
 const main=document.querySelector('main'),browser=document.querySelector('#browser');
 browser.after(landing);
 const intro=document.createElement('p');intro.className='catalog-intro';
 intro.textContent='Ungewöhnliche GOAT-Strategien mit Decklisten, Bildern und nachvollziehbaren Quellen.';
 document.querySelector('h1').after(intro);
 const filterDrawer=document.querySelector('.filter-drawer');
 const filterNote=document.querySelector('.filter-note');
 if(filterDrawer&&filterNote)filterDrawer.append(filterNote);
 const results=document.querySelector('#results'),reset=document.querySelector('#reset'),chips=document.querySelector('#chips');
 const resultTools=document.createElement('div');resultTools.className='catalog-result-tools';
 resultTools.append(results,reset);browser.prepend(resultTools);
 if(chips)browser.prepend(chips);
 const tools=document.createElement('details');tools.id='catalog-tools';tools.className='catalog-tools';
 const toolsLabel=document.createElement('summary');toolsLabel.textContent='Merkliste, gespeicherte Ansichten & Teilen';tools.append(toolsLabel);
 for(const node of main.querySelectorAll(':scope > .personal-drawer,:scope > .view-link-tools'))tools.append(node);
 browser.after(tools);
 // The full export label stays available with the methodology below the catalog.
 const compactStats=()=>{document.querySelector('#stats').textContent=`${records.length} Deckprofile · ${new Set(records.map(r=>r['Family ID'])).size} Familien · ${String(config.version).split(' · ')[0]}`};
 compactStats();

 const review=window.GOAT_PUBLICATION_REVIEW||{};
 if(config.private_preview){
  const featured=document.createElement('section');featured.className='phase8-featured';featured.innerHTML='<h2>Eine kuratierte Reise durch GOAT.</h2><p>24 echte Builds aus dem unveränderten Master. Vollständige Listen und offene Bildtranskriptionen bleiben unterscheidbar. Die Reihenfolge ist eine redaktionelle Auswahl, kein neues Spice-Ranking.</p><div class="phase8-picks"></div>';
  for(const row of records.slice(0,6)){const card=document.createElement('article');card.className='panel';const title=document.createElement('h3');title.textContent=row['Deck / Build'];const info=document.createElement('p');info.textContent=review[row['Build ID']]?.selection_reason||'';const b=document.createElement('button');b.dataset.deck=row['Build ID'];b.textContent='Deckprofil öffnen';card.append(title,info,b);featured.querySelector('.phase8-picks').append(card)}
  landing.append(featured);
  const families=document.createElement('p');families.className='phase8-families';
  for(const id of new Set(records.map(x=>x['Family ID']))){const x=records.find(r=>r['Family ID']===id),b=document.createElement('button');b.dataset.filter='family';b.dataset.value=id;b.className='inline-filter';b.textContent=x.family['Canonical Family']||id;families.append(b)}landing.append(families);
 }
 const method=document.createElement('section');method.id='phase7-method';method.innerHTML='<h2>Methodik & Versionsstatus</h2><p>Eine Deckliste kann unvollständig sein, obwohl ein Bild vorhanden ist. E0–E5 beschreibt dokumentierte Turnierleistung; A–D die Dokumentation. Spice ist eine redaktionelle Einschätzung. Unbekannte Main-, Side- und Extra-Karten werden nicht ergänzt.</p><p>Die Online-Ausgabe benötigt eine gesonderte Freigabe jedes Profils und jedes Bilds. Eine bestandene technische Prüfung ersetzt keine Rechtefreigabe.</p>';document.querySelector('main').append(method);
 const version=document.createElement('p');version.className='muted';version.textContent='Exportstand: '+config.version;method.append(version);
 const thumbnails=config.thumbnails||{};
 const preview=()=>{for(const img of document.querySelectorAll('#content img,#g img,#deck-table img')){const key=img.getAttribute('src');if(thumbnails[key]){img.src=thumbnails[key];img.dataset.original=key}}};
 for(const selector of ['#content','#g','#deck-table'])new MutationObserver(preview).observe(document.querySelector(selector),{childList:true,subtree:true});preview();
 const detailReview=()=>{
  const target=document.querySelector('#content'),id=document.querySelector('#deck-id')?.textContent,row=records.find(r=>r['Build ID']===id),r=review[id];
  if(!row||!r||target.querySelector('[data-publication-review]'))return;
  const panel=document.createElement('section');panel.className='panel phase8-review';panel.dataset.publicationReview=id;
  const h=document.createElement('h3');h.textContent='Beleglage & Veröffentlichungsstatus';panel.append(h);
  const note=document.createElement('p');note.className='note';note.textContent='Fachlich: '+(r.factual_review_status==='CANONICAL_STRUCTURED_COMPLETE_RECORDED'?'Vollständige Liste im historischen Bestand; keine neue unabhängige Freigabe':'Unvollständige Dokumentation; Nachprüfung erforderlich')+' · Rechte nicht freigegeben · Nur private Vorschau. Historische Bewertungen sind keine Primärfakten.';panel.append(note);
  const sums=document.createElement('dl');
  for(const [key,value]of Object.entries(r.sections)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value.state==='REGISTERED_ZERO'?'0 – explizit so registriert':value.named_copies?value.named_copies+' namentlich gezählte Kopien; '+value.coverage_statements.join(' '):'Unbekannt / keine vollständige namentliche Transkription';sums.append(dt,dd)}panel.append(sums);
  const analytical=document.createElement('p');analytical.textContent='Übernommene Analyse: Novelty '+(r.historical_analysis['Modern Novelty Score']??'unbekannt')+'/10; redaktioneller Spice '+(row['Editorial Spice']||'unbekannt')+'. '+(r.historical_analysis['Method note']||'Individuelle Bewertungsherkunft ungeklärt.');panel.append(analytical);
  const ul=document.createElement('ul');for(const text of r.limitations){const li=document.createElement('li');li.textContent=text;ul.append(li)}panel.append(ul);
  const sources=document.createElement('ul');for(const u of r.source_urls){const li=document.createElement('li'),a=document.createElement('a');a.href=u;a.rel='noopener noreferrer';a.target='_blank';a.textContent=u;li.append(a);sources.append(li)}panel.append(sources);
  const images=document.createElement('p');images.textContent=r.images.map(x=>`${x.dimensions[0]} × ${x.dimensions[1]} px · ${x.format} · Original unverändert · Bildrechte ungeklärt`).join(' / ');panel.append(images);
  const related=document.createElement('div');related.className='related';
  for(const other of records.filter(x=>x['Build ID']!==id&&(x['Concept ID']===row['Concept ID']||x['Family ID']===row['Family ID']||x.Player===row.Player)).slice(0,6)){const b=document.createElement('button');b.dataset.deck=other['Build ID'];b.textContent=other['Deck / Build'];related.append(b)}panel.append(related);target.prepend(panel);
 };
 new MutationObserver(detailReview).observe(document.querySelector('#content'),{childList:true});detailReview();
 // Automatic shareable state; the native view-link validator remains authoritative.
 let timer;
 const sync=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(document.querySelector('#deck').open||!window.GOAT_CATALOG)return;try{const state=captureView();history.replaceState(null,'',makeViewURL(state))}catch{}},180)};
 window.addEventListener('hashchange',()=>clearTimeout(timer));
 document.addEventListener('click',event=>{if(event.target.closest('[data-deck],[data-image]'))clearTimeout(timer)});
 for(const id of ['q',...filterIds,'sort','page-size','favorite-only'])document.querySelector('#'+id)?.addEventListener(id==='q'?'input':'change',sync);
 for(const id of ['next','prev','cards-view','table-view','reset'])document.querySelector('#'+id)?.addEventListener('click',sync);
 // Visible error information, rather than only a broken-image icon.
 document.addEventListener('error',event=>{if(event.target.tagName!=='IMG')return;const img=event.target;if(img.parentElement.querySelector('.phase7-image-error'))return;const text=document.createElement('p');text.className='phase7-image-error';text.setAttribute('role','alert');text.textContent='Bilddatei fehlt oder ist beschädigt. Keine Ersatzabbildung verfügbar.';img.parentElement.append(text)},true);
 // Public fixture has no authoritative rankings; never invent ratings or deck cards.
 if(config.test_only){document.title='Spicy GOAT · NICHT PRODUKTIVE Pages-Vorschau';document.querySelector('h1').textContent='Die Oberfläche erproben.'}
})();
