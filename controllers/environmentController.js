const Environment = require('../models/environment');

const handleResponse = (res, success, data, errorMessage, statusCode) => {
  if (success) {
    res.status(statusCode).json({ success: true, data });
  } else {
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};

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
    const environment = await Environment.findOneAndUpdate({ _id: environmentId }, req.body);

    if (!environment) {
      handleResponse(res, false, null, 'Environment not found', 404);
    } else {
      handleResponse(res, true, 'Environment Updated Successfully', null, 200);
    }
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
