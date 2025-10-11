const Review = require("../models/Review");
const User = require("../models/User");
const Movie = require("../models/Movie");

exports.fetchInfoAdminDashboard = async (req, res) => {
  try {
    const filterStatus = req.query.status || "all"; // ตัวกรองจาก dropdown
    const query = filterStatus === "all" ? {} : { status: filterStatus };

    // ดึงข้อมูลรีวิวพร้อมกรองสถานะ
    const allReview = await Review.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "movieId",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $sort: { createdAt: -1 } },
    ]);

    const allUser = await User.find().lean();
    const allMovie = await Movie.find().lean();

    const stats = {
      users: allUser.length,
      movies: allMovie.length,
      reviews: allReview.length,
    };

    const latestReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.render("adminDashboard", {
      allUser,
      allMovie,
      allReview,
      latestReviews,
      stats,
      filterStatus, // ส่งไปให้ ejs ใช้เช็ค dropdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดในระบบ");
  }
};

exports.approveReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    await Review.findByIdAndUpdate(reviewId, { status: "approved" });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดในระบบ");
  }
};

exports.rejectReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    await Review.findByIdAndUpdate(reviewId, { status: "rejected" });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดในระบบ");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    await Review.findByIdAndDelete(reviewId);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดในระบบ");
  }
};

// ✅ เพิ่มฟังก์ชันอนุมัติทั้งหมด
exports.approveAllReviews = async (req, res) => {
  try {
    await Review.updateMany({ status: "pending" }, { status: "approved" });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดในระบบ");
  }
};

exports.userReviews = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).lean();
    const reviews = await Review.aggregate([
      { $match: { userId: user._id } },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "movieId",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
    ]);

    const totalReviews = reviews.length;
    const avgRating = (
      reviews.reduce((sum, r) => sum + r.rating, 0) /
      (totalReviews > 0 ? totalReviews : 1)
    ).toFixed(1);
    const approvedReviews = reviews.filter((r) => r.status === "approved").length;
    const rejectedReviews = reviews.filter((r) => r.status === "rejected").length;
    const pendingReviews = reviews.filter((r) => r.status === "pending").length;
    const latestReviewDate =
      totalReviews > 0 ? new Date(reviews[0].createdAt).toLocaleDateString() : "-";

    res.render("adminUserReviews", {
      user,
      reviews,
      stats: {
        totalReviews,
        avgRating,
        approvedReviews,
        rejectedReviews,
        latestReviewDate,
        pendingReviews,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดในระบบ");
  }
};

// ban user
exports.banUser = async (req, res) => {
  try {
    const userId = req.params.id
    await User.findByIdAndUpdate(userId, { isBanned: true })
    res.redirect("/admin/dashboard")
  }catch (err) {
    console.error(err)
    res.status(500).send("เกิดข้อผิดพลาดในระบบ")
  }
}

// unban user 
exports.unbanUser = async (req, res) => {
  try {
    const userId = req.params.id
    await User.findByIdAndUpdate(userId, { isBanned: false })
    res.redirect("/admin/dashboard")
  }catch (err) {
    console.error(err)
    res.status(500).send("เกิดข้อผิดพลาดในระบบ")
  } 
}
