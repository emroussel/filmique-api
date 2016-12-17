import app from '../server/'
import supertest from 'supertest'
import { expect, should } from 'chai'

const request = supertest.agent(app.listen())
should()

describe('GET /movies/:search/:page', () => {
  it('should get movies', (done) => {
    request
      .get('/api/movies/space/1')
      .expect(200, (err, res) => {
        res.body.page.should.equal(1)
        res.body.results[0].should.be.an('object')
        res.body.results[0].title.should.be.a('string')
        res.body.results[0].poster_path.should.be.a('string')
        res.body.results[0].overview.should.be.a('string')
        res.body.results[0].release_date.should.be.a('string')
        done()
      })
  })
})
