'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.fileName = '';
    this.oldCaretPosition = 0;
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
      this.viewers = viewers;
      $scope.$apply();
    }

    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
    //when a viewer write the file
    function onLGDUpdated(file) {
      //Recover the focus element
      var inputFocused = document.activeElement;
      //Recover the position of the caret
      this.oldCaretPosition = $scope.cursor;
      this.fileName = file.name;
      this.text = file.text;
      $scope.$apply;
      //Refocus on the element previously focused
      inputFocused.focus();
      //Set Caret position of the previous position recovered;
    }
    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));
    //on caret position change
    $scope.$watch("cursor", function(caretPosition) {
        SocketIOService.sendCursorPosition(caretPosition);
    });

    //on caret position change
    $scope.$watch("text", function(newValue, oldValue, scope) {
        $scope.cursor = scope.social.oldCaretPosition;
        console.log(scope);
        console.log("$scope.cursor: " + $scope.cursor);
        console.log("$scope.oldCaretPosition: " + $scope.oldCaretPosition);
        console.log("scope.social.cursor: " + scope.social.cursor);
        console.log("scope.social.oldCaretPosition: " + scope.social.oldCaretPosition);
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
}).directive("rectViewers", function(){
  return {
    scope: {
      viewers: "=viewers",
      file: "=ngModel",
      mycaret: "=caretAware"
    },
    link: function(scope, element, attrs) {
      scope.$watch(
        function () {
          return scope.file;
        },
          function (){
            console.log(scope.mycaret);
          });

      scope.$watch(
        function () {
          return scope.viewers;
        },
        function (viewers) {
          //remove all previous rectangle created
          var viewersRect = angular.element(document.getElementsByClassName("viewers"));	
          for(var i= 0; i < viewersRect.length; i++){
            viewersRect[i].parentNode.removeChild(viewersRect[i]);
          }
          //for all viewers
          for(var i = 0 ; i < viewers.length ; i++){
            //if viewer is focusing textarea
            if(viewers[i].cursorPosition > -1) {
              var coordinates = getCaretCoordinates(element[0], viewers[i].cursorPosition);
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
              rect.style.top = element[0].offsetTop
                - element[0].scrollTop
                + coordinates.top - rect.offsetHeight
                + 'px';
              rect.style.left = element[0].offsetLeft
                - element[0].scrollLeft
                + coordinates.left - rect.offsetWidth/2
                + 'px';
              var caret = document.createElement('div');
              rect.appendChild(caret);
              caret.style.position = 'absolute';
              caret.style.backgroundColor = 'navy';
              caret.style.height = getComputedStyle(element[0]).getPropertyValue('font-size');
              caret.style.width = '1px';
              caret.style.top = rect.offsetHeight + 'px';
              caret.style.left = rect.offsetWidth/2 + 'px';
            }
          }
        }, true
      )
    }
  }
});
    