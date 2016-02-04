
'use strict';
angular
  .module('FileSync')
.directive('viewers', function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      viewers: '=viewers'
    },
    templateUrl: "app/viewers/viewers.html"
  };
});