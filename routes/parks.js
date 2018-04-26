var express = require("express");
var router = express.Router();
var Park = require("../models/park");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
 
var geocoder = NodeGeocoder(options);

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
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        Park.create(req.body.park, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                newlyCreated.author = author;
                newlyCreated.lat = lat;
                newlyCreated.lng = lng;
                newlyCreated.location = location;
                newlyCreated.save();
                console.log(newlyCreated);
                res.redirect("/parks");
            }
        });
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
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'err.message');
          return res.redirect('back');
        }
        req.body.park.lat = data[0].latitude;
        req.body.park.lng = data[0].longitude;
        req.body.park.location = data[0].formattedAddress;
        Park.findByIdAndUpdate(req.params.id, req.body.park, function (err, updatedPark) {
            if (err) {
                req.flash("error", "err.message");
                console.log(err);
            } else {
                res.redirect("/parks/" + updatedPark.id);
            }
        });
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