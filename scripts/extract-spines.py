"""Rectify original photographs, never synthesize book artwork.
Run: python scripts/extract-spines.py /path/to/originals
Coordinates reference EXIF-oriented photos reduced to 1500px wide.
"""
import sys,json,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageOps,ImageDraw
root=Path(sys.argv[1]); out=Path('public/images/books'); out.mkdir(parents=True,exist_ok=True)
# id, image, clockwise source corners, physical model height/width/depth
rows=[
('converted','7650',[(137,435),(216,423),(262,1040),(194,1057)],3.23,.40,2.12),
('the-coming-wave','7650',[(251,367),(317,367),(336,1017),(277,1035)],3.73,.46,2.45),
('ai-needs-you','7650',[(326,282),(416,286),(426,988),(344,1011)],3.88,.48,2.5),
('the-creative-act','7650',[(422,294),(541,304),(523,956),(430,983)],3.78,.67,2.46),
('how-great-ideas-happen','7650',[(549,256),(619,258),(586,926),(526,946)],4.02,.43,2.6),
('empire-of-ai','7650',[(626,247),(724,252),(680,892),(593,920)],4.08,.78,2.68),
('if-anyone-builds-it','7650',[(731,253),(783,255),(727,879),(684,893)],3.87,.44,2.5),
('coachable','7651',[(585,213),(659,218),(646,842),(590,825)],3.87,.52,2.53),
('ai-for-good','7651',[(666,222),(749,224),(714,863),(653,854)],3.87,.52,2.55),
('the-singularity-is-nearer','7651',[(759,207),(852,216),(805,898),(720,878)],3.91,.64,2.56),
('the-infinity-machine','7651',[(870,215),(982,222),(897,930),(811,902)],3.99,.72,2.62),
('ai-for-social-good','7651',[(1007,289),(1078,291),(983,951),(904,931)],3.64,.56,2.39),
('co-intelligence','7651',[(1112,326),(1193,324),(1041,971),(989,961)],3.60,.44,2.36),
('supremacy','7651',[(1204,340),(1300,350),(1119,1000),(1052,985)],3.70,.58,2.42),
('crisis-engineering','7651',[(1312,385),(1388,396),(1193,1023),(1125,1007)],3.61,.49,2.37),
]
manifest=[]
for id,number,corners,height,width,depth in rows:
 source=root/f'IMG_{number}.jpeg';im=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
 points=np.array(corners,dtype=float)*(im.width/1500)
 H=1536;W=round(H*width/height)
 dest=[(0,0),(W,0),(W,H),(0,H)];a=[];b=[]
 for (x,y),(u,v) in zip(dest,points):
  a.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);b.extend([u,v])
 coeff=np.linalg.solve(np.array(a),np.array(b))
 result=im.transform((W,H),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC)
 result.save(out/f'{id}-source-spine.webp',quality=95,method=6)
 manifest.append(dict(id=id,source=source.name,sha256=hashlib.sha256(source.read_bytes()).hexdigest(),sourceCorners1500=corners,height=height,width=width,depth=depth,asset=f'/images/books/{id}-source-spine.webp'))
Path('docs/spine-sources.json').write_text(json.dumps(manifest,indent=2)+'\n')
# Contact sheet for internal visual review only.
canvas=Image.new('RGB',(1500,770),'#eeeae2')
for i,row in enumerate(manifest):
 im=Image.open(out/f"{row['id']}-source-spine.webp");im.thumbnail((90,700));canvas.paste(im,(i*100+(90-im.width)//2,30));ImageDraw.Draw(canvas).text((i*100+5,740),str(i+1),fill='black')
canvas.save('/workspace/previews/source-spines-review.jpg')
