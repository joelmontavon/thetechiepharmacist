var services = angular.module('services', []);
services.factory("_", function() {
    return window._;
});
services.factory("d3", function() {
  return window.d3;
});
services.factory("graphService", ["$filter", "_",
  function($filter, _) {
    var _columns = function (claims) {
      var data = [];
      var ctr = claims.length;
      var xaxis = ['x'];
      var from = _.reduce(claims, function (memo, claim) {
        var dt = claim.dateOfFill.getDaysFromEpoch();
        return dt < memo ? dt : memo;
      }, Infinity);
      var thru = _.reduce(claims, function (memo, claim) {
        var dt = claim.dateOfLastDose.getDaysFromEpoch();
        return dt > memo ? dt : memo;
      }, -Infinity);
      for (var i = from; i <= thru + 1; i++) {
        xaxis.push(Date.getWithDaysFromEpoch(i));
      }
      data.push(xaxis);
      claims.forEach(function (claim) {
        var values = ['Claim #' + claim.number];
        for (var i = from; i <= thru + 1; i++) {
          var dt = Date.getWithDaysFromEpoch(i).toDateString();
          if (dt == claim.dateOfFill.toDateString() || 
            dt == claim.dateOfFillAdj.toDateString() || 
            dt == claim.dateOfLastDose.toDateString()) {
            values.push(ctr);
          } else {
            values.push(null);
          }
        }
        data.push(values);
        ctr -= 1;
      });
      return data;
    };
    var _regions = function (claims) {
      var result = {};
      var ctr = claims.length;
      claims.forEach(function (claim) {
        result['Claim #' + claim.number] = [{
          start: claim.dateOfFill,
          end: claim.dateOfFillAdj,
          style: 'dashed'
        }];
        ctr -= 1;
      });
      return result;
    };
    var pdcGraph = function (adherence, from, thru, type) {
      type = type || 0;
      var options = {};
      switch(type) {
        case 1: 
          var columns = _columns(adherence.claims);
          var regions = _regions(adherence.claims);
          options = {
            bindto: '#chart',
            data: {
              x: 'x',
              columns: columns,
              regions: regions
            },
            axis: {
              x: {
                type: 'timeseries',
                tick: {
                  format: '%m-%d-%y'
                }
              },
              y: {
				/*min: 0,
				max: 1,*/
                tick: {
                  format: function (d) {
                    var num = columns.length - d; 
                    if(columns.hasOwnProperty(num) 
                      && num !== 0) 
                      return columns[num][0];}
                }
              }
            },
            point: {
              r: 4
            },
            tooltip: {
                format: {
                    name: function (name, ratio, id, index) { 
                      return name; 
                    },
                    title: function (d) { 
                      return $filter('date')(d, 'MMM d, y'); 
                    },
                    value: function (value, ratio, id, index) { 
                      var result;
                      switch(columns[0][index + 1].toDateString()) {
                        case regions[id][0].start.toDateString():
                          result = "date of fill";
                          break;
                        case regions[id][0].end.toDateString():
                          result = "date of first dose";
                          break;
                        default:
                          result = "date of last dose";
                          break;
                      }
                      return result;
                    }
                }
            },
            line: {
              connectNull: true
            }
          };
          break;
        case 2: 
			options = {
              bindto: '#chart',
              data: {
                x: 'x',
                columns: [
                  adherence.period,
                  adherence.pdc
                ]
              },
              axis: {
                x: {
                  type: 'timeseries',
                  tick: {
                    format: '%m-%d-%y'
                  }
                },
                y: {
				  min: 0,
				  max: 1,
                  tick: {
                    format: function (d) { 
                      return $filter('percentage')(d);
                    }
                  }
                }
              },
              tooltip: {
                format: {
                    name: function (name, ratio, id, index) { 
                      return 'PDC'; 
                    }
                }
              },
              grid: {
                y: {
                  lines: [
                    {value: 0.8, text: 'Adherent'}
                  ]
                }
              },
              tooltip: {
                format: {
                  title: function (d) { 
                    return $filter('date')(d, 'MMM d, y'); 
                  }
                }
              }
            };
          break;
      } 
      if (Object.keys(options).length) return c3.generate(options);
    };
	
	var opioidGraph = function (opioids, from, thru, type) {
      type = type || 0;
      var options = {};
      switch(type) {
        case 1: 
         options = {
              bindto: '#chart',
              data: {
                x: 'x',
                columns: [
                  opioids.period,
                  opioids.morphEquivDose
                ],
				types: {
				  'Morphine Equivalent Dose': 'area'
				}
              },
              axis: {
                x: {
                  type: 'timeseries',
                  tick: {
                    format: '%m-%d-%y'
                  }
                },
                y: {
                  tick: {
                    format: function (d) { 
                      return $filter('number')(d, 2);
                    }
                  }
                }
              },
              tooltip: {
                format: {
                    name: function (name, ratio, id, index) { 
                      return 'morphine equivalent dose'; 
                    }
                }
              },
              grid: {
                y: {
                  lines: [
                    {value: 120, text: 'Threshold'}
                  ]
                }
              },
              tooltip: {
                format: {
                  title: function (d) { 
                    return $filter('date')(d, 'MMM d, y'); 
                  }
                }
              }
            };
          break;
      }
	  //console.log('opioidGraph');
      if (Object.keys(options).length) return c3.generate(options);
    };
	
    return {
      pdcGraph: pdcGraph,
	  opioidGraph: opioidGraph
    };
}]);

