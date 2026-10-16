import React,{useEffect,useMemo,useRef,useState,Suspense} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer,ContactShadows,useTexture,RoundedBox} from '@react-three/drei';
import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {books,bookendX,shelfFramingHeight} from './library.js';
import {bookTextures,disposeTextures} from './materials.js';

function Camera({reader=false,readerHeight=0}){
 const {camera,size,invalidate}=useThree();
 useEffect(()=>{
  camera.position.set(reader?3.9:0,reader?2.6:Math.max(1.9,...books.map(book=>book.height/2)),reader?9:12);
  camera.lookAt(0,reader?(readerHeight>4.1?readerHeight/2:1.8):Math.max(1.9,...books.map(book=>book.height/2)),0);
  camera.zoom=reader?Math.min(size.width/3.6,size.height/Math.max(4.9,readerHeight+.8)):Math.min(size.width/Math.max(7.1,bookendX*2+2.5),size.height/shelfFramingHeight);
  camera.updateProjectionMatrix();invalidate();
 },[camera,size.width,size.height,reader,readerHeight,invalidate]);
 return null;
}
// Keep the photographed head gently rounded while bringing its corners into the binding.
function fittedSpineHead(y,height){
 const distance=height/2-y,band=.15;
 return distance>=0&&distance<band?height/2-band*Math.pow(distance/band,4):y;
}
// The photograph supplies the binding, highlights and wear. Do not surround its
// silhouette with synthetic boards or page tops that change the photographed book.
function PhotographicBook({book,onOpen,reader=false,reducedMotion=false}){
 const ref=useRef();const [hovered,setHovered]=useState(false);
 const {camera,invalidate,gl}=useThree();
 const kind=reader&&book.coverImage?'cover':'spine';
 const source=useTexture(book[kind+'Image']);
 const texture=useMemo(()=>{
  const t=source.clone();t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  const [x=0,w=1,y=0,h=1]=book[kind+'Crop']??[];
  t.offset.set(x,y);t.repeat.set(w,h);t.needsUpdate=true;return t;
 },[source,book,kind]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 useEffect(()=>{invalidate();},[hovered,invalidate]);
 useEffect(()=>()=>{gl.domElement.style.cursor='default';delete gl.domElement.dataset.cursorInteractive;},[gl]);
 const width=kind==='cover'?book.height*(source.image.width*texture.repeat.x)/(source.image.height*texture.repeat.y):book.width;
 const face=useMemo(()=>{
  if(kind==='cover')return new THREE.PlaneGeometry(width,book.height);
  // Measure the visible binding rather than the transparent image rectangle.
  // A linear center fit removes camera lean without flattening the jacket edges.
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(source.image,texture.offset.x*source.image.width,
   (1-texture.offset.y-texture.repeat.y)*source.image.height,
   texture.repeat.x*source.image.width,texture.repeat.y*source.image.height,0,0,256,1024);
  const pixels=ctx.getImageData(0,0,256,1024).data,rows=[];
  for(let y=0;y<1024;y++){
   let left=256,right=-1;
   for(let x=0;x<256;x++)if(pixels[(y*256+x)*4+3]>128){left=Math.min(left,x);right=x;}
   if(right-left>25)rows.push({v:1-(y+.5)/1024,c:(left+right+1)/512,w:(right-left+1)/256});
  }
  if(!rows.length)return new THREE.PlaneGeometry(width,book.height);
  const top=rows[0].v+.5/1024,bottom=rows.at(-1).v-.5/1024;
  const middle=rows.filter(r=>r.v>bottom+(top-bottom)*.15&&r.v<bottom+(top-bottom)*.85);
  const meanV=middle.reduce((s,r)=>s+r.v,0)/middle.length;
  const meanC=middle.reduce((s,r)=>s+r.c,0)/middle.length;
  const slope=middle.reduce((s,r)=>s+(r.v-meanV)*(r.c-meanC),0)/middle.reduce((s,r)=>s+(r.v-meanV)**2,0);
  const widths=middle.map(r=>r.w).sort((a,b)=>a-b);
  const bodyWidth=widths[Math.floor(widths.length/2)];
  // Correct perspective taper in selected references using broad body samples.
  // Hold the fit outside the body so the real rounded head and foot survive.
  const stations=[.15,.35,.55,.75,.85].map(t=>{
   const v=bottom+(top-bottom)*t;
   const band=rows.filter(r=>Math.abs(r.v-v)<(top-bottom)*.035);
   return {v,c:band.reduce((s,r)=>s+r.c,0)/band.length,w:band.reduce((s,r)=>s+r.w,0)/band.length};
  });
  const fitAt=v=>{
   const a=stations.findLast(s=>s.v<=v)??stations[0];
   const b=stations.find(s=>s.v>=v)??stations.at(-1);
   const t=a===b?0:(v-a.v)/(b.v-a.v);
   return {c:THREE.MathUtils.lerp(a.c,b.c,t),w:THREE.MathUtils.lerp(a.w,b.w,t)};
  };
  const geometry=new THREE.PlaneGeometry(1,1,1,64),p=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++){
   const u=uv.getX(i),v=uv.getY(i),center=meanC+slope*(v-meanV);
   const fit=book.spinePerspectiveFit?fitAt(v):{c:center,w:bodyWidth};
   p.setXYZ(i,(u-fit.c)*book.width/fit.w,((v-bottom)/(top-bottom)-.5)*book.height,0);
  }
  geometry.computeVertexNormals();return geometry;
 },[source,texture,kind,width,book.height,book.width,book.spinePerspectiveFit]);
 useEffect(()=>()=>face.dispose(),[face]);
 useFrame((_,delta)=>{
  if(!ref.current)return;
  ref.current.quaternion.copy(camera.quaternion);
  const target=reader?0:1.313+(hovered?.2:0);
  const targetY=book.height/2+(!reader&&hovered?.035:0);
  ref.current.position.z=reducedMotion?target:THREE.MathUtils.lerp(ref.current.position.z,target,1-Math.exp(-delta*11));
  ref.current.position.y=reducedMotion?targetY:THREE.MathUtils.lerp(ref.current.position.y,targetY,1-Math.exp(-delta*11));
  if(Math.abs(ref.current.position.z-target)>.0005||Math.abs(ref.current.position.y-targetY)>.0005)invalidate();
 });
 return <mesh ref={ref} name={`book-${book.id}`} position={[reader?0:book.x,book.height/2,reader?0:1.313]}
  onPointerOver={reader?undefined:e=>{e.stopPropagation();setHovered(true);gl.domElement.style.cursor='pointer';gl.domElement.dataset.cursorInteractive='true';}}
  onPointerOut={reader?undefined:()=>{setHovered(false);gl.domElement.style.cursor='default';delete gl.domElement.dataset.cursorInteractive;}}
  onClick={reader?undefined:e=>{e.stopPropagation();onOpen(book.id);}}>
  <primitive object={face} attach="geometry"/>
  <meshBasicMaterial map={texture} transparent alphaTest={.1} toneMapped={false}/>
 </mesh>;
}
export function Book(props){
 return props.book.spineImage?<PhotographicBook {...props}/>:<ConstructedBook {...props}/>;
}
function ConstructedBook({book,onOpen,reader=false,reducedMotion=false}){
 const ref=useRef();const [hovered,setHovered]=useState(false);const {invalidate,gl}=useThree();
 const editionKeys=useMemo(()=>['spine','cover'].filter(key=>book[key+'Image']),[book]);
 const editionTextures=useTexture(editionKeys.map(key=>book[key+'Image']));
 const maps=useMemo(()=>bookTextures(book),[book]);
 useMemo(()=>{editionTextures.forEach((texture,i)=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;const crop=book[editionKeys[i]+'Crop'];if(crop){texture.offset.x=crop[0];texture.repeat.x=crop[1];texture.offset.y=crop[2]??0;texture.repeat.y=crop[3]??1;}texture.needsUpdate=true;});},[editionTextures,editionKeys,book]);
 const spineMap=book.spineImage?editionTextures[editionKeys.indexOf('spine')]:maps.spine;
 const coverMap=book.coverImage?editionTextures[editionKeys.indexOf('cover')]:maps.cover;
 useEffect(()=>()=>disposeTextures(maps),[maps]);
 useEffect(()=>{invalidate();},[hovered,reader,invalidate]);
 useEffect(()=>()=>{gl.domElement.style.cursor='default';delete gl.domElement.dataset.cursorInteractive;},[gl]);
 useFrame((_,delta)=>{
  if(!ref.current)return;
  const targetZ=reader?0:1.3-book.depth/2+(hovered?.2:0);
  const targetY=reader?(book.coverImage?-1.15:.408):(hovered?-.035:0);
  if(reducedMotion){ref.current.position.z=targetZ;ref.current.rotation.y=targetY;return;}
  const a=1-Math.exp(-delta*11);
  ref.current.position.z=THREE.MathUtils.lerp(ref.current.position.z,targetZ,a);
  ref.current.rotation.y=THREE.MathUtils.lerp(ref.current.rotation.y,targetY,a);
  if(Math.abs(ref.current.position.z-targetZ)>.0005||Math.abs(ref.current.rotation.y-targetY)>.0005)invalidate();
 });
 // Fit the supporting binding inside the photographed jacket, not around it.
 const photographedJacket=!!book.spineSilhouette;
 const bodyWidth=book.width-.07;
 const bodyHeight=book.height-(photographedJacket?.175:.095);
 const bodyY=book.height/2+(photographedJacket?.0325:.0275);
 const bodyDepth=book.depth-(photographedJacket?.02:.09);
 const bodyZ=photographedJacket?0:-.025;
 const pageTop=bodyY+bodyHeight/2;
 const pageHead=useMemo(()=>{
  const geometry=new THREE.PlaneGeometry(bodyWidth,bodyDepth,32,40);
  const vertices=geometry.attributes.position;
  for(let i=0;i<vertices.count;i++){
   const x=vertices.getX(i)/(book.width/2);
   const binding=Math.exp(-Math.pow((vertices.getY(i)+bodyDepth/2)/.22,2));
   vertices.setZ(i,-.009*(1-x*x)-.009*binding*(1-x*x)+.0015*Math.sin(x*17));
  }
  geometry.computeVertexNormals();return geometry;
 },[book.width,bodyWidth,bodyDepth]);
 useEffect(()=>()=>pageHead.dispose(),[pageHead]);
 const spineShape=useMemo(()=>{
  if(!book.spineSilhouette)return null;
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=768;
  const context=canvas.getContext('2d',{willReadFrequently:true});const image=spineMap.image;
  const [x,width,y=0,height=1]=book.spineCrop;
  context.drawImage(image,x*image.width,(1-y-height)*image.height,width*image.width,height*image.height,0,0,160,768);
  const pixels=context.getImageData(0,0,160,768).data;const left=[],right=[];
  for(let row=0;row<768;row+=2){let first=-1,last=-1;
   for(let col=0;col<160;col++){if(pixels[(row*160+col)*4+3]>245){if(first<0)first=col;last=col;}}
   if(last-first<20)continue;
   const py=(.5-row/767)*book.height;
   left.push(new THREE.Vector2((first/159-.5)*book.width,py));right.push(new THREE.Vector2((last/159-.5)*book.width,py));
  }
  const shape=new THREE.Shape([...left,...right.reverse()]);shape.closePath();return shape;
 },[book,spineMap]);
 const spineSurface=useMemo(()=>{
  const inset=book.spineSilhouette||book.sourcePhoto?0:.026;
  let geometry=spineShape?new THREE.ShapeGeometry(spineShape):new THREE.PlaneGeometry(book.width-inset,book.height-(book.sourcePhoto?.008:.025),24,1);
  if(spineShape){const source=geometry;geometry=new TessellateModifier(.12,7).modify(source);source.dispose();}
  const vertices=geometry.attributes.position;const uv=geometry.attributes.uv;
  for(let i=0;i<vertices.count;i++){
   const x=vertices.getX(i)/((book.width-inset)/2);
   vertices.setZ(i,(book.spineRelief??0)*(1-x*x));
   if(spineShape){
    uv.setXY(i,vertices.getX(i)/book.width+.5,vertices.getY(i)/book.height+.5);
    vertices.setY(i,fittedSpineHead(vertices.getY(i),book.height));
   }
  }
  geometry.computeVertexNormals();return geometry;
 },[book,spineShape]);
 useEffect(()=>()=>spineSurface.dispose(),[spineSurface]);
 const w=book.width,h=book.height,d=book.depth;
 // Close the entire photographic outline into the binding, including both shoulders.
 // The previous shallow extrusion ended before the cover edges and left open seams.
 const jacketConnection=useMemo(()=>{
  if(!spineShape)return null;
  const outline=spineShape.getPoints();
  if(outline[0].equals(outline[outline.length-1]))outline.pop();
  const positions=[],uvs=[],indices=[];const rings=8;
  const rearZ=d/2-.06;
  const top=h/2-.04,bottom=-h/2+.10;
  const cy=(top+bottom)/2,halfY=(top-bottom)/2,halfX=bodyWidth/2+.039;
  for(let i=0;i<outline.length;i++){
   const p=outline[i];
   const scale=Math.max(Math.abs(p.x)/halfX,Math.abs(p.y-cy)/halfY);
   const rearX=p.x/scale,rearY=cy+(p.y-cy)/scale;
   for(let j=0;j<=rings;j++){
    const t=j/rings,smooth=t*t*(3-2*t);
    positions.push(THREE.MathUtils.lerp(p.x,rearX,smooth),THREE.MathUtils.lerp(fittedSpineHead(p.y,h),rearY,smooth),THREE.MathUtils.lerp(d/2+.013,rearZ,t));
    // Sample just inside the opaque photograph; carry its blue/white edge into the joint.
    uvs.push((p.x*.92)/w+.5,(p.y*.99)/h+.5);
    if(j<rings){const a=i*(rings+1)+j,b=((i+1)%outline.length)*(rings+1)+j;indices.push(a,b,a+1,a+1,b,b+1);}
   }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
 },[spineShape,w,h,d,bodyWidth]);
 useEffect(()=>()=>jacketConnection?.dispose(),[jacketConnection]);
 const fittedCover=useMemo(()=>{
  if(!photographedJacket)return null;
  const depth=d-.02,height=h-.14;
  const board=new THREE.BoxGeometry(.035,height,depth,1,1,40);
  const face=new THREE.PlaneGeometry(depth,height,40,1);
  for(const geometry of [board,face]){
   const p=geometry.attributes.position;
   for(let i=0;i<p.count;i++){
    // Plane's left edge becomes the spine edge after its Y rotation.
    const z=geometry===board?p.getZ(i):-p.getX(i);
    if(p.getY(i)>0)p.setY(i,p.getY(i)-.012*Math.exp(-(depth/2-z)/.15));
   }
   geometry.computeVertexNormals();
  }
  return {board,face};
 },[photographedJacket,d,h]);
 useEffect(()=>()=>{fittedCover?.board.dispose();fittedCover?.face.dispose();},[fittedCover]);
 const coverMaterial=<meshStandardMaterial color={book.color} roughness={book.roughness??.78} metalness={book.metalness??0} bumpMap={maps.bump} bumpScale={book.binding==='cloth'?.003:.0005}/>;
 return <group ref={ref} position={[reader?0:book.x,0,reader?0:1.3-book.depth/2]} name={`book-${book.id}`}
  onPointerOver={reader?undefined:e=>{e.stopPropagation();setHovered(true);gl.domElement.style.cursor='pointer';gl.domElement.dataset.cursorInteractive='true';}}
  onPointerOut={reader?undefined:()=>{setHovered(false);gl.domElement.style.cursor='default';delete gl.domElement.dataset.cursorInteractive;}}
  onClick={reader?undefined:e=>{e.stopPropagation();onOpen(book.id);}}>
   <mesh castShadow receiveShadow position={[0,bodyY,bodyZ]}><boxGeometry args={[bodyWidth,bodyHeight,bodyDepth]}/><meshStandardMaterial map={maps.paper} roughness={.92}/></mesh>
   {[-1,1].map(side=>photographedJacket?
    <mesh key={side} geometry={fittedCover.board} position={[side*(bodyWidth/2+.0175),h/2+.03,bodyZ]} castShadow receiveShadow>{coverMaterial}</mesh>:
    <RoundedBox key={side} args={[.025,h,d]} radius={.01} smoothness={2} position={[side*(w/2-.0125),h/2,bodyZ]} castShadow receiveShadow>{coverMaterial}</RoundedBox>)}
   <mesh position={[photographedJacket?bodyWidth/2+.036:w/2+.001,h/2+(photographedJacket?.03:0),bodyZ]} rotation={[0,Math.PI/2,0]}>{fittedCover?<primitive object={fittedCover.face} attach="geometry"/>:<planeGeometry args={[d-.035,h-.02]}/>}<meshStandardMaterial map={coverMap} roughness={.8} bumpMap={maps.bump} bumpScale={book.coverImage?.0003:.003}/></mesh>
   {jacketConnection?<mesh geometry={jacketConnection} position={[0,h/2,0]} castShadow receiveShadow><meshStandardMaterial map={spineMap} side={THREE.DoubleSide} roughness={.78}/></mesh>:<RoundedBox args={[w,h,.07]} radius={.024} smoothness={3} position={[0,h/2,d/2-.025]} castShadow receiveShadow><meshStandardMaterial color={book.color} roughness={.72} bumpMap={maps.bump} bumpScale={.003}/></RoundedBox>}
   <mesh geometry={spineSurface} position={[0,h/2,d/2+.013]}><meshStandardMaterial map={spineMap} transparent={!photographedJacket} alphaTest={photographedJacket?0:.4} roughness={book.roughness??.78} metalness={book.metalness??0} bumpMap={maps.bump} bumpScale={book.binding==='cloth'?.003:.0005}/></mesh>
   <mesh geometry={pageHead} position={[0,pageTop+.001,bodyZ]} rotation={[-Math.PI/2,0,0]} receiveShadow><meshStandardMaterial map={maps.paperTop} bumpMap={maps.paperRelief} bumpScale={.003} roughness={.96}/></mesh>
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
books.forEach(book=>{const urls=[book.spineImage,book.coverImage].filter(Boolean);if(urls.length)useTexture.preload(urls);});
useTexture.preload('/images/agate-bookends.webp');
function World({onOpen,reducedMotion,readerBook}){
 return <>
 <Camera reader={!!readerBook} readerHeight={readerBook?.height??0}/><Lighting/>
 {!readerBook&&books.slice(0,-1).map((book,i)=>{
  const height=Math.min(book.height,books[i+1].height)-.16;
  // A recessed contact shadow closes tiny irregular jacket seams without
  // changing the photographed outer edges or covering their graphics.
  return <mesh key={`seam-${book.id}`} position={[book.x+book.width/2,height/2+.04,1.30]}>
   <planeGeometry args={[.045,height]}/><meshBasicMaterial color="#36332e" toneMapped={false}/>
  </mesh>;
 })}
 {readerBook?<Book key={readerBook.id} book={readerBook} reader reducedMotion={reducedMotion}/>:<Suspense fallback={null}><Bookend side={-1}/>{books.map(book=><Suspense key={book.id} fallback={null}><Book book={book} onOpen={onOpen} reducedMotion={reducedMotion}/></Suspense>)}<Bookend side={1}/></Suspense>}
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[200,200]}/><shadowMaterial transparent opacity={.08}/></mesh>
 <ContactShadows position={[0,.002,0]} opacity={.25} scale={14} blur={2.6} far={5} resolution={256} frames={Infinity}/>
 </>;}
class RenderBoundary extends React.Component{constructor(p){super(p);this.state={failed:false};}static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="scene-unavailable">The 3D shelf couldn’t load. You can still open every book from the reading list below.</div>:this.props.children;}}
export default function LibraryScene({onOpen,reducedMotion=false,readerBook=null}){
 return <RenderBoundary><Canvas orthographic shadows frameloop="demand" dpr={[1,1.5]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} camera={{near:.1,far:250}} fallback={<div className="scene-unavailable">Explore the books through the reading list below.</div>} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;}}>
  <Suspense fallback={null}><World onOpen={onOpen} reducedMotion={reducedMotion} readerBook={readerBook}/></Suspense>
 </Canvas></RenderBoundary>;
}
