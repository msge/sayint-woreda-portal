const express = require('express');
const { body, validationResult } = require('express-validator');
const { ContactMessage } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').isLength({ min: 5 }).withMessage('Message is too short'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const message = await ContactMessage.create(req.body);
      return res.status(201).json({ status: 'success', data: { message } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', message: 'Error submitting contact message' });
    }
  }
);

router.get('/', auth.protect, auth.restrictTo('super_admin', 'admin', 'editor'), async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']], limit: 100 });
    return res.status(200).json({ status: 'success', data: { messages } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Error fetching contact messages' });
  }
});

module.exports = router;
