//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const mongoose = require('mongoose');

const path = require('path');

//global variables
const app = express();
app.use(bodyParser.urlencoded( { extended:false } ));

//setup the path to public folders and views
app.set('views', path.join(__dirname, 'views')); //relative path

//setup path for css, js etc
app.use(express.static(__dirname+'/public'));

//define view engine
app.set('view engine', 'ejs');

//setup db
mongoose.connect('mongodb://localhost:27017/gainen',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//set up session
app.use(session({
    secret: 'bfasdfbsaifdblsadsadfsbdfbuysfbasdfsf',
    resave: false,
    saveUninitialized: true
}));

//setup model for users
const User = mongoose.model('User', {
    username: String,
    password: String
});

//home page
// app.get('/', function(req, res){
//     res.send('Hello world!');
// });

app.get('/', function(req, res){
    res.render('home');
});

app.post('/', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    User.findOne({username: username, password: password}).exec(function(err, user){
            console.log(err);

            req.session.username = user.username;
            req.session.userLoggedIn = true;
            res.redirect('/userprofile');
        });
});

app.get('/userprofile', function(req, res){
    res.render('userprofile');
});

//listen to port
app.listen(8080);
console.log(`server is running on port 8080`);