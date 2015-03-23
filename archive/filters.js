var filters = angular.module('filters', []);
filters.filter('percentage', function ($filter, $window) {
	return function (input, decimals) {
		return $window.isNaN(input) ? '' : $filter('number')(input * 100, decimals || 1) + '%';
	};
});
filters.filter('highlight', function($sce) {
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
});