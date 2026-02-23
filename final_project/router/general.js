const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  const existingUser = users.filter((user) => user.username === username);
  if (existingUser.length > 0) {
    return res.status(400).json({message: "User already exists"});
  }

  users.push({ username, password });
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Task 2 & Task 11: Get all books using async-await with Axios
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await new Promise((resolve, reject) => {
      resolve(books);
    });
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Task 3 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  })
  .then((book) => {
    return res.status(200).json(book);
  })
  .catch((err) => {
    return res.status(404).json({message: err});
  });
});

// Task 4 & Task 11: Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const matchingBooks = await new Promise((resolve, reject) => {
      const filtered = [];
      const bookKeys = Object.keys(books);
      bookKeys.forEach((key) => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          filtered.push({ isbn: key, ...books[key] });
        }
      });
      if (filtered.length > 0) {
        resolve(filtered);
      } else {
        reject("No books found by this author");
      }
    });
    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(404).json({message: err});
  }
});

// Task 5 & Task 11: Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const matchingBooks = await new Promise((resolve, reject) => {
      const filtered = [];
      const bookKeys = Object.keys(books);
      bookKeys.forEach((key) => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          filtered.push({ isbn: key, ...books[key] });
        }
      });
      if (filtered.length > 0) {
        resolve(filtered);
      } else {
        reject("No books found with this title");
      }
    });
    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(404).json({message: err});
  }
});

// Task 6: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
