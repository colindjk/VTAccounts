#!/bin/bash

#./node_modules/.bin/webpack --watch webpack.config.js &
exec ./manage.py runserver 0.0.0.0:8000
