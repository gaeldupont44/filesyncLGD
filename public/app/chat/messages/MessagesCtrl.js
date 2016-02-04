'use strict';
angular
  .module('FileSync')
  .controller('MessagesCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.messages = [];
    function onMessagesUpdated(message) {
      this.messages.push(message);
      $scope.$apply();
    }
    SocketIOService.onMessagesUpdated(onMessagesUpdated.bind(this));
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
