/*globals io, Visibility, _ */
'use strict';
angular.module('FileSync', ['ngAnimate', 'hljs', 'eb.caret', 'leodido.caretAware']);

angular.module('FileSync')
  .constant('io', io)
  .constant('Visibility', Visibility)
  .constant('_', _);
