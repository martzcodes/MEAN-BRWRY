// Controller for Main Page

function BrewCtrl($scope,socket) {
	var tempout = "";

	socket.on('tempout', function (data) {
	$scope.temperatures = data.tempout;
	var tempObj = {time:Date.parse(data.tempout[0].date),value:data.tempout[0].value,name:data.tempout[0].name};
	if (!$scope.temperaturehistory) {
		$scope.temperaturehistory = [tempObj];
	} else {
		$scope.temperaturehistory.push(tempObj);
	}
	});

	socket.on('checksensors', function (data) {
		$scope.checksensors = data.checksensors;
	});

	socket.on('allowablepins', function (data) {
		$scope.allowablepins = data.allowablepins;
	});

	socket.on('gpiopinout', function (data) {
		$scope.gpioPins = data.gpiopinout;
	});

	$scope.toggleGPIO = function(gpioPin) {
	  	//console.log('toggled in ctrler',gpioPin);
	  	socket.emit('send:toggleGPIO', gpioPin);
	}

	$scope.toggleAllGPIO = function() {
	  	//console.log('toggled in ctrler',gpioPin);
	  	socket.emit('send:toggleAllGPIO');
	}
}

// Controller for Setup

function BrewSetupCtrl($scope, socket){
  socket.on('tempout', function (data) {
    $scope.temperatures = data.tempout;
  });

  socket.on('checksensors', function (data) {
    $scope.checksensors = data.checksensors;
  });

  socket.on('gpiopinout', function (data) {
  	$scope.gpioPins = data.gpiopinout;
  });

  $scope.updateSensor = function(sensor) {
  	socket.emit('send:updateSensor', sensor);
  }
  $scope.updateGPIO = function(gpioPin) {
  	//console.log('toggled in ctrler',gpioPin);
  	socket.emit('send:updateGPIO', gpioPin);
  }
  $scope.updateAllGPIO = function(gpioPins) {
  	//console.log('toggled in ctrler',gpioPin);
  	socket.emit('send:updateAllGPIO', gpioPins);
  }
  $scope.removeGPIO = function(gpioPin) {
  	//console.log('toggled in ctrler',gpioPin);
  	socket.emit('send:removeGPIO', gpioPin);
  }
}
/*
// Controller for Brew List
function RecipeListCtrl($scope,Recipe) {
	$scope.recipes = Recipe.query();
}

// Controller for New Brew
function RecipeNewCtrl($scope,$location,Recipe) {
	$scope.recipe = {
		name: '',
		brewer: '',
		brewday: '',
		sensors: [{text: ''}],
		equipment: [{text: ''}],
		steps: [{text: ''}],
		status: '',
		previous: []
	};
	$scope.addSensor = function() {
		$scope.recipe.sensors.push({ text: '' });
	};
	$scope.addEquipment = function() {
		$scope.recipe.equipment.push({ text: '' });
	};

	$scope.createRecipe = function() {
		var recipe = $scope.recipe;
		
		// Check that a question was provided
		if(recipe.name.length > 0 && recipe.sensors.length > 0 && recipe.equipment.length > 0) {
			// Create a new poll from the model
			var newRecipe = new Recipe(recipe);
			
			// Call API to save poll to the database
			newRecipe.$save(function(p, resp) {
				if(!p.error) {
					// If there is no error, redirect to the main view
					$location.path('new');
				} else {
					alert('Could not create recipe');
				}
			});
		} else {
			alert('You must enter a name, have one sensor and one piece of equipment');
		}
	};
}

// Controller for Brew Item
function RecipeItemCtrl($scope,$routeParams,Recipe) {

}

// Controller for History List
function HistoryListCtrl($scope,History) {
	$scope.histories = History.query();
}

// Controller for History Item
function HistoryItemCtrl($scope,$routeParams,History) {

}

*/