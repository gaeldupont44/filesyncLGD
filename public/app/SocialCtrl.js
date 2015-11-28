'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.sendMessage = function() {
      SocketIOService.sendMessage(this.message);
      this.message = "";
    };
    function onMessagesUpdated(message) {
      this.messages.push(message);
      $scope.$apply();
    }
    SocketIOService.onMessagesUpdated(onMessagesUpdated.bind(this));

    function onViewersUpdated(viewers) {
      this.viewers = viewers;
      $scope.$apply();
    }
    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
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
