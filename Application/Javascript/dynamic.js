$(document).ready(function(){
    
    const firebaseConfig = {
        apiKey: "AIzaSyC92FAonMbNaZiapSbs_A0RDzS0YPgpcMw",
        authDomain: "parkaway-comp2930.firebaseapp.com",
        databaseURL: "https://parkaway-comp2930.firebaseio.com",
        projectId: "parkaway-comp2930",
        storageBucket: "parkaway-comp2930.appspot.com",
        messagingSenderId: "817259487218",
        appId: "1:817259487218:web:c64c81d3cf0c5465"
    };
    firebase.initializeApp(firebaseConfig);
    
    let root = firebase.database();
    firebase.auth().onAuthStateChanged(firebaseUser => {

    if(firebaseUser != null) {
        
    } else {
       $("#add-update").replaceWith('<button id="log-in-btn"> Log in </button>');
    }

    // lot should be the ID of the button clicked on map, refer to my test example i uploaded on slack
    // which parking lot is picked
    let lot = window.location.hash.substring(1);
    
    $("#lotNo").replaceWith('<h2>' + lot + '</h2>');

    

    function updateStat() {
      var ref = firebase.database().ref("parkinglot/" + lot + "/comment0");
      ref.once("value")
        .then(function(snapshot) {
          var stat = snapshot.child("status").val();
     
          if(stat != null) {
            $("#status-div").replaceWith(extraStuff(stat));
          } else {
            $("#status-div").replaceWith('<p> Status: <b> Not Availiable </b><p>');
          }
        });
    }

    let i;
    let upid = "upid";
    let upid2 = "";
    let updateContent = "";

    // sets up divs for updates
    // div ids are upid0 ~ upid4
    for(i = 0; i < 3; i++) {
        upid2 = upid + i;
        updateContent = updateContent + '<div class="update-cls" id="' + upid2 + '"><div><p>Name</p> <p>status</p></div><div><p>comments</p></div><div><p>timestamp</p> </div></div>';
    }
    $("#updates").replaceWith(updateContent);
    


    let upvotebtn = 'up-btn';
    let upvotebtn2;
    let downvotebtn = 'down-btn';
    let downvotebtn2;
    refresh();

    //replaces each indiviual update with information   
    function refresh() {
    let j = 0;
    for(i = 0; i < 3; i++) {
        
        var ref = firebase.database().ref("parkinglot/" + lot + "/comment" + i);
        
        ref.once("value")
          .then(function(snapshot) {
            let comment = snapshot.child("message").val();
            let status = snapshot.child("status").val();
            let timestamp = snapshot.child("timestamp").val();
            let name = snapshot.child("username").val();   
            let s;
            console.log(status);
            if(status < 24) {
              s = '<p> Status: </p> <p style="color:#00bc45"> EMPTY </p>';
            } else if(status < 50) {
              s = '<p> Status: </p> <p style="color:#04f7a5"> MOSTLY EMPTY </p>';
            } else if (status < 75) {
              s =  '<p> Status: </p> <p style="color:#042cf7"> HALF FULL </p>';
            } else if (status < 100) {
              s = '<p> Status: </p> <p style="color:#ffa500"> MOSTLY FULL </p>';
            } else {
              s = '<p> Status: </p> <p style="color:#ff2100"> FULL </p>';
            }
    
            if(comment != null)
              $('#upid' + j++).replaceWith('<div><p> Name: ' + name + '</p>' + s +  '</div><div><p>Comments: ' + comment + '</p></div><div><p>' + timestamp + '</p> </div>');
          });
          
    }

    updateStat();
  }

    let statusVal = 'HALF';
    let sta = 50;

    //button takes to login page
    $("#log-in-btn").click(function() {
        window.location.href = "./login.html";
    }); 
    
    //  updates database with new comments
    $("#updt-btn").click(function() {
      let com = document.getElementById("txt-area").value;
      let userId = firebase.auth().currentUser.uid;
      let fName;
      let lName;
      let time =  (Date(Date.now())).toString();
      root.ref('useraccount').once('value').then(snapshot => {        
        let data = snapshot.val();
        let keys = Object.keys(data);
               
        for (let i = 0; i < keys.length; i++) {            
            let k = keys[i];
            let ud = data[k].uid;    
                   
            if (ud == userId) {
                fName = data[k].firstname;
                lName = data[k].lastname;       
                updateRest(fName + ' ' + lName, com, sta, time, 2);
            }
        }

        
      });
      

    });

    //takes commento, and puts it into commento+1
    function updateRest(a, b, c, d, o) {
   
      if(o > 0) { 
      var ref = firebase.database().ref("parkinglot/" + lot + "/comment" + (o - 1));
        ref.once("value")
          .then(function(snapshot) {
            let msg0 = snapshot.child("message").val();
            let status0 = snapshot.child("status").val();
            let timestamp0 = snapshot.child("timestamp").val();
            let username0 = snapshot.child("username").val(); 
          
            writeUserData(username0, msg0, status0, timestamp0, o);
            if(o > 1) {
            updateRest(a, b, c, d, 1);
            } else {
              updateRest(a, b, c, d, 0);
            }
          });
      } else {
          writeUserData(a, b, c, d, 0);
      } 

    }

      //writes data into comment + l
      //paramenters: name, comment, status, timestamp, comment index
      function writeUserData(n, co, st, t, l) {
        
        firebase.database().ref('parkinglot/' + lot + '/comment' + l).set({
          message: co,
          status: st,
          timestamp: t,
          username: n
        });

        if(l == 0) {
          firebase.database().ref('parkinglot/' + lot + '/full').set(
            st    
          );
          location.reload(); 
        }
    }

    //default color
    $("#color").css("color", "#042cf7");
    
    
    var values = ['EMPTY', 'MOSTLY EMPTY', 'HALF', 'MOSTLY FULL', 'FULL'];
    $('#slider1').change(function() {
        $('span').text(values[this.value]);
        statusVal = values[this.value];
        switch (values[this.value]) {
            case 'EMPTY':
                $("#color").css("color", "#00bc45");
                sta = 0;
                break;
            case 'MOSTLY EMPTY':
                $("#color").css("color", "#04f7a5");
                sta = 25;
                break;
            case 'HALF FULL':
                $("#color").css("color", "#042cf7");
                sta = 50;
                break;
            case 'MOSTLY FULL':
                $("#color").css("color", "#ffa500");
                sta = 75;
                break;
            case 'FULL':
                $("#color").css("color", "#ff2100");
                sta = 100;
                break; 
            default:
                $("#color").css("color", "#000000");
        }           
    });

    

    function extraStuff(q) {
      if(q < 24) {
        return  '<p> Status: <b style="color:#00bc45"> EMPTY </b> </p>';
      } else if(q < 50) {
        return  '<p> Status: <b style="color:#04f7a5"> MOSTLY EMPTY </b> </p>';
      } else if (q < 75) {
        return   '<p> Status: <b style="color:#042cf7"> HALF FULL </b> </p>';
      } else if (q < 100) {
        return  '<p> Status: <b style="color:#ffa500"> MOSTLY FULL </b> </p>';
      } else {
        return  '<p> Status: <b style="color:#ff2100"> FULL </b> </p>';
      }
    }  

    });
});