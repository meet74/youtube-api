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
var ejs = require('ejs');
const process = require('process');

var PORT = process.env.PORT || 5000;



const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 
 

//Middlewares
app.use(bodyParser.json());
app.use(cors(corsOptions)) ;
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


//creating server
const server = require('http').createServer(app);

//intializing Database
const dbConnection = mongoose
.createConnection(db_url)

//Init gfs
let gfs,gridfsBucket;


//adding one time listener
dbConnection.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
        bucketName: 'uploads'
      });
    gfs = Grid(dbConnection.db,mongoose.mongo);
    gfs.collection('uploads');
})


//creating storage

const storage = new GridFsStorage({
    url:db_url,
    db:dbConnection,
    file:(req,file) => {
        console.log(file);
        return new Promise((res,rej) => {
            crypto.randomBytes(16,(err,buf) => {    
               
                if (err) {
                    return rej(err);
                }
                
                const fileName = buf.toString('hex')+path.extname(file.originalname);
                console.log(fileName);
                const fileInfo = {
                    filename:fileName,
                    bucketName:"uploads"
                };
                console.log('s',fileInfo);
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
    gfs.files.find().toArray((err, files) => {
        // Check if files
        console.log(files);
        if (!files || files.length === 0) {
          res.render('index', { files: false });
        } else {
          files.map(file => {
              console.log(file);
            if (
              file.contentType === 'video/mp4' ||
              file.contentType === 'video/mp4'
            ) {
              file.isVideo = true;
            } else {
              file.isVideo = false;
            }
          });
          res.render('index', { files: files });
        }
      });
})

app.get('/video/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'video/mp4' || file.contentType === 'video/mp4') {
        // Read output to browser
        const readstream = gridfsBucket.openDownloadStream(file._id);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not a video'
        });
      }
    });
  });
  

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
server.listen(PORT,()=>console.log('server is listening on 5000'))