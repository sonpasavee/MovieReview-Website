// controllers/adminReviewController.js
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const axios = require('axios');

function pickYoutubeTrailer(videos) {
  if (!videos || !Array.isArray(videos.results)) return null;
  // หา Trailer จาก YouTube ที่เป็น official ก่อน
  const pri = videos.results.find(v =>
    v.site === 'YouTube' && v.type === 'Trailer' && (v.official || v.name?.toLowerCase().includes('official'))
  );
  const any = videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  const chosen = pri || any;
  return chosen ? `https://www.youtube.com/embed/${chosen.key}` : null;
}

// แสดงหน้ารีวิว (รายละเอียดหนัง + รายการรีวิว)
async function showReviews(req, res) {
  try {
    const { movieId } = req.params;

    // 1) ลองหาใน DB ก่อน
    let movieDoc = await Movie.findOne({ movieId }).lean();

    // 2) ถ้าไม่มี → เรียก TMDb (แบบละเอียด)
    if (!movieDoc) {
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: {
          api_key: process.env.TMDB_KEY,
          language: 'en-US',
          append_to_response: 'videos' // << เอาวิดีโอด้วย
        }
      });
      movieDoc = {
        movieId: data.id,
        title: data.title,
        overview: data.overview,
        poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '/image/login.png',
        release_date: data.release_date,
        runtime: data.runtime,
        vote_average: data.vote_average,
        genres: (data.genres || []).map(g => g.name),
        trailer_embed: pickYoutubeTrailer(data.videos)
      };
    } else {
      // ถ้ามีใน DB แต่อยากได้ trailer/รายละเอียดเพิ่ม → เติมจาก TMDb อีกที
      try {
        const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          params: {
            api_key: process.env.TMDB_KEY,
            language: 'en-US',
            append_to_response: 'videos'
          }
        });
        movieDoc.trailer_embed = movieDoc.trailer_embed || pickYoutubeTrailer(data.videos);
        movieDoc.runtime = movieDoc.runtime || data.runtime;
        movieDoc.vote_average = movieDoc.vote_average || data.vote_average;
        movieDoc.genres = movieDoc.genres?.length ? movieDoc.genres : (data.genres || []).map(g => g.name);
        movieDoc.release_date = movieDoc.release_date || data.release_date;
        movieDoc.title = movieDoc.title || data.title;
        if (!movieDoc.poster_path && data.poster_path) {
          movieDoc.poster_path = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
        }
      } catch (_) { /* เงียบไว้ถ้าเติมไม่ได้ */ }
    }

    // 3) รีวิวทั้งหมดของเรื่องนี้
    const reviews = await Review.find({ movieId }).sort({ createdAt: -1 }).lean();

    res.render('adminMovieReviews', {
      movie: movieDoc,
      reviews,
      UserData: req.session.user,
      loggedIn: req.session.userId
    });
  } catch (err) {
    console.error('ADMIN MOVIE REVIEWS ERROR:', err);
    res.status(500).send('Server error');
  }
}

// ลบรีวิว → กลับไปหน้าเดิมแบบพาธชัดเจน
async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const { movieId } = req.body; // รับมาจากฟอร์ม hidden
    await Review.findByIdAndDelete(id);
    res.redirect(`/admin/movie/${movieId}/reviews`);
  } catch (err) {
    console.error('ADMIN DELETE REVIEW ERROR:', err);
    res.status(500).send('Delete failed');
  }
}

module.exports = { showReviews, deleteReview };
