import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    await page.setViewport({"width":1280,"height":800});

    await page.goto("http://localhost:8000/", { waitUntil: "networkidle0" });
    console.log(await page.title());

    await page.waitForTimeout(3000);
    await page.evaluate(() => document.querySelector('footer').scrollIntoView());
    await page.waitForNetworkIdle();

    const search = await page.$('#search-input');
    await search.type('bread');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      search.press('Enter')
    ]);

    console.log(await page.title());

    await page.waitForTimeout(3000);
    await page.evaluate(() => document.querySelector('footer').scrollIntoView());
    await page.waitForNetworkIdle();

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('[href="/blog/icelandic-baking/"]')
    ])
    console.log(await page.title());

    await browser.close();
})().catch(err => {
    console.error(err);
    process.exit(1);
});
