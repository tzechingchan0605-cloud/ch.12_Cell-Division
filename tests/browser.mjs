// Optional browser check: install Playwright outside the checkout, then set
// PLAYWRIGHT_MODULE to its package entry point and CHROMIUM_PATH if needed.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const seek=async value=>page.locator('#timeline').fill(String(value));
  const position=async()=>Number(await page.locator('#timeline').inputValue());
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
  await page.locator('#en').click();
  await page.locator('#compare').click();
  await seek(3);
  await page.evaluate(()=>window.tracked=document.querySelector('[data-kind="mitosis"] [data-strand="M1-s0"]'));
  await page.locator('#play').click();
  const samples=await page.evaluate(()=>new Promise(resolve=>{
    const values=[],start=performance.now();
    function sample(time){values.push(Number(window.tracked.querySelector('circle').getAttribute('cy')));if(time-start<500)requestAnimationFrame(sample);else resolve(values)}
    requestAnimationFrame(sample);
  }));
  assert.ok(new Set(samples.map(x=>x.toFixed(2))).size>8,'chromosome must move on many intermediate frames');
  assert.ok(samples.at(-1)<samples[0],'first division must move towards upper pole');
  await page.locator('#play').click();
  const paused=await position();assert.ok(paused>3&&paused<4);
  await page.waitForTimeout(180);assert.equal(await position(),paused);
  await page.locator('#zh').click();assert.equal(await position(),paused);
  assert.equal(await page.evaluate(()=>window.tracked===document.querySelector('[data-kind="mitosis"] [data-strand="M1-s0"]')),true,'SVG nodes survive renders');
  await page.locator('#labels').click();assert.equal(await position(),paused);
  await page.locator('#record').click();const record=await page.locator('tbody').innerText();
  await seek(0);await page.locator('#flip0').click();assert.equal(await page.locator('tbody').innerText(),record);
  await seek(3.4);
  await page.locator('#en').click();
  await page.locator('#speed').selectOption('1200');
  await page.locator('#play').click();await page.waitForTimeout(120);
  const prior=await position();await page.locator('#speed').selectOption('4200');
  const next=await position();assert.ok(next>=prior&&next-prior<.15,'speed change must not reset or jump');
  await page.locator('#play').click();
  await seek(3.4);await page.locator('#speed').selectOption('1200');
  await page.locator('#step').click();await page.waitForTimeout(1100);
  assert.equal(await position(),4);assert.equal(await page.locator('#play').innerText(),'Play');
  assert.ok((await page.locator('[data-count="meiosis"]').innerText()).includes('2'));
  const y=async key=>Number(await page.locator(`[data-kind="meiosis"] [data-strand="${key}"] circle`).getAttribute('cy'));
  assert.equal(await y('M1-s0'),await y('M1-s1'),'sisters remain joined in I');
  assert.notEqual(await y('M1-s0'),await y('P1-s0'),'homologues move to upper/lower poles');
  for(const p of [3,3.5,4,4.65,7.5,8]){
    await seek(p);await page.screenshot({path:`/tmp/cell-animation-${p}.png`,fullPage:true});
  }
  await page.locator('#challenge').click();await page.locator('[data-choice="0"]').click();await page.locator('#check').click();
  assert.equal(await page.locator('.feedback').count(),1);
  await page.locator('#response').fill('The centromeres lead towards the poles.');
  await page.locator('#zh').click();assert.equal(await page.locator('#response').inputValue(),'The centromeres lead towards the poles.');
  const download=page.waitForEvent('download');await page.locator('#download').click();assert.ok((await download).suggestedFilename().endsWith('.csv'));
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'/tmp/cell-animation-mobile.png',fullPage:true});
  await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>scrollTo(0,0));
  // Both language variants must keep the complete transport panel in view.
  for(const language of ['en','zh']) {
    await page.locator('#'+language).click();
    for(const [value,label] of [[1.5,'Prophase I'],[2.5,'Metaphase I'],[3.5,'Anaphase I'],[4.15,'Telophase I'],[4.6,'Cytokinesis I'],[5.1,'Prophase II'],[5.6,'Metaphase II'],[6.5,'Anaphase II'],[7.15,'Telophase II'],[7.6,'Cytokinesis II']]) {
      await seek(value);
      if(language==='en')assert.equal(await page.locator('[data-phase="meiosis"]').innerText(),label);
      else assert.ok(!(await page.locator('[data-phase="meiosis"]').innerText()).includes('phase'));
      const box=await page.locator('.transport').boundingBox();
      assert.ok(box.y>=0&&box.y+box.height<=768,'playback and scrubber must fit the viewport');
    }
  }
  assert.equal(await page.locator('.origin-label').filter({hasText:/s[01]/}).count(),0);
  assert.ok((await page.locator('[data-count="meiosis"]').innerText()).includes('t = 4'));
  const reduced=await browser.newPage({reducedMotion:'reduce'});
  await reduced.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
  assert.equal(await reduced.locator('#reduced').isChecked(),true);
  await reduced.locator('#step').click();assert.equal(await reduced.locator('#timeline').inputValue(),'1');
  // The managed browser blocks file:// navigation. Inject the exact standalone
  // document with networking disabled to verify its self-contained runtime.
  const offline=await browser.newPage();offline.on('pageerror',e=>errors.push(e.message));
  await offline.context().setOffline(true);await offline.setContent(await readFile(new URL('../offline.html',import.meta.url),'utf8'));
  await offline.locator('#en').click();await offline.locator('#timeline').fill('3.5');
  await offline.locator('.observation-note summary').click();
  assert.equal(await offline.locator('#timeline').inputValue(),'3.5');
  assert.ok((await offline.locator('#model-note').innerText()).includes('moving'));
  assert.deepEqual(errors,[]);
  console.log('PASS: intermediate frames, upper/lower separation, persistent SVG nodes, precise pause/resume, speed changes, animated single step, immutable recordings, bilingual state, CSV, mobile layout, reduced motion and offline edition.');
} finally {await browser.close()}
