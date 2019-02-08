#!/bin/bash

# [ ] - Create script to execute "populate_*" functions:
#     1. populate_accounts
#     2. populate_fringes & populate_indirect
source ./../.env/bin/activate

./manage.py populate_accounts
./manage.py populate_fringes
./manage.py populate_indirects

