import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

export default function Cursor({dialogRef,readerOpen}){
 const cursor=useRef();const [host,setHost]=useState(document.body);
 useEffect(()=>{setHost(readerOpen&&dialogRef.current?dialogRef.current:document.body);},[readerOpen,dialogRef]);
 useEffect(()=>{
  const node=cursor.current;
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const contrast=matchMedia('(forced-colors: active)');
  const hide=()=>{node.hidden=true;document.documentElement.classList.remove('custom-cursor-active');};
  const move=event=>{
   if(!fine.matches||contrast.matches||event.pointerType!=='mouse'){hide();return;}
   const target=event.target;
   node.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;
   node.classList.toggle('is-interactive',Boolean(target.closest('a[href],button:not(:disabled),[role="button"],canvas[data-cursor-interactive="true"]')));
   node.classList.toggle('is-inverted',Boolean(target.closest('.library-caption-band')));
   node.hidden=false;document.documentElement.classList.add('custom-cursor-active');
  };
  const keyboard=event=>{if(event.key==='Tab')hide();};
  document.addEventListener('pointermove',move);document.documentElement.addEventListener('pointerleave',hide);
  document.addEventListener('pointercancel',hide);document.addEventListener('keydown',keyboard);window.addEventListener('blur',hide);
  fine.addEventListener('change',hide);contrast.addEventListener('change',hide);
  return()=>{hide();document.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',hide);document.removeEventListener('pointercancel',hide);document.removeEventListener('keydown',keyboard);window.removeEventListener('blur',hide);fine.removeEventListener('change',hide);contrast.removeEventListener('change',hide);};
 },[host]);
 return createPortal(<div ref={cursor} className="custom-cursor" aria-hidden="true" hidden><span className="cursor-ring"/><span className="cursor-dot"/></div>,host);
}
