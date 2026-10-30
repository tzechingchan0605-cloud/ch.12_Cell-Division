"""Produce a standalone HTML file with no runtime imports or requests."""
from pathlib import Path
import re
root = Path(__file__).resolve().parent.parent
def inline_module(name):
    source = (root / name).read_text()
    source = re.sub(r'^import .+?;\s*$', '', source, flags=re.MULTILINE)
    return source.replace('export ', '')
modules = '\n'.join(inline_module(name) for name in ['model.mjs', 'i18n.mjs', 'animation.mjs', 'phases.mjs', 'app.mjs'])
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + (root / 'style.css').read_text() + '</style>')
html = html.replace('<script type="module" src="app.mjs"></script>', '<script type="module">\n' + modules + '\n</script>')
(root / 'offline.html').write_text(html)
print('Built offline.html')
