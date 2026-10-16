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
 // Keep deck browsing primary; reuse existing controls and their event handlers.
 const navigation=document.querySelector('.browse-nav'),primary=navigation.querySelector('.nav-primary');
 const databaseMenu=navigation.querySelector('.nav-menu'),databaseList=databaseMenu.querySelector('.nav-popover');
 const dashboard=primary.querySelector('[data-workspace="dashboard"]');
 if(dashboard){dashboard.textContent='Bestandsübersicht';databaseList.prepend(dashboard)}
 databaseMenu.querySelector('summary').textContent='Datenbank';
 const openTools=document.createElement('button');openTools.id='open-catalog-tools';openTools.type='button';openTools.textContent='Meine Werkzeuge';openTools.setAttribute('aria-controls','catalog-tools');openTools.setAttribute('aria-expanded','false');primary.append(openTools);
 toolsLabel.textContent='Meine Werkzeuge';
 const groups=document.createElement('div');groups.className='tool-groups';
 const group=(title,id)=>{const section=document.createElement('section');section.className='tool-group';section.id=id;const h=document.createElement('h3');h.textContent=title;section.append(h);groups.append(section);return section};
 const favorites=group('Merkliste','tools-favorites'),views=group('Gespeicherte Ansichten & Teilen','tools-views'),exports=group('Datenexport','tools-exports'),backups=group('Persönliche Sicherungen','tools-backups');
 const personalDrawer=tools.querySelector('.personal-drawer');
 const rows=personalDrawer?[...personalDrawer.querySelectorAll(':scope > .saved-tools')]:[];
 if(rows[0])favorites.append(rows[0]);
 const move=(id,target)=>{const node=document.querySelector('#'+id);if(node)target.append(node.closest('label')||node)};
 for(const id of ['save-search','saved-search','load-search','delete-search'])move(id,views);
 const sharing=tools.querySelector('.view-link-tools');if(sharing)views.append(sharing);
 move('export-csv',exports);
 for(const id of ['backup-all','restore-all','backup-workspace','restore-workspace','workspace-status'])move(id,backups);
 // Retain any controls added by later source versions rather than discarding them.
 if(personalDrawer){
  const remaining=[...personalDrawer.querySelectorAll('button,input,select,textarea')];
  if(remaining.length){const more=group('Weitere Werkzeuge','tools-more');for(const row of [...personalDrawer.children])if(row.tagName!=='SUMMARY')more.append(row)}
  personalDrawer.remove();
 }
 tools.append(groups);
 const returnDecks=document.createElement('button');returnDecks.id='tools-return-decks';returnDecks.type='button';returnDecks.textContent='Zurück zur Deckübersicht';tools.append(returnDecks);
 openTools.addEventListener('click',()=>{tools.open=!tools.open;if(tools.open){tools.scrollIntoView({block:'start'});toolsLabel.focus()}});
 toolsLabel.tabIndex=0;
 tools.addEventListener('toggle',()=>openTools.setAttribute('aria-expanded',String(tools.open)));
 returnDecks.addEventListener('click',()=>{tools.open=false;const decks=primary.querySelector('[data-section="decks"]');decks.click();decks.focus();navigation.scrollIntoView({block:'start'})});
 // Escape closes a menu and returns focus; native summary keys still work.
 navigation.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const menu=event.target.closest('.nav-menu');if(menu?.open){menu.open=false;menu.querySelector('summary').focus();event.preventDefault()}});
 // Native view handlers set aria-pressed on navigation buttons. The tools
 // shortcut is a disclosure, not a view selection; keep its semantics distinct.
 document.addEventListener('click',event=>{if(event.target.closest('.browse-nav'))queueMicrotask(()=>openTools.removeAttribute('aria-pressed'))});

 // The full export label stays available with the methodology below the catalog.
 const compactStats=()=>{document.querySelector('#stats').textContent=`${records.length} Deckprofile · ${new Set(records.map(r=>r['Family ID'])).size} Familien · ${String(config.version).split(' · ')[0]}`};
 compactStats();

 // Deck-first presentation: retain the native tab controller and all data.
 const prioritizeDeck=()=>{
  const content=document.querySelector('#content'),hero=content.querySelector('.hero');
  if(!hero)return;
  if(!hero.dataset.deckPriority){
   hero.dataset.deckPriority='true';
   const overview=content.querySelector('#deck-panel-overview'),info=hero.children[1];
   if(info&&overview){
    // Keep identity before editorial descriptions; never reinterpret missing values.
    const facts=info.querySelector('dl');if(facts){facts.classList.add('deck-key-facts');info.prepend(facts)}
    for(const heading of [...info.querySelectorAll('h3')]){
     const paragraph=heading.nextElementSibling;overview.append(heading);
     if(paragraph?.tagName==='P')overview.append(paragraph);
    }
   }
   content.prepend(hero);
   // The hero is persistent across tabs, so the old cloned gallery is redundant.
   content.querySelector('.decklist-gallery')?.remove();
   const actions=content.querySelector('#deck-panel-overview > .deck-actions');
   if(actions){actions.classList.add('deck-secondary-actions');content.append(actions)}
   const toolbar=content.querySelector('.deck-toolbar'),head=document.querySelector('#deck > .dialog-head');
   if(toolbar&&head){
    head.querySelector('.deck-toolbar')?.remove();
    toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Decknavigation und Direktlink');
    head.append(toolbar);
   }
   const list=content.querySelector('#deck-tab-list');if(list)list.click();
   window.GOAT_DECK_LIST?.mount(document.querySelector('#deck-id').textContent);
  }
  const note=content.querySelector('#deck-review-status'),evidence=content.querySelector('#deck-panel-evidence');
  if(note&&evidence&&note.parentElement!==evidence)evidence.prepend(note);
  const reviewPanel=content.querySelector('[data-publication-review]');
  if(reviewPanel&&reviewPanel.parentElement===content&&content.lastElementChild!==reviewPanel)content.append(reviewPanel);
 };
 if(window.GOAT_TABS){const originalMount=window.GOAT_TABS.mount;window.GOAT_TABS.mount=id=>{
  // Remove the preceding header controls before native global ID lookups bind
  // the new deck. Moving the live nodes preserves navigation and copy handlers.
  document.querySelector('#deck > .dialog-head > .deck-toolbar')?.remove();
  originalMount(id);prioritizeDeck();
 }}
 new MutationObserver(prioritizeDeck).observe(document.querySelector('#content'),{childList:true});prioritizeDeck();

 // Remove only redundant presentation, never distinct evidence or live errors.
 const tidyDeck=()=>{
  const content=document.querySelector('#content'),media=content.querySelector('.hero > div');
  if(media){
   const seen=new Set();
   for(const note of media.querySelectorAll(':scope > p.note')){
    if(note.matches('[role],[aria-live]')||note.querySelector('a,img,button,input,[role],[aria-live]'))continue;
    const key=note.textContent.replace(/\s+/g,' ').trim();
    if(!key)continue;
    if(seen.has(key))note.remove();else seen.add(key);
   }
   const thumbs=media.querySelector('.thumbs');
   // A single copy of the same preview adds no image navigation.
   if(thumbs?.children.length===1){
    const main=media.querySelector('.preview[data-image]'),only=thumbs.firstElementChild;
    if(main&&only.dataset.image===main.dataset.image)thumbs.remove();
   }
  }
  const overview=content.querySelector('#deck-panel-overview');
  if(overview&&!overview.dataset.emptyReview){
   overview.dataset.emptyReview='true';let removed=0;
   const placeholders={'Kernidee':'Keine vertiefte Kernidee erfasst.','Warum spicy?':'Keine vertiefte Bewertung erfasst.'};
   for(const h of [...overview.querySelectorAll(':scope > h3')]){
    const p=h.nextElementSibling;
    if(p?.tagName==='P'&&p.textContent===placeholders[h.textContent]){h.remove();p.remove();removed++}
   }
   if(removed===2){const p=document.createElement('p');p.className='muted deck-analysis-empty';p.textContent='Für dieses Deck ist noch keine vertiefte Strategieanalyse erfasst.';overview.append(p)}
  }
  for(const dl of content.querySelectorAll('dl'))if(!dl.children.length)dl.remove();
 };
 new MutationObserver(tidyDeck).observe(document.querySelector('#content'),{childList:true,subtree:true});tidyDeck();

 // Explain historical dimensions without translating, upgrading or rescoring data.
 const makeQualityGuide=()=>{
  const box=document.createElement('details');box.className='quality-guide';
  const summary=document.createElement('summary');summary.textContent='Bewertungen verstehen';box.append(summary);
  for(const text of [
   'Turnierleistung (E0–E5): historische Einstufung der Turnierleistung bzw. des Turnierbezugs. Sie ist keine Bewertung der Quellenzuverlässigkeit oder Spielstärke.',
   'Dokumentation (A–D): übernommene Dokumentationsstufe. Decklistenabdeckung (L-Stufe): separat erfasster Stand der Kartenliste. Ein vorhandenes Bild bedeutet keine vollständige Transkription.',
   'Spice: redaktionelle Einschätzung. Novelty: historische Einschätzung der Originalität, sofern erfasst. Beides sind analytische Bewertungen, keine Primärfakten.',
   'Die Originalwerte und ihre teils uneinheitlichen Beschreibungen bleiben erhalten. Diese Beschriftung ist keine neue fachliche Prüfung und keine Veröffentlichungs- oder Bildrechtefreigabe.'
  ]){const p=document.createElement('p');p.textContent=text;box.append(p)}
  return box;
 };
 const guide=makeQualityGuide();guide.id='quality-help';(filterDrawer||tools).append(guide);
 const fieldNames={'Competitive Evidence':'Turnierleistung (historischer Wert)','Documentation':'Dokumentation (A–D)','Decklist Coverage':'Decklistenabdeckung (L-Stufe)','Editorial Spice':'Spice (redaktionell)','Modern Novelty Score':'Originalität (historischer Novelty-Wert)'};
 const labelControl=(id,label)=>{const node=[...document.querySelector('#'+id).parentElement.childNodes].find(x=>x.nodeType===3);if(node)node.textContent=label};
 labelControl('evidence','Turnierleistung mindestens');labelControl('spice','Spice (redaktionell) mindestens');
 filterLabels.evidence='Turnierleistung ≥';filterLabels.spice='Spice (redaktionell) ≥';
 document.querySelector('#sort option[value=evidence]').textContent='Turnierleistung absteigend';
 document.querySelector('#sort option[value=spice]').textContent='Spice (redaktionell) absteigend';
 const explainQuality=()=>{
  for(const card of document.querySelectorAll('#g .card')){
   if(card.dataset.qualityLabels)continue;
   const row=records.find(x=>x['Build ID']===card.querySelector('[data-deck]')?.dataset.deck),tags=card.querySelector('.tags');
   if(!row||!tags)continue;card.dataset.qualityLabels='true';
   const [spice,evidence]=tags.children;
   if(spice)spice.textContent='Spice (redaktionell): '+(row['Editorial Spice']||'nicht erfasst');
   if(evidence){const raw=String(row['Competitive Evidence']||'');evidence.textContent='Turnierleistung: '+(raw.match(/^E[0-5](?=\s|$)/)?.[0]||raw||'nicht erfasst');evidence.title=raw||'Nicht erfasst'}
   const doc=document.createElement('span');doc.className='tag quality-documentation';const raw=String(row.Documentation||'');doc.textContent='Dokumentation: '+(raw.match(/^[A-D](?=\s|$)/)?.[0]||raw||'nicht erfasst');doc.title=raw||'Nicht erfasst';tags.append(doc);
  }
  const info=document.querySelector('#content > .hero > div:nth-child(2)'),tags=info?.querySelector('.tags');
  if(tags&&!tags.dataset.qualityLabels){
   tags.dataset.qualityLabels='true';const row=records.find(x=>x['Build ID']===document.querySelector('#deck-id')?.textContent);
   if(row){const [spice,evidence]=tags.children;if(spice)spice.textContent='Spice (redaktionell): '+(row['Editorial Spice']||'nicht erfasst');if(evidence)evidence.textContent='Turnierleistung: '+(row['Competitive Evidence']||'nicht erfasst');
    const doc=document.createElement('span');doc.className='tag quality-documentation';doc.textContent='Dokumentation: '+(row.Documentation||'nicht erfasst');tags.append(doc)}
   info.append(makeQualityGuide());
  }
  for(const el of document.querySelectorAll('#content dt,#content th'))if(fieldNames[el.textContent])el.textContent=fieldNames[el.textContent];
  const table=document.querySelector('#deck-table');
  for(const [key,label]of [['evidence','Turnierleistung ↓'],['spice','Spice (redaktionell) ↓']]){const b=table.querySelector(`[data-sort="${key}"]`);if(b&&b.textContent!==label)b.textContent=label}
 };
 for(const target of [main,document.querySelector('#content')])new MutationObserver(explainQuality).observe(target,{childList:true,subtree:true});explainQuality();

 // Shared presentation only: validation and image loading stay in their providers.
 window.GOAT_IMAGE_DETAILS={
  show(host,status,rows){
   let details=host.querySelector(':scope > .image-proof');
   if(!details){details=document.createElement('details');details.className='image-proof';const summary=document.createElement('summary');summary.textContent='Bildnachweis & Details';details.append(summary);host.append(details)}
   if(status.parentElement!==details)details.append(status);
   details.querySelector('dl')?.remove();const dl=document.createElement('dl');
   for(const [label,value]of rows){if(value===null||value===undefined||value==='')continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);dl.append(dt,dd)}details.append(dl);
   return details;
  },
  clear(host,status){const details=host.querySelector(':scope > .image-proof');if(details?.contains(status))host.append(status);details?.remove()}
 };

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
 const hasThumbnails=Object.keys(thumbnails).length>0;
 const preview=()=>{if(!hasThumbnails)return;for(const img of document.querySelectorAll('#content img,#g img,#deck-table img')){const key=img.getAttribute('src');if(thumbnails[key]){img.src=thumbnails[key];img.dataset.original=key}}};
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
 // Focusable, keyboard-pannable original image. Existing gallery/close handlers stay intact.
 const prepareImageViewport=()=>{
  const dialog=document.querySelector('#lightbox'),image=document.querySelector('#full-image'),zoom=document.querySelector('#zoom'),viewport=dialog?.querySelector('.image-scroll');
  if(!dialog||!image||!zoom||!viewport)return;
  viewport.id='image-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Verschiebbarer Deckbildbereich');
  const hint=document.createElement('p');hint.id='image-view-state';hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');viewport.before(hint);
  viewport.setAttribute('aria-describedby',hint.id);zoom.setAttribute('aria-controls',viewport.id);zoom.setAttribute('aria-describedby',hint.id);
  const update=()=>{
   const text=image.classList.contains('actual')?'Originalgröße · Pfeiltasten verschieben das fokussierte Bild. Pos1/Ende: Anfang/Ende.':'Bild eingepasst · „Originalgröße“ öffnet die Ansicht in Originalauflösung.';
   if(hint.textContent!==text)hint.textContent=text;
  };
  const reset=()=>viewport.scrollTo({left:0,top:0,behavior:'auto'});
  zoom.addEventListener('click',()=>{update();if(image.classList.contains('actual'))viewport.focus({preventScroll:true});else reset()});
  viewport.addEventListener('keydown',event=>{
   if(event.target!==viewport||!image.classList.contains('actual')||!image.complete||!image.naturalWidth||event.altKey||event.ctrlKey||event.metaKey)return;
   const x=Math.max(48,Math.round(viewport.clientWidth/8)),y=Math.max(48,Math.round(viewport.clientHeight/8));
   const moves={ArrowLeft:[-x,0],ArrowRight:[x,0],ArrowUp:[0,-y],ArrowDown:[0,y],PageUp:[0,-viewport.clientHeight*.85],PageDown:[0,viewport.clientHeight*.85]};
   if(moves[event.key])viewport.scrollBy({left:moves[event.key][0],top:moves[event.key][1],behavior:'auto'});
   else if(event.key==='Home')reset();
   else if(event.key==='End')viewport.scrollTo({left:viewport.scrollWidth,top:viewport.scrollHeight,behavior:'auto'});
   else return;
   event.preventDefault();event.stopPropagation();
  });
  new MutationObserver(changes=>{if(changes.some(c=>c.attributeName==='src'))reset();update()}).observe(image,{attributes:true,attributeFilter:['class','src']});
  new MutationObserver(()=>{reset();update()}).observe(dialog,{attributes:true,attributeFilter:['open']});
  update();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepareImageViewport,{once:true});else prepareImageViewport();
 // Public fixture has no authoritative rankings; never invent ratings or deck cards.
 if(config.test_only){document.title='Spicy GOAT · NICHT PRODUKTIVE Pages-Vorschau';document.querySelector('h1').textContent='Die Oberfläche erproben.'}
})();
