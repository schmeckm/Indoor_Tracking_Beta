const Environment = require('../models/environment');
const multer = require('multer');
const fs = require('fs');

const handleResponse = (res, success, data, errorMessage, statusCode) => {
  if (success) {
    res.status(statusCode).json({ success: true, data });
  } else {
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, 'image-' + uniqueSuffix + '.' + ext);
  },
});

const upload = multer({ storage });

exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await Environment.find();
    handleResponse(res, true, environments, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

exports.addEnvironment = async (req, res) => {
  try {
    const environment = await Environment.create(req.body);
    handleResponse(res, true, environment, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

exports.deleteEnvironment = async (req, res) => {
  try {
    const { environmentId } = req.params;
    const environment = await Environment.findOneAndDelete({ _id: environmentId });

    if (!environment) {
      handleResponse(res, false, null, 'Environment not found', 404);
    } else {
      handleResponse(res, true, 'Environment Deleted Successfully', null, 200);
    }
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

exports.updateEnvironment = async (req, res) => {
  try {
    const { environmentId } = req.params;
    const { name, description, text1, text2, width, height, distance_points } = req.body;

    let updateObject = {};

    if (name) updateObject.name = name;
    if (description) updateObject.description = description;
    if (text1) updateObject.text1 = text1;
    if (text2) updateObject.text2 = text2;
    if (width) updateObject.width = width;
    if (height) updateObject.height = height;
    if (distance_points) updateObject.distance_points = distance_points;

    const existingEnvironment = await Environment.findById(environmentId);
    if (!existingEnvironment) {
      handleResponse(res, false, null, 'Environment not found', 404);
      return;
    }

    upload.single('image')(req, res, async (err) => {
      if (err) {
        handleResponse(res, false, null, err.message, 400);
      } else {
        const image = req.file;
        if (image) {
          const ext = image.originalname.split('.').pop();
          const filename = `${environmentId}.${ext}`; // Set filename as environmentId
          const filePath = `uploads/${filename}`;

          // Delete the old image if it exists
          if (existingEnvironment.image) {
            const oldImagePath = `uploads/${existingEnvironment.image}`;
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          fs.renameSync(image.path, filePath); // Rename the file
          updateObject.image = filename; // Set the filename in the updateObject
        }

        const updatedEnvironment = await Environment.findByIdAndUpdate(
          environmentId,
          updateObject,
          { new: true }
        );

        handleResponse(res, true, 'Environment Updated Successfully', null, 200);
      }
    });
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

exports.getSingleEnvironment = async (req, res) => {
  try {
    const { environmentId } = req.params;
    const environment = await Environment.findOne({ _id: environmentId });

    if (!environment) {
      handleResponse(res, false, null, 'Environment not found', 404);
    } else {
      handleResponse(res, true, environment, null, 200);
    }
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};
