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

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const filtered = [];
  const bookKeys = Object.keys(books);
  bookKeys.forEach((key) => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      filtered.push({ isbn: key, ...books[key] });
    }
  });
  if (filtered.length > 0) {
    return res.status(200).json(filtered);
  } else {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const filtered = [];
  const bookKeys = Object.keys(books);
  bookKeys.forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      filtered.push({ isbn: key, ...books[key] });
    }
  });
  if (filtered.length > 0) {
    return res.status(200).json(filtered);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// Task 11: Get all books using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5001/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Task 11: Search by ISBN using Promises with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5001/isbn/${isbn}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      return res.status(404).json({message: "Book not found"});
    });
});

// Task 11: Search by Author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:5001/author/${req.params.author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Task 11: Search by Title using Promises with Axios
public_users.get('/async/title/:title', function (req, res) {
  axios.get(`http://localhost:5001/title/${req.params.title}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((error) => {
      return res.status(404).json({message: "No books found with this title"});
    });
});

module.exports.general = public_users;
