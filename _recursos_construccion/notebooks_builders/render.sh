#!/bin/bash
# uso: render.sh nombre  (en /home/claude/curso/build)
SK=/root/.claude/skills/synced/80ec27f9-734b-48fe-b9dd-24005b6f0cbc_71d46920-e796-4608-a32a-59ea7b0ef256/pptx
cd /home/claude/curso/build
python3 $SK/scripts/office/validate.py $1.pptx | tail -1
python3 $SK/scripts/office/soffice.py --headless --convert-to pdf $1.pptx >/dev/null 2>&1
rm -f $1-*.jpg grid_$1_*.jpg; pdftoppm -jpeg -r 50 $1.pdf $1
python3 - $1 <<'PY'
import sys,glob
from PIL import Image
n=sys.argv[1]; fs=sorted(glob.glob(f'{n}-*.jpg')); ims=[Image.open(f) for f in fs]; w,h=ims[0].size
for k in range(0,len(ims),9):
    g=Image.new('RGB',(w*3,h*3),'white')
    for i,im in enumerate(ims[k:k+9]): g.paste(im,((i%3)*w,(i//3)*h))
    g.save(f'grid_{n}_{k//9}.jpg')
print(len(fs),'slides')
PY
