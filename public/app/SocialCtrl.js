'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.fileName = '';
    //set the garet position to -1 (No focus)
    this.cursorPosVal = -1;
    this.taField = document.getElementById("LGDtext");
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
      var viewersRect = document.getElementsByClassName("viewers");
      for(var i= 0; i < viewersRect.length; i++){
        viewersRect[i].parentNode.removeChild(viewersRect[i]);
      }


      for(var i = 0 ; i < viewers.length ; i++){
        if(viewers[i].cursorPosition > -1) {
          var coordinates = getCaretCoordinates(this.taField, viewers[i].cursorPosition);
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
          rect.style.top = this.taField.offsetTop
              - this.taField.scrollTop
              + coordinates.top - rect.offsetHeight
              + 'px';
            rect.style.left = this.taField.offsetLeft
              - this.taField.scrollLeft
              + coordinates.left - rect.offsetWidth/2
              + 'px';
          var caret = document.createElement('div');
          rect.appendChild(caret);
          caret.style.position = 'absolute';
          caret.style.backgroundColor = 'navy';
          caret.style.height = getComputedStyle(this.taField).getPropertyValue('font-size');
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
      this.getCaretPosition(this.taField);
      $scope.$apply();
      //Set Caret position of the previous position recovered
      this.setCaretPosition(this.taField, this.cursorPosVal);
      //Refocus on the element previously focused
      inputFocused.focus();
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));

    //when cursor position change
    this.changeCursorPosition = function($event) {
      var myEl = $event.target;
      //Recover the new position
      this.getCaretPosition(myEl);
      //send new position
      SocketIOService.changeCursorPosition(this.cursorPosVal);
    };
    //when defocus
    this.resetCursorPosition = function($event) {
      var myEl = $event.target;
      //send no focus position
      SocketIOService.changeCursorPosition(-1);
    };
    this.getCaretPosition = function(taField) {
  var CaretPos = 0;
  // IE Support
  if (document.selection) {
    this.taField.focus ();
    var Sel = document.selection.createRange ();
    Sel.moveStart ('character', -taField.value.length);
    CaretPos = Sel.text.length;
  }
  // Firefox support
  else if (this.taField.selectionStart || this.taField.selectionStart == '0')
    CaretPos = this.taField.selectionStart;
       this.cursorPosVal = CaretPos;
     };
   //change the caret position
   this.setCaretPosition = function(taField, pos) {
  if(taField.setSelectionRange){
    taField.focus();
    taField.setSelectionRange(pos,pos);
  }
  else if (taField.createTextRange) {
    var range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
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