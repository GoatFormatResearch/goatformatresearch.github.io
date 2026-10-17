'use strict';
// Presentation only. Never rewrite catalog rows, source quotations or export values.
(function(root){
 const evidence={
  'Concept / non-tournament evidence':'Konzept / Belege ohne Turnierbezug',
  'Documented tournament appearance':'Dokumentierter Turnierauftritt',
  'Event listing only':'Nur im Veranstaltungsverzeichnis aufgeführt',
  'primary event coverage':'Primärbericht zur Veranstaltung',
  'Top Cut':'Finalrunde', 'Top Cut / Top 16':'Finalrunde / Top 16', 'Top Cut / Top 8':'Finalrunde / Top 8',
  'direct image':'Direkter Bildbeleg',
  'placement shown on organizer image':'Platzierung auf der Veranstalterabbildung angegeben',
  '3rd place and interview':'3. Platz und Interview', 'Top 4':'Top 4', 'Finalist':'Finalist', 'Tournament winner':'Turniersieger'
 };
 const documentation={
  'complete tournament 40/15/15':'Vollständige Turnierliste 40/15/15',
  'complete tournament Main 40 / Side 15 / Extra 14':'Vollständige Turnierliste: Main 40 / Side 15 / Extra 14',
  'full source list':'Vollständige Liste aus der Quelle',
  'official coverage and player-labeled organizer image':'Offizieller Bericht und Veranstalterabbildung mit Spielerangabe',
  'official deck tech':'Offizielles Deckprofil', 'official event coverage':'Offizieller Veranstaltungsbericht',
  'official exact registered list plus organizer image':'Offizielle registrierte Kartenliste und Veranstalterabbildung',
  'official organizer image':'Offizielle Veranstalterabbildung',
  'organizer carousel and labeled original deck image':'Bilderfolge des Veranstalters und beschriftetes Originaldeckbild',
  'primary organizer registration / attributed original image':'Primäre Turnierregistrierung / zugeordnetes Originalbild',
  'complete Main image transcription; Side/Extra unresolved':'Vollständige Bildtranskription des Main Decks; Side/Extra ungeklärt',
  'original image':'Originalbild', 'partial original image':'Teilweises Originalbild',
  'organizer image, URL unverified':'Veranstalterabbildung, URL ungeprüft',
  'supplied organizer graphic':'Bereitgestellte Veranstaltergrafik'
 };
 const coverage={
  'Main 37/40; Side 13/15; Extra unresolved':'Main 37/40; Side 13/15; Extra ungeklärt',
  'Source/image available':'Quelle/Bild vorhanden', 'partial named cards':'Teilweise namentlich erfasste Karten',
  'partial verified Main':'Teilweise geprüftes Main Deck', '40/40 Main':'Main 40/40',
  'Main 40 / Side 15; Extra unresolved':'Main 40 / Side 15; Extra ungeklärt',
  'Main 40/40 structured':'Main 40/40 strukturiert erfasst',
  'Main 40/40 structured; Side/Extra unresolved':'Main 40/40 strukturiert erfasst; Side/Extra ungeklärt',
  'Main 40/40; Side and Extra incomplete':'Main 40/40; Side und Extra unvollständig',
  'Complete structured list':'Vollständige strukturierte Liste', '69 tournament cards':'69 Turnierkarten',
  '70 cards':'70 Karten', 'full 40/15/15':'Vollständig 40/15/15'
 };
 const labels={
  'Build ID':'Build-ID','Concept ID':'Konzept-ID','Family ID':'Familien-ID','Appearance ID':'Auftritts-ID',
  'Competitive Evidence':'Turnierleistung (historischer Wert)','Turnierevidenz':'Turnierleistung (historischer Wert)',
  'Documentation':'Dokumentation (A–D)','Decklist Coverage':'Decklistenabdeckung (L-Stufe)',
  'Editorial Spice':'Spice (redaktionell)','Modern Novelty Score':'Originalität (historischer Novelty-Wert)',
  'Placement':'Platzierung','Event':'Veranstaltung','Event Date':'Veranstaltungsdatum','Participants':'Teilnehmerzahl',
  'Card / Entry':'Karte / Eintrag','Count':'Anzahl','Section':'Bereich','Evidence Note':'Belegnotiz',
  'Coverage Level':'Abdeckungsstufe','Main State':'Main-Deck-Status','Side State':'Side-Deck-Status',
  'Fusion/Extra State':'Extra-/Fusion-Deck-Status','Next Upgrade':'Nächster Prüfschritt',
  'Field / Claim':'Feld / Aussage','Value':'Wert','Evidence Type':'Belegart','Confidence':'Zuordnungssicherheit',
  'Evidence State':'Belegstatus','Source URL':'Quellenlink','Notes':'Anmerkungen','Fact Type':'Faktentyp',
  'Win Condition':'Siegbedingung','Gameplan':'Spielplan','Schwächen / Constraints':'Schwächen / Einschränkungen',
  'Key-Card-Rollen':'Rollen der Schlüsselkarten','Builder-Kommentar / Originalaussage':'Kommentar des Deckentwicklers / Originalaussage'
 };
 const text=v=>v===null||v===undefined?'':String(v);
 const own=(map,key)=>Object.prototype.hasOwnProperty.call(map,key);
 function graded(raw,pattern,map){const match=raw.match(pattern);return match&&own(map,match[2])?match[1]+' – '+map[match[2]]:raw;}
 function placement(value){
  const raw=text(value);if(!raw||raw==='None')return 'Nicht erfasst';
  const special={'1st place / Winner':'1. Platz / Sieger','Tied 5th/6th':'Geteilter 5./6. Platz','Top 8 / Worlds-invite playoff winner':'Top 8 / Sieger des Entscheidungsspiels um die WM-Einladung'};
  if(own(special,raw))return special[raw];
  const ordinal=raw.match(/^([1-9]\d{0,2})(st|nd|rd|th)(?: place)?( \/ Top [1-9]\d*)?$/i);
  if(ordinal){const n=Number(ordinal[1]),suffix=n%100>=11&&n%100<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th');
   if(ordinal[2].toLowerCase()===suffix)return ordinal[1]+'. Platz'+(ordinal[3]||'');}
  const rank=raw.match(/^Rank ([1-9]\d{0,2})( \/ Top [1-9]\d*)?$/);
  return rank?rank[1]+'. Platz'+(rank[2]||''):raw;
 }
 function value(key,input){
  const raw=text(input);
  if(['Placement','Platzierung'].includes(key))return placement(input);
  if(['Competitive Evidence','Turnierevidenz'].includes(key))return graded(raw,/^(E[0-5]) – (.+)$/,evidence);
  if(['Documentation','Dokumentation'].includes(key))return graded(raw,/^([A-D]) – (.+)$/,documentation);
  if(['Decklist Coverage','Decklistenabdeckung'].includes(key))return graded(raw,/^(L[1-4]) – (.+)$/,coverage);
  return raw;
 }
 const api=Object.freeze({placement,value,label:key=>own(labels,key)?labels[key]:key});
 if(typeof module==='object'&&module.exports)module.exports=api;else root.GOAT_DE=api;
})(typeof window==='object'?window:globalThis);
