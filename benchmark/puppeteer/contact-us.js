import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    await page.setViewport({"width":1280,"height":1600});

    await page.goto("http://localhost:8000/contact-us/", { waitUntil: "networkidle0" });
    console.log(await page.title());

    await page.waitForTimeout(3000);
    await page.evaluate(() => document.querySelector('footer').scrollIntoView());
    await page.waitForNetworkIdle();

    const id_subject = await page.$('#id_subject');
    await id_subject.type('Enquiring about bread');
    const id_your_name = await page.$('#id_your_name');
    await id_your_name.type('Testing tester');
    const id_purpose = await page.$('#id_purpose');
    await id_purpose.select('Question');
    const id_body = await page.$('#id_body');
    await id_body.type('Is this is for demo purposes only?');
    const submit = await page.$('[type="submit"]');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      submit.press('Enter')
    ]);

    await page.waitForTimeout(3000);
    await page.evaluate(() => document.querySelector('footer').scrollIntoView());
    await page.waitForNetworkIdle();

    console.log(await page.title());
    const intro = await page.$('.index-header__body-introduction');
    console.log(await intro.evaluate((node) => node.innerText));

    await page.waitForTimeout(3000);
    await page.evaluate(() => document.querySelector('footer').scrollIntoView());
    await page.waitForNetworkIdle();

    await browser.close();
})().catch(err => {
    console.error(err);
    process.exit(1);
});
