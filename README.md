# hashMap
Small hashMap API service execise with multiple users, multiple hash maps and a basic logging system.

Users authenticate with SHA256 passwords, db is simulated using ```.json``` files (to persist state between reboots).

File ```users.json``` already contains a bunch of imaginary users for testing purposes.

(I was going to provide admin-like functions to show user logs, but I only had 45 mins on the train to do it)

## 📒 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Docs](#docs)
- [Examples](#examples)

## Installation

```shell
git clone https://github.com/rambonette/hashMap.git
cd hashMap
npm install
```

## Usage

run server with:
```shell
node app.js
```
from another terminal:
```shell
curl -X POST localhost:20136/hashMap -H 'Content-Type: application/json' -d '{"username":"<username>","pwd":"<password>", "action":"<action_you_wish_to_accompish>, "tableName":"<table_name>", "key":"<table_key>", "value":"<table_value>"}'
```

## Docs

List of available "actions":

- "createNewTable": creates new table; requires a valid "tableName".
- "insertInTable": inserts value in table; requires "tableName" and "key" ("value" can be undefined).
- "getFromTable": retrieves value from table; requires "tableName" and "key".
- "removeFromTable": removes key-value pair from table; requires "tableName" and "key".
- "deleteTable": deletes table; requires a valid "tableName".

## Examples

#1:
```shell
curl -X POST localhost:20136/hashMap -H 'Content-Type: application/json' -d '{"username":"longJohnSilver","pwd":"2ac9a6746aca543af8dff39894cfe8173afba21eb01c6fae33d52947222855ef", "action":"createNewTable", "tableName":"test1"}'
```
#2:
```shell
curl -X POST localhost:20136/hashMap -H 'Content-Type: application/json' -d '{"username":"longJohnSilver","pwd":"2ac9a6746aca543af8dff39894cfe8173afba21eb01c6fae33d52947222855ef", "action":"insertInTable", "tableName":"test1", "key":"test2", "value":"test3"}'
```
#3:
```shell
curl -X POST localhost:20136/hashMap -H 'Content-Type: application/json' -d '{"username":"longJohnSilver","pwd":"2ac9a6746aca543af8dff39894cfe8173afba21eb01c6fae33d52947222855ef", "action":"getFromTable", "tableName":"test1", "key":"test2"}'
```
#4:
```shell
curl -X POST localhost:20136/hashMap -H 'Content-Type: application/json' -d '{"username":"longJohnSilver","pwd":"2ac9a6746aca543af8dff39894cfe8173afba21eb01c6fae33d52947222855ef", "action":"removeFromTable", "tableName":"test1", "key":"test2"}'
```
#5:
```shell
curl -X POST localhost:20136/hashMap -H 'Content-Type: application/json' -d '{"username":"longJohnSilver","pwd":"2ac9a6746aca543af8dff39894cfe8173afba21eb01c6fae33d52947222855ef", "action":"deleteTable", "tableName":"test1"}'
```











