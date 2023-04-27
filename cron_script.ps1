$cd ~/campuslabsChromeExtention/data-scraper
$poetry install
$poetry run python3 scraper.py
$git add .
<<<<<<< HEAD
$git commit -m "Update data automatically"
$git push origin main:daily-updates
=======
$temp=$(date)
$git commit -m "Auto update data at $temp"
$git push origin main:daily-updates
>>>>>>> origin/main
