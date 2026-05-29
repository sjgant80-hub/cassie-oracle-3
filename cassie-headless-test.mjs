// quick test: can we launch headless from sandbox?
import { chromium } from 'playwright';

console.log('attempting headless launch...');
try {
  const browser = await chromium.launch({ headless: true });
  console.log('✓ HEADLESS LAUNCHED');
  const page = await browser.newPage();
  console.log('navigating to CASSIE...');
  await page.goto('https://sjgant80-hub.github.io/cassietorusbtc135solver/cassie-torus-v2.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('page loaded:', await page.title());
  await page.waitForTimeout(5000);
  const versionElement = await page.evaluate(() => {
    return {
      hasGoldenSpawn: typeof window.GOLDEN_SPAWN !== 'undefined',
      hasInlineOracle: typeof window.INLINE_ORACLE !== 'undefined',
      hasRecentDp: Array.isArray(window.recentDpSample),
      hasGoldenPriorityHits: Array.isArray(window.GOLDEN_PRIORITY_HITS),
      title: document.title
    };
  });
  console.log('window state:', JSON.stringify(versionElement, null, 2));
  await browser.close();
  console.log('done ✓');
} catch (e) {
  console.error('FAILED:', e.message.split('\n')[0]);
  process.exit(1);
}
