const Review = require("../models/Review");
const User = require("../models/User");
const Movie = require("../models/Movie");
exports.fetchInfoAdminDashboard = async (req, res) => {
  try {
    // ดึงข้อมูลทั้งหมดมาแสดงในหน้า admin dashboard
    const allReview = await Review.aggregate([
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
    ]);

    const allUser = await User.find().lean();
    const allMovie = await Movie.find().lean();
    // นับจำนวนข้อมูล
    const stats = {
      users: allUser.length,
      movies: allMovie.length,
      reviews: allReview.length,
    };
    // ดึงข้อมูลรีวิวล่าสุด 5 รีวิว
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

exports.userReviews = async (req, res) => {
    try {
        const userId = req.params.userId
        const user = await User.findById(userId).lean()
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
            { $unwind: "$movie" }
        ])
 

        const totalReviews = reviews.length
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviews > 0 ? totalReviews : 1).toFixed(1)
        const approvedReviews = reviews.filter(r => r.status === 'approved').length
        const rejectedReviews = reviews.filter(r => r.status === 'rejected').length
        const pendingReviews = reviews.filter(r => r.status === 'pending').length

        const latestReviewDate = totalReviews > 0 ? new Date(reviews[0].createdAt).toLocaleDateString() : '-'

        res.render('adminUserReviews' , { user , reviews , stats : { totalReviews , avgRating , approvedReviews , rejectedReviews , latestReviewDate , pendingReviews } })

    }catch (err) {
        console.error(err)
        res.status(500).send("เกิดข้อผิดพลาดในระบบ")
    }
}