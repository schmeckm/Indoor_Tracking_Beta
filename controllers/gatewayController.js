// Importing the Gateway model from the models directory
const Gateway = require('../models/gateway');

// A utility function to handle and standardize API responses
function handleResponse(res, success, data, errorMessage, statusCode) {
  if (success) {
    res.status(statusCode).json({ success: true, data });
  } else {
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
}

// Fetch all gateways from the database
exports.getAllGateways = async (req, res) => {
  try {
    const gateways = await Gateway.find();
    handleResponse(res, true, gateways, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

// Add a new gateway to the database
exports.addGateway = async (req, res) => {
  try {
    const newGateway = await Gateway.create(req.body);
    handleResponse(res, true, newGateway, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

// Delete a specific gateway using its ID
exports.deleteGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const deletedGateway = await Gateway.findOneAndDelete({ _id: gatewayId });

    if (!deletedGateway) {
      handleResponse(res, false, null, 'Gateway not found', 404);
    } else {
      handleResponse(res, true, 'Gateway Deleted Successfully', null, 200);
    }
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

// Update details of a specific gateway using its ID
exports.updateGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const foundGateway = await Gateway.findOne({ _id: gatewayId });

    if (!foundGateway) {
      handleResponse(res, false, null, 'Gateway not found', 404);
      return;
    }

    const updatedGateway = await Gateway.findByIdAndUpdate(gatewayId, req.body, { new: true });

    handleResponse(res, true, updatedGateway, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

// Fetch details of a specific gateway using its ID
exports.getSingleGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const gateway = await Gateway.findOne({ _id: gatewayId });

    if (!gateway) {
      handleResponse(res, false, null, 'Gateway not found', 404);
    } else {
      handleResponse(res, true, gateway, null, 200);
    }
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

// Fetch details of a specific gateway using its MAC address
exports.getSingleGatewayByMAC = async (req, res) => {
  try {
    const { gatewayId } = req.params; // It might be better to rename 'gatewayId' to 'gatewayMac' for clarity
    const gateway = await Gateway.findOne({ gatewayMac: gatewayId });

    if (!gateway) {
      handleResponse(res, false, null, 'Gateway not found', 404);
    } else {
      handleResponse(res, true, gateway, null, 200);
    }
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};



