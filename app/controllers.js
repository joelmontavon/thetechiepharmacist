var controllers = angular.module('controllers', []);
controllers.controller('controller', function($scope, $filter, $timeout, $location, _, pdcService, eligService, drugsService, opioidsService, graphService) {
	$scope.toDate = Date.getWithDaysFromEpoch;
	$scope.drugsService = drugsService;

	$scope.fromDt = Date.getWithOffsetForTimezone('2015-01-01');
	$scope.thruDt = Date.getWithOffsetForTimezone('2015-12-31');
	$scope.dob = Date.getWithOffsetForTimezone('1997-12-31');
	$scope.elig = [];
	$scope.claims = [];
	$scope.display = 1;
  
	drugsService.getDrugs().then(function (data) {
		$scope.drugs = data;
		/*$scope.elig = [
			{seq: '001', from: Date.getWithOffsetForTimezone('2015-01-01'), thru: Date.getWithOffsetForTimezone('2015-06-30')}
		];
		eligCtr = 1001;
		$scope.eligChanged();
		$scope.claims = [
		  {number: '001', drug: {"fullName":"Metformin hydrochloride 500 MG Oral Tablet","termType":"SCD","rxcui":"861007"}, dateOfFill: Date.getWithOffsetForTimezone('2015-01-06'), qty:30, daysSupply: 30, md: '1234567890', pharm: '1234567890'},
		  {number: '002', drug: {"fullName":"Glyburide 5 MG Oral Tablet","termType":"SCD","rxcui":"310537"}, dateOfFill: Date.getWithOffsetForTimezone('2015-01-06'), qty:30, daysSupply: 30},
		  {number: '003', drug: {"fullName":"Metformin hydrochloride 500 MG Oral Tablet","termType":"SCD","rxcui":"861007"}, dateOfFill: Date.getWithOffsetForTimezone('2015-02-15'), qty:30, daysSupply: 30},
		  {number: '004', drug: {"fullName":"Glyburide 5 MG Oral Tablet","termType":"SCD","rxcui":"310537"}, dateOfFill: Date.getWithOffsetForTimezone('2015-02-15'), qty:30, daysSupply: 30},
		  {number: '005', drug: {"fullName":"Glyburide 5 MG / Metformin hydrochloride 500 MG Oral Tablet","termType":"SCD","rxcui":"861753"}, dateOfFill: Date.getWithOffsetForTimezone('2015-02-28'), qty:30, daysSupply: 30},
		  {number: '006', drug: {"fullName":"Glyburide 5 MG / Metformin hydrochloride 500 MG Oral Tablet","termType":"SCD","rxcui":"861753"}, dateOfFill: Date.getWithOffsetForTimezone('2015-03-30'), qty:30, daysSupply: 30},
		  {number: '007', drug: {"fullName":"Glyburide 5 MG / Metformin hydrochloride 500 MG Oral Tablet","termType":"SCD","rxcui":"861753"}, dateOfFill: Date.getWithOffsetForTimezone('2015-04-28'), qty:30, daysSupply: 30},
		  {number: '008', drug: {"fullName":"Glyburide 5 MG / Metformin hydrochloride 500 MG Oral Tablet","termType":"SCD","rxcui":"861753"}, dateOfFill: Date.getWithOffsetForTimezone('2015-05-25'), qty:30, daysSupply: 30}
		];
		$scope.claims.forEach( function (claim) {
		  $scope.drugSelected(claim);
		});
		claimsCtr = 1008;
		$timeout( function () {
		  $scope.claimChanged();
		});*/
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
					$scope.graph = graphService.pdcGraph($scope.adherence, $scope.fromNbr, $scope.thruNbr, $scope.display);
				} else {
					$scope.opioids = opioidsService.opioids($scope.claims, $scope.fromNbr, $scope.thruNbr);
					$scope.graph = graphService.opioidGraph($scope.opioids, $scope.fromNbr, $scope.thruNbr, $scope.display);
				}
				//console.log($scope.claims, $scope.adherence);
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
  
	$scope.$watch ('display', function () {
		$timeout(function () { 
			if ($scope.type == 'pdc') {
				if ($scope.adherence)
					$scope.graph = graphService.pdcGraph($scope.adherence, $scope.fromNbr, $scope.thruNbr, $scope.display);
			} else {
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
		
	$scope.rowSelected = function (measure) {
		var filtered1Data = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected1.contractType && item['Year'] == $scope.selected1.year.yearNbr;
		});
		var ranked1Data = statsService.distro(filtered1Data, measure.Measure);
		var ranked1Arr = ['1'];
		for (var i = 1; i <= 5; i++) { 
			ranked1Arr.push(ranked1Data[i]['frequency']);
		}
		
		var filtered2Data = _.filter($scope.starsData, function (item) {
			return item['Contract Type'] == $scope.selected2.contractType && item['Year'] == $scope.selected2.year.yearNbr;
		});
		var ranked2Data = statsService.distro(filtered2Data, measure.Measure);
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
controllers.controller('modalController', function($scope, $filter, $timeout, statsService, starsData, scoresData, selected1, selected2, measure, benchmarks) {
	$scope.starsData = starsData;
	$scope.scoresData = scoresData;
	$scope.selected1 = selected1;
	$scope.selected2 = selected2;
	$scope.benchmarks = benchmarks;
	$scope.selected1.graphType = 'Year';
	
	var histo1Data = _.filter($scope.starsData, function (item) {
		return item['Contract Type'] == $scope.selected1.contractType && item['Year'] == $scope.selected1.year.yearNbr;
	});
	var histo1Arr = statsService.histogram('1', histo1Data, measure);
	var pcnt1Data = _.filter($scope.scoresData, function (item) {
		return item['Contract Type'] == $scope.selected1.contractType && item['Year'] == $scope.selected1.year.yearNbr;
	});
	var pcnt1Arr = statsService.percentile('1', pcnt1Data, measure);
	
	var histo2Data = _.filter($scope.starsData, function (item) {
		return item['Contract Type'] == $scope.selected2.contractType && item['Year'] == $scope.selected2.year.yearNbr;
	});
	var histo2Arr = statsService.histogram('2', histo2Data, measure);
	var pcnt2Data = _.filter($scope.scoresData, function (item) {
		return item['Contract Type'] == $scope.selected2.contractType && item['Year'] == $scope.selected2.year.yearNbr;
	});
	var pcnt2Arr = statsService.percentile('2', pcnt2Data, measure);
	
	var options1 = {
	  bindto: '#chart3',
	  data: {
		x: 'x',
		columns: [
		  ['x',1,2,3,4,5],
		  histo1Arr,
		  histo2Arr
		],
		type: 'bar',
		colors: {
            '1': '#286090',
            '2': '#337ab7'
        }
	  },
		axis: {
		  x: {
			type: 'categorized'
		  }
		}
	};
	
	var options2 = {
	  bindto: '#chart4',
	  data: {
		x: 'x',
		columns: [
		  pcnt1Arr.x,
		  pcnt1Arr.y
		],
		type: 'line'
	  },
	  axis: {
		x: {
		  tick: {
			format: function (d) { 
			  return $filter('percentage')(d, 0);
			}
		  }
		},
		y: {
		  tick: {
			format: function (d) {
			  if (measure.format == 'percent') {
				return $filter('percentage')(d, 0);
			  } else {
				return $filter('number')(d, 3);
			  }
			}
		  }
		}
	  }
	};
	
	$timeout( function () {
		c3.generate(options1);
		c3.generate(options2);
	});

});
controllers.controller('measuresController', function($scope, $http) {
	$scope.search = "";
	$http.get('data/measure_descriptions.json').then(function(result) {
			$scope.data = result.data;
		});
});
controllers.controller('trendsController', function($scope, $filter, $timeout, $location, _, statsService, summaryData) {
	summaryData.getSummaryScores().then ( function (data) {
		var histoData = _.filter(data, function (item) {
			return item['Contract Type'] == 'MA-PD' && item['Year'] == 2015;
		});
		histoData.forEach (function (contract) {
			contract['Summary Score'] = Number(contract['Summary Score']);
		});
		$scope.histoArr = statsService.histogram('Summary Score', histoData);
		$scope.percentile = statsService.percentile('Summary Score', histoData);
		console.log(histoData, $scope.histoArr, $scope.percentile);
	});
});	