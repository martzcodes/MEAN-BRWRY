var sense = require('ds18b20');

//var initdate = '';
//var tempSensors = [{sensor:"28-000003cb5b7c",calibration:0,value:-1,lastValue:-1,date:initdate,active:1}];

exports.checkSensors =function(socket,Sensor){
	sense.sensors(function(err, ids) {
		ids.forEach(function(sensor){
			Sensor.find({address:sensor},function (err, sensors) {
				if (err) {
					console.log("error: ",error)
				}
				if (sensors.length == 0) {
					Sensor.create({
						name: 'unnamed', //Name
						type: 'Temperature', //Normally temperature (don't want to prevent using other types of senors), not used
						address: sensor, //addressed used to get readings
						location: 'No Where', //description of where this is placed in the brewing process
						calibration: 0, //Calibration number (if the sensor is off by a set amount)
						value: -1, //current reading
						date: Date(), //time of current reading
						lastValue: -1, //last reading
						active: 1, //Is it being used?
						linked: []  //Is it linked to anything else (PID control of something)
					});
					console.log('Created sensor',sensor,'!')
				}
			})
		});
	});
//	setTimeout(function(){
		Sensor.find({},function (err, sensors) {
			//console.log('Mongo Sensors: ',sensors)
			if (socket) socket.emit('checksensors', {'checksensors': sensors});
		});
//	},1000)
}

exports.checkTemp = function(socket,Sensor){
	Sensor.find({},function(err, sensors) {
		sensors.forEach(function(tempSensor) {
			sense.temperature(tempSensor.address, function(err, value) {
				var newReading = value+tempSensor.calibration;
				Sensor.update({address:tempSensor.address},{lastValue:tempSensor.value,
					value:newReading,date:Date()},function (err, numberAffected, raw) {
  					if (err) console.log('Error:',err);
//  					console.log('The raw response from Mongo was ', raw);
				});
			});                
		})
	});
//	setTimeout(function(){
		Sensor.find({},function(err,sensors){
			if (socket) socket.emit('tempout', {'tempout': sensors});
			//console.log('tempout:',sensors);
		})
		//return sensors;
//	},1000)
}