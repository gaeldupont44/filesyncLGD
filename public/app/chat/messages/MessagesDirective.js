
'use strict';
angular
  .module('FileSync')
.directive('messages', function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      messages: '=messages'
    },
    templateUrl: "app/chat/messages/messages.html"
  };
});