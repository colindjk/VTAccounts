#!/bin/bash

virtualenv -p python3 .env
source ./.env/bin/activate
cd backend

# Use postgres -> setup postgres on machine. 
# Create username and password for vtaccounts
# Include authentication information on virtualenv `activate` script.
./manage.py makemigrations
./manage.py migrate

# Populate accounts

