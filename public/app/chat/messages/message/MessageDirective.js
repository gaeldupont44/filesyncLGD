
'use strict';
angular
  .module('FileSync')
.directive('message', function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      message: '=message'
    },
    templateUrl: "app/chat/messages/message/message.html"
  };
});