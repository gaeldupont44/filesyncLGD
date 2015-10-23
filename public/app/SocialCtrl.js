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
      this.getCaretPosition(taField);
      $scope.$apply();
      this.setCaretPosition(taField, this.cursorPosVal);
    }

    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));

    this.cursorPosVal = -1;
    /* se bloque permet de mettre a jour la position du cursor à chaque déplacement de celui ci
	(evenement récupérer par ng-click et ng-keyup)
    this.getCursorPos = function($event) {
      var myEl = $event.target;
      this.getCaretPosition(myEl);
    };*/
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
 
	if(taField.setSelectionRange)
	{
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
