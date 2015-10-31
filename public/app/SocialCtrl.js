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
      var len = viewersRect.length;
      for (var i = 0; i < len; i++) {
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
/*    
    ['input[type="text"]', 'textarea'].forEach(function (selector) {
        var element = document.querySelector(selector);
        var fontSize = getComputedStyle(element).getPropertyValue('font-size');
        var rect = document.createElement('div');
        document.body.appendChild(rect);
        rect.style.position = 'absolute';
        rect.style.backgroundColor = 'red';
        rect.style.height = fontSize;
        rect.style.width = '1px';
        ['keyup', 'click', 'scroll'].forEach(function (event) {
         element.addEventListener(event, update);
        });
        function update() {
          var coordinates = getCaretCoordinates(element, element.selectionEnd);
          console.log('(top, left) = (%s, %s)', coordinates.top, coordinates.left);
          rect.style.top = element.offsetTop
            - element.scrollTop
            + coordinates.top
            + 'px';
          rect.style.left = element.offsetLeft
            - element.scrollLeft
            + coordinates.left
            + 'px';
        }
      });
*/
    function onLGDUpdated(file) {
      
      var taField = document.getElementById("LGDtext");
      this.fileName = file.name;
      this.text = file.text;
      //Récupération de l'élément focus
      var inputFocused = document.activeElement;
      //Récurétion de la position du curseur
      this.getCaretPosition(taField);
      $scope.$apply();
      //Positionnement du curseur à la position récupérée
      this.setCaretPosition(taField, this.cursorPosVal);
      //Refocus sur l'élément récupérer
      inputFocused.focus();
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));
    

    //Initialisation de la position à -1 (Non focus)
    this.cursorPosVal = -1;

    //Lors de la modification de la position du cursor
    this.changeCursorPosition = function($event) {
      var myEl = $event.target;
      //Récupération de la nouvelle position
      this.getCaretPosition(myEl);
      //envoyer la nouvelle position
      SocketIOService.changeCursorPosition(this.cursorPosVal);
    };
    this.resetCursorPosition = function($event) {
      var myEl = $event.target;
      //envoyer la nouvelle position
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



