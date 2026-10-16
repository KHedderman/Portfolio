import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {books,bookendX} from './library.js';
import './style.css';
const LibraryScene=lazy(()=>import('./LibraryScene.jsx'));
const Arrow=()=> <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>;
function useReducedMotion(){const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change);},[]);return reduced;}
const fromHash=()=>books.find(book=>book.id===location.hash.slice(1))?.id||null;

function Notes({book}){
 const items=[...book.takeaways,...book.notes];
 if(items.length)return <div className="note-prose">{items.map((note,i)=><p key={i}>{note}</p>)}</div>;
 return <div className="empty-notes"><span className="small-label">A PAGE STILL TAKING SHAPE</span><p>Reading takeaways to come.</p></div>;
}
function Shelf({onOpen,reducedMotion}){
 const viewport=useRef();const stage=useRef();
 const [scroll,setScroll]=useState({overflow:false,left:false,right:false});
 useEffect(()=>{
  const element=viewport.current;
  const update=()=>{const end=element.scrollWidth-element.clientWidth;setScroll({overflow:end>2,left:element.scrollLeft>2,right:element.scrollLeft<end-2});};
  const observer=new ResizeObserver(update);observer.observe(element);observer.observe(stage.current);
  element.addEventListener('scroll',update,{passive:true});update();
  return()=>{observer.disconnect();element.removeEventListener('scroll',update);};
 },[]);
 function move(direction){const element=viewport.current;element.scrollBy({left:direction*element.clientWidth*.7,behavior:reducedMotion?'instant':'smooth'});}
 return <>
  <div ref={viewport} id="shelf-scroll" className="shelf-viewport" tabIndex={scroll.overflow?0:undefined} role="region" aria-label="Bookshelf: scroll horizontally to explore" onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}}}>
   <div ref={stage} className="shelf-stage" style={{'--shelf-width':`${Math.max(780,(bookendX*2+2.5)*110)}px`}}><Suspense fallback={<div className="loading-label">Opening the library…</div>}><LibraryScene onOpen={onOpen} reducedMotion={reducedMotion}/></Suspense></div>
  </div>
  {scroll.overflow&&<nav className="shelf-scroll-controls" aria-label="Explore the bookshelf"><button aria-label="Scroll toward left bookend" aria-controls="shelf-scroll" disabled={!scroll.left} onClick={()=>move(-1)}>←</button><span>Explore the shelf</span><button aria-label="Scroll toward right bookend" aria-controls="shelf-scroll" disabled={!scroll.right} onClick={()=>move(1)}>→</button></nav>}
 </>;
}
export default function App(){
 const [selected,setSelected]=useState(fromHash);const [indexOpen,setIndexOpen]=useState(false);
 const dialog=useRef();const lastFocus=useRef();const reducedMotion=useReducedMotion();
 const book=books.find(b=>b.id===selected);const ordinal=books.findIndex(b=>b.id===selected);
 function openBook(id){lastFocus.current=document.activeElement;setSelected(id);setIndexOpen(false);}
 function closeBook(){setSelected(null);}
 function step(direction){setSelected(books[(ordinal+direction+books.length)%books.length].id);}
 useEffect(()=>{const hash=()=>setSelected(fromHash());window.addEventListener('hashchange',hash);return()=>window.removeEventListener('hashchange',hash);},[]);
 useEffect(()=>{
  if(book){if(!dialog.current.open)dialog.current.showModal();dialog.current.querySelector('.back-button')?.focus({preventScroll:true});dialog.current.scrollTop=0;history.replaceState(null,'',`#${book.id}`);}
  else{if(dialog.current.open)dialog.current.close();history.replaceState(null,'',location.pathname+location.search);const target=lastFocus.current;if(target&&target.offsetParent!==null)target.focus();else document.querySelector('.index-toggle')?.focus();}
 },[selected]);
 function readerKeys(event){if(event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}
 return <main className={`library ${book?'is-reading':''}`}>
  <div className="library-topline"><button className="index-toggle" aria-expanded={indexOpen} aria-controls="reading-index" onClick={()=>setIndexOpen(!indexOpen)}>The full reading list <Arrow/></button></div>
  <section className="shelf-section" aria-label="Interactive book collection" aria-describedby="shelf-hint">
   <header className="library-heading"><h1 aria-label="Kait’s Library"><span className="title-owner">KAIT’S</span><span className="title-library">LIBRARY</span></h1></header>
   <Shelf onOpen={openBook} reducedMotion={reducedMotion}/>
   <p id="shelf-hint" className="library-intro">Books shaping how I think about AI, design, and being human. <span className="spine-invitation">Select a spine.</span></p>
  </section>
  <section id="reading-index" className={`reading-index ${indexOpen?'is-open':''}`} aria-label="Browse every title" hidden={!indexOpen}>
   <div className="index-heading"><h2>On the shelf</h2><button onClick={()=>setIndexOpen(false)} aria-label="Close reading list">×</button></div>
   <ol>{books.map((b,i)=><li key={b.id}><button onClick={()=>openBook(b.id)}><span className="index-number">0{i+1}</span><span className="mini-spine" style={{background:b.color}}/><span><strong>{b.title}</strong><small>{b.author}</small></span><Arrow/></button></li>)}</ol>
  </section>
  <dialog ref={dialog} className="reading-room" onCancel={event=>{event.preventDefault();closeBook();}} onClose={()=>{if(selected)setSelected(null);}} onKeyDown={readerKeys} aria-labelledby="reading-title">
   {book&&<>
    <div className="reader-topline"><button className="back-button" onClick={closeBook} autoFocus><span aria-hidden="true">←</span> Back to the shelf</button><span className="small-label">0{ordinal+1} / 0{books.length}</span></div>
    <div className="reader-layout">
     <aside className="reader-object" aria-label={`Three-dimensional view of ${book.title}`}><Suspense fallback={<div className="loading-label">Opening the book…</div>}><LibraryScene readerBook={book} reducedMotion={reducedMotion}/></Suspense><span className="object-caption">FROM KAIT’S READING SHELF</span></aside>
     <article className="reader-content">
      <span className="small-label">{book.topic}</span><h2 id="reading-title">{book.title}</h2><p className="book-author">{book.author}</p>
      {book.subtitle&&<p className="book-subtitle">{book.subtitle}</p>}
      <div className="reading-section-heading"><h3 id="takeaways-heading">Reading takeaways</h3><a className="get-book-top" href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">Get the book <Arrow/></a></div>
      <section id="notes-panel" aria-labelledby="takeaways-heading"><Notes book={book}/></section>
      <div className="purchase-section"><a className="purchase-link" href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">Get the book <Arrow/></a><p>Shop through Bookshop.org to support independent bookstores. This link opens a search for the book.</p>{book.affiliate&&<p>This is an affiliate link. I may earn a commission on your purchase.</p>}</div>
      <div className="reader-pagination"><button onClick={()=>step(-1)}><span aria-hidden="true">←</span> Previous book</button><button onClick={()=>step(1)}>Next book <span aria-hidden="true">→</span></button></div>
     </article>
    </div>
   </>}
  </dialog>
 </main>;
}
