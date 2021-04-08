//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');

const mongoose = require('mongoose');

const path = require('path');

//global variables
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

//setup the path to public folders and views
app.set('views', path.join(__dirname, 'views')); //relative path

//setup path for css, js etc
app.use(express.static(__dirname + '/public'));

//define view engine
app.set('view engine', 'ejs');

//setup db
mongoose.connect('mongodb+srv://abhishek088:gnihtoN@123@cluster0.loi55.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//mongodb+srv://abhishek088:gnihtoN@123@cluster0.loi55.mongodb.net/test
//mongodb://localhost:27017/gainen
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
    emailId: String,
    isPostOnPublic: Boolean,
    ideaDate: Date,
    likesCount: Number,
    adminLikeName: Array
});

//for reference
// app.get('/', function(req, res){
//     res.send('Hello world!');
// });

//home page get and post
app.get('/', function (req, res) {
    res.render('home');
});

app.post('/', function (req, res) {
    res.render('home');
});

//login page get and post
app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (username === "abhishekAdmin" || username === "steAdmin" || username === "mereeshAdmin") {
        User.findOne({ username: username, password: password }).exec(function (err, user) {
            console.log(err);

            if (user) {
                req.session.username = user.username;
                req.session.userLoggedIn = true;
                res.redirect('/adminprofile');
            }
            else {
                res.render('login', {
                    error: 'Incorrect username or password'
                });
            }

        });
    }
    else if (username !== "abhishekAdmin" || username !== "steAdmin" || username !== "mereeshAdmin") {
        User.findOne({ username: username, password: password }).exec(function (err, user) {
            console.log(err);

            if (user) {
                req.session.username = user.username;
                req.session.userLoggedIn = true;
                res.redirect('/userprofile');
            }
            else {
                res.render('login', {
                    error: 'Incorrect username or password'
                });
            }
        });
    }
});

//user profile get and post
app.get('/userprofile', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            Idea.find({ username: req.session.username }).exec(function (err, ideas) {
                console.log(err);
                res.render('userprofile', {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailId: user.emailId,
                    phone: user.phone,
                    profilePicName: user.profilePicName,
                    ideas: ideas
                });
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

app.post('/userprofile', function (req, res) {
    res.render('userprofile');
}); //post method not needed till edit action is created

//logout get and post
app.get('/logout', function (req, res) {
    req.session.username = '';
    req.session.userLoggedIn = false;
    User.findOne({ username: req.session.username }).exec(function (err, user) {
        console.log(err)
        res.render('login', {
            error: 'Logout successful'
        });
    });
});

app.post('/logout', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (username === "abhishekAdmin" || username === "steAdmin" || username === "mereeshAdmin") {
        User.findOne({ username: username, password: password }).exec(function (err, user) {
            console.log(err);

            if (user) {
                req.session.username = user.username;
                req.session.userLoggedIn = true;
                res.redirect('/adminprofile');
            }
            else {
                res.render('login', {
                    error: 'Incorrect username or password'
                });
            }

        });
    }
    else if (username !== "abhishekAdmin" || username !== "steAdmin" || username !== "mereeshAdmin") {
        User.findOne({ username: username, password: password }).exec(function (err, user) {
            console.log(err);

            if (user) {
                req.session.username = user.username;
                req.session.userLoggedIn = true;
                res.redirect('/userprofile');
            }
            else {
                res.render('login', {
                    error: 'Incorrect username or password'
                });
            }

        });
    }
});

//register get and post
app.get('/register', function (req, res) {
    res.render('register');
});

app.post('/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var emailId = req.body.emailId;
    var phone = req.body.phone;

    //need to figure out how to make profile pic name set to a string
    var profilePicName = req.files.profilePic.name;
    var profilePic = req.files.profilePic;

    var profilePicPath = 'public/profile_pics/' + profilePicName; // create local storage path
    profilePic.mv(profilePicPath, function (err) { // move image to local folder
        console.log(err);
    });

    User.findOne({ username: username }).exec(function (err, user) {
        console.log(err);

        if (user) {
            res.render('register', {
                error: 'Username already exists. Please use a different username'
            });
        }
        else {
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
            newUser.save().then(function () {
                console.log('New User REGISTERED');
            });

            res.redirect('/userprofile');
        }
    });
});

//post idea get  and post
app.get('/postIdea', function (req, res) {
    if (!req.session.userLoggedIn)
        res.redirect('/login');
    else
        res.render('postIdea');
});

app.post('/postIdea', function (req, res) {
    var title = req.body.title;
    var idea = req.body.idea;
    var isPublic = req.body.isPublic;
    var ideaDate = Date.now();

    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)

            if (isPublic == "public")
                var isPostOnPublic = true;
            else
                var isPostOnPublic = false;

            var ideaData = {
                title: title,
                idea: idea,
                username: user.username,
                emailId: user.emailId,
                isPostOnPublic: isPostOnPublic,
                ideaDate: ideaDate
            }

            //store user
            var newIdea = new Idea(ideaData);

            //save user
            newIdea.save().then(function () {
                console.log('new idea saved');
            });

            //res.render('postIdea', ideaData);
            res.redirect('/publicIdea');
        });
    }
    // else{
    //     res.redirect('/login');
    // }
});

