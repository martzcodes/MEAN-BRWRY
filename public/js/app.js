//Angular module, defining routes for the app
angular.module('brwry', ['brwryServices']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', { templateUrl: 'partials/main.html', controller: BrewCtrl })
			.when('/setup', { templateUrl: 'partials/setup.html', controller: BrewSetupCtrl })
//			.when('/recipe', { templateUrl: 'partials/main.html', controller: RecipeListCtrl })
//			.when('/recipe/new', { templateUrl: 'partials/main.html', controller: RecipeNewCtrl })
//			.when('/recipe/:recipeid', { templateUrl: 'partials/main.html', controller: RecipeItemCtrl })
//			.when('/history', { templateUrl: 'partials/main.html', controller: HistoryListCtrl })
//			.when('/history/:historyid', { templateUrl: 'partials/main.html', controller: HistoryItemCtrl })
			.otherwise({ redirectTo: '/' });
}]);