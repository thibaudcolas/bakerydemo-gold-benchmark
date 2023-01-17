# bakerydemo GOLD benchmark

Reference Wagtail site implementation for energy usage benchmarking.

## Project setup

This project is based upon Wagtail’s official [bakerydemo](https://github.com/wagtail/bakerydemo), with tweaks to make it more suitable for local [energy consumption benchmarking](https://github.com/wagtail/wagtail/discussions/8843).

### Differences with vanilla bakerydemo

With the overall goal of making the project more representative of a well-maintained real-world production site:

- Full Debian base image rather than `-slim`
- Gunicorn instead of uWSGI
- Python 3.11 instead of 3.9
- Latest WhiteNoise 6.2.0 for Python 3.11 compatibility
- Up-to-date production-ready Django configuration

### Differences with real-world production sites

With the overall goal of making it simpler to get the project running locally with Docker as the only requirement:

- Running locally rather than in a data center
- No reverse-proxy CDN caching requests
- Serving media files with Django (bad practice) rather than dedicated object storage service (S3, Google Cloud Storage, etc)
- Running over HTTP rather than HTTPS

## Getting started

Requirement: Docker.

```bash
# Download a copy of https://github.com/thibaudcolas/bakerydemo-gold-benchmark.
cd bakerydemo-gold-benchmark
docker compose build app
docker compose up app
# The site is up and running but still needs its database initialised.
docker compose exec app ./manage.py migrate
docker compose exec app ./manage.py load_initial_data
```

The site is now up and running with its demo content, but still needs cache warming to be representative of a real-world production site. In particular, Wagtail generates optimised images on the fly _the first time an image is requested_.

Here is a sample `wget` command to warm up the cache:

```bash
wget --recursive --spider --no-directories http://localhost:8005/ -o warmup.log
```

From there, the site can be accessed at <http://localhost:8005/>.

## Benchmark scenarios

Our scenarios cover different aspects of a site, representing real-world user journeys, all spanning multiple pages:

- `homepage-landing.js`: The simplest user journey. Landing on the homepage, navigating to the bread listing page, and finally to a bread detail page.
- `blog-filtering.js`: Another simple user journey. Landing on the blogs listing, filtering it by tag, and arriving on a blog page.
- `contact-us.js`: Successful submission of a simple Wagtail form.
- `search.js`: Usage of a search form. From the homepage, arriving on the search results for "bread", and opening one result.
- `admin.js`: A simple journey through the Wagtail admin. Logging in, editing a blog page, and checking the results in the live preview.

Note although the navigation through the sequence of pages represents a real-world journey, the scenarios’ duration isn’t representative of real usage. Average times spent across different page types are:

- Homepage: 2min
- Listing page: 1min
- Search results: 30s
- Blog post: 1min30s to 8min

### Puppeteer scenarios

Puppeteer test scripts are in `benchmark/puppeteer`. To run those scenarios (requirement: Node 18),

```bash
cd benchmark/puppeteer
npm install
# Then run each scenario with `node`:
node homepage-landing.js
```

### Playwright scenarios for Greenframe

See [Playwright – Migrating from Puppeteer](https://playwright.dev/docs/puppeteer) for differences between the two APIs. Those are the same scenarios, but written with Playwright for compatibility with [Greenframe](https://github.com/marmelab/greenframe-cli). First install Greenframe, then use the following test commands:

```bash
greenframe analyze http://localhost:8005/ homepage-landing.js --containers="bakerydemo-gold-benchmark-app-1" --databaseContainers="bakerydemo-gold-benchmark-db-1,bakerydemo-gold-benchmark-redis-1"
greenframe analyze http://localhost:8005/ search.js --containers="bakerydemo-gold-benchmark-app-1" --databaseContainers="bakerydemo-gold-benchmark-db-1,bakerydemo-gold-benchmark-redis-1"
greenframe analyze http://localhost:8005/ blog-filtering.js  --containers="bakerydemo-gold-benchmark-app-1" --databaseContainers="bakerydemo-gold-benchmark-db-1,bakerydemo-gold-benchmark-redis-1"
greenframe analyze http://localhost:8005/ contact-us.js --containers="bakerydemo-gold-benchmark-app-1" --databaseContainers="bakerydemo-gold-benchmark-db-1,bakerydemo-gold-benchmark-redis-1"
greenframe analyze http://localhost:8005/ admin.js --containers="bakerydemo-gold-benchmark-app-1" --databaseContainers="bakerydemo-gold-benchmark-db-1,bakerydemo-gold-benchmark-redis-1"0.
```

Or run all scenarios at once, based on the configuration in `.greenframe.yml`:

```bash
greenframe analyze
```

Here is what the result from a successful run looks like:

```txt
[…]
✅ homepage-landing completed
The estimated footprint is 0.093 g eq. co2 ± 6.1% (0.21 Wh).

✅ search completed
The estimated footprint is 0.041 g eq. co2 ± 4.9% (0.092 Wh).

✅ blog-filtering completed
The estimated footprint is 0.063 g eq. co2 ± 1.8% (0.142 Wh).

✅ contact-us completed
The estimated footprint is 0.035 g eq. co2 ± 6% (0.078 Wh).

✅ admin completed
The estimated footprint is 0.155 g eq. co2 ± 8.8% (0.352 Wh).
```

## Static site setup

It’s interesting to compare the performance of Django and Wagtail to that of pre-generated HTML files. First, generate the site:

```bash
wget --mirror http://localhost:8005/
mv localhost:8000 static-bakerydemo
mv static-bakerydemo/static/wagtailfontawesome/fonts/fontawesome-webfont.woff2\?v=4.7.0 static-bakerydemo/static/wagtailfontawesome/fonts/fontawesome-webfont.woff2
mv bakerydemo/static/img/bread-favicon.ico static-bakerydemo/favicon.ico
```

Then, serve it with nginx:

```bash
docker compose up static_app
```

From there, the static site can be accessed at <http://localhost:8001/>.

The Greenframe test suite can run over this site as well with:

```bash
greenframe analyze --configFile .greenframe.static.yml
```

Sample results:

```txt
[…]
✅ homepage-landing completed
The estimated footprint is 0.038 g eq. co2 ± 3.2% (0.085 Wh).

✅ blog-filtering completed
The estimated footprint is 0.038 g eq. co2 ± 15.3% (0.085 Wh).
```

## OpenEnergyBadge

These badges show the cost of running certain scenarios in this repository:

- All Routes
<a href="https://metrics.green-coding.berlin/stats.html?id=37e0ca9c-b38e-4833-8316-59802d8ef1da"><img src="https://api.green-coding.berlin/v1/badge/single/37e0ca9c-b38e-4833-8316-59802d8ef1da?metric=ml-estimated"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=37e0ca9c-b38e-4833-8316-59802d8ef1da"><img src="https://api.green-coding.berlin/v1/badge/single/37e0ca9c-b38e-4833-8316-59802d8ef1da?metric=RAPL"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=37e0ca9c-b38e-4833-8316-59802d8ef1da"><img src="https://api.green-coding.berlin/v1/badge/single/37e0ca9c-b38e-4833-8316-59802d8ef1da?metric=DC"></a>

- Migrations
<a href="https://metrics.green-coding.berlin/stats.html?id=dfb58eb7-7100-4ec6-80ee-7653e1329190"><img src="https://api.green-coding.berlin/v1/badge/single/dfb58eb7-7100-4ec6-80ee-7653e1329190?metric=ml-estimated"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=dfb58eb7-7100-4ec6-80ee-7653e1329190"><img src="https://api.green-coding.berlin/v1/badge/single/dfb58eb7-7100-4ec6-80ee-7653e1329190?metric=RAPL"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=dfb58eb7-7100-4ec6-80ee-7653e1329190"><img src="https://api.green-coding.berlin/v1/badge/single/dfb58eb7-7100-4ec6-80ee-7653e1329190?metric=DC"></a>

- Cache Warmups
<a href="https://metrics.green-coding.berlin/stats.html?id=2821c396-98f0-4210-8aad-a9fc5a37f01e"><img src="https://api.green-coding.berlin/v1/badge/single/2821c396-98f0-4210-8aad-a9fc5a37f01e?metric=ml-estimated"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=2821c396-98f0-4210-8aad-a9fc5a37f01e"><img src="https://api.green-coding.berlin/v1/badge/single/2821c396-98f0-4210-8aad-a9fc5a37f01e?metric=RAPL"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=2821c396-98f0-4210-8aad-a9fc5a37f01e"><img src="https://api.green-coding.berlin/v1/badge/single/2821c396-98f0-4210-8aad-a9fc5a37f01e?metric=DC"></a>

- Admin route only
<a href="https://metrics.green-coding.berlin/stats.html?id=ac6b2e5e-7b02-4002-a864-2a5b9e5bc3de"><img src="https://api.green-coding.berlin/v1/badge/single/ac6b2e5e-7b02-4002-a864-2a5b9e5bc3de?metric=ml-estimated"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=ac6b2e5e-7b02-4002-a864-2a5b9e5bc3de"><img src="https://api.green-coding.berlin/v1/badge/single/ac6b2e5e-7b02-4002-a864-2a5b9e5bc3de?metric=RAPL"></a>
<a href="https://metrics.green-coding.berlin/stats.html?id=ac6b2e5e-7b02-4002-a864-2a5b9e5bc3de"><img src="https://api.green-coding.berlin/v1/badge/single/ac6b2e5e-7b02-4002-a864-2a5b9e5bc3de?metric=DC"></a>
