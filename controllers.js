var controllers = angular.module('controllers', []);
controllers.controller('controller', function($scope, $filter, $timeout, _, pdcService, eligService, drugsService, dataService, graphService) {
  $scope.toDate = Date.getWithDaysFromEpoch;
  $scope.drugsService = drugsService;
  $scope.helpData = dataService;
  
  $scope.fromDt = Date.getWithOffsetForTimezone('2015-01-01');
  $scope.thruDt = Date.getWithOffsetForTimezone('2015-12-31');
  $scope.dob = Date.getWithOffsetForTimezone('1997-12-31');
  $scope.elig = [];
  $scope.claims = [];
  $scope.display = 1;
  
  var measures = [{id:'Diabetes Medications', label:'Diabetes Medications'}, {id:'Renin Angiotensin System (RAS) Antagonists', label:'Renin Angiotensin System (RAS) Antagonists'}, {id:'Statin Medications', label:'Statin Medications'}];
  var eligCtr = 1000;
  var claimsCtr = 1000; 
  
	$scope.measures = {
    options: measures,
    model: _.clone(measures[0]),
    settings: {
      smartButtonMaxItems: 1,
      enableSearch: true,
      scrollableHeight: '300px',
      scrollable: true,
      selectionLimit: 1
    },
    events: {
      onItemSelect: function() {
        $scope.claimChanged();
      }
    }
	};
  
  $scope.eligChanged = function () {
    $timeout (function () {
      $scope.fromNbr = eligService.fromDate($scope.elig, $scope.fromDt.getDaysFromEpoch());
      $scope.thruNbr = eligService.thruDate($scope.elig, $scope.thruDt.getDaysFromEpoch());
      $scope.from = Date.getWithDaysFromEpoch($scope.fromNbr);
      $scope.thru = Date.getWithDaysFromEpoch($scope.thruNbr);
      var dates = eligService.eligDates($scope.elig);
      $scope.gap = eligService.gap(dates, $scope.fromNbr, $scope.thruNbr);
    })
  };
  
  $scope.addElig = function () {
    eligCtr += 1;
    $scope.elig.push({
      seq: eligCtr.toString().substr(1,3),
      from: Date.getWithOffsetForTimezone('2015-01-01'),
      thru: Date.getWithOffsetForTimezone('2015-12-31')
    });
    $scope.eligChanged();
  };
  
  $scope.removeElig = function (date) {
    if ($scope.elig.length > 1) {
      var index = $scope.elig.indexOf(date)
      $scope.elig.splice(index, 1);   
      $scope.eligChanged();
    }
  };
  
  $scope.addElig();
  
	$scope.drugs = {
    options: drugsService.getDrugs($scope.measures.model.id),
    settings: {
      smartButtonMaxItems: 1,
      enableSearch: true,
      scrollableHeight: '300px',
      scrollable: true,
      selectionLimit: 1
    },
    events: {
      onItemSelect: function() {
        $scope.claimChanged();
      }
    }
	};
    
  $scope.claimChanged = function () {
    $timeout (function () {
      $scope.adherence = pdcService.adherence($scope.claims, $scope.fromNbr, $scope.thruNbr);
      $scope.graph = graphService.graph($scope.adherence, $scope.fromNbr, $scope.thruNbr, $scope.display);
      //console.log($scope.adherence);
    });
  };
  
  $scope.addClaim = function() {
    claimsCtr += 1;
    $scope.claims.push({
      number: claimsCtr.toString().substr(1,3),
      drug: _.clone($scope.drugs.options[0]),
      dateOfFill: Date.getWithOffsetForTimezone(),
      daysSupply: 30
    });
    $scope.claimChanged();
  };
  
  $scope.removeClaim = function (claim) {
    if ($scope.claims.length > 1) {
      var index = $scope.claims.indexOf(claim)
      $scope.claims.splice(index, 1);   
      $scope.claimChanged();
    }
  };
  
  $scope.clearClaims = function () {
    $scope.drugs.options = drugsService.getDrugs($scope.measures.model.id);
    $scope.claims = [];
    claimsCtr = 1000;
    $scope.addClaim();      
  };

  $scope.clearClaims();
  
  $scope.$watch ('display', function () {
    $timeout(function () { 
      $scope.graph = graphService.graph($scope.adherence, $scope.fromNbr, $scope.thruNbr, $scope.display);
    });
  });
});