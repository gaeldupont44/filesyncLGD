'use strict';
angular
  .module('FileSync')
  .controller('SocialCtrl', ['$scope', 'SocketIOService', function($scope, SocketIOService) {
    this.viewers = [];
    this.messages = [];
    this.message = '';
    this.LGDdir = [];
    this.filename = 'Nom du Fichier';
    this.filepath = '';
    this.text = "Veuillez cliquer sur un fichier de l'arborescence";
    this.sendMessage = function() {
      SocketIOService.sendMessage(this.message);
      this.message = "";
    };
    this.lgdWrite = function() {
      SocketIOService.lgdWrite(this.text);
    };
    this.changeLGDfile = function(file){
      this.filename = file.name;
      this.filepath = file.path;
      $scope.$apply();
      SocketIOService.changeLGDfile(file.path);
    }
    this.createLGDrootDir = function() {
      SocketIOService.createLGDrootDir($scope.DirName);
    };
    this.createLGDdir = function(path, name) {
      SocketIOService.createLGDdir({path: path, name: name});
    };
    this.removeLGDdir = function(path) {
      SocketIOService.removeLGDdir(path);
    };
    this.createLGDrootFile = function() {
      SocketIOService.createLGDrootFile($scope.FileName);
    };
    this.createLGDfile = function(path, name) {
      SocketIOService.createLGDfile({path: path, name: name });
    };
    this.removeLGDfile = function(path) {
      SocketIOService.removeLGDfile(path);
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
    
    function onLGDdirUpdated(dir){
      this.LGDdir = dir;
      $scope.$apply();
    }
    SocketIOService.onLGDdirUpdated(onLGDdirUpdated.bind(this));

    //when a viewer write the file
    function onLGDUpdated(text) {
      this.text = text;
      $scope.$apply();
    }
    SocketIOService.onLGDUpdated(onLGDUpdated.bind(this));

    //on caret position change
    $scope.$watch("cursor", function(caretPosition) {
      if(caretPosition != undefined){
        SocketIOService.sendCursorPosition(caretPosition);
      }
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
}).directive('collection', function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      collection: '='
    },
    template: "<ul class='listFiles'><member ng-repeat='member in collection' member='member'></member></ul>"
  };
}).directive('member', function ($compile) {
  return {
    restrict: "E",
    replace: true,
    require: '^ngController', //Solve recursive problem
    scope: {
      member: '='
    },
    link: function (scope, element, attrs, SocialCtrl) {
      if (angular.isArray(scope.member.children)) {
        element.append("<li><removedir /><span class='LGDdirs'>{{member.name}}/</span>"+
          "<newdir />"+
          "<newdirform />"+
          "<newfile />"+
          "<newfileform />"+
          "</li>"+
          "<collection collection='member.children'></collection>");
      } else {
        element.append("<li><removefile /><lgdfile lgdfile='member'></lgdfile></li>");
      }
      $compile(element.contents())(scope);
    }
  };
}).directive('newfile', function () {
  return {
    restrict: "E",
    replace: true,
    template: "<input class='newFile' type='button' value='fichier'/>",
    link: function (scope, element, attrs) {
      element.bind('click', function() {
        if(element[0].value === 'fichier'){
          element[0].value = '-';
          element.next()[0].style.display = 'inline';
        } else {
          element[0].value = 'fichier';
          element.next()[0].style.display = 'none';
        }
        
      });
    }
  };
}).directive('newfileform', function () {
  return {
    restrict: "E",
    require: '^ngController', //Solve recursive problem
    replace: true,
    template: "<form style='display: none;'>"+
          "<input type='text' class='LGDFileDirInput' placeholder='Nom du fichier' />"+
          "<input type='submit' class='LGDFileDirInput' value='Créer' />"+
          "</form>",
    link: function (scope, element, attrs, SocialCtrl) {
      element.bind('submit', function() {
          SocialCtrl.createLGDfile(scope.member.path, element[0].firstChild.value);
      });
    }
  };
}).directive('newdir', function () {
  return {
    restrict: "E",
    replace: true,
    template: "<input class='newDir' type='button' value='dossier'/>",
    link: function (scope, element, attrs) {
      element.bind('click', function() {
        if(element[0].value === 'dossier'){
          element[0].value = '-';
          element.next()[0].style.display = 'inline';
        } else {
          element[0].value = 'dossier';
          element.next()[0].style.display = 'none';
        }
        
      });
    }
  };
}).directive('newdirform', function () {
  return {
    restrict: "E",
    require: '^ngController', //Solve recursive problem
    replace: true,
    template: "<form style='display: none;'>"+
          "<input type='text' class='LGDFileDirInput' placeholder='Nom du dossier' />"+
          "<input type='submit' class='LGDFileDirInput' value='Créer' />"+
          "</form>",
    link: function (scope, element, attrs, SocialCtrl) {
      element.bind('submit', function() {
          SocialCtrl.createLGDdir(scope.member.path, element[0].firstChild.value);
      });
    }
  };
}).directive('removedir', function () {
  return {
    restrict: "E",
    require: '^ngController', //Solve recursive problem
    replace: true,
    template: "<input class='removeDir' type='button' value='-'/>",
    link: function (scope, element, attrs, SocialCtrl) {
      element.bind('click', function() {
        SocialCtrl.removeLGDdir(scope.member.path);
      });
    }
  };
}).directive('removefile', function () {
  return {
    restrict: "E",
    require: '^ngController', //Solve recursive problem
    replace: true,
    template: "<input class='removeFile' type='button' value='-'/>",
    link: function (scope, element, attrs, SocialCtrl) {
      element.bind('click', function() {
        SocialCtrl.removeLGDfile(scope.member.path);
      });
    }
  };
}).directive('lgdfile', function () {
  return {
    restrict: "E",
    replace: true,
    require: '^ngController', //Solve recursive problem
    scope: {
      lgdfile: '='
    },
    template: "<input class='LGDfiles' type='button' value='{{lgdfile.name}}'/>",
    link: function (scope, element, attrs, SocialCtrl) {
      element.bind('click', function() {
        SocialCtrl.changeLGDfile(scope.lgdfile);
        var taLGD = angular.element(document.querySelector('#LGDtext'));
        taLGD.removeAttr('disabled');
      });
    }
  };
}).directive("lgdUpdate", function(){
  //set caret position of the element used when file change
  function setCaretPos(element, caretPos) {
    if (element.createTextRange) {
      var range = element.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      element.focus();
      if (element.selectionStart !== undefined) {
        element.setSelectionRange(caretPos, caretPos);
      }
    }
  }

  return {
    scope: {
      viewers: "=viewers",
      file: "=ngModel",
      caret: "=caretAware"
    },
    link: function(scope, element, attrs) {
      //watch if scope.file change
      scope.$watch(
        function () {
          return scope.file;
        },
          function (){
            var inputFocused = document.activeElement;
            //update position of the caret
            setCaretPos(element[0], scope.caret);
            inputFocused.focus();
          });

      scope.$watch(
        function () {
          return scope.viewers;
        },
        function (viewers) {
          if(scope.$parent.social.filename !== 'Nom du Fichier'){
            //remove all previous rectangle created
            var viewersRect = angular.element(document.getElementsByClassName("viewers"));	
            for(var i= 0; i < viewersRect.length; i++){
              viewersRect[i].parentNode.removeChild(viewersRect[i]);
            }
            //for all viewers
            for(var i = 0 ; i < viewers.length ; i++){
              //if viewer is focusing textarea
              if(viewers[i].cursorPosition > -1 && viewers[i].currentFilePath == scope.$parent.social.filepath) {
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
          }
        }, true
      )
    }
  }
});
