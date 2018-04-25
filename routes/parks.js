var express = require("express");
var router = express.Router();
var Park = require("../models/park");
var middleware = require("../middleware");

//index route
router.get("/parks", function(req, res) {
    Park.find({}, function (err, parks) {
        if (err) {
            console.log(err);
        } else {
            res.render("parks/index", {parks: parks});
        }
    });
});





//create route
router.post("/parks", middleware.isLoggedIn, function (req, res) {
    var author = {id: req.user._id, username: req.user.username};
    console.log(req.body.park);
    Park.create(req.body.park, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            newlyCreated.author = author;
            newlyCreated.save();
            console.log(newlyCreated);
            res.redirect("/parks");
        }
    });
});

//new route for new items
router.get("/parks/new", middleware.isLoggedIn,function(req, res) {
    res.render("parks/new"); 
    
});


//SHOW - shows more info about the camp ground.
router.get("/parks/:id", function(req, res) {
    //find the park we want to show
    Park.findById(req.params.id).populate("comments").exec(function (err, foundPark) {
        if (err) {
            console.log(err);
        } else {
            res.render("parks/show", {park: foundPark});
        }
    });
    //render the page
    
});


//EDIT
router.get("/parks/:id/edit", middleware.checkParkOwnership, function (req, res) {
    Park.findById(req.params.id, function(err, foundPark) {
        if (err) {
            req.flash("error", "Park not found");
            res.redirect("/parks");
        } else {
            res.render("parks/edit", {park: foundPark});
        }
    });
});

//UPDATE

router.put("/parks/:id", middleware.checkParkOwnership, function (req, res) {
    Park.findByIdAndUpdate(req.params.id, req.body.park, function (err, updatedPark) {
        if (err) {
            req.flash("error", "park not found");
            console.log(err);
        } else {
            res.redirect("/parks/" + updatedPark.id);
        }
    });
});

//DESTROY Park ROUTE
router.delete("/parks/:id", middleware.checkParkOwnership, function(req, res) {
    Park.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
        }
        req.flash("success", "Park successfully deleted");
        res.redirect("/parks");
    }); 
});


module.exports = router;