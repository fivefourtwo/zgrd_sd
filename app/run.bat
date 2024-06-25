@echo off
set FLASK_APP=main.py
set FLASK_ENV=development
set FLASK_RUN_PORT=7860
flask run --host=0.0.0.0

