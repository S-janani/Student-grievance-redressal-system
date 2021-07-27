const express = require('express');//to get the express package 
const bodyParser = require('body-parser');//require body pareser packas
const mongoose = require('mongoose');//it is like above this the way when u require any packages
const path=require('path');
const fs=require('fs');
const ejsLint=require('ejs-lint');
const session=require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); 
const studentroute=require("./routes/Student");
const adminroute=require("./routes/admin");
const headroute=require("./routes/reshead");
const flash = require('connect-flash');
const multer = require('multer');
const helmet= require('helmet');
const compression= require('compression');
const morgan=require('morgan');
const app = express();// we get express for function 
const MONGODB_URI =
  `mongodb+srv://ramani:ragulramani@cluster0-1azzz.mongodb.net/sgc?retryWrites=true&w=majority`;//change by '' replce  `` dep

  console.log(process.env.NODE_ENV);
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'attachments');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'ckeditor')));
app.use('/attachments', express.static(path.join(__dirname, 'attachments')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('file')
);//name of we given in html and single for only accepting single file
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
 // res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.get("/",(req,res,next)=>
{
res.render('home');
});
app.use(studentroute);
app.use(adminroute);
app.use(headroute);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flags : 'a'}//add content in last when thau came
);
app.use(helmet());//it add some headers in network in dep security increases
app.use(compression());
app.use(flash());

app.use(morgan('combined',{stream : accessLogStream }));
mongoose//ithu mongoose oda function to connect the mongodb to port number
  .connect(MONGODB_URI)//atha linka use panna porom 
  .then(result => {
    console.log('connected!');
    app.listen(process.env.PORT || 3000);   
  })
  .catch(err => {
    console.log(err);
  });
  //app is your express okay listen is your function to which port number the serrver want to start

//itha file the server a nammba start panna poroom
//to run the server use command node this file name my file names is apps.js so node apps.js
