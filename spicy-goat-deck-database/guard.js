/* Fail closed before loading any interactive renderer. No fetch, no CDN. */
(() => {
 const data=window.GOAT_CATALOG;
 const valid=Array.isArray(data)&&data.every(x=>x&&typeof x['Build ID']==='string'&&Array.isArray(x.images)&&x.details&&x.family&&['Claims','Facts','Appearances','Deck Cards','Engine Composition','coverageRecords','related'].every(k=>Array.isArray(x[k])));
 if (!valid) {
  window.GOAT_CATALOG=[];
  for (const s of [...document.querySelectorAll('script[src]')]) if(!/site-config|catalog|guard/.test(s.getAttribute('src'))) s.remove();
  const a=document.createElement('p');a.id='data-error';a.setAttribute('role','alert');a.textContent='Katalogdaten fehlen oder sind beschädigt. Bitte das vollständige Paket neu entpacken.';document.body.prepend(a);
 }
})();
