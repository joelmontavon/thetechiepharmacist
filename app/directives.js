var directives = angular.module('directives', []);
directives.directive('myMultiSelect', function() {
    return {
        restrict: 'A',
        //replace: true,
        scope: {
			    myMultiSelect: '=',
			    myOptions: '=',
			    myEvent: '&'
        },
        controller: function($scope) {
        	$scope.drugs = {
            options: $scope.myOptions,
            settings: {
              smartButtonMaxItems: 1,
              enableSearch: true,
              scrollableHeight: '300px',
              scrollable: true,
              selectionLimit: 1
            },
            events: {
              onItemSelect: function() {
                $scope.myEvent();
              }
            }
        	};
				},
        template: '<div ng-dropdown-multiselect="" selected-model="myMultiSelect" options="drugs.options" group-by="category" extra-settings="drugs.settings" events="drugs.events"></div>'
    };
});
directives.directive('myDatepicker', function() {
    return {
        restrict: 'A',
        //replace: true,
        scope: {
			    myDatepicker: '=',
			    myEvent: '&'
        },
        controller: function($scope) {
          $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
        
            $scope.opened = true;
          };
          $scope.changed = function() {
            $scope.myEvent();
          };
				},
        template: '<p class="input-group">' +
            '<input type="text" class="form-control" datepicker-popup="shortDate" ng-model="myDatepicker" is-open="opened" ng-change="changed()"/>' +
            '<span class="input-group-btn">' +
              '<button type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button>' +
            '</span>' +
          '</p>'
    };
});
directives.directive('myCheck', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
	    myCheck: '='
    },
    controller: function($scope) {
			$scope.$watch('myCheck', function () {
				$scope.myValue = $scope.myCheck;
			});
    },
    template: '<span ng-switch="myValue">' +
        '<span ng-switch-when="0"><span class="glyphicon glyphicon-remove-sign"></span></span>' +
        '<span ng-switch-default><span class="glyphicon glyphicon-ok-sign"></span></span>' +
      '</span>'
  };
});
directives.directive('myExclamationMark', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
	    myExclamationMark: '='
    },
    controller: function($scope) {
			$scope.$watch('myExclamationMark', function () {
				$scope.myValue = $scope.myExclamationMark;
			});
    },
    template: '<span ng-switch="myValue">' +
        '<span ng-switch-when="true"><span class="glyphicon glyphicon-exclamation-sign"></span></span>' +
      '</span>'
  };
});
directives.directive('myNewCheck', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
	    myNewCheck: '='
    },
    controller: function($scope) {
			$scope.$watch('myNewCheck', function () {
				$scope.myValue = $scope.myNewCheck;
			});
    },
    template: '<span ng-switch="myValue">' +
        '<span ng-switch-when="false"><span class="glyphicon glyphicon-remove"></span></span>' +
        '<span ng-switch-default><span class="glyphicon glyphicon-ok"></span></span>' +
      '</span>'
  };
});
directives.directive('myGauge', function factory() {
    return {
        restrict: 'A',
        scope: {
			      myGauge: '@',
            myValue: '@'
        },
        link: function postLink(scope, elem, attrs) {
    			var options = {
    				bindto: elem[0],
    				data: {
    					columns: [
    						['data', 0]
    					],
    					type: 'gauge',
    				},
    				color: {
    					pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'],
    					threshold: {
    						max: 100,
    						values: [60, 70, 80, 90]
    					}
    				},
    				tooltip: {
    					show: false
    				}
    			};
    			var chart = c3.generate(options);
    			scope.$watch('myValue', function() {
    				if (scope.myValue) {
    					chart.load({
    						columns: [['data', scope.myValue]]
    					});
    				}
    			});
        }
    };
});
directives.directive('myStars', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
			myStars: '='
        },
        controller: function($scope) {
			$scope.$watch('myStars', function () {
				$scope.myModel = $scope.myStars;
			});
        },
        template: '<td ng-switch="myModel" ng-class="color(myModel)">' +
            '<div ng-switch-when="1"><div rating ng-model="myModel" max="myModel" readonly="true"></div></div>' +
            '<div ng-switch-when="2"><div rating ng-model="myModel" max="myModel" readonly="true"></div></div>' +
            '<div ng-switch-when="3"><div rating ng-model="myModel" max="myModel" readonly="true"></div></div>' +
            '<div ng-switch-when="4"><div rating ng-model="myModel" max="myModel" readonly="true"></div></div>' +
            '<div ng-switch-when="5"><div rating ng-model="myModel" max="myModel" readonly="true"></div></div>' +
            '<div ng-switch-default>N/A</div>' +
            '</td>'
    };
});directives.directive('myChart', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        //replace: true,
        scope: {
			myChart: '='
        },
        link: function postLink(scope, elem) {
			scope.$watch('myChart', function () {
				$timeout( function () {
					if (scope.myChart) {
						scope.myChart.bindto = elem[0];
						c3.generate(scope.myChart);
					}
				});
			});
        },
        template: '<div></div>'
    };
}]);