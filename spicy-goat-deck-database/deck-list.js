/* Shared offline/online deck registration view. No network or canonical edits. */
(function(root){
 'use strict';
 const signature=rows=>JSON.stringify(rows.map(c=>[c['Card / Entry'],c.Count,c.Section]));
 function model(deck,reference={},plans={}){
  const sections={Monster:[],Spell:[],Trap:[],MainUnknown:[],Side:[],Extra:[],Unknown:[]};
  const totals={Main:0,Side:0,Extra:0},errors=[],copies=new Map(),rows=deck['Deck Cards']||[];
  for(const raw of rows){
   const name=String(raw['Card / Entry']||''),section=String(raw.Section||'');
   const count=/^[1-3]$/.test(String(raw.Count))?Number(raw.Count):null;
   const card=Object.hasOwn(reference,name)?reference[name]:null;
   const part=/^Main(?:$| [–-] (?:Monster|Spell|Trap)$)/.test(section)?'Main':['Side','Extra'].includes(section)?section:'Unknown';
   const validCard=card&&Number.isSafeInteger(card.id)&&card.id>0&&card.id<100000000&&['Monster','Spell','Trap'].includes(card.kind);
   if(count===null)errors.push('Unklare Anzahl: '+name);
   if(!validCard)errors.push('Keine eindeutige Kartenkennung: '+name);
   if(part==='Unknown')errors.push('Ungeklärter Deckbereich: '+name);
   if(part==='Main'&&validCard&&card.fusion)errors.push('Fusionskarte im Main Deck: '+name);
   if(part==='Extra'&&validCard&&!card.fusion)errors.push('Keine belegte Fusionskarte im Extra Deck: '+name);
   const explicit=section.match(/^Main [–-] (Monster|Spell|Trap)$/)?.[1];
   if(explicit&&validCard&&explicit!==card.kind)errors.push('Widersprüchlicher Kartentyp: '+name);
   if(part!=='Unknown'&&count!==null)totals[part]+=count;
   if(validCard&&count!==null){copies.set(card.id,(copies.get(card.id)||0)+count);if(copies.get(card.id)>3)errors.push('Mehr als drei Exemplare: '+name)}
   const key=part==='Main'?(validCard?card.kind:'MainUnknown'):part;
   sections[key].push({name,count,id:validCard?card.id:null,source:raw['Source URL']||'',note:raw['Evidence Note']||''});
  }
  const plan=Object.hasOwn(plans,deck['Build ID'])?plans[deck['Build ID']]:null;
  if(!plan)errors.push('Vollständige Main-/Side-/Extra-Version noch nicht für den Export geprüft.');
  else{
   if(!/^L[34](?:\s|$)/.test(String(deck['Decklist Coverage']||'')))errors.push('Keine vollständige L3-/L4-Abdeckung.');
   if(signature(rows)!==plan.signature)errors.push('Kartenliste weicht vom geprüften Exportstand ab.');
   for(const part of ['Main','Side','Extra'])if(!Number.isSafeInteger(plan.expected?.[part])||plan.expected[part]<0||totals[part]!==plan.expected[part])errors.push('Kartensumme stimmt nicht: '+part);
   if(totals.Main<40)errors.push('Main Deck unter 40 Karten.');
  }
  return {sections,totals,errors:[...new Set(errors)],eligible:errors.length===0,plan,buildId:deck['Build ID']};
 }
 function ydk(m){
  if(!m.eligible)throw Error('Unvollständige oder ungeprüfte Deckliste: kein YDK-Export.');
  const expand=items=>items.flatMap(c=>Array(c.count).fill(String(c.id)));
  return ['#created by Spicy GOAT Deck Database','#main',...expand([...m.sections.Monster,...m.sections.Spell,...m.sections.Trap]),'#extra',...expand(m.sections.Extra),'!side',...expand(m.sections.Side),''].join('\n');
 }
 function mount(id){
  const deck=(root.GOAT_CATALOG||[]).find(r=>r['Build ID']===id),panel=document.querySelector('#deck-panel-list > .panel');
  if(!deck||!panel||panel.querySelector('.deck-registration'))return;
  const m=model(deck,root.GOAT_CARD_REFERENCE?.cards,root.GOAT_DECK_EXPORTS),view=document.createElement('div');view.className='deck-registration';
  const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
  const actions=node('div',undefined,'deck-export-actions'),button=node('button','Für Duelingbook exportieren (.ydk)');button.type='button';button.disabled=!m.eligible;button.setAttribute('aria-describedby','deck-export-status');actions.append(button);view.append(actions);
  const status=node('p',m.eligible?'Geprüfte vollständige Version: '+m.totals.Main+' Main / '+m.totals.Side+' Side / '+m.totals.Extra+' Extra.':'Export gesperrt: Die vollständige Deckliste oder eindeutige Kartenkennungen sind noch nicht belegt.','deck-export-status');status.id='deck-export-status';view.append(status);
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
  for(const [part,label] of [['Side','Side Deck'],['Extra','Extra / Fusion Deck']])group(label,m.sections[part],auxiliary,m.eligible&&m.plan.expected[part]===0?'In dieser Version ausdrücklich mit 0 Karten registriert.':'Nicht erfasst oder noch unvollständig; nicht als leer bestätigt.');
  if(m.sections.Unknown.length)group('Nicht zugeordnete Karten / Hinweise',m.sections.Unknown,view);
  const attribution=node('p',undefined,'muted deck-card-reference');const source=node('a','Kartenkennungen und Typen: Project Ignis');source.href='https://github.com/ProjectIgnis/BabelCDB';source.target='_blank';source.rel='noopener noreferrer';attribution.append(source,document.createTextNode(' · lokal gespeicherter Metadatenstand. Keine zusätzlichen Kartenbilder oder Laufzeitabfragen.'));view.append(attribution);
  const raw=node('details',undefined,'deck-transcription'),summary=node('summary','Transkription, Kartenbelege und Abdeckungsstatus');raw.append(summary);
  for(const child of [...panel.children])if(child.tagName!=='H3')raw.append(child);
  panel.append(view,raw);
 }
 const api={model,ydk,signature,mount};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.GOAT_DECK_LIST=api;
})(typeof window==='object'?window:globalThis);
