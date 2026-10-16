import * as THREE from 'three';

function texture(canvas) {
  const map=new THREE.CanvasTexture(canvas);
  map.colorSpace=THREE.SRGBColorSpace;
  map.anisotropy=8;
  return map;
}
function noiseCanvas(color,cloth=false,width=256,height=256){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,width,height);
  let seed=53;const random=()=>((seed=seed*16807%2147483647)/2147483647);
  const pixels=ctx.getImageData(0,0,width,height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4;const n=(random()-.5)*14+(cloth?(x%3===0?6:0)+(y%4===0?-5:0):0);
    for(let j=0;j<3;j++)pixels.data[i+j]+=n;
  }
  ctx.putImageData(pixels,0,0);return canvas;
}
export function bookTextures(book){
  const spine=noiseCanvas(book.color,book.binding==='cloth',320,2048);
  const c=spine.getContext('2d');
  c.fillStyle='#00000016';c.fillRect(0,0,13,2048);c.fillRect(307,0,13,2048);
  c.fillStyle=book.ink;c.save();c.translate(160,125);c.rotate(Math.PI/2);
  let font=book.title.length>35?62:82;c.font=`${font}px Georgia`;
  while(c.measureText(book.title).width>1380){font-=1;c.font=`${font}px Georgia`;}
  c.fillText(book.title,0,0);c.restore();
  c.save();c.translate(160,1640);c.rotate(Math.PI/2);c.font='29px Arial';
  const names=book.author.split(' & ');names.forEach((name,i)=>c.fillText(name,0,i*37));c.restore();
  c.globalAlpha=.35;c.fillRect(85,1940,150,2);c.globalAlpha=1;
  const cover=noiseCanvas(book.color,book.binding==='cloth',1024,1536);const ctx=cover.getContext('2d');ctx.fillStyle=book.ink;

  ctx.font='83px Georgia';let line='',y=400;
  for(const word of book.title.split(' ')){if(ctx.measureText(line+word).width>850){ctx.fillText(line,80,y);y+=106;line='';}line+=word+' ';}ctx.fillText(line,80,y);
  ctx.font='30px Arial';book.author.split(' & ').forEach((name,i)=>ctx.fillText(name,80,1280+i*45));
  const paper=document.createElement('canvas');paper.width=512;paper.height=1024;const p=paper.getContext('2d');p.fillStyle='#e9e1ce';p.fillRect(0,0,512,1024);
  for(let y=0;y<1024;y+=3){p.strokeStyle=y%9===0?'#cfc5ae':'#ddd3bf';p.lineWidth=.6;p.beginPath();p.moveTo(0,y);p.lineTo(512,y+.4);p.stroke();}
  // Looking down onto the book: individual sheets run along its depth.
  const head=document.createElement('canvas');head.width=1024;head.height=512;
  const headContext=head.getContext('2d');const headPixels=headContext.createImageData(1024,512);
  let seed=97;const random=()=>((seed=seed*16807%2147483647)/2147483647);
  const spacing=1024/Math.max(150,Math.round(book.width*500));
  const sheetTone=Array.from({length:Math.ceil(1024/spacing)+1},()=>random()*5-2.5);
  for(let x=0;x<1024;x++)for(let y=0;y<512;y++){
   const phase=(x+.17*Math.sin(y/53))/spacing;
   const seam=Math.pow(Math.max(0,Math.cos(phase*Math.PI*2)),12)*12;
   const grain=(random()-.5)*5;
   const edgeShade=5*Math.exp(-Math.min(x,1023-x)/24);
   const tone=sheetTone[Math.floor(x/spacing)]+grain-seam-edgeShade;
   const i=(y*1024+x)*4;
   headPixels.data[i]=240+tone;headPixels.data[i+1]=237+tone;headPixels.data[i+2]=228+tone;headPixels.data[i+3]=255;
  }
  headContext.putImageData(headPixels,0,0);
  const paperTop=texture(head);const paperRelief=texture(head);paperRelief.colorSpace=THREE.NoColorSpace;
  const cloth=noiseCanvas('#888888',true);const bump=texture(cloth);bump.colorSpace=THREE.NoColorSpace;
  return {spine:texture(spine),cover:texture(cover),paper:texture(paper),paperTop,paperRelief,bump};
}
export function disposeTextures(maps){Object.values(maps).forEach(map=>map.dispose());}
