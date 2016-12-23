import 'babel-polyfill'
import Router from 'koa-router'
import Request from 'request-promise'
import tmdbApiKey from '../secrets'
import { tmdbApiUrl, omdbApiUrl } from '../global'
import { baseApi } from '../config'

const api = 'movies'

const router = new Router();

router.prefix(`/${baseApi}/${api}`)

/* eslint-disable no-unused-vars, no-param-reassign, new-cap */

// GET /api/movies/search
router.get('/search', async(ctx) => {
  try {
    // Get keyword ID from TMDB
    const keywordUrl = `${tmdbApiUrl}/search/keyword?api_key=${tmdbApiKey}` +
      `&query=${ctx.request.query.search}&page=1`
    const response = await Request.get(keywordUrl)

    // Use keyword ID to get list of movies
    const keyword = JSON.parse(response).results[0].id
    const movieUrl = `${tmdbApiUrl}/discover/movie?api_key=${tmdbApiKey}` +
      '&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' +
      `${ctx.request.query.page}&with_keywords=${keyword}`
    let movies = await Request.get(movieUrl)

    movies = JSON.parse(movies)

    // Format the poster url
    for (let i = 0; i < movies.results.length; i++) {
      movies.results[i].poster_path = `http://image.tmdb.org/t/p/w500/${movies.results[i].poster_path}`
    }

    ctx.body = movies
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404)
    }
    ctx.throw(500)
  }
})

// GET /api/movies/:id
router.get('/:id', async(ctx) => {
  try {
    // Get movie details from TMDB to have IMDB ID
    const tmdbUrl = `${tmdbApiUrl}/movie/${ctx.params.id}?api_key=${tmdbApiKey}` +
      `&language=en-US`
    let response = await Request.get(tmdbUrl)

    response = JSON.parse(response)

    // Get movie details from OMDB with IMDB ID
    const omdbUrl = `${omdbApiUrl}/?i=${response.imdb_id}&plot=full&r=json`
    let info = await Request.get(omdbUrl)

    info = JSON.parse(info)

    ctx.body = info
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404)
    }
    ctx.throw(500)
  }
})

/* eslint-enable no-unused-vars, no-param-reassign, new-cap */

export default router
