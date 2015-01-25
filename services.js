var services = angular.module('services', []);
services.factory("_", function() {
    return window._;
});
services.factory("graphService", ["$filter", "_",
  function($filter, _) {
    var _columns = function (claims, from, thru) {
      var data = [];
      var ctr = claims.length;
      var xaxis = ['x'];
      for (var i = from; i <= thru; i++) {
        xaxis.push(Date.getWithDaysFromEpoch(i));
      }
      data.push(xaxis);
      claims.forEach(function (claim) {
        var values = ['Claim #' + claim.number];
        for (var i = from; i <= thru; i++) {
          if (i == claim.dateOfFill.getDaysFromEpoch() || 
            i == claim.dateOfFillAdj.getDaysFromEpoch() || 
            i == claim.dateOfLastDose.getDaysFromEpoch()) {
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
    var _regions = function (claims, from, thru) {
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
    var graph = function (adherence, from, thru, type) {
      type = type || 0;
      var options = {};
      switch(type) {
        case 0: 
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
                    format: '%m-%y'
                  }
                },
                y: {
                  tick: {
                    format: function (d) { 
                      return $filter('percentage')(d);
                    }
                  }
                }
              },
              grid: {
                y: {
                  lines: [
                    {value: .8, text: 'Adherent'}
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
        case 1: 
          var columns = _columns(adherence.claims, from, thru);
          var regions = _regions(adherence.claims, from, thru);
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
                  format: '%m/%y'
                }
              },
              y: {
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
      }
      if (options) return c3.generate(options);
    };
    return {
      graph: graph
    };
}]);

services.factory("pdcService", ["_",
  function(_) {
    var _filterClaims = function (claims, from, thru) {
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
        return claim.dateOfFill.getDate();
      });
      return uniq.length;
    };
    var _span = function (claims) {
      return (claims && claims.length > 1) ? (claims[claims.length - 1].dateOfFill.getDaysFromEpoch() - claims[0].dateOfFill.getDaysFromEpoch() + 1) : 0;
    };
    var _adjustForOverlap = function (sortedClaims) {
      var result = {};
      sortedClaims.forEach(function (claim) {
        var dateOfFill = claim.dateOfFill.getDaysFromEpoch();
        if (claim.drug.hasOwnProperty('id')) {
          var drugs = claim.drug.id.split('/');
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
    var adherence = function (claims, from, thru, threshold) {
      var filteredClaims = _filterClaims(claims, from, thru);
      var sortedClaims = _sortClaims(filteredClaims);
      var uniqueDatesOfFill = _uniqueDatesOfFill(sortedClaims);
      var span = _span(sortedClaims);
      var adjustedForOverlap = _adjustForOverlap(sortedClaims, from, thru);
      var drugsCovered = _drugsCovered(adjustedForOverlap, from, thru);
      var indexDate = _indexDate(drugsCovered, from, thru);
      var daysInMeasurementPeriod = _daysInMeasurementPeriod(drugsCovered, from, thru, threshold);
      var daysCovered = _daysCovered(drugsCovered, from, thru, threshold);
      var pdc = _pdc(daysInMeasurementPeriod, daysCovered, from, thru);
      var period = _period(from, thru);
      var thresholdExceeded = _thresholdExceeded(pdc, threshold);
      return {
        period: period,
        indexDate: indexDate,
        uniqueDatesOfFill: uniqueDatesOfFill,
        span: span,
        claims: sortedClaims,
        drugsCovered: drugsCovered,
        daysInMeasurementPeriod: daysInMeasurementPeriod,
        daysCovered: daysCovered,
        pdc: pdc,
        thresholdExceeded: thresholdExceeded
      }
    }
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
services.factory("drugsService", ["_", function(_) {
  var data = [
    {"id":"alogliptin/metformin","measure":"Diabetes Medications","category":"Biguanide & DPP-IV Inhibitor Combinations","label":"alogliptin/metformin"},
    {"id":"linagliptin/metformin","measure":"Diabetes Medications","category":"Biguanide & DPP-IV Inhibitor Combinations","label":"linagliptin/metformin"},
    {"id":"metformin/saxagliptin","measure":"Diabetes Medications","category":"Biguanide & DPP-IV Inhibitor Combinations","label":"metformin/saxagliptin"},
    {"id":"metformin/sitagliptin","measure":"Diabetes Medications","category":"Biguanide & DPP-IV Inhibitor Combinations","label":"metformin/sitagliptin"},
    {"id":"metformin/repaglinide","measure":"Diabetes Medications","category":"Biguanide & Meglitinide Combinations","label":"metformin/repaglinide"},
    {"id":"glipizide/metformin","measure":"Diabetes Medications","category":"Biguanide & Sulfonylurea Combination Products","label":"glipizide/metformin"},
    {"id":"glyburide/metformin","measure":"Diabetes Medications","category":"Biguanide & Sulfonylurea Combination Products","label":"glyburide/metformin"},
    {"id":"metformin/pioglitazone","measure":"Diabetes Medications","category":"Biguanide & Thiazolidinedione Combination Products","label":"metformin/pioglitazone"},
    {"id":"metformin/rosiglitazone","measure":"Diabetes Medications","category":"Biguanide & Thiazolidinedione Combination Products","label":"metformin/rosiglitazone"},
    {"id":"metformin","measure":"Diabetes Medications","category":"Biguanides","label":"metformin"},
    {"id":"simvastatin/sitagliptin","measure":"Diabetes Medications","category":"DPP-IV Inhibitor Combination Products","label":"simvastatin/sitagliptin"},
    {"id":"alogliptin","measure":"Diabetes Medications","category":"DPP-IV Inhibitors","label":"alogliptin"},
    {"id":"linagliptin","measure":"Diabetes Medications","category":"DPP-IV Inhibitors","label":"linagliptin"},
    {"id":"saxagliptin","measure":"Diabetes Medications","category":"DPP-IV Inhibitors","label":"saxagliptin"},
    {"id":"sitagliptin","measure":"Diabetes Medications","category":"DPP-IV Inhibitors","label":"sitagliptin"},
    {"id":"exenatide","measure":"Diabetes Medications","category":"Incretin Mimetic Agents","label":"exenatide"},
    {"id":"liraglutide","measure":"Diabetes Medications","category":"Incretin Mimetic Agents","label":"liraglutide"},
    {"id":"nateglinide","measure":"Diabetes Medications","category":"Meglitinides","label":"nateglinide"},
    {"id":"repaglinide","measure":"Diabetes Medications","category":"Meglitinides","label":"repaglinide"},
    {"id":"canagliflozin","measure":"Diabetes Medications","category":"SGLT2 Inhibitors","label":"canagliflozin"},
    {"id":"glimepiride/pioglitazone","measure":"Diabetes Medications","category":"Sulfonylurea & Thiazolidinedione Combination Products","label":"glimepiride/pioglitazone"},
    {"id":"glimepiride/rosiglitazone","measure":"Diabetes Medications","category":"Sulfonylurea & Thiazolidinedione Combination Products","label":"glimepiride/rosiglitazone"},
    {"id":"chlorpropamide","measure":"Diabetes Medications","category":"Sulfonylureas","label":"chlorpropamide"},
    {"id":"glimepiride","measure":"Diabetes Medications","category":"Sulfonylureas","label":"glimepiride"},
    {"id":"glipizide","measure":"Diabetes Medications","category":"Sulfonylureas","label":"glipizide"},
    {"id":"glyburide","measure":"Diabetes Medications","category":"Sulfonylureas","label":"glyburide"},
    {"id":"tolazamide","measure":"Diabetes Medications","category":"Sulfonylureas","label":"tolazamide"},
    {"id":"tolbutamide","measure":"Diabetes Medications","category":"Sulfonylureas","label":"tolbutamide"},
    {"id":"alogliptin/pioglitazone","measure":"Diabetes Medications","category":"Thiazolidinedione & DPP IV Inhibitor Combination Products","label":"alogliptin/pioglitazone"},
    {"id":"pioglitazone","measure":"Diabetes Medications","category":"Thiazolidinediones","label":"pioglitazone"},
    {"id":"rosiglitazone","measure":"Diabetes Medications","category":"Thiazolidinediones","label":"rosiglitazone"},
    {"id":"amlodipine/benazepril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"amlodipine/benazepril"},
    {"id":"benazepril/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"benazepril/hydrochlorothiazide"},
    {"id":"captopril/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"captopril/hydrochlorothiazide"},
    {"id":"enalapril/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"enalapril/hydrochlorothiazide"},
    {"id":"fosinopril/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"fosinopril/hydrochlorothiazide"},
    {"id":"hydrochlorothiazide/lisinopril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"hydrochlorothiazide/lisinopril"},
    {"id":"hydrochlorothiazide/moexipril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"hydrochlorothiazide/moexipril"},
    {"id":"hydrochlorothiazide/quinapril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"hydrochlorothiazide/quinapril"},
    {"id":"trandolapril/verapamil","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Combination Products","label":"trandolapril/verapamil"},
    {"id":"benazepril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"benazepril"},
    {"id":"captopril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"captopril"},
    {"id":"enalapril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"enalapril"},
    {"id":"fosinopril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"fosinopril"},
    {"id":"lisinopril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"lisinopril"},
    {"id":"moexipril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"moexipril"},
    {"id":"perindopril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"perindopril"},
    {"id":"quinapril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"quinapril"},
    {"id":"ramipril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"ramipril"},
    {"id":"trandolapril","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ACE Inhibitor Medications","label":"trandolapril"},
    {"id":"aliskiren/valsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"aliskiren/valsartan"},
    {"id":"amlodipine/hydrochlorothiazide/olmesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"amlodipine/hydrochlorothiazide/olmesartan"},
    {"id":"amlodipine/hydrochlorothiazide/valsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"amlodipine/hydrochlorothiazide/valsartan"},
    {"id":"amlodipine/olmesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"amlodipine/olmesartan"},
    {"id":"amlodipine/telmisartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"amlodipine/telmisartan"},
    {"id":"amlodipine/valsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"amlodipine/valsartan"},
    {"id":"azilsartan/chlorthalidone","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"azilsartan/chlorthalidone"},
    {"id":"candesartan/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"candesartan/hydrochlorothiazide"},
    {"id":"eprosartan/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"eprosartan/hydrochlorothiazide"},
    {"id":"hydrochlorothiazide/irbesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"hydrochlorothiazide/irbesartan"},
    {"id":"hydrochlorothiazide/losartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"hydrochlorothiazide/losartan"},
    {"id":"hydrochlorothiazide/olmesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"hydrochlorothiazide/olmesartan"},
    {"id":"hydrochlorothiazide/telmisartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"hydrochlorothiazide/telmisartan"},
    {"id":"hydrochlorothiazide/valsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Combination Products","label":"hydrochlorothiazide/valsartan"},
    {"id":"azilsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"azilsartan"},
    {"id":"candesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"candesartan"},
    {"id":"eprosartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"eprosartan"},
    {"id":"irbesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"irbesartan"},
    {"id":"losartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"losartan"},
    {"id":"olmesartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"olmesartan"},
    {"id":"telmisartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"telmisartan"},
    {"id":"valsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"ARB Medications","label":"valsartan"},
    {"id":"aliskiren/amlodipine","measure":"Renin Angiotensin System (RAS) Antagonists","category":"Direct Renin Inhibitor Combination Products","label":"aliskiren/amlodipine"},
    {"id":"aliskiren/amlodipine/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"Direct Renin Inhibitor Combination Products","label":"aliskiren/amlodipine/hydrochlorothiazide"},
    {"id":"aliskiren/hydrochlorothiazide","measure":"Renin Angiotensin System (RAS) Antagonists","category":"Direct Renin Inhibitor Combination Products","label":"aliskiren/hydrochlorothiazide"},
    {"id":"aliskiren/valsartan","measure":"Renin Angiotensin System (RAS) Antagonists","category":"Direct Renin Inhibitor Combination Products","label":"aliskiren/valsartan"},
    {"id":"aliskiren","measure":"Renin Angiotensin System (RAS) Antagonists","category":"Direct Renin Inhibitor Medications","label":"aliskiren"},
    {"id":"amlodipine/atorvastatin","measure":"Statin Medications","category":"Statin Combination Products","label":"amlodipine/atorvastatin"},
    {"id":"atorvastatin/ezetimibe","measure":"Statin Medications","category":"Statin Combination Products","label":"atorvastatin/ezetimibe"},
    {"id":"ezetimibe/simvastatin","measure":"Statin Medications","category":"Statin Combination Products","label":"ezetimibe/simvastatin"},
    {"id":"lovastatin/niacin","measure":"Statin Medications","category":"Statin Combination Products","label":"lovastatin/niacin"},
    {"id":"niacin/simvastatin","measure":"Statin Medications","category":"Statin Combination Products","label":"niacin/simvastatin"},
    {"id":"simvastatin/sitagliptin","measure":"Statin Medications","category":"Statin Combination Products","label":"simvastatin/sitagliptin"},
    {"id":"atorvastatin","measure":"Statin Medications","category":"Statin Medications","label":"atorvastatin"},
    {"id":"fluvastatin","measure":"Statin Medications","category":"Statin Medications","label":"fluvastatin"},
    {"id":"lovastatin","measure":"Statin Medications","category":"Statin Medications","label":"lovastatin"},
    {"id":"pitavastatin","measure":"Statin Medications","category":"Statin Medications","label":"pitavastatin"},
    {"id":"pravastatin","measure":"Statin Medications","category":"Statin Medications","label":"pravastatin"},
    {"id":"rosuvastatin","measure":"Statin Medications","category":"Statin Medications","label":"rosuvastatin"},
    {"id":"simvastatin","measure":"Statin Medications","category":"Statin Medications","label":"simvastatin"}
  ];
  
  var getDrugs = function (measure) {
    return _.filter(data, function (item) {
      return item.measure == measure;
    });
  };
  
  return {
    getDrugs: getDrugs
  };
}]);
services.factory("dataService", ["_", function(_) {
  var data = [{
      id: 'Description',
    	value: 'Description',
    	type: 'text',
    	children: [{
    		value: 'PDC',
    		type: 'text',
    		children: [{
    			value: 'The percentage of patients 18 years and older who met the Proportion of Days Covered (PDC) threshold of 80 percent during the measurement period.',
    			type: 'text'
    		}]
    	}]
    }, {
      id: 'Definitions',
    	value: 'Definitions',
    	type: 'text',
    	children: [{
    		value: 'PDC',
    		type: 'text',
    		children: [{
    			value: 'The proportion of days in the measurement period "covered" by prescription claims for the same medication or another in its therapeutic category.',
    			type: 'text'
    		}]
    	}, {
    		value: 'PDC threshold',
    		type: 'text',
    		children: [{
    			value: 'The level of PDC above which the medication has a reasonable likelihood of achieving most of the potential clinical benefit (80% for diabetes and cardiovascular drugs; 90% for antiretrovirals)',
    			type: 'text'
    		}]
    	}]
    }, {
      id: 'Eligible Population',
    	value: 'Eligible Population',
    	type: 'text',
    	children: [{
    		value: 'Ages',
    		type: 'text',
    		children: [{
    			value: '18 years and older as of the last day of the measurement period.',
    			type: 'text'
    		}]
    	}, {
    		value: 'Continuous enrollment',
    		type: 'text',
    		children: [{
    			value: '…using enrollment data',
    			type: 'text',
    			children: [{
    				value: 'Subjects should be continuously enrolled during the measurement period. To determine continuous enrollment for a Medicaid beneficiary for whom enrollment is verified monthly, the member may not have more than a 1-month gap in coverage (i.e., a member whose coverage lapses for 2 months [60 consecutive days] is not considered continuously enrolled).',
    				type: 'text'
    			}]
    		}, {
    			value: 'Proxy for enrollment when using pharmacy-only data',
    			type: 'text',
    			children: [{
    				value: 'Two or more prescriptions for any medication, with 150 days between the first fill and the last fill, over a 12 month period.',
    				type: 'text'
    			}]
    		}]
    	}, {
    		value: 'Measurement Period',
    		type: 'text',
    		children: [{
    			value: 'The patient\'s measurement period begins on the date of the first fill of the target medication (i.e., index date) and extends through the last day of the enrollment period or until death or disenrollment. The index date should occur at least 91 days before the end of the enrollment period.',
    			type: 'text'
    		}]
    	}, {
    		value: 'Additional eligible population criteria',
    		type: 'text',
    		children: [{
    			value: 'Patients who filled at least two prescriptions in the therapeutic category on two unique dates of service during the measurement period.',
    			type: 'text'
    		}]
    	}]
    }, {   
      id: 'Rate',
      value: 'Rate',
    	type: 'text',
      children: [{
        value: 'Additional eligible population criteria',
    		type: 'text',
    		children: [{
    			value: 'Patients who filled at least two prescriptions in the therapeutic category on two unique dates of service during the measurement period.',
    			type: 'text'
    		}]
      }, {
        value: 'Denominator exclusion',
    		type: 'text',
    		children: [{
    			value: 'Patients with ESRD for Renin Angiotensin System (RAS) Antagonists; Patients with ESRD can be identified using the ICD-9 code 585.6 and/or by the RxHCC 121 - Dialysis Status',
    			type: 'text'
    		}]
      },{
      	value: 'Numerator',
      	type: 'text',
      	children: [{
      		value: 'The number of patients who met the PDC threshold during the measurement year. Follow the steps below for each patient to determine whether the patient meets the PDC threshold.',
    			type: 'text',
    			children: [{
    				value: 'Step 1',
    				type: 'text',
    				children: [{
    					value: 'Determine the patient’s measurement period, defined as the index prescription date to the end of the enrollment year, disenrollment, or death.',
    					type: 'text'
    				}]
    			}, {
    				value: 'Step 2',
    				type: 'text',
    				children: [{
    					value: 'Within the measurement period, count the days the patient was covered by at least one drug in the class based on the prescription fill date and days of supply. If prescriptions for the same drug (generic ingredient) overlap, then adjust the prescription start date to be the day after the previous fill has ended. Adjustment of overlap should also occur when there is overlap of a single drug product to a combination product containing the single drug or when there is an overlap of a combination product to another combination product where at least one of the drugs is common.',
    					type: 'text'
    				}]
    			}, {
    				value: 'Step 3',
    				type: 'text',
    				children: [{
    					value: 'Divide the number of covered days found in Step 2 by the number of days found in Step 1. Multiply this number by 100 to obtain the PDC (as a percentage) for each patient.',
    					type: 'text'
    				}]
    			}, {
    				value: 'Step 4',
    				type: 'text',
    				children: [{
    					value: 'Count the number of patients who had a PDC of 80% or greater and then divide by the total number of eligible patients.',
    					type: 'text'
    				}]
    			}]
    		}]
      }]
    }];
    
  return data;
}]);