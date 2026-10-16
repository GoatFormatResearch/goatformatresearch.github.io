/* Shared offline/online deck registration view. No network or canonical edits. */
(function(root){
 'use strict';
 const signature=rows=>JSON.stringify(rows.map(c=>[c['Card / Entry'],c.Count,c.Section]));
 function model(deck,reference={},plans={}){
  const sections={Monster:[],Spell:[],Trap:[],MainUnknown:[],Side:[],Extra:[],Unknown:[]};
  const totals={Main:0,Side:0,Extra:0},issues={Main:[],Side:[],Extra:[]},copies={Main:new Map(),Side:new Map(),Extra:new Map()},rows=deck['Deck Cards']||[];
  const sourceSections={Main:[],Side:[],Extra:[]};
  for(const raw of rows){
   const name=String(raw['Card / Entry']||''),section=String(raw.Section||'');
   const count=/^[1-3]$/.test(String(raw.Count))?Number(raw.Count):null;
   const card=Object.hasOwn(reference,name)?reference[name]:null;
   const part=/^Main(?:$| [–-] (?:Monster|Spell|Trap)$)/.test(section)?'Main':['Side','Extra'].includes(section)?section:'Unknown';
   const valid=card&&Number.isSafeInteger(card.id)&&card.id>0&&card.id<100000000&&['Monster','Spell','Trap'].includes(card.kind);
   if(part!=='Unknown'){
    sourceSections[part].push(raw);
    if(count===null)issues[part].push('Unklare Anzahl: '+name);
    if(!valid)issues[part].push('Keine eindeutige Kartenkennung: '+name);
    if(part==='Main'&&valid&&card.fusion)issues.Main.push('Fusionskarte im Main Deck: '+name);
    if(part==='Extra'&&valid&&!card.fusion)issues.Extra.push('Keine belegte Fusionskarte im Extra Deck: '+name);
    const explicit=section.match(/^Main [–-] (Monster|Spell|Trap)$/)?.[1];
    if(explicit&&valid&&explicit!==card.kind)issues[part].push('Widersprüchlicher Kartentyp: '+name);
    if(count!==null)totals[part]+=count;
    if(valid&&count!==null){copies[part].set(card.id,(copies[part].get(card.id)||0)+count);if(copies[part].get(card.id)>3)issues[part].push('Mehr als drei Exemplare: '+name)}
   }
   const key=part==='Main'?(valid?card.kind:'MainUnknown'):part;
   sections[key].push({name,count,id:valid?card.id:null,source:raw['Source URL']||'',note:raw['Evidence Note']||''});
  }
  const plan=Object.hasOwn(plans,deck['Build ID'])?plans[deck['Build ID']]:null,errors=[...issues.Main];
  if(!plan||!plan.complete_sections?.Main)errors.push('Vollständiges Main Deck noch nicht für den Export geprüft.');
  else{
   if(!/^L[234](?:\s|$)/.test(String(deck['Decklist Coverage']||'')))errors.push('Keine belegte vollständige Main-Deck-Abdeckung.');
   if(signature(sourceSections.Main)!==plan.signatures?.Main)errors.push('Main Deck weicht vom geprüften Exportstand ab.');
   if(!Number.isSafeInteger(plan.expected?.Main)||totals.Main!==plan.expected.Main||totals.Main<40)errors.push('Main-Deck-Kartensumme stimmt nicht.');
  }
  const included={Main:errors.length===0,Side:false,Extra:false},warnings=[];
  for(const part of ['Side','Extra']){
   included[part]=!!(plan?.complete_sections?.[part]&&signature(sourceSections[part])===plan.signatures?.[part]&&totals[part]===plan.expected?.[part]&&!issues[part].length);
   if(part==='Side'&&included.Side)for(const [id,n] of copies.Side)if(n+(copies.Main.get(id)||0)>3)included.Side=false;
   if(!included[part])warnings.push((part==='Side'?'Side Deck':'Extra/Fusion Deck')+' unvollständig oder ungeklärt: wird nicht exportiert.');
  }
  const exportTotals={Main:included.Main?totals.Main:0,Side:included.Side?totals.Side:0,Extra:included.Extra?totals.Extra:0};
  return {sections,totals,exportTotals,included,warnings,errors:[...new Set(errors)],eligible:errors.length===0,plan,buildId:deck['Build ID']};
 }
 function ydk(m){
  if(!m.eligible)throw Error('Unvollständiges oder ungeprüftes Main Deck: kein YDK-Export.');
  const expand=items=>items.flatMap(c=>Array(c.count).fill(String(c.id)));
  const notes=['#created by Spicy GOAT Deck Database'];
  if(!m.included.Side)notes.push('# Side Deck omitted: incomplete or unverified.');
  if(!m.included.Extra)notes.push('# Extra Deck omitted: incomplete or unverified.');
  return [...notes,'#main',...expand([...m.sections.Monster,...m.sections.Spell,...m.sections.Trap]),'#extra',...expand(m.included.Extra?m.sections.Extra:[]),'!side',...expand(m.included.Side?m.sections.Side:[]),''].join('\n');
 }
 function mount(id){
  const deck=(root.GOAT_CATALOG||[]).find(r=>r['Build ID']===id),panel=document.querySelector('#deck-panel-list > .panel');
  if(!deck||!panel||panel.querySelector('.deck-registration'))return;
  const m=model(deck,root.GOAT_CARD_REFERENCE?.cards,root.GOAT_DECK_EXPORTS),view=document.createElement('div');view.className='deck-registration';
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
  const actions=node('div',undefined,'deck-export-actions'),button=node('button','Für Duelingbook exportieren (.ydk)');button.type='button';button.disabled=!m.eligible;button.setAttribute('aria-describedby','deck-export-status');actions.append(button);view.append(actions);
  const status=node('p',m.eligible?'Main Deck vollständig. Export: '+m.exportTotals.Main+' Main / '+m.exportTotals.Side+' Side / '+m.exportTotals.Extra+' Extra.':'Export gesperrt: Das vollständige Main Deck oder eindeutige Kartenkennungen sind noch nicht belegt.','deck-export-status');status.id='deck-export-status';view.append(status);
  if(m.eligible)for(const warning of m.warnings)view.append(node('p',warning,'note'));
  if(m.plan){const note=node('p',m.plan.version_note,'muted');view.append(note)}
  if(m.eligible){
   const help=node('p',undefined,'muted');help.append(document.createTextNode('Datei herunterladen und in '));const a=node('a','Duelingbook');a.href='https://www.duelingbook.com/';a.target='_blank';a.rel='noopener noreferrer';help.append(a,document.createTextNode(' im Deck Constructor über „Import Deck“ öffnen. Keine automatische Kontoänderung; keine erneute Prüfung historischer Legalität.'));view.append(help);
   button.addEventListener('click',()=>{const blob=new Blob([ydk(m)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=String(id).replace(/[^A-Za-z0-9_-]/g,'_')+'.ydk';a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)});
  }else{const details=node('details'),summary=node('summary','Warum ist der Export gesperrt?'),list=node('ul');for(const e of m.errors)list.append(node('li',e));details.append(summary,list);view.append(details)}
  const count=items=>items.reduce((s,c)=>s+(c.count||0),0);
  function group(title,items,parent,empty){
   const section=node('section',undefined,'deck-card-group'),h=node('h4',title),total=node('span',String(count(items))+' erfasst','deck-card-total');h.append(total);section.append(h);
   if(items.length){const list=node('ul');for(const card of items){const li=node('li'),qty=node('span',card.count===null?'?':card.count+'×','deck-card-count'),name=node('span',card.name);li.append(qty,name);list.append(li)}section.append(list)}
   else section.append(node('p',empty||'Keine Karten erfasst.','muted'));
   parent.append(section);
  }
  const main=node('section',undefined,'deck-main-section');main.append(node('h3','Main Deck · '+m.totals.Main+(m.eligible?' Karten':' bekannte Exemplare')));const grid=node('div',undefined,'deck-main-columns');main.append(grid);view.append(main);
  group('Monster',m.sections.Monster,grid);group('Zauber',m.sections.Spell,grid);group('Fallen',m.sections.Trap,grid);
  if(m.sections.MainUnknown.length)group('Main: Kartentyp ungeklärt',m.sections.MainUnknown,main);
  const auxiliary=node('div',undefined,'deck-aux-columns');view.append(auxiliary);
  for(const [part,label] of [['Side','Side Deck'],['Extra','Extra / Fusion Deck']])group(label,m.sections[part],auxiliary,m.included[part]&&m.plan.expected[part]===0?'In dieser Version ausdrücklich mit 0 Karten registriert.':'Nicht erfasst oder noch unvollständig; nicht als leer bestätigt.');
  if(m.sections.Unknown.length)group('Nicht zugeordnete Karten / Hinweise',m.sections.Unknown,view);
  const attribution=node('p',undefined,'muted deck-card-reference');const source=node('a','Kartenkennungen und Typen: Project Ignis');source.href='https://github.com/ProjectIgnis/BabelCDB';source.target='_blank';source.rel='noopener noreferrer';attribution.append(source,document.createTextNode(' · lokal gespeicherter Metadatenstand. Keine zusätzlichen Kartenbilder oder Laufzeitabfragen.'));view.append(attribution);
  const raw=node('details',undefined,'deck-transcription'),summary=node('summary','Transkription, Kartenbelege und Abdeckungsstatus');raw.append(summary);
  for(const child of [...panel.children])if(child.tagName!=='H3')raw.append(child);
  panel.append(view,raw);
 }
 const api={model,ydk,signature,mount};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.GOAT_DECK_LIST=api;
})(typeof window==='object'?window:globalThis);
