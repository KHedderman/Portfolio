import React,{useEffect,useMemo,useRef,useState,Suspense} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer,ContactShadows,useTexture,RoundedBox} from '@react-three/drei';
import * as THREE from 'three';
import {books,bookendX} from './library.js';
import {bookTextures,disposeTextures} from './materials.js';

function Camera({reader=false}){
 const {camera,size,invalidate}=useThree();
 useEffect(()=>{
  camera.position.set(reader?3.9:.5,reader?2.6:2.7,reader?9:12);
  camera.lookAt(0,reader?1.8:1.9,0);
  camera.zoom=reader?Math.min(size.width/3.6,size.height/4.9):Math.min(size.width/Math.max(7.1,bookendX*2+2.5),size.height/4.35);
  camera.updateProjectionMatrix();invalidate();
 },[camera,size.width,size.height,reader,invalidate]);
 return null;
}
export function Book({book,onOpen,reader=false,reducedMotion=false}){
 const ref=useRef();const [hovered,setHovered]=useState(false);const {invalidate,gl}=useThree();
 const maps=useMemo(()=>bookTextures(book),[book]);
 const editionKeys=useMemo(()=>['spine','cover'].filter(key=>book[key+'Image']),[book]);
 const editionTextures=useTexture(editionKeys.map(key=>book[key+'Image']));
 useMemo(()=>{editionTextures.forEach(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.needsUpdate=true;});},[editionTextures]);
 const spineMap=book.spineImage?editionTextures[editionKeys.indexOf('spine')]:maps.spine;
 const coverMap=book.coverImage?editionTextures[editionKeys.indexOf('cover')]:maps.cover;
 useEffect(()=>()=>disposeTextures(maps),[maps]);
 useEffect(()=>{invalidate();},[hovered,reader,invalidate]);
 useEffect(()=>()=>{gl.domElement.style.cursor='default';delete gl.domElement.dataset.cursorInteractive;},[gl]);
 useFrame((_,delta)=>{
  if(!ref.current)return;
  const targetZ=reader ? 0 : (hovered ? .2 : 0);
  const targetY=reader?-1.15:hovered?-.035:0;
  if(reducedMotion){ref.current.position.z=targetZ;ref.current.rotation.y=targetY;return;}
  const a=1-Math.exp(-delta*11);
  ref.current.position.z=THREE.MathUtils.lerp(ref.current.position.z,targetZ,a);
  ref.current.rotation.y=THREE.MathUtils.lerp(ref.current.rotation.y,targetY,a);
  if(Math.abs(ref.current.position.z-targetZ)>.0005||Math.abs(ref.current.rotation.y-targetY)>.0005)invalidate();
 });
 const w=book.width,h=book.height,d=book.depth;
 const coverMaterial=<meshStandardMaterial color={book.color} roughness={.78} bumpMap={maps.bump} bumpScale={.004}/>;
 return <group ref={ref} position={[reader?0:book.x,0,0]} name={`book-${book.id}`}
  onPointerOver={reader?undefined:e=>{e.stopPropagation();setHovered(true);gl.domElement.style.cursor='pointer';gl.domElement.dataset.cursorInteractive='true';}}
  onPointerOut={reader?undefined:()=>{setHovered(false);gl.domElement.style.cursor='default';delete gl.domElement.dataset.cursorInteractive;}}
  onClick={reader?undefined:e=>{e.stopPropagation();onOpen(book.id);}}>
   <mesh castShadow receiveShadow position={[0,h/2,-.025]}><boxGeometry args={[w-.07,h-.09,d-.09]}/><meshStandardMaterial map={maps.paper} roughness={.92}/></mesh>
   {[-1,1].map(side=><RoundedBox key={side} args={[.045,h,d]} radius={.014} smoothness={2} position={[side*(w/2-.015),h/2,0]} castShadow receiveShadow>{coverMaterial}</RoundedBox>)}
   <mesh position={[w/2+.01,h/2,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[d-.035,h-.02]}/><meshStandardMaterial map={coverMap} roughness={.8} bumpMap={maps.bump} bumpScale={.003}/></mesh>
   <RoundedBox args={[w,h,.07]} radius={.024} smoothness={3} position={[0,h/2,d/2-.025]} castShadow receiveShadow><meshStandardMaterial color={book.color} roughness={.72} bumpMap={maps.bump} bumpScale={.003}/></RoundedBox>
   <mesh position={[0,h/2,d/2+.013]}><planeGeometry args={[w-.026,h-.025]}/><meshStandardMaterial map={spineMap} roughness={.78} bumpMap={maps.bump} bumpScale={.002}/></mesh>
   <mesh position={[0,h-.045,-.02]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[w-.085,d-.09]}/><meshStandardMaterial map={maps.paper} roughness={1}/></mesh>
 </group>;
}
function Bookend({side}){
 const source=useTexture('/images/agate-bookends.webp');
 const face=useMemo(()=>{const t=source.clone();t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(side<0?.389:.407,.852);t.offset.set(side<0?.068:.542,.071);t.needsUpdate=true;return t;},[source,side]);
 useEffect(()=>()=>face.dispose(),[face]);
 // Trace the face's actual stone silhouette instead of a smooth enclosing arc.
 // This keeps the solid rim registered to the photographed mineral bands.
 const shape=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=552;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  const image=source.image;
  context.drawImage(image,(side<0?.068:.542)*image.width,(1-.071-.852)*image.height,
   (side<0?.389:.407)*image.width,.852*image.height,0,0,384,552);
  const pixels=context.getImageData(0,0,384,552).data;
  const left=[],right=[];
  for(let y=0;y<552;y+=2){
   let first=-1,last=-1;
   for(let x=0;x<384;x++){if(pixels[(y*384+x)*4+3]>=128){if(first<0)first=x;last=x;}}
   if(last-first<8)continue;
   const height=(1-y/551)*2.45;
   left.push(new THREE.Vector2((first/383-.5)*1.7,height));
   right.push(new THREE.Vector2((last/383-.5)*1.7,height));
  }
  const outline=[...left,...right.reverse()];
  const s=new THREE.Shape(outline);s.closePath();return s;
 },[source,side]);
 return <group position={[side*bookendX,0,.34]} name={side<0?'left-agate-bookend':'right-agate-bookend'}>
  <mesh castShadow receiveShadow position={[0,0,.25]}><extrudeGeometry args={[shape,{depth:.31,bevelEnabled:true,bevelThickness:.003,bevelSize:.002,bevelSegments:2,steps:1}]}/><meshStandardMaterial color="#c3baa7" roughness={.94}/></mesh>
  <mesh position={[0,1.225,.571]}><planeGeometry args={[1.7,2.45]}/><meshStandardMaterial map={face} transparent alphaTest={.32} roughness={.56} metalness={.01} depthWrite /></mesh>
 </group>;
}
function Lighting(){return <>
 <hemisphereLight args={['#fffaf0','#aaa28f',1.3]}/>
 <directionalLight position={[-4,7,5]} intensity={2.2} color="#fff8e9" shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={.02} shadow-bias={-.0001}/>
 <Environment resolution={64} frames={1}>
  <Lightformer form="rect" intensity={2} color="#fff9ee" position={[-4,5,3]} rotation={[0,Math.PI/4,0]} scale={[4,5,1]}/>
  <Lightformer form="rect" intensity={1} color="#eaf2f1" position={[5,3,2]} rotation={[0,-Math.PI/3,0]} scale={[3,4,1]}/>
 </Environment>
 </>;}
