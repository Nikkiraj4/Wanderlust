const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require('../utils/cloudConfig.js'); // Ensure this path is correct!
const upload = multer({ storage });

// INDEX & CREATE (Merged)
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single("listing[image]"), // Multer must come before validation
        validateListing, 
        wrapAsync(listingController.createListing)
    );

// NEW FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW, UPDATE, & DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single("listing[image]"), // Add this here too for editing!
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// EDIT FORM
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;