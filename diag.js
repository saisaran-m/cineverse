const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    } else if (msg.type() === 'warning') {
      console.log('PAGE WARN:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('UNCAUGHT PAGE ERROR:', err.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });

  console.log('Navigating to Vercel site...');
  await page.goto('https://cineverse-sai.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log('Waiting 5 seconds for app logic...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('Extracting DOM data...');
  const data = await page.evaluate(() => {
    const heroTitle = document.getElementById('heroTitle')?.textContent;
    const nowPlayingHtml = document.getElementById('nowPlayingRow')?.innerHTML;
    const isLoaderPresent = !!document.getElementById('cinemaLoader');
    const opacity = document.body.style.opacity;
    
    return { heroTitle, nowPlayingLength: nowPlayingHtml?.length, isLoaderPresent, opacity };
  });

  console.log('DOM Results:', data);

  await browser.close();
})();
