from PIL import Image,ImageOps,ImageDraw
import numpy as np
from pathlib import Path
import argparse
parser=argparse.ArgumentParser(description="Extract original photographic book faces without repainting or smoothing.")
parser.add_argument("--zip2",type=Path,required=True)
parser.add_argument("--zip3",type=Path,required=True)
parser.add_argument("--zip4",type=Path,required=True)
parser.add_argument("--zip5",type=Path)
parser.add_argument("--only",nargs="*")
args=parser.parse_args()
out=Path(__file__).resolve().parents[1]/'public/images/books'
# Coordinates measured on EXIF-oriented 900 x 1200 previews; masks preserve jacket edges.
specs=[
('converted','spine','IMG_7666',[(350,120),(463,120),(480,1081),(368,1081)],[(351,143),(354,134),(362,128),(381,123),(408,121),(432,122),(449,127),(457,134),(461,148),(479,1027),(478,1057),(474,1071),(463,1076),(444,1079),(407,1081),(383,1078),(374,1073),(369,1063)]),
('if-anyone-builds-it','spine','IMG_7670',[(387,106),(487,106),(498,1138),(382,1138)],[(389,128),(392,112),(400,110),(407,113),(421,110),(429,108),(439,110),(448,107),(468,109),(478,113),(484,124),(497,1108),(492,1126),(487,1133),(469,1137),(422,1136),(398,1132),(392,1125),(383,1066)]),
('converted','cover','IMG_7665',[(140,160),(735,141),(759,1006),(142,1012)],[(142,173),(146,161),(705,141),(728,142),(735,149),(759,994),(757,1004),(739,1007),(164,1012),(144,1006)]),
('if-anyone-builds-it','cover','IMG_7669',[(126,141),(705,135),(737,1060),(124,1074)],[(128,150),(139,143),(686,136),(702,139),(706,150),(737,1053),(729,1060),(139,1073),(127,1068),(123,1055)])]
specs += [
('the-creative-act','spine','IMG_7654',[(366,154),(496,154),(520,1083),(360,1083)],[(368,179),(371,165),(380,163),(398,157),(424,155),(465,155),(485,159),(494,169),(497,191),(519,1045),(516,1067),(506,1075),(488,1080),(437,1082),(388,1080),(372,1077),(362,1078),(360,1067)]),
('the-creative-act','cover','IMG_7653',[(104,108),(756,102),(793,1085),(73,1083)],[(105,124),(116,114),(138,109),(750,103),(755,107),(791,1069),(789,1081),(772,1085),(92,1082),(80,1079),(74,1069)])]
specs += [
('ai-needs-you','spine','IMG_7658',[(361,65),(484,65),(505,1128),(373,1128)],[(362,111),(367,86),(378,74),(392,68),(430,66),(458,70),(472,81),(481,99),(486,316),(489,575),(503,1048),(502,1088),(496,1103),(480,1114),(451,1123),(417,1127),(393,1123),(383,1115),(376,1098),(373,1073)]),
('ai-needs-you','cover','IMG_7657',[(143,132),(747,113),(776,1088),(130,1088)],[(144,150),(152,140),(176,134),(737,114),(746,121),(776,1076),(774,1084),(750,1088),(159,1088),(138,1081),(131,1073)]),
('the-coming-wave','spine','IMG_7662',[(357,75),(447,75),(489,1144),(381,1144)],[(359,79),(366,77),(378,78),(391,76),(405,77),(422,75),(438,76),(445,81),(449,225),(459,448),(469,684),(483,1007),(489,1120),(484,1131),(476,1140),(392,1143),(383,1139),(381,1129)]),
('the-coming-wave','cover','IMG_7661',[(166,177),(717,140),(783,1074),(167,1059)],[(167,181),(179,175),(712,141),(717,142),(782,1070),(780,1073),(176,1059),(168,1054)])]
specs += [
('how-great-ideas-happen','spine','IMG_7678',[(357,84),(482,84),(490,1078),(369,1078)],[(378,108),(382,96),(390,89),(407,85),(446,85),(465,90),(475,100),(481,119),(481,478),(489,1037),(486,1062),(480,1072),(465,1076),(395,1077),(381,1073),(375,1063),(370,1030),(358,380),(362,272)]),
('how-great-ideas-happen','cover','IMG_7677',[(134,157),(715,140),(744,1034),(141,1048)],[(135,168),(144,162),(177,156),(363,145),(555,142),(695,143),(713,147),(743,1027),(737,1033),(690,1038),(406,1047),(157,1048),(145,1043),(141,1033)]),
('empire-of-ai','cover','IMG_7673',[(141,144),(729,122),(774,1050),(141,1061)],[(141,158),(146,150),(190,142),(318,135),(460,129),(619,123),(712,125),(727,129),(774,1032),(768,1045),(742,1050),(603,1057),(405,1062),(191,1059),(153,1056),(143,1049)])]
for id,kind,name,quad,poly in specs:
 if name in ['IMG_7673','IMG_7677','IMG_7678'] and not args.zip5: continue
 if args.only and id not in args.only: continue
 im=ImageOps.exif_transpose(Image.open((args.zip5 if name in ['IMG_7673','IMG_7677','IMG_7678'] else args.zip3 if name in ['IMG_7653','IMG_7654'] else args.zip4 if name in ['IMG_7657','IMG_7658','IMG_7661','IMG_7662'] else args.zip2)/(name+'.jpeg'))).convert('RGBA');scale=im.width/900
 mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon([(round(x*scale),round(y*scale)) for x,y in poly],fill=255);im.putalpha(mask)
 h=1800;w=round(h*((np.linalg.norm(np.array(quad[0])-quad[1])+np.linalg.norm(np.array(quad[2])-quad[3]))/2)/((np.linalg.norm(np.array(quad[0])-quad[3])+np.linalg.norm(np.array(quad[1])-quad[2]))/2))
 dst=[(0,0),(w,0),(w,h),(0,h)];A=[];B=[]
 for (x,y),(sx,sy) in zip(dst,quad):
  u,v=sx*scale,sy*scale;A.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]);B.extend([u,v])
 coeff=np.linalg.solve(A,B);res=im.transform((w,h),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC);res.save(out/f'{id}-individual-{kind}.webp',quality=95,method=6)
 print(id,kind,w,h)
