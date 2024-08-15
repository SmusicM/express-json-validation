const express = require("express");
const Book = require("../models/book");

const router = new express.Router();
const ExpressError = require("../expressError");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookstoreSchema.json");

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
   
    const books = await Book.findAll();
    
    //return res.json({ book }); ??
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */
//id but really should be ibsn
router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    console.log(req.params.id)
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body,bookSchema);
    if(!result.valid){
      const errors = result.errors.map(error=>error.stack);
      const error = new ExpressError(errors,400)
      return next(error)
    }

    const book = await Book.create(req.body.book);
    console.log(book)
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body,bookSchema);
    if(!result.valid){
      const errors = result.errors.map(error=>error.stack);
      const error = new ExpressError(errors,400)
      return next(error)
    }

    const book = await Book.update(req.params.isbn, req.body.book);
    
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