function World({onOpen,reducedMotion,readerBook}){return <>
 <Camera reader={!!readerBook}/><Lighting/>
 {readerBook?<Book key={readerBook.id} book={readerBook} reader reducedMotion={reducedMotion}/>:<Suspense fallback={null}><Bookend side={-1}/>{books.map(book=><Book key={book.id} book={book} onOpen={onOpen} reducedMotion={reducedMotion}/>)}<Bookend side={1}/></Suspense>}
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[200,200]}/><shadowMaterial transparent opacity={.08}/></mesh>
 <ContactShadows position={[0,.002,0]} opacity={.25} scale={14} blur={2.6} far={5} resolution={256} frames={Infinity}/>
 </>;}
class RenderBoundary extends React.Component{constructor(p){super(p);this.state={failed:false};}static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="scene-unavailable">The 3D shelf couldn’t load. You can still open every book from the reading list below.</div>:this.props.children;}}
export default function LibraryScene({onOpen,reducedMotion=false,readerBook=null}){
 return <RenderBoundary><Canvas orthographic shadows frameloop="demand" dpr={[1,1.5]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} camera={{near:.1,far:250}} fallback={<div className="scene-unavailable">Explore the books through the reading list below.</div>} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;}}>
  <Suspense fallback={null}><World onOpen={onOpen} reducedMotion={reducedMotion} readerBook={readerBook}/></Suspense>
 </Canvas></RenderBoundary>;
}
