'use strict';
angular
  .module('FileSync')
  .controller('MessageCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.message = '';
    this.sendMessage = function() {
      SocketIOService.sendMessage(this.message);
      this.message = "";
    };
  }])
.directive('autoscrollDown', function () {
  return {
    link: function postLink(scope, element, attrs) {
      scope.$watch(
        function () {
          return element.children().length;
        },
        function () {
          element.animate({ scrollTop: element.prop('scrollHeight')}, 500);
        }
      );
    }
  };
});
