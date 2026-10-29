"""Produce a standalone HTML file with no runtime imports or requests."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
model = (root / 'model.mjs').read_text().replace('export ', '')
i18n = (root / 'i18n.mjs').read_text().replace('export ', '')
app = '\n'.join((root / 'app.mjs').read_text().splitlines()[2:])
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + (root / 'style.css').read_text() + '</style>')
html = html.replace('<script type="module" src="app.mjs"></script>', '<script type="module">\n' + model + '\n' + i18n + '\n' + app + '\n</script>')
(root / 'offline.html').write_text(html)
print('Built offline.html')
