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
    $routeProvider.when('/score2', {
        templateUrl: "score2.html"
    });
    $routeProvider.when('/score3', {
        templateUrl: "score3.html"
    });
    $routeProvider.when('/score3/plays/:playID', {
        templateUrl: "score3-play.html"
        //params.playID
    });
    
    $routeProvider.when('/score3/plays/:playID/history', {
        templateUrl: "score3-history.html"
        //params.playID
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
    //SCORE TESTING
    //CREATE A FIREBASE REFERENCE
    var ref = new Firebase("https://iisjreg-playground.firebaseio.com/scores");
    //
    // first score demo
    //
    //
    // GET SCORES AS AN OBJECT
    var scoresSync = $firebase(ref);
    var scores = scoresSync.$asObject();
    scores.$bindTo($scope, "scores");
    $scope.updateScores = function() {
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
app.controller('ScoreController2', function($rootScope, $scope, $firebase) {
    //SCORE TESTING - n Players
    //CREATE A FIREBASE REFERENCE
    var ref = new Firebase("https://iisjreg-playground.firebaseio.com/scores2");
    //
    // adds n-players scoring, with buttons for adding/subtracting
    // and adding /deleting players
    //
    //
    var scores = $firebase(ref).$asArray();
    scores.$loaded().then(function() {
        console.log(scores.length + " players");
        var numberOfPlayers = scores.length;
        ref.on("child_removed", function(snapshot) {
            var deletedPost = snapshot.val();
            console.log("Player '" + deletedPost.playerID + "' has been deleted");
            numberOfPlayers -= 1;
        });
        $scope.numberOfPlayers = numberOfPlayers;
        $scope.scores = scores;
        $scope.increasePlayers = function() {
            numberOfPlayers += 1;
            $scope.scores.$add({
                playerID: numberOfPlayers,
                playerScore: 0
            });
        }
        $scope.updateScore = function(score, update) {
            console.log("Player " + score.playerID + ", +/-" + update);
            score.playerScore += update;
            //playerScore = playerScore + update;
            scores.$save(score).then(function() {
                // data has been saved to Firebase
                console.log(" -> updated");
            });
        }
        $scope.resetGame = function() {
            for(var x in scores) {
                if(scores[x].playerID) {
                    console.log(x);
                    scores[x].playerScore = 0;
                    console.log("player " + scores[x].playerID + " score to 0");
                    scores.$save(scores[x]).then(function() {
                        // data has been saved to Firebase
                        console.log(" -> updated scores");
                    });
                }
            }
        }
        $scope.logInfo = function() {
            console.log(scores);
        }
    });
});
app.controller('ScoreController3', function($rootScope, $scope, $firebase, $routeParams) {
    //SCORE TESTING - n Players
    //
    //add score history & plays (instances of a game)
    //
    //TODO struct: scores3>players>$playerID>$scoreID>score & timestamp ???
    //
    //
    //
    var params = $routeParams;
    if(params.playID) {
        //show play
        console.log("params playID = " + params.playID);
        var playRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID);
        var play = $firebase(playRef).$asObject();
        play.$bindTo($scope, "play");
        
        var playerRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID + "/players");
        var players = $firebase(playerRef).$asArray();
        
        players.$loaded().then(function() {
            console.log(players.length + " players in play");
            var numberOfPlayers = players.length;
            playerRef.on("child_removed", function(snapshot) {
                var deletedPost = snapshot.val();
                console.log("Player '" + deletedPost.playerName + "' has been deleted");
                numberOfPlayers -= 1;
            });
            
            //playerRef.on("value", function(snapshot) {
            //    var post = snapshot.val();
            //    console.log(post);
            //});
            
            $scope.numberOfPlayers = numberOfPlayers;
            $scope.players = players;
            $scope.addPlayer = function() {
                numberOfPlayers += 1;
                var playerName = $scope.playerName || 'anonymous';
                //ADD TO FIREBASE
                console.log(playerName);
                $scope.players.$add({
                    playerName: playerName,
                    playerScore: 0
                });
                $scope.playerName = "";
            }
            $scope.updateScore = function(player, update) {
                console.log("Player " + player.playerName + ", " + update);
                var newScore = player.playerScore + update; 
                player.playerScore = newScore;
                players.$save(player).then(function() {
                // data has been saved to Firebase
                    console.log(" -> updated");
                });
                var time = new Date();
                var playerScoreRef = playerRef.child(player.$id + "/scores");
                playerScoreRef.push({
                    score: newScore,
                    time: time.toUTCString()
                });
            }
            
        });
        
    } else {
        
        //show all plays
        console.log("no params");
        var ref = new Firebase("https://iisjreg-playground.firebaseio.com/scores3");
        var plays = $firebase(ref).$asArray();
        plays.$loaded().then(function() {
            console.log(plays.length + " games in play");
            var numberOfPlays = plays.length;
            ref.on("child_removed", function(snapshot) {
                var deletedPost = snapshot.val();
                console.log("PlayID '" + deletedPost.$id + "' has been deleted");
                numberOfPlays -= 1;
            });
            $scope.numberOfPlays = numberOfPlays;
            $scope.plays = plays;
            $scope.addPlay = function() {
                numberOfPlays += 1;
                var gameName = $scope.gameName || 'anonymous';
                var time = new Date();
                //ADD TO FIREBASE
                console.log(gameName);
                console.log(time);
                $scope.plays.$add({
                    gameName: gameName,
                    time: time.toUTCString(),
                    ISOtime: time.toISOString()
                });
            }
        });
    }
});
app.controller('historyController', function($rootScope, $scope, $firebase) {
    //history TESTING
    

    
    
});
app.controller('MainController', function($rootScope, $scope) {
    //ROUTING
    $rootScope.$on("$routeChangeStart", function() {
        $rootScope.loading = true;
    });
    $rootScope.$on("$routeChangeSuccess", function() {
        $rootScope.loading = false;
    });
    //OTHER DEMO STUFF THAT CAN EVELUATUALLY GO
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