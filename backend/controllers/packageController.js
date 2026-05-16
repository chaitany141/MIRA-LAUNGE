const Package = require('../models/Package');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
  const packages = await Package.find({});
  res.json(packages);
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
  const { type, name, description, price, image } = req.body;
  const pkg = new Package({ type, name, description, price, image });
  const createdPackage = await pkg.save();
  res.status(201).json(createdPackage);
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
const deletePackage = async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (pkg) {
    await pkg.deleteOne();
    res.json({ message: 'Package removed' });
  } else {
    res.status(404).json({ message: 'Package not found' });
  }
};

module.exports = { getPackages, createPackage, deletePackage };
