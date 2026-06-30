# Start GIVIT Django on port 8001 (keeps clear of other apps on 8000).
Set-Location $PSScriptRoot
& .\venv\Scripts\Activate.ps1
python manage.py runserver 8001
