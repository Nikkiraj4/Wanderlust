if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const session = require("express-session"); 

// If the above still fails, some versions require this specific structure:
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models and Routers
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 1. DEFINE dbUrl FIRST (Critical!)
const dbUrl = process.env.ATLASDB_URL;

// 2. Create the Mongo Store using that dbUrl
const store = new MongoStore({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET || "mysupersecretcode",
    },
    touchAfter: 24 * 3600, // seconds
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// 3. Define Session Options
const sessionOptions = {
    store: store, 
    secret: process.env.SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// 4. Database Connection logic
main()
    .then(() => { console.log("connected to DB"); })
    .catch((err) => { console.log(err); });

async function main() {
    await mongoose.connect(dbUrl);
}

// 5. App Settings and Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', engine);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Use session ONCE here
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; 
    next();
});


app.get("/", (req, res) =>{
   res.redirect("/listings"); // <-- Add this
});


// Middleware to check if user is logged in

app.use("/listings", listingRouter);
    
   app.use("/listings/:id/reviews", reviewRouter);

//GET" Route
// Render Sign Up Form
app.use("/", userRouter);

    // Generic Error Handler
// This tells Express to catch any path and name it "path"
// This uses a Regular Expression to catch everything without crashing
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});