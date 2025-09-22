const axios = require("axios")
require("dotenv").config()

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

module.exports = async (req, res) => {
  try {
    const q = (req.query.q || "").trim()
    if (!q) return res.render('searchResults', { query: "", results: [] })

    const { data } = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: process.env.TMDB_KEY,
        language: "en-US",
        query: q,
        page: 1,
        include_adult: false
      }
    })

    const results = (data.results || []).map(m => ({
      movieId: m.id,
      title: m.title,
      overview: m.overview,
      release_date: m.release_date,
      poster_path: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : "/images/no-poster.png"
    }))

    res.render('searchResults', { query: q, results })
  } catch (err) {
    console.error("SEARCH ERROR:", err.message)
    res.status(500).render("searchResults", { query: req.query.q || "", results: [] })
  }
}