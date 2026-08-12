const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR STACK:', error.stack);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const location = msg.location();
      console.log(`PAGE LOG ERROR: ${msg.text()} at ${location.url}:${location.lineNumber}`);
    }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  } catch (e) {
    console.error("Failed to load page", e);
  }

  await browser.close();
})();
