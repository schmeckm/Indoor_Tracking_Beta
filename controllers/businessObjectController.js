// Importing the BusinessObject model
const BusinessObject = require('../models/businessObject');

// A utility function to handle API responses.
// Sends either a success response with data or an error message.
const handleResponse = (res, success, data, errorMessage = null) => {
    const status = success ? 200 : 500;
    const response = success ? { success, data } : { success, error: errorMessage };
    res.status(status).json(response);
};

// Add a new business object to the database.
// On success, the created object is returned.
exports.addobject = async (req, res) => {
    try {
        console.log(req);
        const newObject = await BusinessObject.create(req.body);
        handleResponse(res, true, newObject);
    } catch (error) {
        console.error(error);
        handleResponse(res, false, null, 'Error while adding object.');
    }
};

// Fetch all business objects from the database.
// Returns a list of objects on success.
exports.getobject = async (req, res) => {
    try {
        const objects = await BusinessObject.find();
        handleResponse(res, true, objects);
    } catch (error) {
        console.error(error);
        handleResponse(res, false, null, 'Error while retrieving objects.');
    }
};

// Update a specific business object in the database.
// On success, the updated object is returned.
exports.updateobject = async (req, res) => {
    try {
        const beaconMac = req.params.beaconMac; // Assuming you will provide beaconMac in the URL params
        
        const updatedObject = await BusinessObject.findOneAndUpdate(
            { beaconMac: beaconMac }, 
            req.body, 
            { new: true }
        );

        // Check if the object was found and updated
        if (!updatedObject) {
            return handleResponse(res, false, null, 'Object not found using the given beaconMac.');
        }

        handleResponse(res, true, updatedObject);
    } catch (error) {
        console.error(error);
        handleResponse(res, false, null, 'Error while updating object.');
    }
};


// Delete a specific business object from the database.
// Sends a success message on completion.
exports.deleteobject = async (req, res) => {
    try {
        const beaconMac = req.params.beaconMac;

        const deletedObject = await BusinessObject.findOneAndDelete({ beaconMac: beaconMac });

        // Prüfen Sie, ob das Objekt gefunden und gelöscht wurde
        if (!deletedObject) {
            return handleResponse(res, false, null, 'Objekt mit dem angegebenen beaconMac nicht gefunden.');
        }

        handleResponse(res, true, 'Objekt erfolgreich gelöscht.');
    } catch (error) {
        console.error(error);
        handleResponse(res, false, null, 'Fehler beim Löschen des Objekts.');
    }
};