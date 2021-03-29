## The web service for scheduleStuff

Hi John, here is a link to the repo

web service - https://github.com/LachlanStephan/scheduleStuffBackend

---

IF YOU CLONE THE CLIENT TO TEST

- Clone the "updates" branch, master is many commits behind and will not work with this version of the web service

---

# Database conn

create folder "config at root level", add .env file to config folder

Make a DB and upload the /sql-dump/\_DB_scheduleStuff.sql file

Copy and paste the following into env => Make a user and fill in the following details

DB_HOST=
DB_USER=
DB_PASS=
DB_DATABASE=
DB_PORT=

## Get started

- Git clone
- npm i
- node server.js

## Test web service

This web service is being tested via jestjs. To run tests enter the following command

- npm test

Please note - Not all test functions have been written

For additional info on jestjs - https://jestjs.io/

## See client here

https://github.com/LachlanStephan/scheduleStuff

## Proj desc

This project is to serve scheduleStuff -> it is currently serving a nextjs client and connected to a mysql database

## Data dictionary

To be added

## Crud matrix

To be added

## MYSQL export

See /sql-dump
