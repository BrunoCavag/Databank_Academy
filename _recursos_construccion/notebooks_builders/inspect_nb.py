import nbformat, sys, base64, os, re
nb = nbformat.read(sys.argv[1], 4)
imgdir = sys.argv[2] if len(sys.argv) > 2 else None
k = 0
for i, c in enumerate(nb.cells):
    if c.cell_type != 'code':
        continue
    for o in c.outputs:
        if o.output_type == 'stream':
            print(f"[{i}] STREAM", o.text[:600])
        elif o.output_type == 'error':
            print(f"[{i}] ERROR", o.ename, o.evalue)
        elif o.output_type in ('execute_result', 'display_data'):
            d = o.data
            if 'image/png' in d and imgdir:
                os.makedirs(imgdir, exist_ok=True)
                fn = f"{imgdir}/c{i:02d}_{k}.png"; k += 1
                open(fn, 'wb').write(base64.b64decode(d['image/png'])); print(f"[{i}] IMG {fn}")
            elif 'text/html' in d:
                txt = re.sub(r'<style.*?</style>', '', d['text/html'], flags=re.S)
                txt = re.sub(r'<[^>]+>', ' ', txt); txt = re.sub(r'\s+', ' ', txt)
                print(f"[{i}] HTML", txt[:700])
            elif 'text/plain' in d:
                print(f"[{i}] RES", d['text/plain'][:600])
