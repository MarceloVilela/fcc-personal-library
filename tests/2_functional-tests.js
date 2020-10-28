/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function (done) {
    chai.request(server)
      .get('/api/books')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function () {


    suite('POST /api/books with title => create book object/expect book object', function () {

      test('Test POST /api/books with title', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'Title - post with title'
          })
          .end(function (err, res) {

            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'Title - post with title');
            assert.isString(res.body._id);
            done();
          });
      });

      test('Test POST /api/books with no title given', function (done) {
        chai.request(server)
          .post('/api/books')
          .end(function (err, res) {

            assert.equal(res.status, 400);
            done();
          });
      });

    });


    suite('GET /api/books => array of books', function () {

      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get('/api/books')
          .end(function (err, res) {

            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'commentcount');
            assert.isNumber(res.body[0].commentcount);
            done();
          });
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function () {

      test('Test GET /api/books/[id] with id not in db', function (done) {
        var _id = 'invalid-id'

        chai.request(server)
          .get(`/api/books/${_id}`)
          .end(function (err, res) {

            assert.equal(res.status, 400);
            assert.equal(res.text, 'invalid bookid');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'Title - get with valid id'
          })
          .end(function (err, res) {
            var validid = res.body._id;

            chai.request(server)
              .get(`/api/books/${validid}`)
              .end(function (err, res) {

                assert.equal(res.status, 200);
                assert.equal(res.body.title, 'Title - get with valid id');
                assert.equal(res.body._id, validid);
                assert.isArray(res.body.comments);
                done();
              });
          });
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function () {

      test('Test POST /api/books/[id] with comment', function (done) {
        var comment = 'comment added';

        chai.request(server)
          .post('/api/books')
          .send({
            title: 'Title - with comment'
          })
          .end(function (err, res) {
            var whitcommentid = res.body._id;

            chai.request(server)
              .post(`/api/books/${whitcommentid}`)
              .send({
                comment
              })
              .end(function (err, res) {

                chai.request(server)
                  .get(`/api/books/${whitcommentid}`)
                  .end(function (err, res) {

                    assert.equal(res.status, 200);
                    assert.equal(res.body.title, 'Title - with comment');
                    assert.equal(res.body._id, whitcommentid);
                    assert.isArray(res.body.comments);
                    assert.equal(res.body.comments[0], comment);
                    done();
                  });
              });
          });
      });

    });

  });

});
