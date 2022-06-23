const express = require('express');
const app = express();

const server = require('http').createServer(app);

const initializeDatabase = require('./src/database');


//intializing Database
initializeDatabase();

app.get('/',(req,res) => {
    res.send('Shreehari')
})



server.listen(5000,()=>console.log('server is listening on 5000'))