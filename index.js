//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const mongoose = require('mongoose');

const path = require('path');

//global variables
const app = express();
app.use(bodyParser.urlencoded( { extended:false } ));
app.use(fileUpload());

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
    password: String,
    firstName: String,
    lastName: String,
    emailId: String,
    phone: String,
    profilePicName: String
});

const Idea = mongoose.model('Idea', {
    title: String,
    idea: String,
    username: String,
    isPostOnPublic: Boolean
});

//for refernce
// app.get('/', function(req, res){
//     res.send('Hello world!');
// });

//home page get and post
app.get('/', function(req, res){
    res.render('home');
});

app.post('/', function(req, res){
    res.render('home');
});

//login page get and post
app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    User.findOne({username: username, password: password}).exec(function(err, user){
            console.log(err);

            if(user){
                req.session.username = user.username;
                req.session.userLoggedIn = true;
                res.redirect('/userprofile');
            }
            else{
                res.render('login', {
                    error: 'Incorrect username or password'
                });
            }
            
        });
});

//user profile get and post
app.get('/userprofile', function(req, res){
    if(req.session.userLoggedIn){
        User.findOne({username: req.session.username}).exec(function(err, user){
            console.log(err)
            res.render('userprofile', {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.firstName,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else{
        res.redirect('/login');
    } 
});

app.post('/userprofile', function(req, res){
    res.render('userprofile');
}); //post method not needed till edit action is created

//logout get
app.get('/logout', function(req, res) {
    req.session.username = ''; 
    req.session.userLoggedIn = false; 
    User.findOne({username: req.session.username}).exec(function(err, user){
        console.log(err)
        res.render('login', {
            error: 'Logout successful'
        });
    });
});

app.post('/logout', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    User.findOne({username: username, password: password}).exec(function(err, user){
            console.log(err);

            if(user){
                req.session.username = user.username;
                req.session.userLoggedIn = true;
                res.redirect('/userprofile');
            }
            else{
                res.render('login', {
                    error: 'Incorrect username or password'
                });
            }
            
        });
});

//register get and post
app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var emailId = req.body.emailId;
    var phone = req.body.phone;
    var profilePicName = req.files.profilePic.name;
    var profilePic = req.files.profilePic;

    var profilePicPath = 'public/profile_pics/' + profilePicName; // create local storage path
    profilePic.mv(profilePicPath, function(err) { // move image to local folder
        console.log(err);
    });

    User.findOne({username: username}).exec(function(err, user){
        console.log(err);
        
        if(user){
            res.render('register', {
                error: 'Username already exists. Please use a different username'
            });
        }
        else{
            var registerData = {
                username: username,
                password: password,
                firstName: firstName,
                lastName: lastName,
                emailId: emailId,
                phone: phone,
                profilePicName: profilePicName
            }
        
            //store user
            var newUser = new User(registerData);
        
            //save user
            newUser.save().then(function(){
                console.log('new user saved');
            });
        
            res.render('register', registerData);
        }
    });
    
});

//post idea get  and post
app.get('/postIdea', function(req, res){
    if(!req.session.userLoggedIn)
        res.redirect('/login');
    else
        res.render('postIdea');
});

app.post('/postIdea', function(req, res){
    var title = req.body.title;
    var idea = req.body.idea;
    var isPublic = req.body.isPublic;

    if(req.session.userLoggedIn){
        User.findOne({username: req.session.username}).exec(function(err, user){
            console.log(err)

            if(isPublic == "public")
                var isPostOnPublic = true;
            else
                var isPostOnPublic = false;

            var ideaData = {
                title: title,
                idea: idea,
                username: user.username,
                isPostOnPublic: isPostOnPublic
            }
        
            //store user
            var newIdea = new Idea(ideaData);
        
            //save user
            newIdea.save().then(function(){
                console.log('new idea saved');
            });
        
            res.render('postIdea', ideaData);
        });
    }
    // else{
    //     res.redirect('/login');
    // }
});

//all ideas get and post
app.get('/publicIdea', function(req, res){
    Idea.find({}).exec(function(err, ideas){
        console.log(err)

        res.render('publicIdea', {ideas: ideas});
    });
});

app.post('/publicIdea', function(req, res){
    //dosomething
});


//edit profile get and post
app.get('/editProfile', function(req, res){
    if(req.session.userLoggedIn){
        User.findOne({username: req.session.username}).exec(function(err, user){
            console.log(err)
            res.render('editProfile', {
                username: user.username,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.firstName,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else{
        res.redirect('/login');
    }
});

app.post('/editProfile', function(req, res){
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var emailId = req.body.emailId;
    var phone = req.body.phone;
    var profilePicName = req.files.profilePic.name;
    var profilePic = req.files.profilePic;

    var profilePicPath = 'public/profile_pics/' + profilePicName; // create local storage path
    profilePic.mv(profilePicPath, function(err) { // move image to local folder
        console.log(err);
    });

    if(req.session.userLoggedIn){
        User.findOne({username: req.session.username}).exec(function(err, user){
            console.log(err)
            user.password = password;
            user.firstName = firstName;
            user.lastName = lastName;
            user.emailId = emailId;
            user.phone = phone;
            user.profilePicName = profilePicName;
            user.save();  
 
            res.redirect('userprofile');
        });
        
    }
    else{
        res.redirect('/login');
    }
});

//delete profile get and post


//listen to port
app.listen(8000);
console.log(`server is running on port 8000`);