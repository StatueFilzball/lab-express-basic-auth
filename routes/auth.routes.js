const bcrypt = require("bcrypt")
const express = require('express');
const router = express.Router();
const saltRounds = 10;

const User = require('../models/User.model');

const { isLoggedIn, isLoggedOut} = require('../middleware/route-guard');


router.get('/signup', (req, res) => {
    res.render('auth/signup')
})

router.post('/signup', (req, res) =>{
    console.log(req.body)

const { username, password } = req.body;

bcrypt.hash(password, saltRounds) // Generate a hash password  
    .then(hash => {
        return User.create({ username, password: hash}) // // Create a User in the DB, add the Hash password to the new user
    })
    .then(newUser => res.redirect(`/auth/profile/${newUser.username}`))// Redirect the user to their profile
    .catch(err => console.log(err))

})


// Profile route
router.get('/profile/:username', (req, res) => {
    const { username } = req.params;
       
    User.findOne({ username })
        .then(foundUser => res.render('auth/profile', foundUser))
        .catch(err => console.log(err))
    })

// Login

router.get('/login', (req, res)=>{
    console.log('SESSION =====> ', req.session);
    res.render('auth/login')
})

router.post('/login', (req, res) => {
    console.log('SESSION =====> ', req.session);
    const { username, password } = req.body;
    
    if (username === "" || password === "") {
        res.render("auth/login", {
            errorMessage: "Please enter both email and password to login."
        })
        return
    }


    User.findOne({ username })
        .then(foundUser => {
            console.log("User", foundUser)
            if (!foundUser){
                res.render("auth/login", {errorMessage: "Username cant be found. Think hard and try again"})
                return
            } else if (bcrypt.compare(password, foundUser.password)) {
                const {username, password} = foundUser
                req.session.currentUser = {username}
                res.redirect(`/auth/profile/${username}`)
            } else {
                res.render("auth/login", {errorMessage: "Incorrect passwort"})
            }
})
.catch(err => console.log(err))
})

// main route
router.get("/main", isLoggedIn, (req, res) => {
        console.log('currentUser:', req.session.currentUser);

    const { currentUser } = req.session;
    currentUser.loggedIn = true;
    res.render("auth/main")
  })

// private route
router.get("/private", isLoggedIn, (req, res) => {
    console.log('currentUser:', req.session.currentUser);

const { currentUser } = req.session;
currentUser.loggedIn = true;
res.render("auth/private")
})

router.post('/logout', isLoggedIn, (req, res) => {
    req.session.destroy(err => {
      if (err) console.log(err);
      res.redirect('/');
    });
  });

module.exports = router;

