'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.fileName = '';
    this.lgdWrite = function() {
      SocketIOService.lgdWrite({ name: this.fileName, text: this.text});
    };
    this.sendMessage = function() {
      console.log(this.message);
      SocketIOService.sendMessage(this.message);
      this.message = "";
    };

    function onMessagesUpdated(message) {
      this.messages.push(message);
      $scope.$apply();
    }

    SocketIOService.onMessagesUpdated(onMessagesUpdated.bind(this));

    function onViewersUpdated(viewers) {
      //Element a gérer avec des directives
      var taField = document.getElementById("LGDtext");
      var viewersRect = document.getElementsByClassName("viewers");

      for(var i= 0; i < viewersRect.length; i++){
        viewersRect[i].parentNode.removeChild(viewersRect[i]);
      }
      for(var i = 0 ; i < viewers.length ; i++){
        if(viewers[i].cursorPosition > -1) {
          var coordinates = getCaretCoordinates(taField, viewers[i].cursorPosition);
          //console.log(viewers[i].nickname, coordinates.top, coordinates.left);
          var rect = document.createElement('div');
          rect.setAttribute("class", "viewers");
          rect.innerHTML = viewers[i].nickname;
          document.body.appendChild(rect);
          rect.style.textAlign = 'center';
          rect.style.position = 'absolute';
          rect.style.color = 'white';
          rect.style.backgroundColor = 'navy';
          rect.style.opacity = '0.75';
          rect.style.padding = '5px 10px';
          rect.style.top = taField.offsetTop
              - taField.scrollTop
              + coordinates.top - rect.offsetHeight
              + 'px';
            rect.style.left = taField.offsetLeft
              - taField.scrollLeft
              + coordinates.left - rect.offsetWidth/2
              + 'px';
          var caret = document.createElement('div');
          rect.appendChild(caret);
          caret.style.position = 'absolute';
          caret.style.backgroundColor = 'navy';
          caret.style.height = getComputedStyle(taField).getPropertyValue('font-size');
          caret.style.width = '1px';
          caret.style.top = rect.offsetHeight + 'px';
          caret.style.left = rect.offsetWidth/2 + 'px';
          }
        }
      this.viewers = viewers;
      $scope.$apply();
    }

    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
    //if someone write in the file
    function onLGDUpdated(file) {

      this.fileName = file.name;
      this.text = file.text;
      //Recover the focus element
      var inputFocused = document.activeElement;
      //Recover the position of the caret
      var oldCaretPosition = $scope.cursor;
      $scope.$apply();
      //Set Caret position of the previous position recovered
      $scope.cursor = oldCaretPosition;
      //Refocus on the element previously focused
      inputFocused.focus();
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));
    //on caret position change
    $scope.$watch("cursor", function(caretPosition) {
        SocketIOService.sendCursorPosition(caretPosition);
    });
    //on defocus
    this.resetCursorPosition = function() {
      //send defocused position
      SocketIOService.sendCursorPosition(-1);
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
