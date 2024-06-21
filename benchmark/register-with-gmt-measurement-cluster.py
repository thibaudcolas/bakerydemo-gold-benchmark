import requests

# edit this with the email address to be notified when the repo you submit is run
# see the full API at https://api.green-coding.io/docs

gmt_run_data = {
    "name": "Djangocon EU 2024 BakeryDemo GOLD Benchmark",
    "email": "YOUR_NAME@YOUR_EMAIL",
    "url": "https://github.com/thegreenwebfoundation/bakerydemo-gold-benchmark/",
    "branch": "main",
    "filename": "usage_scenario.yml",
    "machine_id": 7,  # 7 is the specific machine ID for CO2 Benchmarking
    "schedule_mode": "one-off",
}

# post the payload to add this repo to the GMT measurement cluster for a one-off run
requests.post("https://api.green-coding.io/v1/software/add", json=gmt_run_data)
