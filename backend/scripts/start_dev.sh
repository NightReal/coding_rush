#!/usr/bin/env bash


python3 manage.py collectstatic --no-input
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser --no-input
python3 manage.py import_codes
python3 manage.py runserver 0.0.0.0:8000
