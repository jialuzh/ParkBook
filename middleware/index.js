var middlewareObj = {};
var Park = require("../models/park");
var Comment = require("../models/comment");

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

middlewareObj.checkParkOwnership = function (req, res, next) {
    if(req.isAuthenticated()) {
        Park.findById(req.params.id, function(err, foundPark) {
            if (err) {
                req.flash("error", "Park not found");
                res.redirect("back");
            } else {
                // does user own campgroud
                if (foundPark.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                req.flash("error", "Park not found");
                res.redirect("back");
            } else {
                // does user own park
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

module.exports = middlewareObj;