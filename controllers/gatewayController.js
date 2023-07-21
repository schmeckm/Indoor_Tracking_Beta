const Gateway = require('../models/gateway');

function handleResponse(res, success, data, errorMessage, statusCode) {
  if (success) {
    res.status(statusCode).json({ success: true, data });
  } else {
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
}

exports.getAllGateways = async (req, res) => {
  try {
    const gateways = await Gateway.find();
    handleResponse(res, true, gateways, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

exports.addGateway = async (req, res) => {
  try {
    const newGateway = await Gateway.create(req.body);
    handleResponse(res, true, newGateway, null, 200);
  } catch (error) {
    handleResponse(res, false, null, error.message, 500);
  }
};

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

exports.updateGateway = async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const foundGateway = await Gateway.findOne({ _id: gatewayId });
    console.log(foundGateway);

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
//Github
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
exports.getSingleGatewayByMAC = async (req, res) => {
  try {
    const { gatewayId } = req.params;
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






