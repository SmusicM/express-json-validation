process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testbook;

beforeEach(async function () {
  let result = await db.query(`INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ('10101010','http://a.co/eobPtX2test', 'test auth', 'english', 400, 'test publisher', 'test title', 2018) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year
        `);
  testbook = result.rows[0];
  //testbook = result;
});

describe("POST /books", function () {
  test("Add a book to a book store", async function () {
    const response = await request(app)
      .post(`/books`)
      .send({
        book: {
          isbn: "0691161518",
          amazon_url: "http://a.co/eobPtX2",
          author: "Mathew Lane",
          language: "english",
          pages: 264,
          publisher: "Princeton University Press",
          title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          year: 2017,
        },
      });
    expect(response.statusCode).toEqual(201);
  
    expect(response.body).toEqual({
      book: {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Mathew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017,
      },
    });
    
  });
});

describe("PUT /books", function () {
    test(" Update a book in the book store", async function () {
      const response = await request(app)
        .put(`/books/10101010/`)
        .send({
            book: {
                amazon_url: "http://a.co/eobPtX2test",
                author: "test auth updated",
                isbn: "10101010",
                language: "english",
                pages: 400,
                publisher: "test publisher",
                title: "test title",
                year: 2018,
              }
        });
      expect(response.statusCode).toEqual(200);
      
       expect(response.body).toEqual({
        book: {
            amazon_url: "http://a.co/eobPtX2test",
            author: "test auth updated",
            isbn: "10101010",
            language: "english",
            pages: 400,
            publisher: "test publisher",
            title: "test title",
            year: 2018,
          }
      });
      //expect(response.body).toEqual({ book: [testbook] });
    });
    test(" Update a book in the book store with invalid", async function () {
      const response = await request(app)
        .put(`/books/10101010/`)
        .send({
            book: {
                amazon_url: "http://a.co/eobPtX2test",
                author: 10101010,
                isbn: "10101010",
                language: "english",
                pages: 400,
                publisher: "test publisher",
                title: "test title",
                year: 2018,
              }
        });
      expect(response.statusCode).toEqual(400);
      //expect(response.body).toEqual({ book: [testbook] });
    });
  });



describe("GET /books", function () {
  test("Gets a list of all books", async function () {
    const response = await request(app).get("/books/");
    expect(response.statusCode).toEqual(200);

    expect(response.body).toEqual({ books: [testbook] });
  });
});

describe("GET /books/:id", function () {
  test("Gets a single book", async function () {
    const response = await request(app).get("/books//10101010/");
    expect(response.statusCode).toEqual(200);

    //expect(response.body).toEqual({books: [testbook]});

    //expect(response.body).toEqual({book:   [testbook]}

    expect(response.body).toEqual({
      book: {
        amazon_url: "http://a.co/eobPtX2test",
        author: "test auth",
        isbn: "10101010",
        language: "english",
        pages: 400,
        publisher: "test publisher",
        title: "test title",
        year: 2018,
      },
    });
  });
});

describe("DELETE /books/:isbn", function() {
  test("Deletes a single book", async function() {
    const response = await request(app)
      .delete(`/books/${testbook.isbn}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
});

afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  // close db connection
  await db.end();
});
