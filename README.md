# Wanderlust
**A Full-Stack Travel Listing & Booking Platform**

![Node.js](https://img.shields.io/badge/Node.js-v25.5.0-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Storage-3448C5?logo=cloudinary&logoColor=white)
![License: ISC](https://img.shields.io/badge/License-ISC-blue)

[Live Demo →](https://wanderlust-ykfc.onrender.com)  |  [API Routes →](#api-routes)  |  [Architecture →](#technical-architecture)  |  [Local Setup →](#local-development)

---

## The Problem

Travelers looking for unique stays — mountain cabins, arctic retreats, castle getaways, farm stays — have no single platform that:

- Lets **anyone list** a property with photos, location, and category in under a minute
- Shows **listings on an interactive map** with geolocation coordinates
- Supports **user authentication**, so only owners can edit or delete their own listings
- Enables **community reviews** tied to real user accounts
- Handles **image uploads to the cloud** without any manual file management

The result: fragmented tools, no ownership controls, and no map-based discovery.

---

## The Solution

Wanderlust is a full-stack MERN-style travel listing platform where users can discover, list, review, and manage unique travel destinations — all in one place. Authentication is baked in. Ownership is enforced at the route level. Every listing has geolocation support for map display.

```
User Action
      ↓
Express Router         validates session & ownership
      ↓
Controller Layer       handles CRUD logic
      ↓
Mongoose Models        Listing · Review · User (with cascading deletes)
      ↓
MongoDB Atlas          persistent cloud database
      ↓
Cloudinary             image storage & CDN delivery
      ↓
EJS Templates          server-rendered views with flash messages
```

---

## Key Features

| Feature | Capability |
|---|---|
| Listing CRUD | Create, view, edit, and delete travel listings with title, description, price, location, country, and image |
| Category Filters | 9 categories — Trending, Rooms, Iconic Cities, Mountains, Castles, Amazing Pools, Camping, Farms, Arctic |
| Map Integration | Geolocation coordinates stored per listing for interactive map display |
| Image Uploads | Multer + Cloudinary pipeline — drag and drop a photo, get a CDN URL |
| User Authentication | Passport.js Local Strategy — register, login, logout, persistent sessions via MongoDB |
| Ownership Enforcement | Only the listing owner can edit or delete their listing (middleware-guarded routes) |
| Reviews | Logged-in users can post reviews on any listing; cascading delete removes reviews when a listing is deleted |
| Flash Messages | Success and error feedback on every action |
| Session Persistence | MongoDB-backed sessions via connect-mongo with 7-day cookie expiry |
| Input Validation | Joi schema validation on all listing and review inputs |

---

## MVP Workflow

```
┌────────────────────────────────────────────────────────────┐
│  USER                                                       │
│  → Registers an account                                    │
│  → Clicks: Add New Listing                                 │
│  → Fills: Title, Description, Price, Location, Category   │
│  → Uploads: Cover photo                                    │
│  → Submits                                                 │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  EXPRESS ROUTER: POST /listings                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 1. isLoggedIn middleware                            │  │
│  │    Checks session → redirects to login if not auth │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │ 2. Multer + Cloudinary                              │  │
│  │    Receives image → uploads to Cloudinary           │  │
│  │    Returns: { filename, url }                       │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │ 3. Joi Validation                                   │  │
│  │    Validates all listing fields against schema      │  │
│  │    Throws 400 if invalid                            │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │ 4. Mongoose: Listing.save()                         │  │
│  │    Stores listing with owner reference              │  │
│  │    Geolocation coordinates stored on geometry field │  │
│  └──────────────────────┬──────────────────────────────┘  │
└───────────────────────────────────────────────────────────-┘
                     │
                     ▼
         Redirect → /listings/:id
         Flash: "New Listing Created!"
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌────────────────┐     ┌──────────────────────┐
│  Listing Show  │     │  Map Display         │
│  Full details  │     │  Coordinates plotted  │
│  Reviews panel │     │  on interactive map  │
└────────────────┘     └──────────────────────┘
```

---

## How to Navigate the App

**Step 1 — Browse Listings**
The homepage redirects to `/listings`. All active listings are displayed with cover images, prices, and locations. Use category filters to narrow by type.

**Step 2 — Register / Login**
Click Sign Up to create an account. Sessions persist for 7 days via MongoDB-backed cookies. Login with email + password using Passport.js Local Strategy.

**Step 3 — Create a Listing**
Click "Add New Listing" (visible when logged in). Fill in the form — title, description, price, location, country, category, and upload a photo. Hit Submit.

**Step 4 — View & Review**
Click any listing to see its full detail page, including the map marker and all existing reviews. Logged-in users can post a new review directly from this page.

**Step 5 — Edit or Delete**
If you are the owner of a listing, Edit and Delete buttons appear on the show page. Ownership is enforced server-side — other users cannot modify your listings even via direct URL.

---

## Technical Architecture

```
Wanderlust/
├── app.js                         # Express entry point, middleware, route mounting
├── middleware.js                  # isLoggedIn, isOwner, validateListing, validateReview
├── schema.js                      # Joi validation schemas
│
├── models/
│   ├── listing.js                 # Listing schema (title, price, image, geometry, reviews[])
│   ├── review.js                  # Review schema (rating, comment, author ref)
│   └── user.js                    # User schema (passport-local-mongoose plugin)
│
├── routes/
│   ├── listing.js                 # /listings — INDEX, NEW, CREATE, SHOW, EDIT, UPDATE, DELETE
│   ├── review.js                  # /listings/:id/reviews — CREATE, DELETE
│   └── user.js                    # /register, /login, /logout
│
├── controllers/
│   ├── listings.js                # All listing route handlers
│   ├── reviews.js                 # All review route handlers
│   └── users.js                   # Register, login, logout handlers
│
├── utils/
│   ├── wrapAsync.js               # Async error wrapper for Express
│   ├── ExpressError.js            # Custom error class with statusCode
│   └── cloudConfig.js             # Cloudinary + Multer storage config
│
├── views/
│   ├── layouts/boilerplate.ejs    # EJS-Mate base layout
│   ├── listings/                  # index, show, new, edit templates
│   ├── users/                     # login, signup templates
│   └── error.ejs                  # Generic error page
│
└── public/
    └── CSS/                       # Static stylesheets
```

---

## API Routes

| Method | Route | Auth Required | Description |
|---|---|---|---|
| GET | `/listings` | No | All listings index |
| GET | `/listings/new` | Yes | Render new listing form |
| POST | `/listings` | Yes | Create new listing |
| GET | `/listings/:id` | No | Show single listing |
| GET | `/listings/:id/edit` | Yes (owner) | Render edit form |
| PUT | `/listings/:id` | Yes (owner) | Update listing |
| DELETE | `/listings/:id` | Yes (owner) | Delete listing + cascade reviews |
| POST | `/listings/:id/reviews` | Yes | Add review to listing |
| DELETE | `/listings/:id/reviews/:reviewId` | Yes (author) | Delete review |
| GET | `/register` | No | Render signup form |
| POST | `/register` | No | Register new user |
| GET | `/login` | No | Render login form |
| POST | `/login` | No | Authenticate user |
| GET | `/logout` | Yes | Destroy session |

---

## Local Development

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### Setup

```bash
# Clone the repository
git clone https://github.com/Nikkiraj4/Wanderlust.git
cd Wanderlust

# Install dependencies
npm install

# Create environment variables file
touch .env
```

Add the following to your `.env` file:

```env
ATLASDB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/wanderlust
SECRET=yoursupersecretkey
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

```bash
# Start the development server
node app.js
# → http://localhost:8080
```

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v25.5.0 | Runtime |
| Express | ^5.2.1 | REST routing & middleware |
| MongoDB + Mongoose | ^9.2.1 | Database & ODM |
| EJS + EJS-Mate | ^3.0.2 / ^3.0.0 | Server-side templating with layouts |
| Passport.js | ^0.7.0 | Authentication framework |
| passport-local-mongoose | ^9.0.1 | Local strategy + user plugin |
| express-session | ^1.19.0 | Session management |
| connect-mongo | ^6.0.0 | MongoDB-backed session store |
| connect-flash | ^0.1.1 | Flash messages |
| Cloudinary | ^1.41.3 | Cloud image storage |
| Multer | ^2.1.1 | Multipart form / file upload handling |
| multer-storage-cloudinary | ^4.0.0 | Cloudinary storage engine for Multer |
| Joi | ^18.0.2 | Input validation schemas |
| method-override | ^3.0.0 | PUT/DELETE via HTML forms |
| dotenv | ^17.3.1 | Environment variable loading |

---

## Future Scope

The following capabilities are planned for future development:

- **Search & Filters** — Full-text search by location, country, and price range
- **Map-first Discovery** — Leaflet/Mapbox integration to browse listings spatially
- **Booking System** — Date range selection, availability calendar, booking confirmation emails
- **Rating Aggregation** — Average star rating displayed on listing cards
- **Wishlist** — Save favourite listings to a personal collection
- **Admin Dashboard** — Moderation panel for listing approvals and user management
- **Payment Integration** — Razorpay/Stripe for booking deposits
- **Mobile App** — React Native companion for on-the-go listing management

---

## Author

| Name | Role |
|---|---|
| Nikita Kumari | Full-Stack Developer |

Built with ❤️ using the MERN stack  ·  [Live at wanderlust-ykfc.onrender.com](https://wanderlust-ykfc.onrender.com)  ·
