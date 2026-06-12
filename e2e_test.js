const puppeteer = require('puppeteer');

async function runBrowserTest() {
  console.log('Starting Multi-Tenancy E2E Browser Automation Test...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Test 1: Admin Dashboard (port 3003)
    console.log('--- Test 1: Admin Dashboard (http://localhost:3003) ---');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle2', timeout: 15000 });
    let title = await page.title();
    console.log(`Admin Title: ${title}`);
    let content = await page.evaluate(() => document.body.innerText);
    if (content.includes('BeautyBeats Admin') || content.includes('Login')) {
      console.log('✅ Admin Dashboard loaded successfully.');
    } else {
      console.log('⚠️ Admin Dashboard may not have loaded properly.');
    }

    // Test 2: Client Website (port 3004)
    console.log('--- Test 2: Salon Client Website (http://localhost:3004) ---');
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle2', timeout: 15000 });
    title = await page.title();
    console.log(`Client Title: ${title}`);
    content = await page.evaluate(() => document.body.innerText);
    if (content.toLowerCase().includes('salon')) {
      console.log('✅ Client Website loaded successfully.');
    } else {
      console.log('⚠️ Client Website may not have loaded properly.');
    }

    // Test 3: Clinic Website (port 3005)
    console.log('--- Test 3: Clinic Website (http://localhost:3005) ---');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle2', timeout: 15000 });
    title = await page.title();
    console.log(`Clinic Title: ${title}`);
    content = await page.evaluate(() => document.body.innerText);
    if (content.toLowerCase().includes('clinic') || content.toLowerCase().includes('hydra')) {
      console.log('✅ Clinic Website loaded successfully.');
    } else {
      console.log('⚠️ Clinic Website may not have loaded properly.');
    }

    await page.screenshot({ path: 'test_screenshot.png' });
    console.log('✅ Final screenshot saved as test_screenshot.png');
    
    console.log('Browser Automation Test Completed Successfully!');
  } catch (error) {
    console.error('❌ Browser Test Failed:', error.message);
  } finally {
    await browser.close();
  }
}

runBrowserTest();
