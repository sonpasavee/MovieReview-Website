// controllers/adminMovieDetailController.js
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const axios = require('axios');

function pickYoutubeTrailer(videos) {
  if (!videos || !Array.isArray(videos.results)) return null;
  const pri = videos.results.find(
    v => v.site === 'YouTube' && v.type === 'Trailer' &&
    (v.official || v.name?.toLowerCase().includes('official'))
  );
  const any = videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  const chosen = pri || any;
  return chosen ? `https://www.youtube.com/embed/${chosen.key}` : null;
}

module.exports = async (req, res) => {
  try {
    const { movieId } = req.params;

    const dbMovie = await Movie.findOne({ movieId }).lean();

    const asNumber = Number(movieId);
    const hasNumber = !Number.isNaN(asNumber);

    const agg = await Review.aggregate([
      {
        $match: {
          $or: [
            { movieId: movieId },             // ถ้าเก็บเป็น string
            ...(hasNumber ? [{ movieId: asNumber }] : []) // ถ้าเก็บเป็น number
          ]
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const reviewStats = agg[0] || { avgRating: null, count: 0 };

    // ===== TMDb =====
    let tmdb = null;
    try {
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
        params: {
          api_key: process.env.TMDB_KEY,
          language: 'en-US',
          append_to_response: 'videos'
        }
      });
      tmdb = data;
    } catch (_) {}

    //ข้อมูล
    const combined = {
      movieId,
      title: dbMovie?.title ?? tmdb?.title ?? tmdb?.original_title ?? '-',
      overview: tmdb?.overview || null,
      poster_path:
        dbMovie?.poster_path ||
        dbMovie?.poster ||
        (tmdb?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : '/image/login.png'),
      release_date: dbMovie?.release_date || dbMovie?.releaseDate || tmdb?.release_date || null,
      runtime: dbMovie?.runtime || tmdb?.runtime || null,
      genres:
        (Array.isArray(dbMovie?.genres) && dbMovie.genres.length
          ? dbMovie.genres.map(g => (typeof g === 'string' ? g : (g.name || g)))
          : (tmdb?.genres || []).map(g => g.name)
        ),
      // คะแนน
      vote_average:
        (typeof dbMovie?.rating === 'number' ? dbMovie.rating : null) ??
        (typeof reviewStats.avgRating === 'number' ? Number(reviewStats.avgRating) : null),
      vote_count: reviewStats.count || 0,
      trailer_embed: pickYoutubeTrailer(tmdb?.videos)
    };

    return res.render('adminMovieDetail', {
      movie: combined,
      UserData: req.session.user,
      loggedIn: req.session.userId
    });
  } catch (err) {
    console.error('ADMIN MOVIE DETAIL ERROR:', err);
    return res.status(500).send('Server error');
  }
};
