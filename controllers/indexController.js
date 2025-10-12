// ควบคุมหน้าhome
const User = require("../models/User");
const axios = require("axios");
const Movie = require("../models/Movie");
const Review = require("../models/Review");
require("dotenv").config();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

module.exports = async (req, res) => {
  try {
    // ดึงข้อมูล user
    const UserData = res.locals.UserData;

    // pagination
    const page = parseInt(req.query.page) || 1;
    // ดึงข้อมูลหนังจาก TMDb หนังล่าสุด
    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      params: {
        api_key: process.env.TMDB_KEY,
        language: "en-US",
        page: page,
      },
    });

    const totalPages = response.data.total_pages;

    const latestMovies = response.data.results.map((movie) => ({
      movieId: movie.id,
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    }));

    // หนังยอดนิยมอิงจาก review collection ของเรา
    const popularReviews = await Review.aggregate([
      { $match: { status: "approved" } }, // เฉพาะรีวิวที่อนุมัติแล้ว
      {
        $group: {
          _id: "$movieId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, count: -1 } },
    ]);

    const popularMovies = await Promise.all(
      popularReviews.map(async (r) => {
        try {
          const movieRes = await axios.get(`${TMDB_BASE_URL}/movie/${r._id}`, {
            params: {
              api_key: process.env.TMDB_KEY,
              language: "en-US",
            },
          });
          const movie = movieRes.data;
          return {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "/images/default.png",
            avgRating: r.avgRating,
            count: r.count,
          };
        } catch (err) {
          console.error(err);
        }
      })
    );

   // หนังแนะนำ
const recommendPosters = {
  755898: "/images/war.jpeg",
  1038392: "/images/conjur.jpg",
  803796: "/images/kpop.jpg",
};

const recommendIds = Object.keys(recommendPosters).map(Number);

const recommendMovies = await Promise.all(
  recommendIds.map(async (id) => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
        params: {
          api_key: process.env.TMDB_KEY,
          language: "en-US",
        },
      });

      const movie = res.data;

      return {
        movieId: movie.id,
        title: movie.title,
        overview: movie.overview,
        release_date: movie.release_date,
        poster_path: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/images/default.png",
        customPoster: recommendPosters[movie.id] || "/images/default.png",
      };
    } catch (err) {
      console.error(`Error fetching movie id ${id}:`, err);
      return null;
    }
  })
);

// กรอง null เผื่อมี id ไหน fetch ไม่ได้
const finalRecommendMovies = recommendMovies.filter(Boolean);

    const reviews = await Review.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    // render หน้า index
    res.render("index", {
      latestMovies,
      UserData,
       recommendMovies: finalRecommendMovies,
      popularMovies,
      reviews,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading home page");
  }
};
