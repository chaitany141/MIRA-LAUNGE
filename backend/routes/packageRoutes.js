const express = require('express');
const router = express.Router();
const { getPackages, createPackage, deletePackage } = require('../controllers/packageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getPackages).post(protect, admin, createPackage);
router.route('/:id').delete(protect, admin, deletePackage);

module.exports = router;
