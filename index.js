const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const dotenv = require("dotenv");
// const multer = require('multer')
// const upload = multer({ dest: 'public/uploads/' })
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
dotenv.config();

// MongoDB Connnection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Controllers import
const indexController = require("./controllers/indexController");
const loginController = require("./controllers/loginController");
const registerController = require("./controllers/registerController");
const storeController = require("./controllers/storeUserController");
const loginUserController = require("./controllers/loginUserController");
const adminDashboardController = require("./controllers/adminDashboardController");
const userDashboardController = require("./controllers/userDashboardController");
const logoutController = require("./controllers/logoutController");
const movieDetailController = require("./controllers/movieDetailController");
const storeReviewController = require("./controllers/storeReviewController");
const reviewController = require("./controllers/reviewController");
const searchController = require("./controllers/searchController");
const updateProfileController = require("./controllers/updateProfileController");
const addCollectionController = require("./controllers/addCollectionController");
const collectionController = require("./controllers/controllerCollection");

// Middleware Import
const {
  isAuthenticated,
  isAdmin,
  isUser,
} = require("./middleware/authMiddleware");
const userDataMiddleware = require("./middleware/userData");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // เก็บข้อมูล login 1 ชั่วโมง
  })
);
app.use(flash());
app.use(userDataMiddleware);
// middleware สำหรับส่ง loggedIn ไปทุก view
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.loggedIn = req.session.userId || null;
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// get controlelr
app.get("/", indexController);
app.get("/login", loginController);
app.get("/register", registerController);
app.get("/admin/dashboard", isAuthenticated, isAdmin, adminDashboardController);
app.get("/user/dashboard", isAuthenticated, isUser, userDashboardController);
app.post("/user/register", storeController);
app.post("/user/login", loginUserController);
app.get("/logout", logoutController);
app.get("/movie/detail/:id", movieDetailController);
app.post("/reviews", storeReviewController);
app.get("/review/form/:movieId", reviewController);
app.get("/searchResults", searchController);
app.post("/profile/update", upload.single("avatar"), updateProfileController);
app.post("/add/collection/:movieId", addCollectionController);
app.get("/collection", isAuthenticated, collectionController);
app.post(
  "/collection/rename/:collectionId",
  collectionController.renameCollection
);
app.post(
  "/collection/delete/:collectionId",
  collectionController.deleteCollection
);
app.post(
  "/collection/:collectionId/remove/:movieId",
  collectionController.removeMovie
);

app.listen(4000, () => {
  console.log("App listening on port 4000");
});

module.exports = app;
