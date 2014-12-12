// function updateScore(player, score) {
//     clearTimeout(timer);
//     //console.log(document.getElementById("tempScoreLabel-" + player));
//     var currentScore = Number(document.getElementById("tempScoreLabel-" + player).innerHTML); 
//     var newScore = currentScore + score;
//     document.getElementById("tempScoreLabel-" + player).innerHTML = newScore;
//     //wait 5 seconds than update hidden field which auto updates ng
//     var timer = setTimeout(function(){
//         document.getElementById("tempScore-" + player).value = newScore;
//         document.getElementById("tempScoreLabel-" + player).innerHTML = "";
//     },3000);
// }
var app = angular.module('MobileAngularUiExamples', ["ngRoute", "ngTouch", "mobile-angular-ui", "firebase", "googlechart"]);
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
    $routeProvider.when('/score3/plays/history/:playID', {
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
    //
    var timer = [];
    var params = $routeParams;
    if(params.playID) {
        //show individual play
        console.log("params playID = " + params.playID);
        var playRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID);
        var play = $firebase(playRef).$asObject();
        //play.$bindTo($scope, "play");
        $scope.play = play;
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
            $scope.predicate = "-playerScore";
            $scope.numberOfPlayers = numberOfPlayers;
            $scope.players = players;
            $scope.addPlayer = function() {
                var time = new Date();
                console.log("update time");
                play.time = time.toUTCString();
                play.ISOtime = time.toISOString();
                play.numberOfPlayers += 1;
                play.$save();
                var colors = ["blue", "red", "yellow", "green", "orange"];
                var newColor = $scope.color || colors[Math.floor(Math.random() * colors.length)];
                numberOfPlayers += 1;
                var playerName = $scope.playerName || 'anonymous';
                console.log(playerName);
                $scope.players.$add({
                    playerName: playerName,
                    playerScore: 0,
                    tempScore: "",
                    history: "",
                    color: newColor
                });
                $scope.playerName = "";
            }
            $scope.changeColor = function(player) {
                var colors = ["blue", "red", "yellow", "green", "orange"];
                var newColor = colors[Math.floor(Math.random() * colors.length)];
                console.log("change color of " + player.playerName + " to " + newColor);
                player.color = newColor;
                players.$save(player).then(function() {
                    // data has been saved to Firebase
                    console.log(" -> successful");
                });
            }
            $scope.updateScore = function(player, update) {
                var playerNum = players.$indexFor(player.$id);
                clearTimeout(timer[playerNum]); //ONE TIMER PER PLAYER
                player.tempScore = Number(player.tempScore) + update;
                wait(playerNum, function() {
                    finalupdate(player, player.tempScore);
                    player.tempScore = "";
                    players.$save(player);
                }, 3000);
            }

            function wait(ref, func, time) {
                timer[ref] = setTimeout(func, time); //PROBABLY NOT NECESSARY
            }

            function finalupdate(player, update) {
                var time = new Date();
                console.log("update time");
                play.time = time.toUTCString();
                play.ISOtime = time.toISOString();
                play.$save();
                var newScore = player.playerScore + update;
                console.log("Player " + player.playerName + ", " + update + " = " + newScore);
                player.playerScore = newScore;
                var maxHistory = 16;
                var newHistory = update.toString();
                if(player.history.length > 0) {
                    newHistory = newHistory + ", " + player.history;
                }
                if(player.history.length >= maxHistory) {
                    newHistory = newHistory.substr(0, maxHistory).concat("...");
                }
                player.history = newHistory;
                console.log(player.history);
                players.$save(player).then(function() {
                    // data has been saved to Firebase
                    console.log(" -> successful");
                    var time = new Date();
                    var playerScoreRef = playerRef.child(player.$id + "/scores");
                    playerScoreRef.push({
                        score: newScore,
                        time: time.toUTCString()
                    });
                });
            }
        });
    } else {
        //show all plays
        console.log("no params");
        var ref = new Firebase("https://iisjreg-playground.firebaseio.com/scores3");
        var plays = $firebase(ref).$asArray();
        plays.$loaded().then(function() {
            console.log(plays.length + " current games");
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
                    ISOtime: time.toISOString(),
                    numberOfPlayers: 0
                });
            }
        });
    }
});
app.controller('historyController', function($rootScope, $scope, $firebase, $routeParams) {
    //history TESTING
    //
    var timer = [];
    var params = $routeParams;
    if(params.playID) {
        //show individual play
        console.log("params playID = " + params.playID);
        var playRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID);
        var play = $firebase(playRef).$asObject();
        //play.$bindTo($scope, "play");
        $scope.play = play;
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
            $scope.predicate = "-playerScore";
            $scope.numberOfPlayers = numberOfPlayers;
            $scope.players = players;
            var chart1 = {};
            chart1.type = "LineChart";
            chart1.cssStyle = "width:100%";
            //TODO convert data!
            //
            //
            //
            //
            //
            //console.log(players);
            //
            //
            var testdata = new google.visualization.DataTable();
            // Declare columns
            testdata.addColumn('string', 'Score datetime');
            testdata.addColumn('number', 'score');
            testdata.addColumn('number', 'score 2');
            //
            //column per player
            //
            //for(var x in players) {
            //if(players[x].playerName) {
            //console.log(x + "/ " + players[x].playerName);
            //Add data.
            testdata.addRows([
                [new Date(2007, 5, 1).toString(), 2, 4],
                [new Date(2006, 7, 16).toString(), 3, 5],
                [new Date(2007, 11, 28).toString(), 5, 1],
                [new Date(2005, 3, 13).toString(), 10, null],
                [new Date(2005, 3, 13).toString(), 11, 2],
                [new Date(2005, 3, 13).toString(), 1, 6],
                [new Date(2011, 6, 1).toString(), 6, 5]
            ]);
            //
            //row per 'time-slot' - KeepScore uses 5 minute slots
            //
            //
            //scores[x].playerScore = 0;
            //console.log("player " + scores[x].playerID + " score to 0");
            //scores.$save(scores[x]).then(function() {
            //    // data has been saved to Firebase
            //    console.log(" -> updated scores");
            //});
            //}
            //}
            //data.addRows
            //
                       
            
            chart1.data = testdata; 
            
            chart1.options = {
                "legend": {
                    "position": "top",
                    "maxLines": 4
                },
                "displayExactValues": true,
                "hAxis": {
                    "title": "Time"
                },
                "domainAxis": {
                    "type": "category"
                }
            };
            chart1.formatters = {};
            $scope.chart = chart1;
        });
    } else {
        //show all plays
        console.log("no params");
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