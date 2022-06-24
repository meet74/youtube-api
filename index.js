//imports
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const db_url = require('./src/database');
const cors=require("cors");



const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 
 

//Middlewares
app.use(bodyParser.json());
app.use(cors(corsOptions)) ;

//creating server
const server = require('http').createServer(app);

//intializing Database
const dbConnection = mongoose
.createConnection(db_url)

//Init gfs
let gfs;


//adding one time listener
dbConnection.once('open', () => {
  
    gfs = Grid(dbConnection.db,mongoose.mongo);
    gfs.collection('uploads');
})


//creating storage

const storage = new GridFsStorage({
    url:db_url,
    db:dbConnection,
    file:(req,file) => {
        console.log("shreehari");
        return new Promise((res,rej) => {
            crypto.randomBytes(16,(err,buf) => {
                console.log(file);
                if (err) {
                    return rej(err);
                }
                const fileName = buf.toString('hex')+path.extname(file.orignalname);
                const fileInfo = {
                    filename:fileName,
                    bucketName:"uploads"
                };
                res(fileInfo)
            })
        })
    }
})

//creating multer
const uploads = multer({storage});

app.post('/uploadvideo',uploads.single('file'),(req,res) => {
    console.log(req.file);
    res.send('File uploaded');
})

//@Router Get request
app.get('/',(req,res) => {
    res.send('Shreehari')
})

app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }
  
      // Files exist
      return res.json(files);
    });
  });



//starting server
server.listen(5000,()=>console.log('server is listening on 5000'))