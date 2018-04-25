var express = require("express");
var router = express.Router();
var Park = require("../models/park");
var Comment = require("../models/comment");
var middleware = require("../middleware");


router.get("/parks/:id/comments/new", middleware.isLoggedIn, function(req, res) {
    Park.findById(req.params.id, function(err, foundPark) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {park: foundPark});
        }
    });
    
});


router.post("/parks/:id/comments", middleware.isLoggedIn, function(req, res) {
    //look up park by ID
    Park.findById(req.params.id, function(err, park) {
        if (err) {
            console.log(err);
            res.redirect("/parks");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // console.log(comment);
                    comment.save();
                    park.comments.push(comment);
                    park.save();
                    req.flash("success", "Comment added successfully");
                    res.redirect("/parks/" + park._id);
                }
            });
        }
    });
    
});

//EDIT
router.get("/parks/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            req.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            res.render("comments/edit", {park_id: req.params.id, comment: foundComment});
        }
    });
});

//UPDATE

router.put("/parks/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, undatedComment) {
        if (err) {
            // console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/parks/" + req.params.id);
        }
    });
});

//DESTROY ROUTE
router.delete("/parks/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            // console.log(err);
            res.redirect("back");
        }
        req.flash("success", "Comment successfully deleted");
        res.redirect("/parks/" + req.params.id);
    }); 
});

module.exports = router;