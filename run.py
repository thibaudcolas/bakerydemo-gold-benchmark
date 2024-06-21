import subprocess
import re
import time

def process_array(arr):
    for args in arr:

        input_file = "requirements/base.txt"  # Assuming the first argument is the input file

        with open(input_file, 'r') as infile:
            file_contents = infile.read()

        file_contents = re.sub(r'Django==\d+\.\d+\.\d+', f"Django=={args[0]}", file_contents)
        file_contents = re.sub(r'wagtail==\d+\.\d+\.\d+', f"wagtail=={args[1]}", file_contents)

        # Write the modified contents back to the output file
        with open(input_file, 'w') as outfile:
            outfile.write(file_contents)

        # please change these paths if your code sources path is not /home/gc
        subprocess.run(['/usr/bin/env', 'python3', '/home/gc/green-metrics-tool/runner.py',  '--uri', '/home/gc/bakerydemo-gold-benchmark',  '--name', f"Historic Run (Django {args[0]} / Wagtail {args[1]})", '--skip-unsafe', '--filename', 'usage_scenario_warm_timetravel_2023_09_10.yml'])
        print("Sleeping")
        time.sleep(300)

if __name__ == "__main__":

    #=> All versions support Python 3.8
    #=> we try with 3.11 though for more consistency with modern packages

    # Django / Wagtail pairings
    my_array = [
        ['4.1.10', '4.2.4'], # current
        ['4.1.10', '4.1.6'],
        ['4.1.10', '4.0.4'],
        ['4.0.10', '3.0.3'],
        ['4.0.10', '2.16.3'],
        ['3.2.21', '2.15.6'],
        ['3.2.21', '2.14.2'],
        ['3.2.21', '2.13.5'],
        ['3.1.14', '2.12.5'],
        ['3.1.14', '2.11.8'],
        ['3.0.14', '2.9.3'],
        ['3.0.14', '2.8.2'],
        ['2.2.28', '2.7.1'],
        ['2.2.28', '2.6.3'],
        ['2.2.28', '2.5.2'], # Aug 1, 2019
    ]

    process_array(my_array)
