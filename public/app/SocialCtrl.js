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
      SocketIOService.lgdWrite({ name: this.fileName, text: this.text});
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

    function onLGDUpdated(file) {
      
      var taField = document.getElementById("LGDtext");
      this.fileName = file.name;
      this.text = file.text;
      //Recover the focus element
      var inputFocused = document.activeElement;
      //Recover the position of the caret
      this.getCaretPosition(taField);
      $scope.$apply();
      //Set Caret position of the previous position recovered
      this.setCaretPosition(taField, this.cursorPosVal);
      //Refocus on the element previously focused
      inputFocused.focus();
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));

    //set the garet position to -1 (No focus)
    this.cursorPosVal = -1;

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
		taField.focus ();
		var Sel = document.selection.createRange ();
		Sel.moveStart ('character', -taField.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else if (taField.selectionStart || taField.selectionStart == '0')
		CaretPos = taField.selectionStart;
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

  }]);



