var app = angular.module('MobileAngularUiExamples', ["ngRoute", "ngTouch", "mobile-angular-ui", "firebase"]);
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: "home.html"
    });
    $routeProvider.when('/scroll', {
        templateUrl: "scroll.html"
    });
    $routeProvider.when('/toggle', {
        templateUrl: "toggle.html"
    });
    $routeProvider.when('/tabs', {
        templateUrl: "tabs.html"
    });
    $routeProvider.when('/accordion', {
        templateUrl: "accordion.html"
    });
    $routeProvider.when('/overlay', {
        templateUrl: "overlay.html"
    });
    $routeProvider.when('/forms', {
        templateUrl: "forms.html"
    });
    $routeProvider.when('/chat', {
        templateUrl: "chat.html"
    });
    $routeProvider.when('/score', {
        templateUrl: "score.html"
    });
});

app.controller('ChatController', function($rootScope, $scope, $firebase) {
    //CHAT TESTING
    
    //CREATE A FIREBASE REFERENCE
    var ref = new Firebase("https://iisjreg-playground.firebaseio.com/chat");
    
    // GET MESSAGES AS AN ARRAY
    $scope.messages = $firebase(ref).$asArray();
    $scope.predicate = '-ISOtime';
    //ADD MESSAGE METHOD
    $scope.addMessage = function(e) {
        //LISTEN FOR RETURN KEY
        if(e.keyCode === 13 && $scope.msg) {
            //ALLOW CUSTOM OR ANONYMOUS USER NAMES
            var name = $scope.name || 'anonymous';
            var time = new Date();
            //ADD TO FIREBASE
            console.log(name);
            console.log(time);
            console.log($scope.msg);
            $scope.messages.$add({
                name: name,
                text: $scope.msg,
                time: time.toUTCString(),
                ISOtime: time.toISOString()
            });
            //RESET MESSAGE
            $scope.msg = "";
        }
    }
});

app.controller('ScoreController', function($rootScope, $scope, $firebase) {
    //CHAT TESTING
    
    //CREATE A FIREBASE REFERENCE
    var ref = new Firebase("https://iisjreg-playground.firebaseio.com/scores");
    
    // GET MESSAGES AS AN ARRAY
    var scoresSync = $firebase(ref);
    var scores = scoresSync.$asObject();
    scores.$bindTo($scope, "scores");

    $scope.updateScores = function() {
            //ALLOW CUSTOM OR ANONYMOUS USER NAMES
            var p1Score = $scope.scores.p1Score || 0;
            var p2Score = $scope.scores.p2Score || 0;

            var time = new Date();
            //ADD TO FIREBASE
            console.log(p1Score);
            console.log(p2Score);
            scores.p1Score = p1Score;
            scores.p2Score = p2Score;
            scores.$save();

    }
});

app.controller('MainController', function($rootScope, $scope) {
    //ROUTING
    $rootScope.$on("$routeChangeStart", function() {
        $rootScope.loading = true;
    });
    $rootScope.$on("$routeChangeSuccess", function() {
        $rootScope.loading = false;
    });
    
    
    
    //OTHER DEMO STUFF
    var scrollItems = [];
    for(var i = 1; i <= 100; i++) {
        scrollItems.push("Item " + i);
    }
    $scope.scrollItems = scrollItems;
    $scope.invoice = {
        payed: true
    };
    $scope.userAgent = navigator.userAgent;
    $scope.chatUsers = [{
        name: "Carlos  Flowers",
        online: true
    }, {
        name: "Byron Taylor",
        online: true
    }, {
        name: "Jana  Terry",
        online: true
    }];
});