var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");

var parkRoutes = require("./routes/parks"),
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index");


var url = process.env.DATABASEURL || "mongodb://localhost/parkbook"
mongoose.connect(url);
// mongoose.connect("mongodb://jialuzh:webdev@ds257579.mlab.com:57579/yelpcamp");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
//seed the database
// seedDB();



//PASSPORT Configuration
app.use(require("express-session")({
    secret: "We can move to Seattle!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use(commentRoutes);
app.use(parkRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Parkbook server has started!!!");
});