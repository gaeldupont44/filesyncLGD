'use strict';
angular
  .module('FileSync')
.directive('viewer', function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      viewer: '=viewer'
    },
    templateUrl: "/app/viewers/viewer/viewer.html"
  };
});