//all ideas get and post
app.get('/publicIdea', function (req, res) {
    Idea.find({}).exec(function (err, ideas) {
        console.log(err);

        res.render('publicIdea', { ideas: ideas });
    });
});

app.post('/publicIdea', function (req, res) {
    //dosomething
});


//edit profile get and post
app.get('/editProfile', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)
            res.render('editProfile', {
                username: user.username,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

app.post('/editProfile', function (req, res) {
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var emailId = req.body.emailId;
    var phone = req.body.phone;
    var profilePicName = req.files.profilePic.name;
    var profilePic = req.files.profilePic;

    // if (profilePicName == null)
    //     profilePicName = "joinExplanation2";
    // else   
    // var profilePicName = req.files.profilePic.name

    var profilePicPath = 'public/profile_pics/' + profilePicName; // create local storage path
    profilePic.mv(profilePicPath, function (err) { // move image to local folder
        console.log(err);
    });

    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)
            user.password = password;
            user.firstName = firstName;
            user.lastName = lastName;
            user.emailId = emailId;
            user.phone = phone;
            user.profilePicName = profilePicName;
            user.save();

            if (req.session.username === "abhishekAdmin" || req.session.username === "steAdmin" || req.session.username === "mereeshAdmin")
                res.redirect('adminprofile')
            else
                res.redirect('userprofile');
        });

    }
    else {
        res.redirect('/login');
    }
});

//delete profile get and post
app.get('/deleteProfile', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)
            res.render('deleteProfile', {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else {
        res.redirect('/login');
    }
});
app.post('/deleteProfile', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOneAndDelete({ username: req.session.username }).exec(function () {

            res.redirect('/');
        });
    }
});


app.get('/deleteIdea/:id', function (req, res) {
    if (req.session.userLoggedIn) {
        var id = req.params.id;
        console.log(id);
        Idea.findOne({ _id: id }).exec(function (err, idea) {
            console.log(err)
            res.render('deleteIdea', {
                title: idea.title,
                idea: idea.idea,
                ideaDate: idea.ideaDate,
                username: idea.username
            });
        });
    }
    else {
        res.redirect('/login');
    }
});
app.post('/deleteIdea/:id', function(req, res) {
    if(req.session.userLoggedIn) {
        var id = req.params.id;
        console.log(id);
        Idea.findOneAndDelete({ _id: id }).exec(function() {
            res.redirect('/userprofile');
        });
    }
});

app.get('/editIdea/:id', function (req, res) {
    if (req.session.userLoggedIn) {
        var id = req.params.id;
        console.log(id);
        Idea.findOne({ _id: id }).exec(function (err, idea) {
            console.log(err)
            res.render('editIdea', {
                title: idea.title,
                idea: idea.idea,
                isPostOnPublic: idea.isPostOnPublic
            });
        });
    }
    else {
        res.redirect('/login');
    }
});
app.post('/editIdea/:id', function(req, res) {
    if(req.session.userLoggedIn) {
        var id = req.params.id;
        var title = req.body.title;
        var ideaEdit = req.body.idea;
        var isPublic = req.body.isPublic;
        console.log(id);
        Idea.findOne({ _id: id }).exec(function(err, idea) {
            if (isPublic == "public")
                var isPostOnPublic = true;
            else{
                var isPostOnPublic = false;
            }
               
            idea.title = title;
            idea.idea = ideaEdit;
            idea.isPostOnPublic = isPostOnPublic;
            idea.save();

            res.redirect('/userprofile');
        });
    }
});

//admin module---------------------------------------------------------------------------------------

