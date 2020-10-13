const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// LOAD USER MODEL
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// LOGIN PAGE
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// REGISTER PAGE
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// REGISTER
router.post('/register', (req, res) => {
    const { first_name, last_name, email, password, password2 } = req.body;
    let errors = [];

    if (!first_name || !last_name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            first_name,
            last_name,
            email,
            password,
            password2
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    first_name,
                    last_name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    username: `${first_name} ${last_name}`,
                    first_name,
                    last_name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// LOGIN
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// LOGOUT
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

router.post('/signin', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email: email }).exec()
        if (user != null) {
            bcrypt.compare(password, user.password).then(function (result) {
                console.log(result)
                if (result) {
                    res.status(200).json(user)
                }
                else {
                    res.status(400).json({ message: "wrong password" })
                }
            });
        }else{
            res.status(400).json({ message: "no email" })
        }
    } catch (error) {
        res.status(400).json({ message: error })
    }
})


router.get('/alluser', async function (req, res) {
    // const email = req.body.email;
    // const password = req.body.password;
    console.log("user", req.body)
    try {
        const user = await User.find()
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ message: error })
    }
})


router.get('/signin', (req, res) => {
    res.send("hello")
})

module.exports = router;