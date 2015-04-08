var routes = angular.module('routes', []);
routes.config (['$routeProvider',
  function ($routeProvider) {
	$routeProvider.
	  when ('/', {
		templateUrl: '/partials/home.html'
	  }).
	  when('/pdc', {
		controller: 'controller',
		templateUrl: '/partials/pdc.html'
	  }).
	  when('/med', {
		controller: 'controller',
		templateUrl: '/partials/med.html'
	  }).
	  when('/dashboard', {
		controller: 'dashboardController',
		templateUrl: '/partials/dashboard.html'
	  }).
	  when('/measures', {
		controller: 'measuresController',
		templateUrl: '/partials/measures.html'
	  }).	  
	  when('/trends', {
		controller: 'trendsController',
		templateUrl: '/partials/trends.html'
	  }).
	  when('/google2cab125c9ebd6b0b.html', {
		templateUrl: '/google2cab125c9ebd6b0b.html'
	  }).
	  otherwise ({
		redirectTo: '/'
	  });
}]);