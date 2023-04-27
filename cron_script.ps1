$cd ~/campuslabsChromeExtention/data-scraper
$poetry install
$poetry run python3 scraper.py
$git add .
$temp=$(date)
$git commit -m "Auto update data at $temp"
$git push origin main:daily-updates
