if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var path = require('path');
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();




// PASSWORD CONFIG
require('./config/passport')(passport);

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(cors())
// EXPRESS BODY PASRSER

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

//EXPRESSION SESSION
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// PASSPORD MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

//CONNECTION FLASH
app.use(flash());

//GLOBAL VARS
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//IMPORT USER ROUTE
const userRoute = require('./routes/user')
app.use('/users', userRoute)

//IMPORT PROVINCE ROUTE
const provinceRoute = require('./routes/province')
app.use('/provinces', provinceRoute)

//IMPORT PLACE ROUTE
const placeRoute = require('./routes/place')
app.use('/places', placeRoute)

//IMPORT HOTEL ROUTE
const hotelRoute = require('./routes/hotel')
app.use('/hotels', hotelRoute)

//ROUTE
app.use('/backend', require('./routes/index'))

// DB CONNECTION
mongoose
    .connect(
        "mongodb+srv://Sambath:Ezg8n5uBUWhKjNzE@trip-adviser-db.p4ysx.mongodb.net/TRIP-ADVISER-DB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


 if (process.env.NODE_ENV === 'production') {
    // Static folder
    app.use(express.static(__dirname + '/public/'));

    // Handle SPA
    app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
 }
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on port ${PORT}`))