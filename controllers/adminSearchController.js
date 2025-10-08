// controllers/adminSearchController.js
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const hasQuery = q.length > 0; // ← ใช้บอกว่าเริ่มค้นหาจริงหรือยัง

    if (!hasQuery) {
      return res.render('adminSearch', {
        results: [],
        query: '',
        hasQuery,                    // ← ส่งไปให้ EJS
        UserData: req.session.user,
        loggedIn: req.session.userId
      });
    }

    const { data } = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: process.env.TMDB_KEY,
        language: 'en-US',
        query: q,
        page: 1,
        include_adult: false
      }
    });

    const results = (data.results || []).map(m => ({
      movieId: m.id,
      title: m.title,
      poster_path: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : '/image/login.png'
    }));

    return res.render('adminSearch', {
      results,
      query: q,
      hasQuery,
      UserData: req.session.user,
      loggedIn: req.session.userId
    });
  } catch (err) {
    console.error('ADMIN SEARCH ERROR:', err.message);
    return res.status(500).render('adminSearch', {
      results: [],
      query: (req.query.q || '').trim(),
      hasQuery: (req.query.q || '').trim().length > 0,
      UserData: req.session.user,
      loggedIn: req.session.userId
    });
  }
};
