var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//index route
router.get("/campgrounds", function(req, res) {
    Campground.find({}, function (err, campgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: campgrounds});
        }
    });
});





//create route
router.post("/campgrounds", middleware.isLoggedIn, function (req, res) {
    var author = {id: req.user._id, username: req.user.username};
    console.log(req.body.campground);
    Campground.create(req.body.campground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            newlyCreated.author = author;
            newlyCreated.save();
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//new route for new items
router.get("/campgrounds/new", middleware.isLoggedIn,function(req, res) {
    res.render("campgrounds/new"); 
    
});


//SHOW - shows more info about the camp ground.
router.get("/campgrounds/:id", function(req, res) {
    //find the campground we want to show
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    //render the page
    
});


//EDIT
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            req.flash("error", "Campground not found");
            res.redirect("/camgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

//UPDATE

router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, undatedCampground) {
        if (err) {
            req.flash("error", "Campground not found");
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + undatedCampground.id);
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
        }
        req.flash("success", "Campground successfully deleted");
        res.redirect("/campgrounds");
    }); 
});


module.exports = router;