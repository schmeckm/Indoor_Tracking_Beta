//MongoDB Models by API and Objects
const Beacon = require('../models/beacons');
const Gateway = require('../models/gateway');
const Rssi = require('../models/rssi');
const MedianValue = require('../models/medianValues');
const BeaconRecord = require('../models/beaconRecord');
const KalmanValues = require('../models/kalmanValues');
const Distance = require('../models/distance');
const SystemSettings = require('../models/systemSettings');
const Regression = require('../models/regressionmodel');

//Kalman Filter Module 
const { KalmanFilter } = require('kalman-filter');

//Help variable to be used 
const moment = require('moment');
const trilat = require('trilat');
const median = require('median');

// applying klaman algorithm
const applyFilters = async () => {

	// Call Standard Derviation function to get standard deviation from array
	//----------------------------------------------------------------------
	function getStandardDeviation(array) {
		const n = array.length;
		const mean = array.reduce((a, b) => a + b) / n;
		return Math.sqrt(
			array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
		);
	}
	//----------------------------------------------------------------------
	// getting system settings values to apply db stored settings
	const systemSettings = await SystemSettings.findOne({});
	//----------------------------------------------------------------------
	// getting mathematical value to be used in distance calculation
	const RegressionSettings = await Regression.findOne({});

	//Determine the last minutes, because every 2 min. rssi values are sent to Kalmann Filter
	const lastTwoMinutes = moment().subtract('2', 'minutes').utc().toDate();

	// Reading rssi values for given time to calculate distance
	const data = await Rssi.aggregate([
		{
			$match: {
				createdAt: { $gte: lastTwoMinutes },
			},
		},
		// Grouping Values by gateway/beacon which fired RSSI value to DB
		{
			$group: {
				_id: {
					gateway: '$gatewayId',
				},
				beacon: { $addToSet: '$beaconId' },
			},
		},
	]);

	// Outside Loop to interate over all gateways to prepare the input for trigulation function
	let trilatInput = data.map(async gateway => {

		// Inside Loop to interate over all beacons of the gateway
		const trilatData = gateway.beacon.map(async beacon => {

			// Finding gateway/beacons data to get the corresponding macs addresses
			const gatewayData = await Gateway.findOne({ _id: gateway._id.gateway });
			const beaconData = await Beacon.findOne({ _id: beacon });

			// Finding rssi values for every gateway/beacon combination created the last two minutes
			const rssiData = await Rssi.find({
				beaconMac: beaconData.beaconMac,
				gatewayMac: gatewayData.gatewayMac,
				createdAt: { $gte: lastTwoMinutes },
			}).select('rssi -_id');

			//Addtional Improvements here: It would be good if rssi value by BeaconMac, Gatewaym createdAT and RSSI values 
			//can be streamed by Socket.Io to enable Graphical Ilustration on Web-Frontend  

			//console.log('rssi before kalman', rssiData);

			// Observations for kalman filter


			//see Github https://github.com/piercus/kalman-filter how function need to be called
			//const observations = [0, 0.1, 0.5, 0.2, 3, 4, 2, 1, 2, 3, 5, 6];
			// this is creating a smoothing
			//const kFilter = new KalmanFilter();
			//const res = kFilter.filterAll(observations)
			// res is a list of list (for multidimensional filters)
			// [
			//   [ 0 ],
			//   [ 0.06666665555510715 ],
			//   [ 0.3374999890620582 ],
			//   [ 0.25238094852592136 ],
			//   [ 1.9509090885288296 ],
			//   [ 3.2173611101031616 ],
			//   [ 2.4649867370240965 ],
			//   [ 1.5595744679428254 ],
			//   [ 1.831772445766021 ],
			//   [ 2.5537767922925685 ],
			//   [ 4.065625882212133 ],
			//   [ 5.26113483436549 ]
			// ]

			// Prepare Kalmann Filtering data with kalman filter and same Kalman Filtered value as median in DB
			const observations = rssiData.map(r => parseInt(r.rssi));
			const kFilter = new KalmanFilter();
			// Handover Observation to Kalman Filter 
			const kalmanData = kFilter.filterAll(observations);

			const filteredValues = kalmanData.flat(1);

			//console.log('rssi after kalman', filteredValues);

			const medianValue = median(filteredValues);

			// Saving filtered values to database
			await KalmanValues.create({
				beaconMac: beaconData.beaconMac,
				gatewayMac: gatewayData.gatewayMac,
				kalmanData: filteredValues,
			});

			// Getting rssi median value stored in table medianvalues

			const rssiMedian = await MedianValue.find();

			// if (!Boolean(rssiMedian))
			// {
			// }


			//console.log('median value', rssiMedian[0].medianValue);

			//Calculating distance with the Standard formula if RSSI value exist
			//Formula to calcualte is mathematically given:
			//Distance = 10^((Measured Power - Instant RSSI)/10*N)
			//Instant RSSI = This is the RSSI calibration value when the beacon is postition "one meter from Gateway"
			//Measured Power = RSSI value after Kalman applies 
			//N= Plex Value is constant called patch lost exponent which can be adapted depending where --> Standard is = 2
			//2 for free space. 2.7 to 3.5 for urbans areas, 3-5 for suburban areas and 1.6-1.8 for indoor tracking area

			//console.log(systemSettings.plexValue)

			// var cal_d = Math.pow(10,((rss-a)/(-10*n)));

			/* 			const distance = Math.pow(
							10,
							(rssiMedian[0].medianValue - systemSettings.median === true
								? medianValue
								: filteredValues[filteredValues.length - 1]) /
							(10 * systemSettings.plexValue)
						); */

			const MachineLearning_active = systemSettings.machineLearning;
			const expRegressionConstantA = RegressionSettings.ExpRegressionConstanA;
			const expRegressionConstantB = RegressionSettings.ExpRegressionConstanB;

			if (MachineLearning_active == false) {
				rss = filteredValues[filteredValues.length - 1]
				a = rssiMedian[0].medianValue
				n = systemSettings.plexValue
				distance = Math.pow(10, ((rss - a) / (-10 * n)))
				console.log(
					rss,
					a,
					n,
					beaconData.beaconMac,
					gatewayData.gatewayMac,
					distance,
				);
			}
			else {
				//(x) = 39.1 * e^(0.131 * x)
				rss = Math.abs(filteredValues[filteredValues.length - 1])
				productA = (rss) / (expRegressionConstantB)
				product = Math.log(productA)
				distance = product / expRegressionConstantA;
				console.log(
					rss,
					expRegressionConstantB, 
					productA, 
					expRegressionConstantA,
					product,
					beaconData.beaconMac,
					gatewayData.gatewayMac,
					distance,
				);
			}



			// In addition Standard Deviation is calcualted as statistial KPIs 
			const SD = getStandardDeviation(filteredValues);

			await Distance.create({
				beaconMac: beaconData.beaconMac,
				gatewayMac: gatewayData.gatewayMac,
				distance: distance,
				deviation: SD,
			});


			const trilatObj = {
				beaconMac: beaconData.beaconMac,
				gatewayMac: gatewayData.gatewayMac,
				distance: distance,
				deviation: SD,
			};

			return trilatObj;
		});

		// Getting trilat Object and creating array for beacon distance
		const distances = await Promise.all(trilatData);

		return distances;
	});

	// Putting together and formatting distances for trilat
	trilatInput = await Promise.all(trilatInput);

	trilatInput = trilatInput.flat(1).filter(input => input);

	console.log('trilat input after kalman filter', trilatInput);

	// trilat input after kalman filter to get the following output out
	//{
	//	beaconMac: 'AC233F71C930',
	//	gatewayMac: 'AC233FC09987',
	//	distance: 0.00015399282527942898,
	//	deviation: 1.4113702496350398
	//  },
	//  {
	//	beaconMac: 'AC233F71C993',
	//	gatewayMac: 'AC233FC09987',
	//	distance: 0.002346234117116161,
	//	deviation: 3.342359238093592
	//  },

	// Getting Unique beacons to store each beacon distance according to gateway X,Y

	// Trilat Data Obj is prepared here with all values for each gateway/beacon combination to prepare 
	// Overall Data Objects for the Trigualation module function which is called later
	// This function expect here a array or object to the "beacon position out" . see below : 2.20 , 9,9

	//Simple computation of trilateration using
	//matlab's Levenberg Marquardt curve-fitting algorithm.
	// var trilat = require('trilat');
	// var input = [
	//      X     Y     D
	//	[ 0.0,  0.0, 10.0],
	//  [10.0, 10.0, 10.0],
	//  [10.0,  0.0, 14.142135]

	// var output = trilat(input);
	// [ 2.205170988086251e-7, 9.999999779478834 ]

	// D= Distance from Gateway (i) to Beacon (n)
	// X, Y = are the absolute Gateway coordinations in the room where the Gateway is located
	// The data are maintained in the Gateway settings
	// Each row stands for an Gatway (i). In our case we will use three Gatways 
	//For example Gatway 1 (X=0, Y=0 Distance 10), Gateway 2 (X=10, Y=10 distance 10) 

	const inputBeacons = trilatInput.map(input => input.beaconMac);
	const uniqueBeacon = [...new Set(inputBeacons)];

	let trilatData = uniqueBeacon.map(async beacon => {

		// Counting Gateway to only pass beacon which is present in at least three gateways
		let countGateway = 0;

		// Formatting values to prepare for trilat input. In this section X,Y position from Gateway
		const inputData = trilatInput.map(async input => {
			if (beacon === input.beaconMac) {
				countGateway++;
				const gateway = await Gateway.findOne({
					gatewayMac: input.gatewayMac,
				});
				return [gateway.gatewayX, gateway.gatewayY, input.distance];
			}

		});


		// Checking if beacon was screened and presented at least by three gateways
		if (countGateway >= 3) {
			let input = await Promise.all(inputData);
			input = input.filter(input => input);
			//console.log(input);
			return input;
		} else {
			return;
		}
	});

	trilatData = await Promise.all(trilatData);

	const output = trilatData.map(data => trilat(data));

	// Here we interate and read the position from the output file out
	output.forEach(async (output, index) => {
		await BeaconRecord.create({
			beaconMac: uniqueBeacon[index],
			positionX: output[0],
			positionY: output[1],
		});
	});
	return output;
	//	}
};

module.exports = applyFilters;
