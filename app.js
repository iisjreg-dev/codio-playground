var myApp = angular.module("myApp", ["firebase"]);
myApp.controller('MyController', ['$scope', '$firebase',
    function($scope, $firebase) {
        //CREATE A FIREBASE REFERENCE
        var ref = new Firebase("https://iisjreg-playground.firebaseio.com/chat");
        // GET MESSAGES AS AN ARRAY
        $scope.messages = $firebase(ref).$asArray();
        //ADD MESSAGE METHOD
        $scope.addMessage = function(e) {
            //LISTEN FOR RETURN KEY
            if(e.keyCode === 13 && $scope.msg) {
                //ALLOW CUSTOM OR ANONYMOUS USER NAMES
                var name = $scope.name || 'anonymous';
                var time = new Date().toUTCString();
                //ADD TO FIREBASE
                $scope.messages.$add({
                    name: name,
                    text: $scope.msg,
                    time: time
                });
                //RESET MESSAGE
                $scope.msg = "";
            }
        }
        //OR CLICK
        $scope.addMessageClick = function() {
            var name = $scope.name || 'anonymous';
            var time = new Date().toUTCString();
            //ADD TO FIREBASE
            $scope.messages.$add({
                name: name,
                text: $scope.msg,
                time: time
            });
            //RESET MESSAGE
            $scope.msg = "";
        }
    }
]);