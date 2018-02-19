#!/bin/bash

virtualenv -p python3 .env
source ./.env/bin/activate
cd backend
./manage.py makemigrations
./manage.py migrate

