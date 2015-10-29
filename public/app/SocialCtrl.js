'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.fileName = '';
    this.text = '';
    this.modifBy = '';
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
      this.viewers = viewers;
      $scope.$apply();
    }

    SocketIOService.onViewersUpdated(onViewersUpdated.bind(this));
    

    function onLGDUpdated(file) {
      
      var taField = document.getElementById("LGDtext");
      this.fileName = file.name;
      this.text = file.text;
      this.modifBy = file.by;
      //Récurétion de la position du curseur
      this.getCaretPosition(taField);
      $scope.$apply();
      //Positionnement du curseur à la position récupérée
      this.setCaretPosition(taField, this.cursorPosVal);
      //Refocus de l'élément
      //this.setInputFocus(this.inputFocused);
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));

    this.getInputFocus = function($event) {
      this.inputFocused = $event.target;
    };

    /*this.setInputFocus = function(element) {
      element.focus ();
    };*/
    this.cursorPosVal = -1;
    //Lors de la modification de la position du cursor
    this.getCursorPos = function($event) {
      var myEl = $event.target;
      this.getCaretPosition(myEl);
      //envoyer la nouvelle position

    };

    this.getCaretPosition = function(taField) {
	var CaretPos = 0;
	// IE Support
	/*if (document.selection) {
		taField.focus ();
		var Sel = document.selection.createRange ();
		Sel.moveStart ('character', -taField.value.length);
		CaretPos = Sel.text.length;
	}
	// Firefox support
	else*/ if (taField.selectionStart || taField.selectionStart == '0')
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
}
  }]);
