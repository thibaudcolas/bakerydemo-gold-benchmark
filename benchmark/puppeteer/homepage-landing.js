import puppeteer from 'puppeteer';
import microtime from 'microtime';

(async () => {
  let puppeteerArgs = {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
  // assume we are in development environment working on scripts
  // so we want to see the browser doing its thing
  if (process.env.LIVE_DEMO) {
    puppeteerArgs.headless = false;
  }
  // assume we running puppeteer in a dedicated docker container 
  // for GMT. We want to be explicit about the path to the browser
  // and we want it to be headless
  else {
    puppeteerArgs.headless = true;
    puppeteerArgs.executablePath = "/usr/bin/chromium-browser";
  }


  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.setViewport({ "width": 1280, "height": 800 });

  await page.goto(process.env.USAGE_SCENARIO_DOMAIN, { waitUntil: "networkidle0" });
  console.log(microtime.now(), await page.title());
  console.log("GMT_SCI_R=1");

  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('footer').scrollIntoView());
  await page.waitForNetworkIdle();

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('[href="/breads"]')
  ])
  console.log(microtime.now(), await page.title());
  console.log("GMT_SCI_R=1");

  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('footer').scrollIntoView());
  await page.waitForNetworkIdle();

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('[href="/breads/bolani/"]')
  ])
  console.log(microtime.now(), await page.title());
  console.log("GMT_SCI_R=1");

  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('footer').scrollIntoView());
  await page.waitForNetworkIdle();

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});