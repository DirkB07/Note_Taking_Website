const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const pool = require('../db'); // Import your PostgreSQL connection pool

const router = express.Router();

// Handle user registration
router.post(
  '/register',
  [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        const usernameExistsQuery = 'SELECT * FROM users WHERE username = $1';
        const usernameExists = await pool.query(usernameExistsQuery, [username]);
        
        // Check if the email is already in use
        const emailExistsQuery = 'SELECT * FROM users WHERE email = $1';
        const emailExists = await pool.query(emailExistsQuery, [email]);
        
        if (usernameExists.rows.length > 0) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Username already in use' }] });
        }

        if (emailExists.rows.length > 0) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'email already in use' }] });
          }

      // Hash the password before storing it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert the new user into the database
      const insertUserQuery =
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
      const newUser = await pool.query(insertUserQuery, [
        username,
        email,
        hashedPassword,
      ]);

      res.json({ userId: newUser.rows[0].id });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;