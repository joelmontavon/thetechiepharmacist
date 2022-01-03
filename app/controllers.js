var controllers = angular.module('controllers', []);
controllers.controller('controller', function($scope, $filter, $timeout, $location, _, pdcService, eligService, drugsService, opioidsService, graphService, graphs) {
	$scope.toDate = Date.getWithDaysFromEpoch;
	$scope.drugsService = drugsService;

	$scope.fromDt = Date.getWithOffsetForTimezone('2016-01-01');
	$scope.thruDt = Date.getWithOffsetForTimezone('2016-12-31');
	$scope.dob = Date.getWithOffsetForTimezone('1997-12-31');
	$scope.elig = [];
	$scope.claims = [];
	$scope.eventSources = [];
	$scope.display = 1;
  
	drugsService.getDrugs().then(function (data) {
		$scope.drugs = data;
		$scope.clearElig();
		$scope.clearClaims();
	});
  
	var measures = [{id:'A10B', label:'Diabetes Medications'}, {id:'C09', label:'Renin Angiotensin System (RAS) Antagonists'}, {id:'C10AA', label:'Statin Medications'}];
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
			$scope.claimChanged();
		})
	};
  
	$scope.addElig = function () {
		eligCtr += 1;
		$scope.elig.push({
			seq: eligCtr.toString().substr(1,3),
			from: Date.getWithOffsetForTimezone('2016-01-01'),
			thru: Date.getWithOffsetForTimezone('2016-12-31')
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
  
	$scope.clearElig = function () {
		$scope.elig = [];
		eligCtr = 1000;
		$scope.addElig();      
	};
	
	$scope.drugSelected = function(claim) {
		drugsService.getDrugInfo(claim.drug.rxcui)
			.then(function (data) {
				claim.drug = data;
			}).then(function () {
				$scope.claimChanged();
			});
	};
    
	$scope.claimChanged = function () {
		$timeout (function () {
			if ($scope.claims.length) {
				if ($scope.type == 'pdc') {
					$scope.adherence = pdcService.adherence($scope.claims, $scope.fromNbr, $scope.thruNbr, [$scope.measures.model.id]);
					//console.log($scope.adherence);
					$scope.graph = graphService.pdcGraph($scope.adherence, $scope.fromNbr, $scope.thruNbr, $scope.display);
					graphs($scope.adherence.calendar, $scope.from, $scope.thru);
				} else if ($scope.type == 'med') {
					$scope.opioids = opioidsService.opioids($scope.claims, $scope.fromNbr, $scope.thruNbr);
					$scope.graph = graphService.opioidGraph($scope.opioids, $scope.fromNbr, $scope.thruNbr, $scope.display);
				}
			}
		});
	};
  
	$scope.addClaim = function() {
		claimsCtr += 1;
		var claim = {
			number: claimsCtr.toString().substr(1,3),
			drug: _.clone($scope.drugs[0]),
			selected: {},
			dateOfFill: Date.getWithOffsetForTimezone(),
			qty: 30,
			daysSupply: 30,
			md: '1234567890',
			pharm: '1234567890'
		};
		$scope.drugSelected(claim);
		$scope.claims.push(claim);
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

	var demos = [{
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-02T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-03T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-06T06:00:00.000Z","dateOfLastDose":"2016-04-04T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-03T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-05T05:00:00.000Z","dateOfLastDose":"2016-05-04T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-05T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-05T05:00:00.000Z","dateOfLastDose":"2016-06-03T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-05T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-04T05:00:00.000Z","dateOfLastDose":"2016-07-03T05:00:00.000Z"}], //[{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-02T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-08T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-08T06:00:00.000Z","dateOfLastDose":"2016-04-06T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-03T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-07T05:00:00.000Z","dateOfLastDose":"2016-05-06T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-09T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-09T05:00:00.000Z","dateOfLastDose":"2016-06-07T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-05T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-08T05:00:00.000Z","dateOfLastDose":"2016-07-07T05:00:00.000Z"}],
		id: 0,
		label: 'Consistent',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-10T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-10T06:00:00.000Z","dateOfLastDose":"2016-03-10T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-06T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-11T06:00:00.000Z","dateOfLastDose":"2016-04-09T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-17T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-16T05:00:00.000Z","dateOfLastDose":"2016-05-15T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-21T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-20T05:00:00.000Z","dateOfLastDose":"2016-06-18T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-09T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-19T05:00:00.000Z","dateOfLastDose":"2016-07-18T05:00:00.000Z"}],		id: 1,
		label: 'Inconsistent',
		id: 1,
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-14T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-14T06:00:00.000Z","dateOfLastDose":"2016-03-14T05:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-20T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-20T05:00:00.000Z","dateOfLastDose":"2016-04-18T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-29T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-29T05:00:00.000Z","dateOfLastDose":"2016-05-28T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-06-11T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-06-11T05:00:00.000Z","dateOfLastDose":"2016-07-10T05:00:00.000Z"}], //[{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-14T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-14T06:00:00.000Z","dateOfLastDose":"2016-03-14T05:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-06T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-15T05:00:00.000Z","dateOfLastDose":"2016-04-13T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-23T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-22T05:00:00.000Z","dateOfLastDose":"2016-05-21T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-06-01T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-31T05:00:00.000Z","dateOfLastDose":"2016-06-29T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-28T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-30T05:00:00.000Z","dateOfLastDose":"2016-07-29T05:00:00.000Z"}],
		id: 2,
		label: 'Highly inconsistent',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-02T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-23T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-23T05:00:00.000Z","dateOfLastDose":"2016-04-21T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-19T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-22T05:00:00.000Z","dateOfLastDose":"2016-05-21T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-06-11T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-06-11T05:00:00.000Z","dateOfLastDose":"2016-07-10T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-07-04T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-07-07T05:00:00.000Z","dateOfLastDose":"2016-08-05T05:00:00.000Z"}], //[{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-22T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-22T06:00:00.000Z","dateOfLastDose":"2016-03-22T05:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-24T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-23T05:00:00.000Z","dateOfLastDose":"2016-04-21T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-25T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-24T05:00:00.000Z","dateOfLastDose":"2016-05-23T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-06-11T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-06-10T05:00:00.000Z","dateOfLastDose":"2016-07-09T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-07-04T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-07-07T05:00:00.000Z","dateOfLastDose":"2016-08-05T05:00:00.000Z"}],
		id: 3,
		label: 'Several gaps',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-05T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-09T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-09T05:00:00.000Z","dateOfLastDose":"2016-05-08T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-05T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-09T05:00:00.000Z","dateOfLastDose":"2016-06-07T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-09T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-08T05:00:00.000Z","dateOfLastDose":"2016-07-07T05:00:00.000Z"}], //[{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-05T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-09T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-08T05:00:00.000Z","dateOfLastDose":"2016-05-07T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-05T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-08T05:00:00.000Z","dateOfLastDose":"2016-06-06T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-13T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-12T05:00:00.000Z","dateOfLastDose":"2016-07-11T05:00:00.000Z"}],
		id: 4,
		label: 'Significant gap(s)',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-05T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-06T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-06T06:00:00.000Z","dateOfLastDose":"2016-04-04T05:00:00.000Z"}], //[{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-10T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-10T06:00:00.000Z","dateOfLastDose":"2016-03-10T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-06T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-11T06:00:00.000Z","dateOfLastDose":"2016-04-09T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-17T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-16T05:00:00.000Z","dateOfLastDose":"2016-05-15T05:00:00.000Z"}],
		id: 5,
		label: 'Discontinued',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-05T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-09T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-08T05:00:00.000Z","dateOfLastDose":"2016-05-07T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-14T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-13T05:00:00.000Z","dateOfLastDose":"2016-06-11T05:00:00.000Z"},{"number":"006","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"selected":{},"dateOfFill":"2016-06-14T01:10:33.430Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"0QW","dateOfFillAdj":"2016-06-13T05:00:00.000Z","dateOfLastDose":"2016-07-12T05:00:00.000Z"}],
		id: 6,
		label: 'Upward trend',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-02-03T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-11T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-11T06:00:00.000Z","dateOfLastDose":"2016-04-09T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-04-17T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-04-16T05:00:00.000Z","dateOfLastDose":"2016-05-15T05:00:00.000Z"},{"number":"005","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-05-27T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05R","dateOfFillAdj":"2016-05-26T05:00:00.000Z","dateOfLastDose":"2016-06-24T05:00:00.000Z"}],
		id: 7,
		label: 'Downward trend',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [{"number":"001","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-06T06:00:00.000Z","qty":30,"daysSupply":30,"md":"1234567890","pharm":"1234567890","$$hashKey":"05N","dateOfFillAdj":"2016-01-06T06:00:00.000Z","dateOfLastDose":"2016-02-04T06:00:00.000Z"},{"number":"002","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 10 MG Oral Tablet","fullGenericName":"Lisinopril 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314076","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316151","name":"Lisinopril 10 MG","strength":10,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-01-31T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05O","dateOfFillAdj":"2016-02-05T06:00:00.000Z","dateOfLastDose":"2016-03-05T06:00:00.000Z"},{"number":"003","drug":{"brandName":"","displayName":"Lisinopril (Oral Pill)","synonym":"","fullName":"Lisinopril 20 MG Oral Tablet","fullGenericName":"Lisinopril 20 MG Oral Tablet","strength":"20 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"314077","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"316153","name":"Lisinopril 20 MG","strength":20,"uom":"MG","ingredient":"Lisinopril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-03T06:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05P","dateOfFillAdj":"2016-03-06T06:00:00.000Z","dateOfLastDose":"2016-04-04T05:00:00.000Z"},{"number":"004","drug":{"brandName":"","displayName":"Benazepril (Oral Pill)","synonym":"BZP","fullName":"Benazepril hydrochloride 10 MG Oral Tablet","fullGenericName":"Benazepril hydrochloride 10 MG Oral Tablet","strength":"10 mg","rxtermsDoseForm":"Tab","route":"Oral Pill","termType":"SCD","rxcui":"898687","genericRxcui":"0","rxnormDoseForm":"Oral Tablet","suppress":"","brand":false,"components":[{"rxcui":"898349","name":"Benazepril hydrochloride 10 MG","strength":10,"uom":"MG","ingredient":"benazepril","classes":[{"id":"C09AA","name":"ACE inhibitors, plain"}]}]},"dateOfFill":"2016-03-22T05:00:00.000Z","qty":30,"daysSupply":30,"$$hashKey":"05Q","dateOfFillAdj":"2016-03-22T05:00:00.000Z","dateOfLastDose":"2016-04-20T05:00:00.000Z"}],
		id: 8,
		label: 'Overlapping fills',
		measure: {
			id: 'C09'
		}
	}, {
		claims: [],
		id: 9,
		label: 'User-defined',
		measure: {
			id: 'C09'
		}
	}];
	
	$scope.demos = {
		options: demos,
		model: _.clone(demos[9]),
		settings: {
		  smartButtonMaxItems: 1,
		  enableSearch: true,
		  scrollableHeight: '300px',
		  scrollable: true,
		  selectionLimit: 1
		},
		events: {
		  onItemSelect: function() {
			selectDemo();
		  }
		}
	};
	
	var selectDemo = function () {
		$scope.elig = [
			{seq: '001', from: Date.getWithOffsetForTimezone('2016-01-01'), thru: Date.getWithOffsetForTimezone($scope.demos.model.id == 8 ? '2016-04-30' : '2016-06-30')}
		];
		eligCtr = 1001;
		$scope.eligChanged();
		$scope.measures.model = demos[$scope.demos.model.id].measure;
		demos[$scope.demos.model.id].claims.forEach(function (claim) {
			claim.dateOfFill = new Date(claim.dateOfFill);
		});
		$scope.claims = demos[$scope.demos.model.id].claims;
		claimsCtr = 1000 + demos[$scope.demos.model.id].claims.length;
		$timeout( function () {
		  $scope.claimChanged();
		});
	};
  
	$scope.$watch ('display', function () {
		$timeout(function () { 
			if ($scope.type == 'pdc') {
				if ($scope.adherence)
					$scope.graph = graphService.pdcGraph($scope.adherence, $scope.fromNbr, $scope.thruNbr, $scope.display);
			} else if ($scope.type == 'med') {
				if ($scope.opioids)
					$scope.graph = graphService.opioidGraph($scope.opioids, $scope.fromNbr, $scope.thruNbr, $scope.display);
			}
		});
	}, true);
  
	var load = $scope.$on('$routeChangeSuccess', function() {
		$scope.type = $location.url().split('/')[1];
		load();
	});
});
controllers.controller('dashboardController', function($scope, $http, $q, $modal, pivot, stars, statsService) {
	$scope.measureStars = stars.measureStars;
	$scope.displayThresholds = stars.displayThresholds;
	$scope.summaryStars = stars.summaryStars;
	$scope.iFactor = stars.iFactor;
	
	$scope.view = 'Contract';
	$scope.selected1 = {
		year: null,
		contracts: [],
		contractType: null,
		benchmark: null
	};
	$scope.selected2 = {
		year: null,
		contracts: [],
		contractType: null,
		benchmark: null
	};
	
	$q.all([
        $http.get('data/measures.json'),
        $http.get('data/scores.json'),
		$http.get('data/stars.json'),
		$http.get('data/summary.json'),
		$http.get('data/iFactor.json')
    ]).then( function (responses) {
		$scope.measuresData = responses[0].data;
		$scope.scoresData = responses[1].data;
		$scope.starsData = responses[2].data;
		$scope.summaryData = responses[3].data;
		$scope.iFactorData = responses[4].data;
		
		$scope.years = [{'yearStr':'2012','yearNbr':2012},{'yearStr':'2013','yearNbr':2013},{'yearStr':'2014','yearNbr':2014},{'yearStr':'2015','yearNbr':2015}];
		$scope.benchmarks = [
			{'contractType':'MA-PD','organizationType':'MA-PD','isOrganizationType':false},
			{'contractType':'MA-PD','organizationType':'1876 Cost','isOrganizationType':true},
			{'contractType':'MA-PD','organizationType':'Demo','isOrganizationType':true},
			{'contractType':'MA-PD','organizationType':'Local CCP','isOrganizationType':true},
			{'contractType':'MA-PD','organizationType':'MSA','isOrganizationType':true},
			{'contractType':'MA-PD','organizationType':'PFFS','isOrganizationType':true},
			{'contractType':'MA-PD','organizationType':'Regional CCP','isOrganizationType':true},
			{'contractType':'PDP','organizationType':'PDP','isOrganizationType':false},
			{'contractType':'PDP','organizationType':'Employer/Union Only Direct Contract PDP','isOrganizationType':true},
			{'contractType':'PDP','organizationType':'PDP','isOrganizationType':true}
		];
		$scope.selected1.year = $scope.years[3],
		$scope.selected1.contracts.push($scope.scoresData[0]);
		$scope.selected1.contractType = 'PDP';
		$scope.selected1.benchmark = $scope.benchmarks[7];
		
		$scope.selected2.year = $scope.years[3],
		$scope.selected2.contracts.push($scope.scoresData[0]);
		$scope.selected2.contractType = 'PDP';
		$scope.selected1.benchmark = $scope.benchmarks[7];
		
		$scope.selectionChanged = function () {
			var columns = [
				{name: 'Call Center – Pharmacy Hold Time', label: 'Call Center – Pharmacy Hold Time', oper: 'avg'}, 
				{name: 'Call Center – Foreign Language Interpreter and TTY/TDD Availability', label: 'Call Center – Foreign Language Interpreter and TTY/TDD Availability', oper: 'avg'}, 
				{name: 'Appeals Auto–Forward', label: 'Appeals Auto–Forward', oper: 'avg'}, 
				{name: 'Appeals Upheld', label: 'Appeals Upheld', oper: 'avg'}, 
				{name: 'Enrollment Timeliness', label: 'Enrollment Timeliness', oper: 'avg'}, 
				{name: 'Complaints about the Drug Plan', label: 'Complaints about the Drug Plan', oper: 'avg'}, 
				{name: 'Beneficiary Access and Performance Problems', label: 'Beneficiary Access and Performance Problems', oper: 'avg'}, 
				{name: 'Members Choosing to Leave the Plan', label: 'Members Choosing to Leave the Plan', oper: 'avg'}, 
				{name: 'Drug Plan Quality Improvement', label: 'Drug Plan Quality Improvement', oper: 'avg'}, 
				{name: 'Getting Information From Drug Plan', label: 'Getting Information From Drug Plan', oper: 'avg'}, 
				{name: 'Rating of Drug Plan', label: 'Rating of Drug Plan', oper: 'avg'}, 
				{name: 'Getting Needed Prescription Drugs', label: 'Getting Needed Prescription Drugs', oper: 'avg'}, 
				{name: 'MPF Price Accuracy', label: 'MPF Price Accuracy', oper: 'avg'}, 
				{name: 'High Risk Medication', label: 'High Risk Medication', oper: 'avg'}, 
				{name: 'Diabetes Treatment', label: 'Diabetes Treatment', oper: 'avg'}, 
				{name: 'Part D Medication Adherence for Diabetes Medications', label: 'Part D Medication Adherence for Diabetes Medications', oper: 'avg'}, 
				{name: 'Part D Medication Adherence for Hypertension (RAS antagonists)', label: 'Part D Medication Adherence for Hypertension (RAS antagonists)', oper: 'avg'}, 
				{name: 'Part D Medication Adherence for Cholesterol (Statins)', label: 'Part D Medication Adherence for Cholesterol (Statins)', oper: 'avg'}
			];
			var contracts1 = _.pluck($scope.selected1.contracts, 'Contract Number');
			var contracts2 = _.pluck($scope.selected2.contracts, 'Contract Number');
			
			$scope.scores1Pivot = pivot.create()
				.from($scope.scoresData)
				.where({
					Year: $scope.selected1.year.yearNbr,
					"Contract Number": contracts1
				})
				.groupBy([])
				.select(columns)
				.toObject();
				
			$scope.stars1Pivot = pivot.create()
				.from($scope.starsData)
				.where({
					Year: $scope.selected1.year.yearNbr,
					"Contract Number": contracts1
				})
				.groupBy([])
				.select(columns)
				.toObject();
			
			var where = {};
			if ($scope.view == 'Contract') {
				where = {
					Year: $scope.selected1.year.yearNbr,
					"Contract Number": contracts2
				};
			} else if ($scope.view == 'Year') {
				where = {
					Year: $scope.selected2.year.yearNbr,
					"Contract Number": contracts1
				};
			} else if ($scope.selected1.benchmark.isOrganizationType) {
				where = {
					Year: $scope.selected1.year.yearNbr,
					'Organization Type': $scope.selected1.benchmark.organizationType 
				};
			} else {
				where = {
					Year: $scope.selected1.year.yearNbr,
					'Contract Type': $scope.selected1.benchmark.contractType
				};
			}
			
			$scope.scores2Pivot = pivot.create()
				.from($scope.scoresData)
				.where(where)
				.groupBy([])
				.select(columns)
				.toObject();
				
			$scope.stars2Pivot = pivot.create()
				.from($scope.starsData)
				.where(where)
				.groupBy([])
				.select(columns)
				.toObject();
				
			//console.log($scope.scores1Pivot, $scope.scores2Pivot, $scope.stars1Pivot, $scope.stars2Pivot);
		};
		
    $scope.openModal = function(measure) {
        var modalInstance = $modal.open({
            templateUrl: './partials/modal.html',
            controller: 'modalController',
            size: 'lg',
            resolve: {
                starsData: function() {
                    return $scope.starsData;
                },
                scoresData: function() {
                    return $scope.scoresData;
                },
                selected1: function() {
                    return $scope.selected1;
                },
                selected2: function() {
                    return $scope.selected2;
                },
				measure: function () {
					return measure;
				},
				benchmarks: function () {
					return $scope.benchmarks;
				}
            }
        });
	};
		
    $scope.openModal2 = function(measure) {
        var modalInstance = $modal.open({
            templateUrl: './partials/new-modal.html',
            controller: 'newModalController',
            size: 'lg',
            resolve: {
                contractType: function() {
                    return $scope.selected1.contractType;
                },
				measure: function () {
					return measure;
				}
            }
        });
    };
		
	$scope.rowSelected = function (measure) {
		var filtered1Data = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected1.contractType && item['Year'] == $scope.selected1.year.yearNbr;
		});
		var ranked1Data = statsService.distro(filtered1Data, measure.Measure, measure.higherIsBetter);
		var ranked1Arr = ['1'];
		for (var i = 1; i <= 5; i++) { 
			ranked1Arr.push(ranked1Data[i]['frequency']);
		}
		
		var filtered2Data = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected2.contractType && item['Year'] == $scope.selected2.year.yearNbr;
		});
		var ranked2Data = statsService.distro(filtered2Data, measure.Measure, measure.higherIsBetter);
		var ranked2Arr = ['2'];
		for (var i = 1; i <= 5; i++) { 
			ranked2Arr.push(ranked2Data[i]['frequency']);
		}
		
		var options = {
		  bindto: '#chart2',
		  data: {
			x: 'x',
			columns: [
			  ['x',1,2,3,4,5],
			  ranked1Arr,
			  ranked2Arr
			],
			type: 'bar'
		  },
			axis: {
			  x: {
				type: 'categorized'
			  }
			}
		};
		
		if (Object.keys(options).length) return c3.generate(options);
	};
		
		$scope.selectionChanged();
	});
});
controllers.controller('modalController', function($scope, $filter, $timeout, pivot, statsService, starsData, scoresData, selected1, selected2, measure, benchmarks) {
	$scope.starsData = starsData;
	$scope.scoresData = scoresData;
	$scope.selected1 = selected1;
	$scope.selected2 = selected2;
	$scope.benchmarks = benchmarks;
	$scope.selected1.graphType = 'Year';
	$scope.measure = measure;
	
	var format = measure.format;
	var contracts = _.pluck($scope.selected1.contracts, 'Contract Number');
	var contractsDisplay;
	if (contracts.length > 3) {
		contractsDisplay = contracts[0] && ', ' && contracts[1] && ', ' && contracts[2] && '...';
	} else {
		contractsDisplay = contracts.toString();
	}
	
	$scope.scoresPivot = pivot.create()
	.from($scope.scoresData)
	.where({
		"Contract Number": _.pluck($scope.selected1.contracts, 'Contract Number')
	})
	.groupBy(['Year'])
	.select([{name: measure.Measure, label: measure.Measure, oper: 'avg'}])
	.toObject();
	
	$scope.scoresBench = pivot.create()
	.from($scope.scoresData)
	.where({
		"Contract Type": $scope.selected1.contractType
	})
	.groupBy(['Year'])
	.select([{name: measure.Measure, label: measure.Measure, oper: 'avg'}])
	.toObject();
	
	$scope.starsPivot = pivot.create()
	.from($scope.starsData)
	.where({
		"Contract Number": _.pluck($scope.selected1.contracts, 'Contract Number')
	})
	.groupBy(['Year'])
	.select([{name: measure.Measure, label: measure.Measure, oper: 'avg'}])
	.toObject();
	
	$scope.starsBench = pivot.create()
	.from($scope.starsData)
	.where({
		"Contract Type": $scope.selected1.contractType
	})
	.groupBy(['Year'])
	.select([{name: measure.Measure, label: measure.Measure, oper: 'avg'}])
	.toObject();
	
	var x = ['x'];
	var y1 = [contractsDisplay];
	var y2 = [contractsDisplay];
	var bench = 'All ';
	bench = bench.concat($scope.selected1.contractType, ' Contracts');
	console.log($scope.selected1.contractType);
	var y3 = [bench];
	var y4 = [bench];
	
	for (var i = 2012; i <= 2015; i++) {
		x.push(i);
		y1.push($scope.scoresPivot[i].values[measure.Measure]);
		y2.push($scope.starsPivot[i].values[measure.Measure]);
		y3.push($scope.scoresBench[i].values[measure.Measure]);
		y4.push($scope.starsBench[i].values[measure.Measure]);
	}
	
	console.log(x, y1, y2, y3, y4);
	
	$scope.chart1 = {
	  data: {
		x: 'x',
		columns: [
		  x,
		  y1,
		  y3
		],
		type: 'line',
		colors: {
            '1': '#286090',
            '2': '#337ab7'
        }
	  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				  label: 'Score',
				  tick: {
					format: function (d) {
					  if (format == 'percent') {
						return $filter('percentage')(d, 0);
					  } else {
						return $filter('number')(d, 3);
					  }
					}
				  }
			  }
			}
	};
	
	$scope.chart2 = {
	  data: {
		x: 'x',
		columns: [
		  x,
		  y2,
		  y4
		],
		type: 'line'
	  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				  label: 'Stars',
				  min: 1,
				  max: 5,
				  tick: {
					count: 5,
					format: function (d) {
						return $filter('number')(d, 0);
					}
				  }
			  }
			}
	};
	

});
controllers.controller('measuresController', function($scope, $http, $q, $timeout, $filter, pivot, stars, statsService) {
	$scope.thresholdsArray = stars.thresholdsArray;
	$scope.search = "";
	$scope.contractTypes = [{'name':'MA-PD'},{'name':'PDP'}];

	$scope.selected = {
		measure: null,
		contractType: $scope.contractTypes[0]
	};
	
	$scope.measureSelected = function () {
		var format = $scope.thresholds[2015][$scope.selected.contractType.name][$scope.selected.measure.name]['format'];
		var filtered1Data = _.filter($scope.scoresData, function (item) {
			return item['Contract Type'] == $scope.selected.contractType.name && item['Year'] == 2015;
		});
		var ranked1Data = statsService.distro(filtered1Data, $scope.selected.measure.name, $scope.thresholds['2015'][$scope.selected.contractType.name][$scope.selected.measure.name].higherIsBetter);
		var ranked1Arr = {'x':['x'], 'y':[]};
		for (var prop in ranked1Data) { 
			ranked1Arr.y.push(Number(prop));
		}
		ranked1Arr.y.sort(function (a, b) {return a - b;});

		for (var i = 0; i < ranked1Arr.y.length; i++) {
			ranked1Arr.x.push(ranked1Data[ranked1Arr.y[i]]['percentile']);
		}
		ranked1Arr.y.unshift('score');
			
		var filtered2Data = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected.contractType.name && item['Year'] == 2015;
		});
		var ranked2Data = statsService.distro(filtered2Data, $scope.selected.measure.name, $scope.thresholds['2015'][$scope.selected.contractType.name][$scope.selected.measure.name].higherIsBetter);
		var ranked2Arr = {'x':['x'], 'y':['stars']};
		for (var i = 1; i <= 5; i++) {
			ranked2Arr.x.push(i);
			ranked2Arr.y.push(ranked2Data[i]['frequency']);
		}
			
		$scope.chart1 = {
		  data: {
			x: 'x',
			columns: [
			  ranked1Arr.x,
			  ranked1Arr.y
			],
			type: 'spline',
			colors: {
				'score': '#286090'
			}
		  },
		  axis: {
			x: {
			  label: 'Percentile',
			  //type: 'categorized',
			  tick: {
				count: 20,
				format: function (d) { 
				  return $filter('percentage')(d, 0);
				}
			  }
			},
			y: {
			  label: 'Score',
			  tick: {
				format: function (d) {
				  if (format == 'percent') {
					return $filter('percentage')(d, 0);
				  } else {
					return $filter('number')(d, 3);
				  }
				}
			  }
			}
		  },
		  legend: {
			  hide: true
		  }
		};

		$scope.chart2 = {
		  data: {
			x: 'x',
			columns: [
			  ranked2Arr.x,
			  ranked2Arr.y
			],
			type: 'bar'
		  },
		  axis: {
			x: {
				label: 'Stars'
			},
			y: {
			  label: 'Frequency',
			  tick: {
				format: function (d) {
					return $filter('number')(d, 0);
				}
			  }
			}
		  },
		  legend: {
			  hide: true
		  }
		};

		$scope.thresholdz = {'2': ['2'], '3':['3'], '4': ['4'], '5': ['5']};
		for (var i = 2012; i <= 2015; i++) {
			var meas = $scope.thresholds[i][$scope.selected.contractType.name][$scope.selected.measure.name];
			$scope.thresholdz['2'].push(meas[2]);
			$scope.thresholdz['3'].push(meas[3]);
			$scope.thresholdz['4'].push(meas[4]);
			$scope.thresholdz['5'].push(meas[5]);
		}
		$scope.chart3 = {
		  data: {
			x: 'x',
			columns: [
			  ['x',2012,2013,2014,2015],
			  $scope.thresholdz['2'],
			  $scope.thresholdz['3'],
			  $scope.thresholdz['4'],
			  $scope.thresholdz['5'],
			],
			type: 'line'
		  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				  label: 'Score',
				  tick: {
					format: function (d) {
					  if (format == 'percent') {
						return $filter('percentage')(d, 0);
					  } else {
						return $filter('number')(d, 3);
					  }
					}
				  }
			  }
			}
		};
			
		var fourStarPivot = pivot.create()
			.from($scope.starsData)
			.where({'Contract Type':$scope.selected.contractType.name})
			.groupBy(['Year'])
			.select([{label: 'CountContracts', oper: 'calc', calc: function (val) {var filteredArr = _.filter(val.grid, function (obj) {return _.isFinite(obj[$scope.selected.measure.name]);}); return filteredArr.length;}}, 
				{label: 'CountFourStarContracts', oper: 'calc', calc: function (val) {var filteredArr = _.filter(val.grid, function (obj) {return _.isFinite(obj[$scope.selected.measure.name]) && obj[$scope.selected.measure.name] >= 4;}); return filteredArr.length;}}, 
				{label: 'PercentFourStarContracts', oper: 'calc', calc: function(val) {return val.values.CountFourStarContracts / val.values.CountContracts;}}])
			.toObject();
		var fourStarContracts = {x: ['x'], y: ['Contracts At or Above 4-Stars']};
		for (var prop in fourStarPivot) {
			fourStarContracts.x.push(prop);
			fourStarContracts.y.push(fourStarPivot[prop]['values']['PercentFourStarContracts']);
		}
			
		$scope.chart4 = {
		  data: {
			x: 'x',
			columns: [
			  fourStarContracts.x,
			  fourStarContracts.y
			],
			type: 'line'
		  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				label: 'Score',
				max: .9,
				min: .1,
				tick: {
					format: function (d) {
						return $filter('percentage')(d, 0);
					}
				}
			  }
			},
			legend: {
				hide: true
			}
		};
	};
	
	$q.all([
        $http.get('data/measures.json'),
		$http.get('data/measure_descriptions.json'),
        $http.get('data/scores.json'),
		$http.get('data/stars.json')])
	.then(function(results) {
		$scope.thresholds = results[0].data;
		$scope.measuresData = results[1].data;
		$scope.scoresData = results[2].data;
		$scope.starsData = results[3].data;
		$scope.measurez = [];
		results[1].data.forEach(function (domain) {
			domain.measures.forEach(function (measure) {
				$scope.measurez.push({name: measure.Measure.split(' - ')[1]});
			});
		});
		$scope.selected.measure = $scope.measurez[0];
		$scope.measureSelected();
	});
});
controllers.controller('newModalController', function($scope, $modalInstance, $http, $q, $timeout, $filter, pivot, stars, statsService, contractType, measure) {
	$scope.thresholdsArray = stars.thresholdsArray;
	$scope.search = "";
	$scope.contractTypes = [{'name':'MA-PD'},{'name':'PDP'}];

	$scope.selected = {
		measure: {
			name: measure
		},
		contractType: {
			name: contractType
		}
	};
	
	$scope.measureSelected = function () {
		var format = $scope.thresholds[2015][$scope.selected.contractType.name][$scope.selected.measure.name]['format'];
		var filtered1Data = _.filter($scope.scoresData, function (item) {
			return item['Contract Type'] == $scope.selected.contractType.name && item['Year'] == 2015;
		});
		var ranked1Data = statsService.distro(filtered1Data, $scope.selected.measure.name, $scope.thresholds['2015'][$scope.selected.contractType.name][$scope.selected.measure.name].higherIsBetter);
		var ranked1Arr = {'x':['x'], 'y':[]};
		for (var prop in ranked1Data) { 
			ranked1Arr.y.push(Number(prop));
		}
		ranked1Arr.y.sort(function (a, b) {return a - b;});

		for (var i = 0; i < ranked1Arr.y.length; i++) {
			ranked1Arr.x.push(ranked1Data[ranked1Arr.y[i]]['percentile']);
		}
		ranked1Arr.y.unshift('score');
			
		var filtered2Data = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected.contractType.name && item['Year'] == 2015;
		});
		var ranked2Data = statsService.distro(filtered2Data, $scope.selected.measure.name, $scope.thresholds['2015'][$scope.selected.contractType.name][$scope.selected.measure.name].higherIsBetter);
		var ranked2Arr = {'x':['x'], 'y':['stars']};
		for (var i = 1; i <= 5; i++) {
			ranked2Arr.x.push(i);
			ranked2Arr.y.push(ranked2Data[i]['frequency']);
		}
			
		$scope.chart1 = {
		  data: {
			x: 'x',
			columns: [
			  ranked1Arr.x,
			  ranked1Arr.y
			],
			type: 'spline',
			colors: {
				'score': '#286090'
			}
		  },
		  axis: {
			x: {
			  label: 'Percentile',
			  //type: 'categorized',
			  tick: {
				count: 20,
				format: function (d) { 
				  return $filter('percentage')(d, 0);
				}
			  }
			},
			y: {
			  label: 'Score',
			  tick: {
				format: function (d) {
				  if (format == 'percent') {
					return $filter('percentage')(d, 0);
				  } else {
					return $filter('number')(d, 3);
				  }
				}
			  }
			}
		  },
		  legend: {
			  hide: true
		  }
		};

		$scope.chart2 = {
		  data: {
			x: 'x',
			columns: [
			  ranked2Arr.x,
			  ranked2Arr.y
			],
			type: 'bar'
		  },
		  axis: {
			x: {
				label: 'Stars'
			},
			y: {
			  label: 'Frequency',
			  tick: {
				format: function (d) {
					return $filter('number')(d, 0);
				}
			  }
			}
		  },
		  legend: {
			  hide: true
		  }
		};

		$scope.thresholdz = {'2': ['2'], '3':['3'], '4': ['4'], '5': ['5']};
		for (var i = 2012; i <= 2015; i++) {
			var meas = $scope.thresholds[i][$scope.selected.contractType.name][$scope.selected.measure.name];
			$scope.thresholdz['2'].push(meas[2]);
			$scope.thresholdz['3'].push(meas[3]);
			$scope.thresholdz['4'].push(meas[4]);
			$scope.thresholdz['5'].push(meas[5]);
		}
		$scope.chart3 = {
		  data: {
			x: 'x',
			columns: [
			  ['x',2012,2013,2014,2015],
			  $scope.thresholdz['2'],
			  $scope.thresholdz['3'],
			  $scope.thresholdz['4'],
			  $scope.thresholdz['5'],
			],
			type: 'line'
		  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				  label: 'Score',
				  tick: {
					format: function (d) {
					  if (format == 'percent') {
						return $filter('percentage')(d, 0);
					  } else {
						return $filter('number')(d, 3);
					  }
					}
				  }
			  }
			}
		};
			
		var fourStarPivot = pivot.create()
			.from($scope.starsData)
			.where({'Contract Type':$scope.selected.contractType.name})
			.groupBy(['Year'])
			.select([{label: 'CountContracts', oper: 'calc', calc: function (val) {var filteredArr = _.filter(val.grid, function (obj) {return _.isFinite(obj[$scope.selected.measure.name]);}); return filteredArr.length;}}, 
				{label: 'CountFourStarContracts', oper: 'calc', calc: function (val) {var filteredArr = _.filter(val.grid, function (obj) {return _.isFinite(obj[$scope.selected.measure.name]) && obj[$scope.selected.measure.name] >= 4;}); return filteredArr.length;}}, 
				{label: 'PercentFourStarContracts', oper: 'calc', calc: function(val) {return val.values.CountFourStarContracts / val.values.CountContracts;}}])
			.toObject();
		var fourStarContracts = {x: ['x'], y: ['Contracts At or Above 4-Stars']};
		for (var prop in fourStarPivot) {
			fourStarContracts.x.push(prop);
			fourStarContracts.y.push(fourStarPivot[prop]['values']['PercentFourStarContracts']);
		}
			
		$scope.chart4 = {
		  data: {
			x: 'x',
			columns: [
			  fourStarContracts.x,
			  fourStarContracts.y
			],
			type: 'line'
		  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				label: 'Score',
				max: .9,
				min: .1,
				tick: {
					format: function (d) {
						return $filter('percentage')(d, 0);
					}
				}
			  }
			},
			legend: {
				hide: true
			}
		};
	};
	
	$q.all([
        $http.get('data/measures.json'),
		$http.get('data/measure_descriptions.json'),
        $http.get('data/scores.json'),
		$http.get('data/stars.json')])
	.then(function(results) {
		$scope.thresholds = results[0].data;
		$scope.measuresData = results[1].data;
		$scope.scoresData = results[2].data;
		$scope.starsData = results[3].data;
		$scope.measurez = [];
		results[1].data.forEach(function (domain) {
			domain.measures.forEach(function (measure) {
				$scope.measurez.push({name: measure.Measure.split(' - ')[1]});
			});
		});
		$scope.selected.measure = $scope.measurez[0];
		$scope.measureSelected();
	});
});
controllers.controller('trendsController', function($scope, $filter, $timeout, $location, _, pivot, statsService, summaryData) {
	$scope.search = "";
	$scope.contractTypes = [{'name':'MA-PD'},{'name':'PDP'}];

	$scope.selected = {
		contractType: $scope.contractTypes[0]
	};
	
	$scope.contractTypeChanged = function () {
		var histoData = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected.contractType.name && item['Year'] == 2015;
		});
		$scope.histoArr = statsService.histogram('Summary Score', histoData, 'Summary Score', true);
		$scope.chart1 = {
		  data: {
			x: 'x',
			columns: [
			  $scope.histoArr.x,
			  $scope.histoArr.y
			],
			type: 'bar',
			colors: {
				'1': '#286090',
				'2': '#337ab7'
			}
		  },
			axis: {
			  x: {
				label: 'Stars',
				type: 'categorized'
			  },
			  y: {
				label: 'Frequency'
			  }
			},
			legend: {
				hide: true
			}
		};
		
		var fourStarPivot = pivot.create()
			.from($scope.starsData)
			.where({'Contract Type':$scope.selected.contractType.name})
			.groupBy(['Year'])
			.select([{label: 'CountContracts', oper: 'calc', calc: function (val) {var filteredArr = _.filter(val.grid, function (obj) {return _.isFinite(obj['Summary Score']);}); return filteredArr.length;}}, 
				{label: 'CountFourStarContracts', oper: 'calc', calc: function (val) {var filteredArr = _.filter(val.grid, function (obj) {return _.isFinite(obj['Summary Score']) && obj['Summary Score'] >= 4;}); return filteredArr.length;}}, 
				{label: 'PercentFourStarContracts', oper: 'calc', calc: function(val) {return val.values.CountFourStarContracts / val.values.CountContracts;}}])
			.toObject();
		var fourStarContracts = {x: ['x'], y: ['Contracts At or Above 4-Stars']};
		for (var prop in fourStarPivot) {
			fourStarContracts.x.push(prop);
			fourStarContracts.y.push(fourStarPivot[prop]['values']['PercentFourStarContracts']);
		}
		
		$scope.chart2 = {
		  data: {
			x: 'x',
			columns: [
			  fourStarContracts.x,
			  fourStarContracts.y
			],
			type: 'line'
		  },
			axis: {
			  x: {
				label: 'Year',
				type: 'categorized'
			  },
			  y: {
				label: 'Score',
				max: .9,
				min: .1,
				tick: {
					format: function (d) {
						return $filter('percentage')(d, 0);
					}
				}
			  }
			},
			legend: {
				hide: true
			}
		};
	};
	
	summaryData.getSummaryScores().then ( function (data) {
		$scope.starsData = data;
		$scope.contractTypeChanged();
	});
});
controllers.controller('statinsController', function($scope, $filter, $timeout, $location, _) {});
