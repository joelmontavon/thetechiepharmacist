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
    when('/icd10', {
		templateUrl: '/thetechiepharmacist/partials/icd10.html'
	  }).
    when('/risk-adj', {
		templateUrl: '/thetechiepharmacist/partials/risk-adj.html'
	  }).
    when('/cutpoints', {
		templateUrl: '/thetechiepharmacist/partials/cutpoints.html'
	  }).
    when('/pdc-sas', {
		templateUrl: '/thetechiepharmacist/partials/pdc-sas.html'
	  }).
    when('/mat', {
		templateUrl: '/thetechiepharmacist/partials/mat.html'
	  }).
    when('/stars-trends', {
		templateUrl: '/thetechiepharmacist/partials/stars-trends.html'
	  }).
	  when('/google2cab125c9ebd6b0b.html', {
		templateUrl: '/google2cab125c9ebd6b0b.html'
	  }).
	  otherwise ({
		redirectTo: '/'
	  });
}]);
