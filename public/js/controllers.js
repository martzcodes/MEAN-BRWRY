// Controller for Main Page

function BrewCtrl($scope,socket) {
	var tempout = "";
	//$scope.brwry = "asdf";
	//$scope.brwry.tempout = "asdf";
	
  socket.on('tempout', function (data) {
    $scope.temperatures = data.tempout;
  });

  socket.on('allowablepins', function (data) {
  	$scope.allowablepins = data.allowablepins;
  })

  socket.on('checksensors', function (data) {
    $scope.checksensors = data.checksensors;
  });

  socket.on('gpiopinout', function (data) {
  	$scope.gpioPins = data.gpiopinout;
  });

  socket.on('send:toggleGPIO', function(data){
  	//console.log('toggled from send:toggle');
  });

  socket.on('send:updateGPIO', function(data){
  	//console.log('toggled from send:toggle');
  });

  $scope.toggleGPIO = function(gpioPin) {
  	//console.log('toggled in ctrler',gpioPin);
  	socket.emit('send:toggleGPIO', gpioPin);
  }

  $scope.updateGPIO = function(gpioPin) {
  	//console.log('toggled in ctrler',gpioPin);
  	socket.emit('send:updateGPIO', gpioPin);
  }
  $scope.removeGPIO = function(gpioPin) {
  	//console.log('toggled in ctrler',gpioPin);
  	socket.emit('send:removeGPIO', gpioPin);
  }

  $scope.updateSensor = function(sensor) {
  	socket.emit('send:updateSensor', sensor);
  }

	//$scope.brwry.temperature = temperatureout;
}

// Controller for Setup
/*
function BrewSetupCtrl($scope, socket){
	socket.on('setup', function(data) {
		$scope.sensors = data.sensors;
		$scope.equipment = data.equipment;
	});

	$scope.update = function() {
		var updateObj = { sensors: sensors, equipment: equipment };
		socket.emit('update:setup', updateObj);
	};
}

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