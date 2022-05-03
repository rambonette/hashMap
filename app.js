const express = require('express'), bodyParser = require('body-parser');
const fs = require("fs");

var app = express();
app.use(bodyParser.json());
const port = 20136;

//load json "db"
var users = require("./users.json");
//console.log(users); //debug
var maps = require("./maps.json");
//console.log(maps); //debug
var logs = require("./logs.json");
//console.log(logs); //debug

class HashMap
{
    constructor(table, size)
    {
        if (!table) this.table = new Array(32); //small size for readability reasons
        else this.table = table;
        if (!size) this.size = 0;
        else this.size = size;
    }
  
    _hash(key) //pseudo hash is calulated using ascii codes, this gives some chance to have some fun with collisions
    {
        let hash = 0;
        for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
        return hash % this.table.length;
    }
  
    set(key, value)
    {
        const index = this._hash(key);
        if (this.table[index]) //kinda avoid collision
        {
            for (let i = 0; i < this.table[index].length; i++) 
            {
                if (this.table[index][i][0] === key) { this.table[index][i][1] = value; return; }
            }
            this.table[index].push([key, value]); 
        }
        else
        {
            this.table[index] = [];
            this.table[index].push([key, value]);
        }
        this.size++;
    }
  
    get(key)
    {
        const index = this._hash(key);
        if (this.table[index])
        {
            for (let i = 0; i < this.table.length; i++)
            {
                if (this.table[index][i] && this.table[index][i][0] === key) return this.table[index][i][1];
            }
        }
        return null;
    }
  
    remove(key)
    {
        const index = this._hash(key);
  
        if (this.table[index] && this.table[index].length)
        {
            for (let i = 0; i < this.table.length; i++)
            {
                if (this.table[index][i] && this.table[index][i][0] === key)
                {
                    this.table[index].splice(i, 1);
                    this.size--;
                    return true;
                }
            }
        }
        else return false;
    }
}

initApp();
function initApp()
{
    for (let map in maps)
    {
        if (maps[map].table && (maps[map].size != undefined || maps[map].size != null))
        {
            maps[map] = new HashMap(maps[map].table, maps[map].size);
        } //rebuild class from json input
    }
}

function saveToDb(tableName, data) //this shouldn't be done with files, but with a real db... i'm desperately tight on time
{
    return fs.writeFileSync(tableName+".json", JSON.stringify(data)); //at least is synchronous :'D
}

function checkForUser(req)
{
    if (!req.body.username || !req.body.pwd) return false;
    
    return users.some(user => user.username == req.body.username && user.pwd == req.body.pwd);
}

function checkParams(data, params)
{
    for (let param of params)
    {
        if (!data[param] || !data[param].length) return false;
    }
    return true;
}

function logAction(username, action)
{
    logs.push({ username: username, timestamp: new Date(), ...action });
    saveToDb("logs", logs);
}

app.post('/hashMap', function (req, res) 
{
    let msg;
    if (checkForUser(req))
    {
        if (req.body.action && req.body.action.length)
        {
            msg = doAction(req.body);
        }
    }
    else msg = { status: "ERROR: Invalid username or password!"};

    res.status(200).send(msg);
});

function doAction(data)
{
    let msg;
    switch(data.action)
    {
        case 'createNewTable':
            if (checkParams(data, ["tableName"]))
                msg = createNewTable(data);
            else
                msg = { status: "ERROR: Invalid tableName provided!" };
            break;
        case 'insertInTable':
            if (checkParams(data, ["tableName", "key"]))
                msg = insertInTable(data);
            else
                msg = { status: "ERROR: Invalid params!" };
            break;
        case 'getFromTable':
            if (checkParams(data, ["tableName", "key"]))
                msg = getFromTable(data);
            else
                msg = { status: "ERROR: Invalid params!" };
            break;
        case 'removeFromTable':
            if (checkParams(data, ["tableName", "key"]))
                msg = removeFromTable(data);
            else
                msg = { status: "ERROR: Invalid params!" };
            break;
        case 'deleteTable':
            if (checkParams(data, ["tableName"]))
            {
                if (maps[data.username+data.tableName])
                {
                    delete maps[data.username+data.tableName];
                    msg = { status: "DONE!" };
                }
                else
                    msg = { status: "ERROR: Table does not exist!" };

            }
            else
                msg = { status: "ERROR: Invalid params!" };
            break;
        default:
            msg = { status: "ERROR: no action found" };
            break;
    }
    return msg;
}

//create new table
function createNewTable(data)
{
    let username = data.username, tableName = data.tableName;
    if (!maps[username+tableName])
    {
        try 
        {
            maps[username+tableName] = new HashMap();
            saveToDb("maps", maps);
            logAction(username, { action: "createNewTable" });
            return { status: "DONE!" };
        }
        catch(e)
        {
            logAction(username, { error: e });
            return { status: "INTERNAL SERVER ERROR" };
        }
        
    }
    else return { status: "ERROR: table already exists!" };
}

//insert in table
function insertInTable(data)
{
    let username = data.username, tableName = data.tableName, key = data.key, value = data.value; 
    if (maps[username+tableName])
    {
        try
        {
            maps[username+tableName].set(key, value);
            saveToDb("maps", maps);
            logAction(username, { action: "insertInTable" });
            return { status: "DONE!" };
        }
        catch(e)
        {
            logAction(username, { error: e });
            return { status: "INTERNAL SERVER ERROR" };
        }
    }
    else return { status: "ERROR: table does not exists!" };
}

//get from table
function getFromTable(data)
{
    let username = data.username, tableName = data.tableName, key = data.key;
    if (maps[username+tableName])
    {
        //try
        //{
            let content = maps[username+tableName].get(key);
            logAction(username, "getFromTable");
            return { status: "DONE!", result: content };
        /*}
        catch(e)
        {
            logAction(username, { error: e });
            return { status: "INTERNAL SERVER ERROR" };
        }*/
    }
    else return { status: "ERROR: table does not exists!" };
}

//remove from table
function removeFromTable(data)
{
    let username = data.username, tableName = data.tableName, key = data.key;
    if (maps[username+tableName])
    {
        try
        {
            maps[username+tableName].remove(key);
            saveToDb("maps", maps);
            logAction(username, "removeFromTable");
            return { status: "DONE!" };
        }
        catch(e)
        {
            logAction(username, { error: e });
            return { status: "INTERNAL SERVER ERROR" };
        }
    }
    else msg = { status: "ERROR: table does not exists!" };
}

app.listen(port, () =>
{
    console.log("HashMap service at your service @port "+ port);
});
