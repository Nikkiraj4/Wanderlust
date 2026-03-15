const Listing = require("../models/listing");

// Index - Show all listings
// Add the 'async' keyword here!
// GET - Index Route
module.exports.index = async (req, res) => {
    // 1. Extract 'guests' from the query along with search and dateRange
    const { category, search, dateRange, guests } = req.query;

    // 2. If ANY of the search bar filters are used, show Coming Soon
    if (
        (search && search.trim() !== "") || 
        (dateRange && dateRange !== "") || 
        guests
    ) {
        return res.render("listings/comingSoon.ejs", { search });
    }

    let query = {};
    if (category) {
        query.category = category;
    }

    let allListing = await Listing.find(query);
    res.render("listings/index.ejs", { allListing });
};

// Show - Display one specific listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id.trim())
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};
// Render New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Create - Save new listing to DB with Image Upload
module.exports.createListing = async (req, res, next) => {
    // 1. Geocoding with Nominatim (Free)
    const location = req.body.listing.location;
    const country = req.body.listing.country;

    const query = `${location}, ${country}`;
    console.log("Searching for:", query);
    const geoResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    {
        headers: {
            // This tells Nominatim who is calling their API. 
            // Use a fake email or project name.
            'User-Agent': 'Wanderlust-Project-Student-Learning-App'
        }
    }
);
    const geoData = await geoResponse.json();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: req.file.path, filename: req.file.filename };

    // 2. Save Coordinates (Default to [0,0] if not found)
    if (geoData.length > 0) {
        newListing.geometry = {
            type: "Point",
            coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)]
        };
    } else {
        newListing.geometry = { type: "Point", coordinates: [0, 0] };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// Render Edit Form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Transformation: Resize and blur the current image for the preview
    let originalImageUrl = listing.image.url;
    let previewUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    
    res.render("listings/edit.ejs", { listing, previewUrl });
};

// Update Listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Check if a new file was actually uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Delete Listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};