//user profile get and post
app.get('/adminprofile', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err);
            res.render('adminprofile', {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

app.post('/adminprofile', function (req, res) {
    res.render('adminprofile');
}); //post method not needed till edit action is created

//private ideas get and post
app.get('/privateIdea', function (req, res) {
    if (req.session.userLoggedIn) {
        Idea.find({}).exec(function (err, ideas) {
            console.log(err)

            res.render('privateIdea', { ideas: ideas });
        });
    }
    else
        res.redirect('/login');
});

app.post('/privateIdea', function (req, res) {
    //dosomething
});

//admin public idea get and post
app.get('/adminPublicIdea', function (req, res) {
    if (req.session.userLoggedIn) {
        Idea.find({}).exec(function (err, ideas) {
            console.log(err);

            res.render('adminPublicIdea', {
                ideas: ideas,
                adminName: req.session.username
            });
        });
    }
    else
        res.redirect('/login');
});

app.post('/adminPublicIdea', function (req, res) {
    //dosomething
});

//like post method
app.post('/posts/:id/act', (req, res, next) => {
    if (req.session.userLoggedIn) {
        const action = req.body.action;
        // const counter = action === "Like" ? 1 : -1;
        if (action === "Like") {
            Idea.findByIdAndUpdate({ _id: req.params.id }, { $inc: { likesCount: 1 } }, {}, (err, numberAffected) => {
                Idea.findOne({ _id: req.params.id }).exec(function (err, idea) {
                    idea.adminLikeName.push(req.session.username);
                    idea.save();

                });
                res.send('');
            });
        }
        if (action === "Unlike") {
            Idea.findByIdAndUpdate({ _id: req.params.id }, { $inc: { likesCount: -1 } }, {}, (err, numberAffected) => {
                Idea.findOne({ _id: req.params.id }).exec(function (err, idea) {
                    const index = idea.adminLikeName.indexOf(req.session.username);
                    if (index > -1) {
                        idea.adminLikeName.splice(index, 1);
                    }
                    idea.save();
                });
                res.send('');
            });
        }

    }
});

//admin edit profile get and post
app.get('/editProfileAdmin', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)
            res.render('editProfileAdmin', {
                username: user.username,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else {
        res.redirect('/login');
    }
});

app.post('/editProfileAdmin', function (req, res) {
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var emailId = req.body.emailId;
    var phone = req.body.phone;
    var profilePicName = req.files.profilePic.name;
    var profilePic = req.files.profilePic;

    // if (profilePicName == null)
    //     profilePicName = "joinExplanation2";
    // else   
    // var profilePicName = req.files.profilePic.name

    var profilePicPath = 'public/profile_pics/' + profilePicName; // create local storage path
    profilePic.mv(profilePicPath, function (err) { // move image to local folder
        console.log(err);
    });

    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)
            user.password = password;
            user.firstName = firstName;
            user.lastName = lastName;
            user.emailId = emailId;
            user.phone = phone;
            user.profilePicName = profilePicName;
            user.save();

            if (req.session.username === "abhishekAdmin" || req.session.username === "steAdmin" || req.session.username === "mereeshAdmin")
                res.redirect('adminprofile')
            else
                res.redirect('userprofile');
        });

    }
    else {
        res.redirect('/login');
    }
});

//admin delete profile get and post
app.get('/deleteProfileAdmin', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOne({ username: req.session.username }).exec(function (err, user) {
            console.log(err)
            res.render('deleteProfileAdmin', {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                phone: user.phone,
                profilePicName: user.profilePicName
            });
        });
    }
    else {
        res.redirect('/login');
    }
});
app.post('/deleteProfileAdmin', function (req, res) {
    if (req.session.userLoggedIn) {
        User.findOneAndDelete({ username: req.session.username }).exec(function () {

            res.redirect('/');
        });
    }
});

app.get('/deleteIdeaAdmin/:id', function (req, res) {
    if (req.session.userLoggedIn) {
        var id = req.params.id;
        console.log(id);
        Idea.findOne({ _id: id }).exec(function (err, idea) {
            console.log(err)
            res.render('deleteIdeaAdmin', {
                title: idea.title,
                idea: idea.idea,
                ideaDate: idea.ideaDate,
                username: idea.username
            });
        });
    }
    else {
        res.redirect('/login');
    }
});
app.post('/deleteIdeaAdmin/:id', function(req, res) {
    if(req.session.userLoggedIn) {
        var id = req.params.id;
        console.log(id);
        Idea.findOneAndDelete({ _id: id }).exec(function() {
            res.redirect('/adminprofile');
        });
    }
});

//shared------------------------------------------------------------------------------------------
app.get('/userLoggedInHome', function (req, res) {
    if (req.session.userLoggedIn) {
        res.render('userLoggedInHome');
    }
});

app.get('/adminLoggedInHome', function (req, res) {
    if (req.session.userLoggedIn) {
        res.render('adminLoggedInHome');
    }
});

app.get('/explore', function (req, res) {
    Idea.find({}).exec(function (err, ideas) {
        console.log(err)

        res.render('explore', { ideas: ideas });
    });
});

app.get('/userLoggedInExplore', function (req, res) {
    if (req.session.userLoggedIn) {
        Idea.find({}).exec(function (err, ideas) {
            console.log(err)
            res.render('userLoggedInExplore', { ideas: ideas });
        });
    }
});

app.get('/adminLoggedInExplore', function (req, res) {
    if (req.session.userLoggedIn) {
        Idea.find({}).exec(function (err, ideas) {
            console.log(err)
            res.render('adminLoggedInExplore', { ideas: ideas });
        });
    }
});

//listen to port
app.listen(process.env.PORT, '0.0.0.0');
//app.listen(8000);
console.log(`server is running on port 8000`);