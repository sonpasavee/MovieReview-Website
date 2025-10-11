// ควบคุมหน้า user dashboard
const User = require("../models/User");
const Profile = require("../models/Profile");
const Review = require("../models/Review");
const Collection = require("../models/Collection");

exports.userDashboard = async (req, res) => {
  try {
    const loggedIn = res.locals.UserData;
    const userId = loggedIn._id;

    // ดึงข้อมูลผู้ใช้และโปรไฟล์
    const user = await User.findById(userId).lean();
    const profile = await Profile.findOne({ userId }).lean();

    // ใช้ aggregate เดิมของคุณ
    const reviews = await Review.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "movieId",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      { $sort: { createdAt: -1 } },
    ]);

    // ดึง collections
    const collections = await Collection.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // recentActivities
    const recentActivities = [
      ...reviews.map((r) => ({
        type: "review",
        text: `You reviewed "${
          r.movie?.title || "Unknown Movie"
        }" with rating ${r.rating}`,
        date: r.createdAt,
      })),
      ...collections.map((c) => ({
        type: "collection",
        text: `You added "${c.name}" to your collection.`,
        date: c.createdAt,
      })),
    ];

    const stats = {
      totalReviews: reviews.length,
      totalCollections: collections.length,
      avgRating: reviews.length
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0,
    };

    res.render("userDashboard", {
      user,
      profile,
      reviews,
      collections,
      recentActivities,
      stats,
    });
  } catch (error) {
    console.error("Error loading user dashboard:", error);
    req.flash("error", "An error occurred while loading the dashboard.");
    res.redirect("/");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = res.locals.UserData;
    const userId = user._id;
    const { name, bio, facebook, twitter, instagram } = req.body;

    // สร้าง object สำหรับอัปเดต
    const updateData = {
      bio,
      socialLinks: { facebook, twitter, instagram },
    };

    // ถ้ามีไฟล์อัปโหลด ให้เก็บเป็น buffer
    if (req.file) {
      updateData.avatarUrl = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // อัปเดต profile
    await Profile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );

    // อัปเดตชื่อผู้ใช้
    await User.findByIdAndUpdate(userId, { name }, { new: true });

    req.flash("success", "Profile updated successfully");
    res.redirect("/user/dashboard");
  } catch (error) {
    console.error("Error updating profile:", error);
    req.flash("error", "An error occurred while updating the profile.");
    res.redirect("/user/dashboard");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id
    const user = res.locals.UserData
    const userId = user._id
    await Review.findOneAndDelete({ _id: reviewId, userId })
    req.flash("success", "Review deleted successfully")
    res.redirect("/user/dashboard")
  } catch (error) {
    console.error("Error deleting review:", error)
    req.flash("error", "An error occurred while deleting the review.")
    res.redirect("/user/dashboard")
  } 
}
