'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.fileName = '';
    this.text = '';
    this.lgdWrite = function() {
      console.log(this.text);
      SocketIOService.lgdWrite({ name: this.fileName, text: this.text });
      console.log("veux ecrire : " + this.text);
    };
    this.sendMessage = function() {
      console.log(this.message);
      SocketIOService.sendMessage(this.message);
    };

    function onMessagesUpdated(message) {
      function updateHTML(){
	document.getElementById('chatInput').value = "";
        var element = document.getElementById('chatText');
        element.scrollTop = element.scrollHeight;
      }
      this.messages.push(message);
      
      $scope.$apply();
      this.message = "";
      setTimeout(updateHTML, 250);
    }

    SocketIOService.onMessagesUpdated(onMessagesUpdated.bind(this));

    function onViewersUpdated(viewers) {
      this.viewers = viewers;
      $scope.$apply();
    }

    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
    

    function onLGDUpdated(file) {
      this.fileName = file.name;
      this.text = file.text;
      $scope.$apply();
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));
  }]);
