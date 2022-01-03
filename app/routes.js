var routes = angular.module('routes', []);
routes.config (['$routeProvider',
  function ($routeProvider) {
	$routeProvider.
	  when ('/', {
		templateUrl: '/thetechiepharmacist/partials/home.html'
	  }).
	  when('/pdc', {
		controller: 'controller',
		templateUrl: '/thetechiepharmacist/partials/pdc.html'
	  }).
	  when('/med', {
		controller: 'controller',
		templateUrl: '/thetechiepharmacist/partials/med.html'
	  }).
	  when('/dashboard', {
		controller: 'dashboardController',
		templateUrl: '/thetechiepharmacist/partials/dashboard.html'
	  }).
	  when('/measures', {
		controller: 'measuresController',
		templateUrl: '/thetechiepharmacist/partials/measures.html'
	  }).	  
	  when('/trends', {
		controller: 'trendsController',
		templateUrl: '/thetechiepharmacist/partials/trends.html'
	  }).
	  when('/statins', {
		templateUrl: '/thetechiepharmacist/partials/statins.html'
	  }).
	  when('/google2cab125c9ebd6b0b.html', {
		templateUrl: '/google2cab125c9ebd6b0b.html'
	  }).
	  otherwise ({
		redirectTo: '/'
	  });
}]);
