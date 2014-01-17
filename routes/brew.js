var currentbrew = '';
var Equipment, Sensor, Brew, System;

function initSensors() {
	if (currentbrew != '') {
		Sensor.find({}, function(err, sensors) {
			Brew.findById(currentbrew, function(err, brew) {
				sensors.forEach(function(sensor){
					brew.sensors.push(sensor);
				});
				brew.save();
			})
		});
	} else {
		console.log('error, no current brew but init-ing sensors')
	}
}

function initEquipment() {
	if (currentbrew != '') {
		Equipment.find({}, function(err, equipments) {
			Brew.findById(currentbrew, function(err, brew) {
				equipments.forEach(function(equipment){
					brew.equipment.push(equipment);
				});
				brew.save();
			})
		});
	} else {
		console.log('error, no current brew but init-ing equipment')
	}
}

function brewProcess() {
	if (currentbrew != '') {
		System.findOne({}, function(err, system) {
			
		});
	}
}

exports.startBrew = function(data) {
	System.findOne({}, function(err, system) {
		if (err) {
			console.log("error: ",error)
		}
		if (system.currentbrewid != '') {
			Brew.findByIdAndUpdate(system.currentbrewid,{status:'Active'});
		} else {
			Brew.create({
				name: data.currentbrew,
				brewer: data.brewer,
				brewday: Date(),
				sensors: [],
				equipment: [],
				steps: [],
				status: 'Active',
				previous: [],
				temperatureminute: [],
				temperaturesecond: [],
				dataequipment: []
			},function(err,newbrew){
				if (err) {
					console.log('error:',err);
				} else {
					console.log('Created new brew, active');
					console.log('newbrew id:',newbrew._id)
					system.currentbrewid = newbrew._id;
					system.save();
					currentbrew = newbrew._id;
					//initialize sensor list
					initSensors();
					//initialize equipment list
					initEquipment();
				}
			});
		}
	});
}

exports.stopBrew = function() {
	if (currentbrew != '') {
		Brew.findByIdAndUpdate(currentbrew, {state:0},function(err, brew) {
			currentbrew = '';
		});
	}
}

exports.initBrew = function(initBrew,initEquipment,initSensor,initSystem) {
	Equipment = initEquipment;
	Sensor = initSensor;
	Brew = initBrew;
	System = initSystem;

	System.findOne({}, function(err, system) {
		console.log('system',system)
		if (err) {
			console.log("error: ",error)
		}
		if (system.currentbrewid != '') {
			currentbrew = system.currentbrewid;
			Brew.findByIdAndUpdate(system.currentbrewid,{status:'Active'});
		}
	});

	setInterval(function(){
		brewProcess();
	},1000);
}