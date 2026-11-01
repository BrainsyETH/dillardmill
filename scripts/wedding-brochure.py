"""Regenerate the private/public brochure from the site's package data.
Requires Node (with the repo's TypeScript dependency), Python, ReportLab and Pillow.
Run from the repo root: python scripts/wedding-brochure.py
"""
import json, subprocess
from io import BytesIO
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageOps
root = Path(__file__).resolve().parent.parent
js = "const fs=require('fs'),ts=require('typescript');const src=fs.readFileSync('src/lib/events/content.ts','utf8');const out=ts.transpile(src,{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020});const m={exports:{}};new Function('exports','module',out)(m.exports,m);process.stdout.write(JSON.stringify(m.exports.weddingPackages));"
packages = json.loads(subprocess.check_output(['node','-e',js],cwd=root))
for name,filename in [('PVSerif','DejaVuSerif.ttf'),('PVSans','DejaVuSans.ttf'),('PVBold','DejaVuSans-Bold.ttf')]:
 pdfmetrics.registerFont(TTFont(name, '/usr/share/fonts/truetype/dejavu/'+filename))
pdfmetrics.registerFontFamily('PVSans',normal='PVSans',bold='PVBold')
out = root/'src/lib/content/documents/pine-valley-weddings.pdf'
c = canvas.Canvas(str(out),pagesize=(612,792))
c.setTitle('Wedding weekends at Pine Valley')
c.setAuthor('Pine Valley at Dillard Mill')
cream, forest, stone, sand = '#F8F6F1','#2F4A34','#636B63','#DDDCD2'
c.setFillColor(HexColor(cream));c.rect(0,0,612,792,fill=1,stroke=0)
def text(x,y,s,size=10,font='PVSans',color=forest):
 c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,y,s)
def para(x,y,s,w=522,size=10):
 p=Paragraph(s,ParagraphStyle('body',fontName='PVSans',fontSize=size,leading=size*1.4,textColor=HexColor(forest)))
 _,h=p.wrap(w,100);p.drawOn(c,x,y-h);return h
text(40,754,'PINE VALLEY',14,'PVSerif')
text(40,738,'AT DILLARD MILL  /  DAVISVILLE, MISSOURI',8,color=stone)
text(40,702,'Weddings at Pine Valley',26,'PVSerif')
text(40,682,'A weekend by the creek, with your people staying close.',10)
im=Image.open(root/'public/images/property/819922e5ba54.webp').convert('RGB')
im=ImageOps.fit(im,(1596,390))
jpeg=BytesIO();im.save(jpeg,format='JPEG',quality=82,optimize=True);jpeg.seek(0)
c.drawImage(ImageReader(jpeg),40,534,width=532,height=130)
text(40,514,'100 EVENT GUESTS',10,'PVBold')
text(225,514,'8 ACCOMMODATIONS',10,'PVBold')
text(422,514,'2-3 NIGHT WEEKENDS',10,'PVBold')
y=488
for p in packages:
 c.setStrokeColor(HexColor(sand));c.line(40,y,572,y)
 text(40,y-24,p['name'],18,'PVSerif')
 text(460,y-24,f"${p['price']:,}",22,'PVSerif')
 text(40,y-43,p['stay'].replace('–','-'),9,color=stone)
 text(40,y-60,'Up to 100 event guests. '+p['lodging'].replace('·',' / ')+'.',9)
 para(40,y-70,' / '.join(p['includes']).replace('·','-'),size=8)
 y-=103
c.setStrokeColor(HexColor(sand));c.line(40,y,572,y)
para(40,y-13,'<b>Weather:</b> No rain backup is provided. The cafe seats 30; it cannot accommodate a 100-person reception.',size=9)
para(40,y-48,'A ceremony at Dillard Mill State Historic Site requires a separate arrangement with Missouri State Parks. We will confirm availability, taxes and your full quote before booking.',size=8)
text(40,73,'Ask about your date',18,'PVSerif')
text(40,54,'dillardmill.com/weddings  /  (314) 843-4321',10)
text(40,38,'pinevalley@dillardmill.com  /  126 Dillard Mill Road, Davisville, MO 65456',9)
c.linkURL('https://dillardmill.com/weddings',(40,48,300,65),relative=0)
c.showPage();c.save()
print(out)