services.factory("pdcService", ["_",
  function(_) {
    var _filterClasses = function (claims, classes) {
      return _.filter(claims, function (claim) {
		if (_.has(claim.drug, 'components')) {
			return claim.drug.components.some( function (component) {
			  if(_.has(component, 'classes')) {
				return component.classes.some( function (classForDrug) {
				  return classes.some( function (classForList) {
					return classForDrug.id.substr(0, classForList.length) == classForList; 
				  });
				});
			  } else {
				return false;
			  }
			});
		} else {
			return false;
		}
      });
    };
    var _filterDates = function (claims, from, thru) {
      return _.filter(claims, function (claim) {
        var date = claim.dateOfFill.getDaysFromEpoch();
        return date >= from && date <= thru;
      });
    };
    var _sortClaims = function (claims) {
      return _.sortBy(claims, function (claim) {
        return claim.dateOfFill;
      });
    };
    var _uniqueDatesOfFill = function (claims) {
      var uniq = _.uniq(claims, function (claim) {
        return claim.dateOfFill.toDateString();
      });
      //console.log(uniq);
      return uniq.length;
    };
    var _span = function (claims) {
      return (claims && claims.length > 1) ? (claims[claims.length - 1].dateOfFill.getDaysFromEpoch() - claims[0].dateOfFill.getDaysFromEpoch() + 1) : 0;
    };
    var _adjustForOverlap = function (sortedClaims) {
      var result = {};
      sortedClaims.forEach(function (claim) {
        var dateOfFill = claim.dateOfFill.getDaysFromEpoch();
        /*if (claim.drug.hasOwnProperty('id')) {
          var drugs = claim.drug.id.split('/');*/
        if (claim.drug.hasOwnProperty('components')) {
          var drugs = _.pluck(claim.drug.components, 'ingredient');
          drugs.forEach(function (drug) {
            if (!result.hasOwnProperty(drug)) result[drug] = {};
          });
          var dt = dateOfFill;
          var ctr = 0;
          while (ctr < claim.daysSupply) {
            var isCovered = false;
            drugs.forEach(function (drug) {
              if (result[drug].hasOwnProperty(dt)) isCovered = true;
            });
            if (!isCovered) {
              if (!ctr) claim.dateOfFillAdj = Date.getWithDaysFromEpoch(dt);
              drugs.forEach(function (drug) {
                result[drug][dt] = 1
              });
              ctr += 1;
            }
            dt += 1;
          }
          claim.dateOfLastDose = Date.getWithDaysFromEpoch(dt - 1);
        }
      });
	  
      return result;
    };
	var _daysLate = function (sortedClaims, thru) {
		var result = {
			daysLate: [],
			daysLateBand: [],
			daysLate0: 0,
			daysLate3: 0,
			daysLate7: 0,
			daysLate14: 0,
			daysLate30: 0,
			stopped: false,
			significantGap: false,
			increasing: 0,
			decreasing: 0,
			trend: '',
			pattern: '',
			profile: ''
		};
		var ctr = 0;
		for (i = 1; i < sortedClaims.length; i++) {
			result.daysLate[i-1] = Math.max(sortedClaims[i].dateOfFill.getDaysFromEpoch() - sortedClaims[i-1].dateOfLastDose.getDaysFromEpoch() - 1, 0);
		}
		if (result.daysLate.length) result.daysLate.push(Math.max(thru - sortedClaims[sortedClaims.length-1].dateOfLastDose.getDaysFromEpoch() - 1, 0));
		for (i = 0; i < result.daysLate.length; i++) {
			if (result.daysLate[i] > 0) result.daysLate0 += 1;
			if (result.daysLate[i] > 3) result.daysLate3 += 1;
			if (result.daysLate[i] > 7) result.daysLate7 += 1;
			if (result.daysLate[i] > 14) result.daysLate14 += 1;
			if (result.daysLate[i] > 30) result.daysLate30 += 1;
			if (result.daysLate[i] == 0) result.daysLateBand[i] = 0;
				else if (result.daysLate[i] <= 3) result.daysLateBand[i] = 1;
				else if (result.daysLate[i] <= 7) result.daysLateBand[i] = 2;
				else if (result.daysLate[i] <= 14) result.daysLateBand[i] = 3;
				else result.daysLateBand[i] = 4;
			if (result.daysLate[i] > 30) result.stopped = true;
				else result.stopped = false;
		}
		if (result.stopped) result.pattern = 'Discontinued';
			else if (result.daysLate30) result.pattern = 'Significant gap(s)';
			else if (result.daysLate14 > 1) result.pattern = 'Several gaps';
			else if (result.daysLate7/result.daysLate.length >= 0.5) result.pattern = 'Highly inconsistent';
			else if (result.daysLate3/result.daysLate.length >= 0.5) result.pattern = 'Inconsistent';
			else result.pattern = 'Consistent';
		for (i = result.daysLate.length - 2; i >= 1; i--) {
			if (!result.significantGap && ctr < 3) {
				if (result.daysLateBand[i-1] < result.daysLateBand[i]) result.increasing += 1;
					else if (result.daysLateBand[i-1] > result.daysLateBand[i]) result.decreasing += 1;
				if (result.daysLate[i-1] > 30) result.significantGap = true;
			}
		}
		if (result.pattern != 'Discontinued') {
			if (!result.decreasing && result.increasing) result.trend = ' with downward trend'
				else if (result.decreasing > 1 && !result.increasing) result.trend = ' with strong upward trend';
				else if (result.decreasing && !result.increasing) result.trend = ' with upward trend';
		}
		result.profile = result.pattern + result.trend;
		return result;
	};
    var _drugsCovered = function (adjustedForOverlap, from, thru) {
      var result = {};
      for (var i = from; i <= thru; i++) {
        result[i] = 0;
        for (drug in adjustedForOverlap) {
          if (adjustedForOverlap[drug].hasOwnProperty(i)) result[i] += adjustedForOverlap[drug][i];
        }
      }
      return result;
    };
    var _indexDate = function (drugsCovered, from, thru) {
      for (var i = from; i <= thru; i++) {
        if (drugsCovered[i]) return Date.getWithDaysFromEpoch(i);
      }
      return;
    };
    var _daysInMeasurementPeriod = function (drugsCovered, from, thru, threshold) {
      threshold = threshold || 1;
      var result = {};
      var iter = 0;
      for (var i = from; i <= thru; i++) {
        if (drugsCovered[i] >= threshold) iter = 1;
        if (i == from) {
          result[i] = iter;
        } else {
          result[i] = result[i - 1] + iter;
        }
      }
      return result;
    };
    var _daysCovered = function (drugsCovered, from, thru, threshold) {
      threshold = threshold || 1;
      var result = {};
      var iter = 0;
      for (var i = from; i <= thru; i++) {
        if (drugsCovered[i] >= threshold) {
          iter = 1;
        } else {
          iter = 0;
        }
        if (i == from) {
          result[i] = iter;
        } else {
          result[i] = result[i - 1] + iter;
        }
      }
      return result;
    };
    var _calendar = function (drugsCovered, from, thru, threshold, index) {
      threshold = threshold || 1;
      var result = {};
      var val = null;
      for (var i = from; i <= thru; i++) {
		if (drugsCovered[i] >= threshold) {
		  val = 1;
		} else {
		  val = val === null ? null : 0;
		}
		result[Date.getWithDaysFromEpoch(i).toStdString().substring(0, 10)] = val;
      }
      return result;
    };
    var _pdc = function (daysInMeasurementPeriod, daysCovered, from, thru) {
      var result = ['pdc'];
      var val = null;
      for (var i = from; i <= thru; i++) {
        if (daysInMeasurementPeriod[i]) val = daysCovered[i]/daysInMeasurementPeriod[i];
        result.push(val);
      }
      return result;
    };
    var _period = function (from, thru) {
      var result = ['x'];
      var val = null;
      for (var i = from; i <= thru; i++) {
        result.push(Date.getWithDaysFromEpoch(i));
      }
      return result;
    };
    var _thresholdExceeded = function (pdc, threshold) {
      threshold = threshold || .8;
      var result = ['threhold exceeded'];
      var isExceeded;
      for (var i = 1; i < pdc.length; i++) {
        if (pdc[i] >= threshold) {
          isExceeded = true;
        } else {
          isExceeded = false;
        }
        result.push(isExceeded);
      }
      return result;
    };
    var adherence = function (claims, from, thru, classes, threshold) {
      var filteredClasses = _filterClasses(claims, classes)
      var filteredDates = _filterDates(filteredClasses, from, thru);
      var sortedClaims = _sortClaims(filteredDates);
      var uniqueDatesOfFill = _uniqueDatesOfFill(sortedClaims);
      var span = _span(sortedClaims);
      var adjustedForOverlap = _adjustForOverlap(sortedClaims, from, thru);
	  var daysLate = _daysLate(sortedClaims, thru);
      var drugsCovered = _drugsCovered(adjustedForOverlap, from, thru);
      var indexDate = _indexDate(drugsCovered, from, thru);
      var daysInMeasurementPeriod = _daysInMeasurementPeriod(drugsCovered, from, thru, threshold);
      var daysCovered = _daysCovered(drugsCovered, from, thru, threshold);
	  var calendar = _calendar(drugsCovered, from, thru, threshold, indexDate);
      var pdc = _pdc(daysInMeasurementPeriod, daysCovered, from, thru);
      var period = _period(from, thru);
      var thresholdExceeded = _thresholdExceeded(pdc, threshold);
      return {
        period: period,
        indexDate: indexDate,
        uniqueDatesOfFill: uniqueDatesOfFill,
        span: span,
        claims: sortedClaims,
		daysLate: daysLate,
        drugsCovered: drugsCovered,
        daysInMeasurementPeriod: daysInMeasurementPeriod,
        daysCovered: daysCovered,
		calendar: calendar,
        pdc: pdc,
        thresholdExceeded: thresholdExceeded
      };
    };
    return {
      adherence: adherence
    };
}]);
services.factory("eligService", ["_", function(_) {
  var fromDate = function (elig, from) {
    var min = _.reduce (elig, function (result, obj) {
      var dt = obj.from.getDaysFromEpoch();
      return dt < result ? dt : result;
    }, Infinity);
    return from > min ? from : min;
  };
  
  var thruDate = function (elig, thru) {
    var max = _.reduce (elig, function (result, obj) {
      var dt = obj.thru.getDaysFromEpoch();
      return dt > result ? dt : result;
    }, -Infinity);
    return thru < max ? thru : max;
  };
  
  var eligDates = function (elig) {
    var result = {};
    elig.forEach(function (dates) {
      var from = dates.from.getDaysFromEpoch();
      var thru = dates.thru.getDaysFromEpoch();
      for (var i = from; i <= thru; i++) {
        result[i] = 1;
      }
    });
    return result;
  };
  
  var gap = function (elig, from, thru) {
    var result = 0;
    var isFound = false;
    for (var i = from; i <= thru; i++) {
      if (elig.hasOwnProperty(i)) {
        isFound = true;
      } else if (isFound) {
        result += 1;
      }
    }
    return result;
  };
  
  return {
    fromDate: fromDate,
    thruDate: thruDate,
    eligDates: eligDates,
    gap: gap
  };
}]);
services.factory('drugsService', ['$http', '$q', function ($http, $q) {
  var getDrugs = function () {
    //http://stackoverflow.com/questions/20252640/angular-combining-parallel-and-chained-requests-with-http-then-and-q-all
    //https://egghead.io/lessons/angularjs-q-all
    return $http.get('https://rxnav.nlm.nih.gov/REST/RxTerms/allconcepts')
      .then(function(data) {
        return data.data.minConceptGroup.minConcept;
      });
  };
  var getDrugInfo = function (rxcui) {
	var deferred = $q.defer();
    $q.all([
      $http.get('https://rxnav.nlm.nih.gov/REST/RxTerms/rxcui/' + rxcui + '/allinfo'),
      $http.get('https://rxnav.nlm.nih.gov/REST/rxcui/' + rxcui + '/allProperties?prop=attributes'),
      $http.get('https://rxnav.nlm.nih.gov/REST/rxcui/' + rxcui + '/related?tty=SCDC')
    ])
    .then(function (responses) {
      var result = {};
      result = responses[0].data.rxtermsProperties;
      result['brand'] = result['brandName'] ? true : false;
      /*responses[1].data.propConceptGroup.propConcept.forEach (function (property) {
        if (property.propName == 'QUANTITY' || property.propName == 'SCHEDULE') {
          result[property.propName.toLowerCase()] = property.propValue;
        }
      });*/
      result.components = _.map(responses[2].data.relatedGroup.conceptGroup[0].conceptProperties, function (component) {
        return {
          rxcui: component.rxcui,
          name: component.name
        };
      });
      return result;
    })
    .then(function (result) {
      result.components.forEach(function (component) {
        $q.all([
          $http.get('https://rxnav.nlm.nih.gov/REST/rxcui/' + component.rxcui + '/allProperties?prop=attributes'),
          $http.get('https://rxnav.nlm.nih.gov/REST/rxcui/' + component.rxcui + '/related?tty=IN')
        ])
        .then(function (responses) {
          var strength = _.result(_.find(responses[0].data.propConceptGroup.propConcept, {propName: 'STRENGTH'}), 'propValue').split(' ');
          component.strength = strength.length > 1 ? Number(strength[0]) : null;
          component.uom = strength.length > 1 ? strength[1] : strength[0];
          var ingredient = _.find(responses[1].data.relatedGroup.conceptGroup[0].conceptProperties, {tty: 'IN'});
          component.ingredient = _.result(ingredient, 'name');
          $http.get('https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui?rxcui=' + ingredient.rxcui + '&relaSource=ATC')
            .then(function (response) {
              component.classes = [];
              if (_.has(response.data, 'rxclassDrugInfoList')) {
                response.data.rxclassDrugInfoList.rxclassDrugInfo.forEach(function (classification) {
                  component.classes.push({
                    id: classification.rxclassMinConceptItem.classId,
                    name: classification.rxclassMinConceptItem.className
                  });
                });
              }
              deferred.resolve(result);
            });
          return result;
        });
      });
      return result;
    });
	return deferred.promise;
  };
  return {
    getDrugs: getDrugs,
    getDrugInfo: getDrugInfo
  };
}]);
services.factory("opioidsService", ["_", function(_) {
	var nest = function(arr, keys) {
		var self = this;
		if (!keys.length)
			return arr;
		var first = keys[0];
		var rest = keys.slice(1);
		return _.mapValues(_.groupBy(arr, first), function(value) {
			return nest(value, rest);
		});
	};
	
  var opioidsData = nest([
  	{ingredient:'Buprenorphine', route:'Transdermal', conversionFactor:42, uom:'MCG'},
  	{ingredient:'Buprenorphine', route:'Sublingual', conversionFactor:10, uom:'MG'},
  	{ingredient:'Butorphanol', route:'Injectable', conversionFactor:7, uom:'MG'},
  	{ingredient:'Butorphanol', route:'Nasal', conversionFactor:7, uom:'MG'},
  	{ingredient:'Codeine', route:'Oral Pill', conversionFactor:0.15, uom:'MG'},
  	{ingredient:'Dihydrocodeine', route:'Oral Pill', conversionFactor:0.25, uom:'MG'},
  	{ingredient:'Fentanyl', route:'Sublingual', conversionFactor:0.18, uom:'MCG'},
  	{ingredient:'Fentanyl', route:'Transdermal', conversionFactor:7.2, uom:'MCG'},
  	{ingredient:'Fentanyl', route:'Buccal', rxnormDoseForm:'Buccal Film', conversionFactor:0.18, uom:'MCG'},
  	{ingredient:'Fentanyl', route:'Buccal', rxnormDoseForm:'Buccal Tablet', conversionFactor:0.13, uom:'MCG'},
  	{ingredient:'Fentanyl', route:'Nasal', conversionFactor:0.16, uom:'MCG'},
  	{ingredient:'Fentanyl', route:'Sublingual', conversionFactor:0.13, uom:'MCG'},
  	{ingredient:'Hydrocodone', route:'Oral Pill', conversionFactor:1, uom:'MG'},
  	{ingredient:'Hydromorphone', route:'Injectable', conversionFactor:4, uom:'MG'},
  	{ingredient:'Hydromorphone', route:'Oral Pill', conversionFactor:4, uom:'MG'},
  	{ingredient:'Hydromorphone', route:'Rectal', conversionFactor:4, uom:'MG'},
  	{ingredient:'Levorphanol', route:'Oral Pill', conversionFactor:11, uom:'MG'},
  	{ingredient:'Meperidine', route:'Injectable', conversionFactor:0.1, uom:'MG'},
  	{ingredient:'Meperidine', route:'Oral Pill', conversionFactor:0.1, uom:'MG'},
  	{ingredient:'Methadone', route:'Injectable', conversionFactor:3, uom:'MG'},
  	{ingredient:'Methadone', route:'Oral Pill', conversionFactor:3, uom:'MG'},
  	{ingredient:'Morphine', route:'Injectable', conversionFactor:1, uom:'MG'},
  	{ingredient:'Morphine', route:'Oral Pill', conversionFactor:1, uom:'MG'},
  	{ingredient:'Morphine', route:'Rectal', conversionFactor:1, uom:'MG'},
  	{ingredient:'Nalbuphine', route:'Injectable', conversionFactor:1, uom:'MG'},
  	{ingredient:'Opium', route:'Rectal', conversionFactor:1, uom:'MG'},
  	{ingredient:'Opium', route:'Oral Pill', conversionFactor:1, uom:'MG'},
  	{ingredient:'Oxycodone', route:'Oral Pill', conversionFactor:1.5, uom:'MG'},
  	{ingredient:'Oxymorphone', route:'Injectable', conversionFactor:3, uom:'MG'},
  	{ingredient:'Oxymorphone', route:'Oral Pill', conversionFactor:3, uom:'MG'},
  	{ingredient:'Oxymorphone', route:'Rectal', conversionFactor:3, uom:'MG'},
  	{ingredient:'Pentazocine', route:'Oral Pill', conversionFactor:0.37, uom:'MG'},
  	{ingredient:'Pentazocine', route:'Injectable', conversionFactor:0.37, uom:'MG'},
  	{ingredient:'Tapentadol', route:'Oral Pill', conversionFactor:0.4, uom:'MG'},
  	{ingredient:'Tramadol', route:'Oral Pill', conversionFactor:0.1}
  ], ['ingredient', 'route']);

    var _filterDrugs = function (claims) {
      return _.filter(claims, function (claim) {
		if (_.has(claim.drug, 'components')) {
			return claim.drug.components.some(function (component) {
			  return opioidsData.hasOwnProperty(component.ingredient) && opioidsData[component.ingredient].hasOwnProperty(claim.drug.route);
			});
		};
      });
    };
    var _opioidsRouteNotFound = function (claims) {
      return _.filter(claims, function (claim) {
		if (_.has(claim.drug, 'components')) {
			return claim.drug.components.some(function (component) {
			  return opioidsData.hasOwnProperty(component.ingredient) && !opioidsData[component.ingredient].hasOwnProperty(claim.drug.route);
			});
		};
      });
    };
    var _filterDates = function (claims, from, thru) {
      return _.filter(claims, function (claim) {
        var date = claim.dateOfFill.getDaysFromEpoch();
        return date >= from && date <= thru;
      });
    };
    var _sortClaims = function (claims) {
      return _.sortBy(claims, function (claim) {
        return claim.dateOfFill;
      });
    };
    var _morphEquivDose = function (sortedClaims, from, thru) {
      var resultObj = {};
	  	for (var i = from; i <= thru; i++)
			resultObj[i] = 0;
        sortedClaims.forEach(function (claim) {
          var dateOfFill = claim.dateOfFill.getDaysFromEpoch();
          if (claim.drug.hasOwnProperty('components')) {
            claim.drug.components.forEach( function(component) {
              if(opioidsData.hasOwnProperty(component.ingredient)) {
                var conversionFactor; 
                if(opioidsData[component.ingredient].hasOwnProperty(claim.drug.route)) {
                  if (component.ingredient == 'Fentanyl' && claim.drug.route == 'Buccal') {
					conversionFactor = _.find(opioidsData[component.ingredient][claim.drug.route], {rxnormDoseForm: claim.drug.rxnormDoseForm});
				  } else {
					conversionFactor = opioidsData[component.ingredient][claim.drug.route][0];
				  }
                } else {
                  conversionFactor = 0;
                }
				component.conversionFactor = conversionFactor.conversionFactor;
				component.strength = conversionFactor.uom == 'MCG' && component.uom.search('MCG') == -1 ? component.strength * 1000 : component.strength;
				component.uom = conversionFactor.uom == 'MCG' ? component.uom.replace('MG', 'MCG') : component.uom;
                component.med = claim.qty * component.strength / claim.daysSupply * conversionFactor.conversionFactor;
                for (var i = dateOfFill; i < dateOfFill + claim.daysSupply; i++) {
                  resultObj[i] += component.med;
                }
              }
            });
          }
          //claim.dateOfLastDose = Date.getWithDaysFromEpoch(i);
		  claim.dateOfLastDose = Date.getWithDaysFromEpoch(dateOfFill + claim.daysSupply - 1);
        });
		var resultArr = ['Morphine Equivalent Dose'];
		for (var i = from; i <= thru; i++)
			resultArr.push(resultObj[i]);
      return resultArr;
    };
    var _withinThreshold = function (morphEquivDose, from, thru, threshold) {
      threshold = threshold || 120;
      var result = {};
      var withinThreshold;
	  var i = 1;
      for (var j = from; j <= thru; j++) {
        if (morphEquivDose[i] >= threshold) {
          withinThreshold = true;
        } else {
          withinThreshold = false;
        }
        result[j] = withinThreshold;
		i++
      }
      return result;
    };
    var _period = function (from, thru) {
      var result = ['x'];
      var val = null;
      for (var i = from; i <= thru; i++) {
        result.push(Date.getWithDaysFromEpoch(i));
      }
      return result;
    };
	var _total = function (withinThreshold, from, thru) {
		var result = 0;
		for (var i = from; i <= thru; i++) {
			if (withinThreshold[i])
				result += 1;
		}
		return result;
	};
	var _consecutive = function (withinThreshold, from, thru) {
		var result = 0;
		var ctr = 0;
		for (var i = from; i <= thru; i++) {
			if (!withinThreshold[i]) {
				ctr = 0;
			} else {
				ctr += 1;
			}
			result = result > ctr ? result : ctr;
		}
		return result;
	};
	var _prescribers = function (claims) {
		return _.uniq(_.pluck(claims, 'md')).length;
	};
	var _pharmacies = function (claims) {
		return _.uniq(_.pluck(claims, 'pharm')).length;
	};
    var opioids = function (claims, from, thru, threshold) {
	  var period = _period(from, thru);
      var filteredDrugs = _filterDrugs(claims);
	  var opioidsRouteNotFound = _opioidsRouteNotFound(claims);
      var filteredDates = _filterDates(filteredDrugs, from, thru);
      var sortedClaims = _sortClaims(filteredDates);
      var morphEquivDose = _morphEquivDose(sortedClaims, from, thru);
      var withinThreshold = _withinThreshold(morphEquivDose, from, thru);
	  var total = _total(withinThreshold, from, thru);
	  var consecutive = _consecutive(withinThreshold, from, thru);
	  var prescribers = _prescribers(sortedClaims);
	  var pharmacies = _pharmacies(sortedClaims);
      return {
		period: period,
        claims: sortedClaims,
		opioidsRouteNotFound: opioidsRouteNotFound,
        morphEquivDose: morphEquivDose,
        withinThreshold: withinThreshold,
		total: total,
		consecutive: consecutive,
		prescribers: prescribers,
		pharmacies: pharmacies
      };
    };
  return {
    opioids: opioids
  };
}]);
services.factory("pivot", ["_",
    function(_) {
        var create = function() {
            var source = [];
            var filtered = [];
            var grids = [];
            var tree = {};
            var from = function(arr) {
                source = arr;
                filtered = source;
                return this;
            };
            var pickMulti = function(obj, keys) {
                var result = {};
                _.each(keys, function(key) {
                    _.assign(result, _.pick(obj, key));
                });
                return result;
            };
			var like = function (str, pattern) {
				return RegExp(('^' + pattern + '$').replace('%','.*'), 'i').test(str);
			};
            var filter = function(data, prop, vals) {
                return _.filter(data, function(obj) {
                    if (_.isArray(vals)) {
                        for (var i = 0; i < vals.length; i++) {
                            if (obj[prop] == vals[i]) return true;
                        }
                    } else if (obj[prop] == vals) {
                        return true;
                    }
                    return false;
                });
            };
            var where = function(obj) {
                _.each(obj, function(val, key) {
                    filtered = filter(filtered, key, val)
                });
                return this;
            };
            var group = function(arr, keys, dims) {
                dims = dims || {};
                var first = keys[0];
                var rest = keys.slice(1);
                return _.chain(arr)
                    .groupBy(first)
                    .mapValues(function(val, key) {
                        dims[first] = val[0][first];
                        if (!rest.length) {
                            var obj = {
                                dimensions: _.clone(dims),
                                grid: val,
                                values: {}
                            };
                            grids.push(obj);
                            return obj;
                        } else {
                            return group(val, rest, dims);
                        }
                    })
                    .value();
            };
            var regroup = function(index, keys) {
                var data = _.chain(grids)
                    .where({
                        dimensions: pickMulti(grids[index].dimensions, keys)
                    })
                    .map(function(val, key) {
                        return val.grid;
                    })
                    .flatten()
                    .value();
                var pivot = new Pivot(data, keys);
                return pivot;
            };
            var groupBy = function(keys) {
				if (keys && keys.length) {
					tree = group(filtered, keys);
				} else {
					var obj = {
						dimensions: {},
						grid: filtered,
						values: {}
					};
					grids.push(obj);
					tree = obj;
				}
                return this;
            };
            var count = function(grid, value) {
                grid['values'][value.label] = grid.grid.length;
            };
            var countDistinct = function(grid, value) {
                grid['values'][value.label] = _.chain(grid.grid)
                    .pluck(key)
                    .uniq()
                    .remove(function(x) {
                        return !_.isNull(x) && !_.isUndefined(x);
                    })
                    .value()
                    .length;
            };
            var average = function(grid, value) {
                var ctr = 0;
                var sum = _.reduce(grid.grid, function(memo, obj) {
                    //var num = obj[value.name] != "" ? Number(obj[value.name]) : obj[value.name];
					var num = obj[value.name];
                    if (_.isFinite(num)) {
                        ctr += 1;
                        return memo + num;
                    } else {
                        return memo;
                    }
                }, null);
                grid['values'][value.label] = ctr ? (sum / ctr) : null;
            };
            var max = function(grid, value) {
                grid['values'][value.label] = _.reduce(grid.grid, function(memo, obj) {
                    var num = Number(obj[value.name]);
                    if (_.isFinite(num)) return num > memo ? num : memo;
                }, -Infinity);
            };
            var min = function(grid, value) {
                grid['values'][value.label] = _.reduce(grid.grid, function(memo, obj) {
                    var num = Number(obj[value.name]);
                    if (_.isFinite(num)) return num < memo ? num : memo;
                }, Infinity);
            };
            var first = function(grid, value) {
                grid['values'][value.label] = _.first(grid.grid)[value.name];
            };
            var last = function(grid, value) {
                grid['values'][value.label] = _.last(grid.grid)[value.name];
            };
            var sum = function(grid, value) {
                grid['values'][value.label] = _.reduce(grid.grid, function(memo, obj) {
                    var num = Number(obj[value.name]);
                    if (_.isFinite(num)) return memo + num;
                }, 0);
            };
            var calculation = function(grid, value) {
                grid['values'][value.label] = value.calc(grid, value);
            };
            var select = function(values) {
                _.each(values, function(value) {
                    _.each(grids, function(grid) {
                        switch (value.oper) {
                            case 'count':
                                count(grid, value);
                                break;
                            case 'unique':
                                countDistinct(grid, value);
                                break;
                            case 'avg':
                                average(grid, value);
                                break;
                            case 'max':
                                max(grid, value);
                                break;
                            case 'min':
                                min(grid, value);
                                break;
                            case 'first':
                                first(grid, value);
                                break;
                            case 'last':
                                last(grid, value);
                                break;
                            case 'calc':
                                calculation(grid, value);
                                break;
                            case 'sum':
                            default:
                                sum(grid, value);
                                break;
                        }
                    });
                });
                return this;
            };
            var orderBy = function(key, ascending) {
				if (key) {
					ascending = ascending || true;
					grids = _.sortBy(grids, function(val) {
						return _.chain(val.dimensions)
							.pick(key)
							.values()
							.value()
					});
					if (!ascending) grids.reverse();
				}
                return this;
            };
            var toArray = function() {
                return grids;
            };
            var toObject = function() {
                return tree;
            };
            var values = function() {
                var result = [];
                _.each(grids, function(val) {
                    result.push(_.chain({}).assign(val.dimensions).assign(val.values).value());
                });
                return result;
            };
			var run = function (options) {
				console.log(options);
				this.from(options.data);
				this.where(options.where);
				this.groupBy(options.groupBy);
				this.select(options.select);
				this.orderBy(options.orderBy);
				switch(options.output) {
					case 'array':
						return this.toArray();
						break;
					case 'object':
						return this.toObject();
						break;
					case 'values':
						return this.values();
						break;
				}
			};
            return {
                source: function() {
                    return source;
                },
                filtered: function() {
                    return filtered;
                },
                from: from,
                where: where,
                groupBy: groupBy,
                orderBy: orderBy,
                select: select,
                toArray: toArray,
                toObject: toObject,
                values: values,
				run: run
            };
        };
        return {
            create: function() {
                return new create();
            }
        };
    }
]);
services.factory("stars", ["$filter", "pivot", "_",
  function($filter, pivot, _) {
    var format = function (val, format) {
		var result;
		switch (format) {
			case 'percent':
				result = $filter('percentage')(val,0);
				break;
			case 'number':
				//result = $filter('number')(val,3);
				result = val;
				break;
			default:
				result = val;
				break;
		}
		return result;		
	};
	
	var displayThresholds = function (measure, contractType, year, thresholds) {
		if (measure && contractType && year) {
			var results;
			var arr = [];
			var meas = thresholds[year][contractType][measure];
			if (meas.higherIsBetter) {
				arr.push('<' + format(meas[2], meas.format));
				arr.push('≥' + format(meas[2], meas.format) + ' to ' + '<' + format(meas[3], meas.format));
				arr.push('≥' + format(meas[3], meas.format) + ' to ' + '<' + format(meas[4], meas.format));
				arr.push('≥' + format(meas[4], meas.format) + ' to ' + '<' + format(meas[5], meas.format));
				arr.push('≥' + format(meas[5], meas.format));
			} else {
				arr.push('>' + format(meas[2], meas.format));
				arr.push('>' + format(meas[3], meas.format) + ' to ' + '≤' + format(meas[2], meas.format));
				arr.push('>' + format(meas[4], meas.format) + ' to ' + '≤' + format(meas[3], meas.format));
				arr.push('>' + format(meas[5], meas.format) + ' to ' + '≤' + format(meas[4], meas.format));
				arr.push('≤' + format(meas[5], meas.format)); 
			}
			for (var i = 0; i < arr.length; i++) {
				if (i == 0) {
					result = '1 Star:' + arr[i];
				} else {
					result += ', ' + (i + 1) + ' Stars:' + arr[i];
				}
			}
			return result;
		}
    };
	
	var thresholdsArray = function (measure, contractType, year, thresholds) {
		if (measure && contractType && year) {
			var arr = [];
			var meas = thresholds[year][contractType][measure];
			if (meas.higherIsBetter) {
				arr.push('<' + format(meas[2], meas.format));
				arr.push('≥' + format(meas[2], meas.format) + ' to ' + '<' + format(meas[3], meas.format));
				arr.push('≥' + format(meas[3], meas.format) + ' to ' + '<' + format(meas[4], meas.format));
				arr.push('≥' + format(meas[4], meas.format) + ' to ' + '<' + format(meas[5], meas.format));
				arr.push('≥' + format(meas[5], meas.format));
			} else {
				arr.push('>' + format(meas[2], meas.format));
				arr.push('>' + format(meas[3], meas.format) + ' to ' + '≤' + format(meas[2], meas.format));
				arr.push('>' + format(meas[4], meas.format) + ' to ' + '≤' + format(meas[3], meas.format));
				arr.push('>' + format(meas[5], meas.format) + ' to ' + '≤' + format(meas[4], meas.format));
				arr.push('≤' + format(meas[5], meas.format)); 
			}
			return arr;
		}
    };
	
	var measureStars = function (score, stars, measure, contractType, year, thresholds) {
		if (measure == 'Call Center – Pharmacy Hold Time' || measure == 'Drug Plan Quality Improvement') {
			return stars;
		} else if (!_.isNull(score)) {
            var meas = thresholds[year][contractType][measure];
			if (meas.higherIsBetter) {
				for (var i = 5; i > 1; i--) {
				  if (score >= meas[i]) return i;
				}
			} else {
				for (var i = 5; i > 1; i--) {
				  if (score <= meas[i]) return i;
				}
			}
			return 1;
        }
        return null;
    };
	
	var summaryStars = function(scores, stars, contractType, year, thresholds) {
        if (scores) {
		  var den = 0;
          var num = 0;
          _.keys(thresholds[year][contractType]).forEach( function (measure) {
            var _stars = measureStars(scores[measure], stars[measure], measure, contractType, year, thresholds); 
			var weighting = thresholds[year][contractType][measure]['Weighting'];
			if (!_.isNull(_stars)) {
				den += weighting;
				num += _stars * weighting;
			}
          });
          return num / den;
        }
		return;
    };
	
	var _iFactor = function (scores, stars, contractType, year, starsThresholds, iFactorThresholds) {
		var result = 0;
		if (scores) {
			var _summaryStars = summaryStars(scores, stars, contractType, year, starsThresholds);
			var SUMWX = 0;
			var W = 0;
			var n = 0;
			_.keys(starsThresholds[year][contractType]).forEach( function (measure) {
				var _measureStars = measureStars(scores[measure], stars[measure], measure, contractType, year, starsThresholds); 
				var weighting = starsThresholds[year][contractType][measure]['Weighting'];
				if (!_.isNull(_measureStars)) {
					SUMWX += (_summaryStars - _measureStars) ^ 2 * weighting;
					W += weighting;
					n += 1;
				}
			});
			var variance = n * SUMWX / (W * (n - 1));
			var improvement = _.isNull(stars['Drug Plan Quality Improvement']) ? 'without' : 'with';
			if (_summaryStars >= iFactorThresholds[year]['Performance'][improvement]['85th'][contractType] && variance <= iFactorThresholds[year]['Variance'][improvement]['30th'][contractType]) {
				result = 0.4;
			} else if (_summaryStars >= iFactorThresholds[year]['Performance'][improvement]['85th'][contractType] && variance <= iFactorThresholds[year]['Variance'][improvement]['70th'][contractType]) {
				result = 0.3;
			} else if (_summaryStars >= iFactorThresholds[year]['Performance'][improvement]['65th'][contractType] && variance <= iFactorThresholds[year]['Variance'][improvement]['30th'][contractType]) {
				result = 0.2;
			} else if (_summaryStars >= iFactorThresholds[year]['Performance'][improvement]['65th'][contractType] && variance <= iFactorThresholds[year]['Variance'][improvement]['70th'][contractType]) {
				result = 0.1;
			}
			return result;
		}
		return;
	};
	  
	iFactor = function (scores, stars, contractType, year, starsThresholds, iFactorThresholds) {
		if (scores) {
			var withImprovement = _iFactor(scores, stars, contractType, year, starsThresholds, iFactorThresholds);
			var withoutImprovement = _iFactor(scores, _.assign(_.clone(stars), {'Drug Plan Quality Improvement': null}), contractType, year, starsThresholds, iFactorThresholds);
			return withImprovement > withoutImprovement ? withImprovement : withoutImprovement;
		}
	}
	
    var self = {
      displayThresholds: displayThresholds,
	  thresholdsArray: thresholdsArray,
      measureStars: measureStars,
      summaryStars: summaryStars,
	  iFactor: iFactor
	};
	
	return self;
}]);
 services.factory('starsData', ['$http', '$q', function ($http, $q) {
    return {
     getMeasures: function() {
       return $http.get('data/measures.json').then(function(result) {
           return result.data;
       });
     }
   }
 }]);
 services.factory('summaryData', ['$http', '$q', function ($http, $q) {
    return {
     getSummaryScores: function() {
       return $http.get('data/summary.json').then(function(result) {
           return result.data;
       });
     }
   }
 }]);
  services.factory('statsService', function () {
	var distro = function (arr, key, higherIsBetter) {
		//http://education-portal.com/academy/lesson/finding-percentiles-in-a-data-set-formula-examples-quiz.html
		//(k + .5r) / n = p
		var result = {};
		var sortedArr = [];
		if (higherIsBetter) {
			//sortedArr = _.sortBy(_.filter(arr, function (val) {return _.isNumber(val[key]);}), key);
			sortedArr = _.filter(arr, function (val) {return _.isFinite(val[key]);});
			sortedArr.sort(function (a, b) {return a[key] - b[key];});
		} else {
			//sortedArr = _.sortBy(_.filter(arr, function (val) {return _.isNumber(val[key]);}), function (item) {return -item[key];});
			sortedArr = _.filter(arr, function (val) {return _.isFinite(val[key]);});
			sortedArr.sort(function (a, b) {return b[key] - a[key];});
		}
		var len = sortedArr.length;
		for (var i = 0; i < len; i++) {
			var index = sortedArr[i][key];
			if(_.has(result, index)) {
				var obj = result[index];
				obj.frequency += 1;
				obj.rank -= 1;
				obj.percentile = (obj.valuesBelow + (0.5 * obj.frequency)) / len;
			} else {
				result[index] = {
					valuesBelow: i,
					frequency: 1,
					rank: len - i,
					percentile: (i + 0.5) / len
				};
			}
		}
		return result;
	};
	var histogram = function (label, data, measure, higherIsBetter) {
		var _distro = distro(data, measure, higherIsBetter);
		var x = [];
		var y = [label];
		for (var prop in _distro) {
			x.push(Number(prop));
		}
		x.sort();
		for (var i = 0; i < x.length; i++) {
			y.push(_distro[x[i]]['frequency']);
		}
		x.unshift('x');
		return {
			x: x,
			y: y
		};
	};
	var percentile = function (label, data, measure, higherIsBetter) {
		var _distro = distro(data, measure, higherIsBetter);
		var x = ['x'];
		var y = [label];
		for (var prop in _distro) { 
			x.push(_distro[prop]['percentile']);
			y.push(prop);
		}
		return {
			x: x,
			y: y
		};
	};
    return {
     distro: distro,
	 histogram: histogram,
	 percentile: percentile
   }
 });