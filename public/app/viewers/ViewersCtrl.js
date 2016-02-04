'use strict';
angular
  .module('FileSync')
  .controller('ViewersCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    function onViewersUpdated(viewers) {
      this.viewers = viewers;
      $scope.$apply();
    }
    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
  }]);
