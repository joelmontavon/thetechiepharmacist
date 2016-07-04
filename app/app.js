var app = angular.module('app', [
  'ui.bootstrap',
  'ngSanitize', 
  'ngRoute',
  'ui.select',
  'ui.calendar', 
  'angularjs-dropdown-multiselect',
  'routes',
  'directives',
  'services',
  'controllers',
  'graphs',
  'filters'
]);
/*app.config (['$locationProvider', function ($locationProvider) {
	$locationProvider.html5Mode (true);
}]);*/
app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);