var currentbrew = '';
var model, control, socket;


function initSensors() {
	if (currentbrew != '') {
		model.sensor.find({}, function(err, sensors) {
			model.brew.findById(currentbrew, function(err, brew) {
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
		model.equipment.find({}, function(err, equipments) {
			model.brew.findById(currentbrew, function(err, brew) {
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

function brewSecond() {
	if (currentbrew != '') {
		var sensorObj = {
			time:Date(),
			sensors:[]
		};

		model.sensor.find({},function(err,sensors){
			sensors.forEach(function(sensor){
				sensorObj.sensors.push({
					address:sensor.address,
					value:sensor.value
				})
			})
		});

		model.brew.findById(currentbrew, function(err, brew) {
			var popLength = brew.temperaturesecond.length - 120;
			if (popLength > 0) {
				for (var i=0;i<popLength;i++) {
					brew.temperaturesecond.pop(0);
				}
			}
			brew.temperaturesecond.push(sensorObj);
			brew.save();
		});
	}
}

function brewMinute() {
	if (currentbrew != '') {
		var secondData;
		var sensorObj = {
			time:Date(),
			sensors:[]
		}
		var minuteData = {};
		var minuteLength;
		model.brew.findById(currentbrew, function(err, brew) {
			secondData = brew.temperaturesecond.slice(-1-60);
			minuteLength = secondData.length;
			secondData.forEach(function(second){
				second.forEach(function(sensor){
					if(isNaN(minuteData[sensor.address])){
						minuteData[sensor.address] = sensor.value;
					} else {
						minuteData[sensor.address] = minuteData[sensor.address] + sensor.value;
					}
				})
			})
			//minuteData.forEach
		})
	}
}

exports.equipmentLog = function(data) {
	if (currentbrew != '') {
		var equipmentObj = {
			time:Date(),
			equipment:[]
		}
		data.forEach(function(equipment){
			equipmentObj.equipment.push({
				address:equipment.address,
				value:equipment.value
			})
		})
		model.brew.findById(currentbrew, function(err, brew) {
			brew.dataequipment.push(equipmentObj);
			brew.save();
		});
	}
}

exports.startBrew = function(data) {
	model.system.findOne({}, function(err, system) {
		if (err) {
			console.log("error: ",error)
		}
		if (system.currentbrewid != '') {
			model.brew.findByIdAndUpdate(system.currentbrewid,{status:'Active'});
		} else {
			model.brew.create({
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
		model.brew.findByIdAndUpdate(currentbrew, {state:0},function(err, brew) {
			currentbrew = '';
		});
	}
}

exports.initBrew = function(initBrew,initEquipment,initSensor,initSystem) {
	model = {
		system:initSystem,
		sensor:initSensor,
		equipment:initEquipment,
		brew:initBrew
	};

	model.system.findOne({}, function(err, system) {
		if (err) {
			console.log("error: ",error)
		}
		if (system.currentbrewid != '') {
			currentbrew = system.currentbrewid;
			model.brew.findByIdAndUpdate(system.currentbrewid,{status:'Active'});
		}
	});

	setInterval(function(){
		brewSecond();
	},1000);
	setTimeout(function(){
		setInterval(function(){
			brewMinute();
		},60000);
	},60000);
}