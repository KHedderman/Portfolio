import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {books} from './library.js';
import './style.css';
const LibraryScene=lazy(()=>import('./LibraryScene.jsx'));
const Arrow=()=> <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 16 16 4M4 4h12v12" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>;
function useReducedMotion(){const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change);},[]);return reduced;}
const fromHash=()=>books.find(book=>book.id===location.hash.slice(1))?.id||null;

function Notes({book,tab}){
 const items=book[tab];
 if(items.length)return <div className="note-prose">{items.map((note,i)=><p key={i}>{note}</p>)}</div>;
 return <div className="empty-notes"><span className="small-label">A PAGE STILL TAKING SHAPE</span><p>{tab==='notes'?'Reading notes to come.':tab==='takeaways'?'Takeaways to come.':'Questions to come.'}</p></div>;
}
export default function App(){
 const [selected,setSelected]=useState(fromHash);const [tab,setTab]=useState('notes');const [indexOpen,setIndexOpen]=useState(false);
 const dialog=useRef();const lastFocus=useRef();const reducedMotion=useReducedMotion();
 const book=books.find(b=>b.id===selected);const ordinal=books.findIndex(b=>b.id===selected);
 function openBook(id){lastFocus.current=document.activeElement;setSelected(id);setIndexOpen(false);}
 function closeBook(){setSelected(null);}
 function step(direction){setSelected(books[(ordinal+direction+books.length)%books.length].id);}
 useEffect(()=>{const hash=()=>setSelected(fromHash());window.addEventListener('hashchange',hash);return()=>window.removeEventListener('hashchange',hash);},[]);
 useEffect(()=>{
  if(book){setTab('notes');if(!dialog.current.open)dialog.current.showModal();dialog.current.querySelector('.back-button')?.focus({preventScroll:true});dialog.current.scrollTop=0;history.replaceState(null,'',`#${book.id}`);}
  else{if(dialog.current.open)dialog.current.close();history.replaceState(null,'',location.pathname+location.search);const target=lastFocus.current;if(target&&target.offsetParent!==null)target.focus();else document.querySelector('.index-toggle')?.focus();}
 },[selected]);
 function readerKeys(event){if(event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}
 return <main className={`library ${book?'is-reading':''}`}>
  <div className="library-topline"><span>KAIT HEDDERMAN</span><button className="index-toggle" aria-expanded={indexOpen} aria-controls="reading-index" onClick={()=>setIndexOpen(!indexOpen)}>The reading list <Arrow/></button></div>
  <section className="shelf-section" aria-label="Interactive book collection" aria-describedby="shelf-hint">
   <header className="library-heading"><h1 aria-label="Kait’s Library"><span className="title-owner">KAIT’S</span><span className="title-library">LIBRARY</span></h1></header>
   <div className="shelf-stage"><Suspense fallback={<div className="loading-label">Opening the library…</div>}><LibraryScene onOpen={openBook} reducedMotion={reducedMotion}/></Suspense></div>
   <p className="library-intro">Books shaping how I think about AI, design, and being human.</p>
   <p id="shelf-hint" className="shelf-hint"><span className="hint-dot"/> SELECT A SPINE. STEP INTO THE MARGINS.</p>
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
      <div className="note-tabs" role="tablist" aria-label="Reading reflections">{[['notes','Reading notes'],['takeaways','Takeaways'],['questions','Questions']].map(([key,label])=><button key={key} role="tab" id={`tab-${key}`} aria-controls="notes-panel" aria-selected={tab===key} tabIndex={tab===key?0:-1} onClick={()=>setTab(key)} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.stopPropagation();event.preventDefault();const keys=['notes','takeaways','questions'];const next=keys[(keys.indexOf(key)+(event.key==='ArrowRight'?1:2))%3];setTab(next);document.getElementById(`tab-${next}`)?.focus();}}}>{label}</button>)}</div>
      <section id="notes-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}><Notes book={book} tab={tab}/></section>
      <div className="purchase-section"><a className="purchase-link" href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">Find this book on Bookshop.org <Arrow/></a><p>{book.affiliate?'This is an affiliate link. A purchase may earn a commission.':'Opens a bookstore search in a new tab. No affiliate tracking.'}</p></div>
      <div className="reader-pagination"><button onClick={()=>step(-1)}><span aria-hidden="true">←</span> Previous book</button><button onClick={()=>step(1)}>Next book <span aria-hidden="true">→</span></button></div>
     </article>
    </div>
   </>}
  </dialog>
 </main>;
}
