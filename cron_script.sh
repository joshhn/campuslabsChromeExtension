cd ~/Desktop/campuslabsChromeExtention/data-scraper
poetry install
poetry run python3 scraper.py
git add .
git commit -m "Update data automatically"
git push origin main:daily-updates
