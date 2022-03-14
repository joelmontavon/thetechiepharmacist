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
	  when('/statins', {
		templateUrl: '/partials/statins.html'
	  }).
    when('/icd10', {
		templateUrl: '/partials/icd10.html'
	  }).
    when('/risk-adj', {
		templateUrl: '/partials/risk-adj.html'
	  }).
    when('/cutpoints', {
		templateUrl: '/partials/cutpoints.html'
	  }).
    when('/pdc-sas', {
		templateUrl: '/partials/pdc-sas.html'
	  }).
    when('/mat', {
		templateUrl: '/partials/mat.html'
	  }).
    when('/star-ratings-trends', {
		templateUrl: '/partials/star-ratings-trends.html'
	  }).
    when('/cql-camp', {
		templateUrl: '/partials/cql-camp.html'
	  }).
	  when('/google2cab125c9ebd6b0b.html', {
		templateUrl: '/google2cab125c9ebd6b0b.html'
	  }).
	  otherwise ({
		redirectTo: '/'
	  });
}]);
