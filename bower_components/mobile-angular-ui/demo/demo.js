var app = angular.module('MobileAngularUiExamples', ["ngRoute", "ngTouch", "mobile-angular-ui", "firebase", "googlechart"]);
app.factory("Auth", ["$firebaseAuth",
    function($firebaseAuth) {
        var authRef = new Firebase("https://iisjreg-playground.firebaseio.com/users");
        return $firebaseAuth(authRef);
    }
]);
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
    $routeProvider.when('/score4', {
        templateUrl: "score4.html"
    });
    $routeProvider.when('/score3/plays/:playID', {
        templateUrl: "score3-play.html"
        //params.playID
    });
    $routeProvider.when('/score4/plays/:playID', {
        templateUrl: "score4-play.html"
        //params.playID
    });
    $routeProvider.when('/score3/plays/history/:playID', {
        templateUrl: "score3-history.html"
        //params.playID
    });
    $routeProvider.when('/user', {
        templateUrl: "user.html",
    });
    $routeProvider.when('/friends', {
        templateUrl: "friends.html",
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
app.controller('UserController', function($rootScope, $scope, $firebase, $location) {
    //USER TESTING
    //CREATE A FIREBASE REFERENCE
    //var usersRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + $scope.auth.uid);
    //var user = $firebase(usersRef).$asObject();
    //$scope.user = user;
});
app.controller('FriendsController', function($rootScope, $scope, $firebase, $location) {
    //FRIEND TESTING
    //CREATE A FIREBASE REFERENCE
    //
    //STATUSES: APPROVED, REJECTED, WAITING (for requestee), PENDING (for requester)
    //
    //
    console.log("friends...");
    var myFriendsRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + $scope.user.uid + "/friends");
    var friends = $firebase(myFriendsRef).$asArray();
    friends.$loaded().then(function() {
        $scope.friends = friends;
    });
    $scope.add = {};
    $scope.addFriend = function() {
        $scope.add.error = "";
        console.log("add friend " + $scope.friendEmail);
        var time = new Date();
        //FIND USER BY EMAIL ADDRESS
        var usersRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/");
        var success = false;
        var friendUid = "";
        var currentFriendRecordID = "";
        var friendFriendRecordID = "";
        usersRef.once('value', function(dataSnapshot) {
            dataSnapshot.forEach(function(childSnapshot) {
                //CHECK EACH USER'S EMAIL
                var friendEmail = childSnapshot.child("password").child("email").val();
                var friendName = childSnapshot.child("details").child("name").val();
                console.log("1" + friendEmail);
                console.log("2" + friendName);
                if(friendEmail == $scope.friendEmail) {
                    console.log("3" + "match! " + friendEmail);
                    var friend = childSnapshot.val(); //FRIEND USER OBJECT
                    console.log("4" + friend);
                    var friendsListRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + $scope.user.uid + "/friends/" + friend.uid); //ADD CHILD FOR FRIEND UID
                    friendsListRef.set({
                        email: friendEmail, //EMAIL OF FRIEND
                        name: friendName, //NAME OF FRIEND
                        status: "PENDING",
                        requestSent: time.toUTCString()
                    });
                    //UPDATE FRIEND'S FRIEND LIST
                    console.log("5" + friend.uid); //FRIEND'S UID
                    var otherFriendsListRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + friend.uid + "/friends/" + $scope.user.uid); //ADD CHILD FOR CURRENT USER UID
                    var email = $scope.user.password.email; //CURRENT USER'S EMAIL
                    var name = $scope.userDetails.name; //CURRENT USER'S NAME
                    console.log("6" + email);
                    console.log("7" + name);
                    otherFriendsListRef.set({
                        email: email,
                        name: name,
                        status: "WAITING",
                        requestSent: time.toUTCString()
                    });
                    $rootScope.toggle('overlay-add-friend', 'off');
                    success = true;
                    return true;
                }
            });
            if(!success) {
                //error message
                console.log("user not found");
                $scope.add.error = "User not found";
            }
        });
    }
    $scope.processRequest = function(approved, requester) {
        var newStatus = "";
        if(approved == true) {
            newStatus = "APPROVED";
        }
        if(approved == false) {
            newStatus = "REJECTED";
        }
        //console.log("requester.$id " + request.$id + " " + request.status)
        var FriendsListRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + $scope.user.uid + "/friends/" + requester.$id);
        FriendsListRef.update({
            status: newStatus
        });
        console.log("current user updated");
        var otherFriendsListRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + requester.$id + "/friends/" + $scope.user.uid);
        otherFriendsListRef.update({
            status: newStatus
        });
        console.log("updated other user");
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
        //PLAY REF
        var playRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID);
        var play = $firebase(playRef).$asObject();
        $scope.play = play;
        //PLAYERS REF
        var playerRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID + "/players");
        var players = $firebase(playerRef).$asArray();
        //CAHT REF
        var chatRef = new Firebase("https://iisjreg-playground.firebaseio.com/scores3/" + params.playID + "/chat");
        var messages = $firebase(chatRef).$asArray();
        var myFriendsRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + $scope.user.uid + "/friends");
        var friends = $firebase(myFriendsRef).$asArray();
        friends.$loaded().then(function() {
            $scope.friends = friends;
            console.log("score3 friends loaded: " + friends.length);
            //console.log(friends);
        });
        messages.$loaded().then(function() {
            $scope.messages = messages;
            $scope.numberOfMessages = messages.length;
        });
        players.$loaded().then(function() {
            console.log(players.length + " players in play");
            var numberOfPlayers = players.length;
            $scope.scorePredicate = "-playerScore";
            $scope.chatPredicate = '-ISOtime';
            $scope.numberOfPlayers = numberOfPlayers;
            $scope.players = players;
            //
            //functions
            //
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
                    playerName: playerName.substr(0, 13),
                    playerScore: 0,
                    turnOrder: 0,
                    tempScore: "",
                    history: "",
                    color: newColor
                });
                $scope.playerName = "";
            }
            $scope.addFriendPlayer = function() {
                var time = new Date();
                //console.log("update time");
                play.time = time.toUTCString();
                play.ISOtime = time.toISOString();
                play.numberOfPlayers += 1;
                play.$save();
                var friend = $scope.addFriend;
                var friendColor = "";
                var friendName = "";
                var friendUserRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + friend.$id);
                friendUserRef.once('value', function(dataSnapshot) {
                    //console.log("get user details");
                    friendColor = dataSnapshot.child("details").child("favouriteColor").val();
                    friendName = dataSnapshot.child("details").child("name").val();
                    //console.log(friendColor);
                    numberOfPlayers += 1;
                    $scope.players.$add({
                        userUid: friend.$id,
                        playerName: friendName.substr(0, 13),
                        playerScore: 0,
                        turnOrder: 0,
                        tempScore: "",
                        history: "",
                        color: friendColor
                    });
                    console.log(friendName + "added");
                });
            }
            $scope.addUserPlayer = function() {
                var time = new Date();
                //console.log("update time");
                play.time = time.toUTCString();
                play.ISOtime = time.toISOString();
                play.numberOfPlayers += 1;
                play.$save();
                numberOfPlayers += 1;
                var name = $scope.userDetails.name;
                $scope.players.$add({
                    userUid: $scope.user.uid,
                    playerName: name.substr(0, 13),
                    playerScore: 0,
                    turnOrder: 0,
                    tempScore: "",
                    history: "",
                    color: $scope.userDetails.favouriteColor
                });
                console.log("added user");
            }
            $scope.addMessage = function() {
                var time = new Date();
                console.log("msg");
                console.log(time);
                console.log($scope);
                console.log($scope.$$childTail.msg);
                console.log($scope.user.uid);
                console.log($scope.userDetails.name);
                $scope.messages.$add({
                    name: $scope.userDetails.name,
                    text: $scope.$$childTail.msg,
                    time: time.toUTCString(),
                    ISOtime: time.toISOString()
                });
                //RESET MESSAGE
                $scope.$$childTail.msg = "";
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
                $rootScope.toggle('overlay-' + player.$id, 'off');
                var time = new Date();
                //console.log("update time");
                play.time = time.toUTCString();
                play.ISOtime = time.toISOString();
                play.$save();
                var newScore = player.playerScore + Number(update);
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
                //console.log(player.history);
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
            //console.log(plays.length + " current games");
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
                console.log($scope.user.uid);
                $scope.plays.$add({
                    gameName: gameName,
                    creatorUid: $scope.user.uid,
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
    //var timer = [];
    var params = $routeParams;
    if(params.playID) {
        var testdata = new google.visualization.DataTable();
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
            //
            //
            //
            //TODO convert data!
            //
            //
            //
            //
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
            //
            //test:
            var data1a = new Date("Thu, 11 Dec 2014 21:49:18 GMT").toTimeString();
            var data2a = new Date("Thu, 11 Dec 2014 22:00:18 GMT").toTimeString();
            var data3a = new Date("Thu, 11 Dec 2014 22:05:18 GMT").toTimeString();
            var data4a = new Date("Thu, 11 Dec 2014 22:49:18 GMT").toTimeString();
            var data5a = new Date("Thu, 11 Dec 2014 23:50:18 GMT").toTimeString();
            var data6a = new Date("Thu, 11 Dec 2014 23:55:18 GMT").toTimeString();
            var data7a = new Date("Thu, 11 Dec 2014 23:55:18 GMT").toTimeString();
            var data8a = new Date("Fri, 12 Dec 2014 00:10:18 GMT").toTimeString();
            testdata.addRows([
                [data1a.substr(0, 5), 2, 4],
                [data2a.substr(0, 5), 3, 5],
                [data3a.substr(0, 5), 5, 1],
                [data4a.substr(0, 5), 10, 1],
                [data5a.substr(0, 5), 11, 1],
                [data6a.substr(0, 5), 1, 6],
                [data7a.substr(0, 5), 6, 5],
                [data8a.substr(0, 5), 6, 5]
            ]);
            //
            //row per 'time-slot' - e.g. KeepScore uses 5 minute slots
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
                    "title": "TEST DATA ONLY"
                },
                "domainAxis": {
                    "type": "category"
                }
            };
            chart1.formatters = {};
            $scope.chart = chart1;
        });
    } else {
        console.log("no params");
    }
});
app.controller('MainController', function($rootScope, $scope, $firebase, $window, Auth) {
    //ROUTING
    $rootScope.$on("$routeChangeStart", function() {
        $rootScope.loading = true;
    });
    $rootScope.$on("$routeChangeSuccess", function() {
        $rootScope.loading = false;
    });
    //AUTH
    $scope.form = {};
    $scope.auth = Auth;
    $scope.user = $scope.auth.$getAuth();
    if($scope.user) {
        var userRef = new Firebase("https://iisjreg-playground.firebaseio.com/users/" + $scope.user.uid + "/details");
        var userDetails = $firebase(userRef).$asObject();
        $scope.userDetails = userDetails;
    }
    //$scope.userDetails = $scope.user.child("details");
    //FUNCTIONS
    $scope.login = function() {
        console.log("login");
        $scope.auth.$authWithPassword({
            email: $scope.form.email,
            password: $scope.form.password
        }).then(function(authData) {
            console.log("Logged in as:", authData.uid);
            //$location.path(absUrl);
            $window.location.reload();
        }).
        catch(function(error) {
            console.error("Authentication failed:", error);
        });
    }
    $scope.logout = function() {
        console.log("login");
        $scope.auth.$unauth();
        $window.location.reload();
    }
    $scope.newAccount = function() {
        var isNewUser = true;
        console.log("new account");
        console.log($scope.form.newEmail);
        console.log($scope.form.newName);
        console.log($scope.form.newColor);
        $scope.auth.$createUser($scope.form.newEmail, $scope.form.newPassword).then(function() {
            console.log("User created successfully!");
            var usersRef = new Firebase("https://iisjreg-playground.firebaseio.com/users");
            usersRef.onAuth(function(authData) {
                if(authData && isNewUser) {
                    // save the user's profile into Firebase so we can list users,
                    // use them in Security and Firebase Rules, and show profiles
                    usersRef.child(authData.uid).set(authData);
                    //try to save extra details
                    usersRef.child(authData.uid).child("details").set({
                        name: $scope.form.newName,
                        favouriteColor: $scope.form.newColor
                    });
                }
            });
            return $scope.auth.$authWithPassword({
                email: $scope.form.newEmail,
                password: $scope.form.newPassword
            });
        }).then(function(authData) {
            console.log("Logged in as:", authData.uid);
            $window.location.reload();
        }).
        catch(function(error) {
            console.error("Error: ", error);
        });
    }
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
});