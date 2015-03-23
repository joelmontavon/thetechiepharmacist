var filters = angular.module('filters', []);
filters.filter('percentage', function ($filter, $window) {
	return function (input, decimals) {
		return $window.isNaN(input) ? '' : $filter('number')(input * 100, decimals) + '%';
	};
});
filters.filter('orderByMeasureID', function(){
 return function(input) {
    var arr = [];
    for(var key in input) {
		var obj = input[key];
		obj.Measure = key;
        arr.push(obj);
    }

    arr.sort(function(a, b){
        var a = parseInt(a['Measure ID'].substr(1,2));
        var b = parseInt(b['Measure ID'].substr(1,2));
        return a - b;
    });
    return arr;
 }
});
/*filters.filter('highlight', function($sce) {
  return function(text, phrases) {
    if (phrases) {
      var arr = phrases.split(';');
      arr.forEach( function (phrase) {
        phrase = phrase.trim();
        if (phrase)
          text = text.replace(new RegExp('(?!<.*?)('+ phrase +')(?![^<>]*?(</a>|>))', 'gi'),
            '<span class="highlighted">$1</span>');
      });
    }
    return $sce.trustAsHtml(text);
  };
});*/
filters.filter('multifilter', function($filter) {
  return function(items, phrases) {
    if (phrases) {
      var arr = phrases.split(' ');
      arr.forEach( function (phrase) {
        items = $filter('filter')(items, phrase);
      });
    }
    return items;
  };
});
filters.filter('firstOpioidComponent', function($filter) {
  return function(components) {
	var result = [];
	if (components) {
		components.forEach(function (component) {
			if (component.med > 0) {
				result.push(component)
			}
		});
	}
	return result;
  };
});
filters.filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});