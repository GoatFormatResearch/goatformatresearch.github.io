'use strict';
// One gallery for preserved offline images, reviewed external images and screenshots.
// The displayed deck is authoritative; public catalog rows intentionally have no images.
function prepareDeckImageGallery(){
 const dialog=document.querySelector('#lightbox'),image=document.querySelector('#full-image');
 const content=document.querySelector('#content'),prev=document.querySelector('#image-prev'),next=document.querySelector('#image-next');
 const position=document.querySelector('#image-position'),zoom=document.querySelector('#zoom'),download=document.querySelector('#original-image-download');
 if(!dialog||!image||!content||!prev||!next||!position)return;
 let opener=null;
 const source=b=>new URL(b.dataset.image,document.baseURI).href;
 const items=()=>{
  const seen=new Set();
  return [...content.querySelectorAll('[data-image]')].filter(b=>{
   const img=b.querySelector('img');
   if(!img||(img.complete&&!img.naturalWidth)||!b.dataset.image)return false;
   const url=source(b);if(seen.has(url))return false;seen.add(url);return true;
  });
 };
 function controls(){
  const list=items(),index=list.findIndex(b=>source(b)===image.src),multiple=list.length>1;
  for(const button of [prev,next]){button.hidden=!multiple;button.style.display=multiple?'':'none';}
  prev.disabled=index<=0;next.disabled=index<0||index>=list.length-1;
  position.textContent=index<0?'Deckbild':`Bild ${index+1} von ${list.length}`;
  if(index>=0){
   opener=list[index];
   if(download)download.textContent=opener.dataset.anonymized==='true'?'Anonymisierten Screenshot speichern':'Angezeigtes Bild speichern';
  }
 }
 function show(button){
  if(!button)return;
  opener=button;image.classList.remove('actual');if(zoom)zoom.textContent='Originalgröße';
  image.alt=button.querySelector('img')?.alt||'Deckabbildung';
  if(download){download.hidden=true;download.removeAttribute('href');}
  image.src=source(button);
  dialog.querySelector('.image-scroll')?.scrollTo({left:0,top:0,behavior:'auto'});
  controls();
 }
 function move(delta){
  const list=items(),index=list.findIndex(b=>source(b)===image.src);
  if(index>=0&&list[index+delta])show(list[index+delta]);
 }
 prev.onclick=()=>move(-1);next.onclick=()=>move(1);
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-image]');
  if(button&&content.contains(button)){opener=button;controls();}
 });
 // Supersede the historical catalog-only key handler. In original-size view,
 // the focusable image viewport keeps its existing arrow-key panning behavior.
 dialog.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
  if(event.target.matches('input,textarea,select,[contenteditable="true"]'))return;
  if(event.target===dialog.querySelector('.image-scroll')&&image.classList.contains('actual'))return;
  event.preventDefault();event.stopImmediatePropagation();move(event.key==='ArrowLeft'?-1:1);
 },true);
 image.addEventListener('load',controls);
 content.addEventListener('load',()=>{if(dialog.open)controls();},true);
 content.addEventListener('error',()=>{if(dialog.open)controls();},true);
 new MutationObserver(()=>{if(dialog.open)controls();}).observe(content,{childList:true,subtree:true});
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
 controls();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepareDeckImageGallery,{once:true});else prepareDeckImageGallery();
