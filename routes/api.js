/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const MONGODB_CONNECTION_STRING = process.env.DB;

var db = null;
MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, con) {
  db = con;
});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      var filter = {};

      db.collection('book').find(filter).toArray(
        function (err, results) {
          if (err) return res.status(400).send('error on list books');

          if (results.length === 0) return res.json([]);

          const books = results.map(item => ({
            _id: item._id,
            title: item.title,
            commentcount: item.comments.length,
          }));

          return res.json(books);
        });

      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function (req, res) {
      var {
        title,
      } = req.body;

      if (title === undefined || title === '') {
        return res.status(400).send('invalid title');
      }

      const bookToInsert = {
        title,
        comments: [],
      };

      db.collection('book').insert(
        bookToInsert,
        function (err) {
          if (err) return res.status(400).send('error on insert book');

          return res.json(bookToInsert);
        });

      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      var filter = {};

      db.collection('book').deleteMany(
        filter,
        function (err) {
          if (err) return res.status(400).json('error on delete books');

          return res.status(200).send('complete delete successful');
        });

      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = req.params.id;

      if (!ObjectId.isValid(bookid)) {
        return res.status(400).send('invalid bookid');
      }

      db.collection('book').find({ _id: ObjectId(bookid) }).toArray(
        function (err, results) {
          if (err) return res.status(400).send('error on find book');

          var [book] = results;

          if (!book) return res.status(400).send('book dont exists');

          return res.json(book);
        })
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;

      if (!ObjectId.isValid(bookid)) {
        return res.status(400).send('invalid bookid');
      }

      if (comment === undefined || comment === '') {
        return res.status(400).send('invalid comment');
      }

      db.collection('book').find({ _id: ObjectId(bookid) }).toArray(
        function (err, results) {
          if (err) return res.status(400).send('error on find book');

          var [book] = results;

          if (!book) return res.status(400).send('book dont exists');

          book.comments.push(
            comment
          );

          db.collection('book').updateOne(
            { _id: ObjectId(bookid) },
            book,
            function (err) {
              if (err) return res.status(400).json('error on add comment');

              return res.json(book);
            });
        });
    })

    .delete(function (req, res) {
      var bookid = req.params.id;

      if (!ObjectId.isValid(bookid)) {
        return res.status(400).send('invalid bookid');
      }

      var filter = { _id: ObjectId(bookid) };

      db.collection('book').find(filter).toArray(
        function (err, results) {
          if (err) return res.status(400).send('error on find book');

          var [book] = results;

          if (!book) return res.status(400).send('book dont exists');

          db.collection('book').deleteOne(
            filter,
            function (err) {
              if (err) return res.status(400).json('error on delete a book');

              return res.status(200).send('delete successful');
            });
        });
    });

};
