/*

Javasript to handle mouse dragging and release
to drag a string around the html canvas
Keyboard arrow keys are used to move a moving box around
(The mouse co-ordinates are wrong if the canvas is scrolled with scroll bars.
 Exercise: can you fix this?)

Here we are doing all the work with javascript and jQuery. (none of the words
are HTML, or DOM, elements. The only DOM element is just the canvas on which
where are drawing.

This example shows examples of using JQuery
JQuery syntax:
$(selector).action();
e.g.
$(this).hide() - hides the current element.
$("p").hide() - hides all <p> elements.
$(".test").hide() - hides all elements with class="test".
$("#test").hide() - hides the element with id="test".

Mouse event handlers are being added and removed using jQuery and
a jQuery event object is being passed to the handlers

Keyboard keyDown handler is being used to move a "moving box" around

Notice in the .html source file there are no pre-attached handlers.
*/

//Use javascript array of objects to represent words and their locations


//intended for keyboard control
var movingBox = {
  x: 50,
  y: 50,
  width: 100,
  height: 100
};

var timer; //used to control the free moving word
var timer2;
var pollingTimer; //timer to poll server for location updates


var deltaX, deltaY; //location where mouse is pressed
var background = document.getElementById("background");
var fontPointSize = 18; //point size for word text
var editorFont = "Arial"; //font for your editor

var paddleBeingMoved;

var puckMovingX = 5;
var puckMovingY = 0;

var p1Controlled = false;
var p2Controlled = false;

var playerJoined = 0;

var controllingPaddle;

var p1Score = 0;
var p2Score = 0;

var mover1 = document.getElementById('paddlediv1');
var mover2 = document.getElementById('paddlediv2');
var paddle1Img = document.getElementById('paddleImg1');
var paddle2Img = document.getElementById('paddleImg2');

var puck = document.getElementById('puck');

document.getElementById('paddlediv1').ondragstart = function() { return false; };
document.getElementById('paddlediv2').ondragstart = function() { return false; };
document.getElementById('puck').ondragstart = function() { return false; };
document.getElementById('background').ondragstart = function() { return false; };


mover1.style.left = "45px";
mover1.style.top = "200px";

mover2.style.left = "680px";
mover2.style.top = "200px";

puck.style.left = "400px";
puck.style.top = "215px";

var paddle1XSpeed = 0;
var oldPaddle1X = 45;
var paddle1YSpeed = 0;
var oldPaddle1Y = 200;
var paddle2XSpeed = 0;
var oldPaddle2X = 680;
var paddle2YSpeed = 0;
var oldPaddle2Y = 200;

background.addEventListener('mousemove', handleMouseMove);
mover1.addEventListener('mousedown', handleMouseDown);
mover2.addEventListener('mousedown', handleMouseDown);


//connect to server and retain the socket
var socket = io('http://' + window.document.location.host)
//var socket = io('http://localhost:3000')


socket.on('paddleData', function(data) {
//  console.log("player connected");
  var locationData = JSON.parse(data);
  if (locationData.moved == "mover1"){
    mover1.style.left = locationData.x;
    mover1.style.top = locationData.y;
  }else if (locationData.moved == "mover2"){
    mover2.style.left = locationData.x;
    mover2.style.top = locationData.y;
  }

  drawCanvas();
})

//Send the puck's location to all the clients
socket.on('puckData', function(data) {
//  console.log("player connected");
  var locationData = JSON.parse(data);
  puck.style.left = locationData.x;
  puck.style.top = locationData.y;
  puckMovingX = locationData.movingX;
  puckMovingY = locationData.movingY;

  drawCanvas();
})

socket.on('paddleControl', function(data) {
  var locationData = JSON.parse(data);
  if (locationData.paddle == "p1"){
    p1Controlled = locationData.pControl;
  }else if (locationData.paddle == "p2"){
    p2Controlled = locationData.pControl;
  }

})

var drawCanvas = function() {
  mover1.style.left = mover1.style.left;
  mover1.style.top = mover1.style.top;

  mover2.style.left = mover2.style.left;
  mover2.style.top = mover2.style.top;

  puck.style.left = puck.style.left;
  puck.style.top = puck.style.top;
};

/*function clickHandlerP1(e){
  //console.log("hit Paddle 1");
  var canvasX = e.pageX - 8; //use jQuery event object pageX and pageY
  var canvasY = e.pageY - 8;
  console.log("X is: " + canvasX);
  console.log("Y is: " + canvasY);
  paddleBeingMoved = mover1;
  if (paddleBeingMoved != null){
    deltaX = mover1.style.left - canvasX;
    deltaY = mover1.style.top - canvasY;
    $("#paddlediv1").mousemove(handleMouseMove);
    $("#paddlediv1").mouseup(handleMouseUp);
  }
}

function clickHandlerP2(e){
  //console.log("hit Paddle 2");
  var canvasX = e.pageX - 8; //use jQuery event object pageX and pageY
  var canvasY = e.pageY - 8;
  console.log("X is: " + canvasX);
  console.log("Y is: " + canvasY);
  paddleBeingMoved = mover2;
  if (paddleBeingMoved != null){
    deltaX = mover2.style.left - canvasX;
    deltaY = mover2.style.top - canvasY;
    $("#paddlediv2").mousemove(handleMouseMove);
    $("#paddlediv2").mouseup(handleMouseUp);
  }

}*/

function handleMouseDown(e) {
  //get mouse location relative to canvas top left
  paddleBeingMoved = getPaddleAtLocation(event.clientX, event.clientY);
  // Stop propagation of the event and stop any default
  if (paddleBeingMoved == mover1 && p1Controlled == true && controllingPaddle == mover1){
    p1Controlled = false;
    paddleBeingMoved = null;
    controllingPaddle = null;
    paddleImg1.setAttribute("src", '/images/paddleUnused.png')
    var dataObj = { pControl: p1Controlled, paddle: "p1" };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('paddleControl', jsonString)
  }else if(paddleBeingMoved == mover2 && p2Controlled == true && controllingPaddle == mover2){
    p2Controlled = false;
    paddleBeingMoved = null;
    controllingPaddle = null;
    paddleImg2.setAttribute("src", '/images/paddleUnused.png')
    var dataObj = { pControl: p2Controlled, paddle: "p2" };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('paddleControl', jsonString)
  }
  //  browser action
  e.stopPropagation();
  e.preventDefault();

  if (controllingPaddle != null){
    if (p1Controlled && controllingPaddle == mover1){
      var dataObj = { pControl: p1Controlled, paddle: "p1" };
      //create a JSON string representation of the data object
      var jsonString = JSON.stringify(dataObj);
      //update the server with a new location of the moving box
      socket.emit('paddleControl', jsonString)
    }else if (p2Controlled && controllingPaddle == mover2){
      var dataObj = { pControl: p2Controlled, paddle: "p2" };
      //create a JSON string representation of the data object
      var jsonString = JSON.stringify(dataObj);
      //update the server with a new location of the moving box
      socket.emit('paddleControl', jsonString)
    }
  }

  drawCanvas();
}
/*
this.checkCollision = function(){
  //Puck with paddles

  var dx1 = mover1.style.left - puck.style.left;
  var dy1 = (mover1.style.left+50) - (puck.style.left+50);
  var distance = Math.sqrt(dx1 * dx1 + dy1 * dy1);
   if (distance < 46.5){
      var angle = Math.atan2(dy, dx);
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);

      pos0 = { x: 0, y: 0},
      //rotate this's position
      pos1 = rotate(dx, dy, sin, cos, true),
      //rotate controllers[i]'s velocity
      vel0 = rotate(controllers[i].velocityX, controllers[i].velocityY, sin, cos, true),
      //rotate this's velocity
      vel1 = rotate(this.velocityX, this.velocityY, sin, cos, true),
      //collision reaction
      velocityXTotal = vel0.x - vel1.x;
 }

}*/

function getPaddleAtLocation(x, y){
  var paddle1 = mover1.getBoundingClientRect();
  var paddle2 = mover2.getBoundingClientRect();
  if (x >= paddle1.left && x <= paddle1.left+50 && y >= paddle1.top && y <= paddle1.top+50){
    return mover1;
  }
  else if (x >= paddle2.left && x <= paddle2.left+50 && y >= paddle2.top && y <= paddle2.top + 50){
    return mover2;
  }
}

function checkCollision(paddleBeingMoved){
  var paddle;
  var paddleSpeedX;
  var paddleSpeedY;
  var puckRect = puck.getBoundingClientRect();
  if(paddleBeingMoved == mover1){
    paddle = mover1.getBoundingClientRect();
    paddleSpeedX = paddle1XSpeed;
    paddleSpeedY = paddle1YSpeed;
  }else if(paddleBeingMoved == mover2){
    paddle = mover2.getBoundingClientRect();
    paddleSpeedX = paddle2XSpeed;
    paddleSpeedY = paddle2YSpeed;
  }
  if (paddle != undefined){
    var paddleX = paddle.left + (paddle.width/2);
    var paddleY = paddle.top + (paddle.height/2);
    var puckX = puckRect.left + (puckRect.width/2);
    var puckY = puckRect.top + (puckRect.height/2);
    var a = (paddleX - puckX) * (paddleX - puckX);
    var b = (paddleY - puckY) * (paddleY - puckY);
    var distance = Math.sqrt(a+b);
    if (distance <= ((puckRect.width/2) + (paddle.width/2))) {
      console.log("Paddle 1 info: " + puckMovingX + ", " + puckRect.width + ", " + paddle.width + ", " + paddleSpeedX);
      puckMovingX = ((puckMovingX * (puckRect.width - paddle.width) + (2 * paddle.width * paddleSpeedX)) / (puckRect.width + paddle.width));
      puckMovingY = ((puckMovingY * (puckRect.width - paddle.width) + (2 * paddle.width * paddleSpeedY)) / (puckRect.width + paddle.width));
      puck.style.left = (puckRect.left + puckMovingX) + "px";
      puck.style.top = (puckRect.top + puckMovingY) + "px";
    }

  }
}

function handleMouseMove(e) {

  //get mouse location relative to canvas top left
  if (controllingPaddle != null){
  //Paddles with board
    var paddle1 = mover1.getBoundingClientRect();
    var paddle2 = mover2.getBoundingClientRect();

    if(controllingPaddle == mover1){
      if (event.clientX-25 >= 8 && event.clientX+25 <= 408 && event.clientY-25 >= 8 && event.clientY+25 <= 538){
        controllingPaddle.style.left = (event.clientX - 25) + "px";
        controllingPaddle.style.top = (event.clientY - 25) + "px";
        checkCollision(mover1);
      }
    }else if(controllingPaddle == mover2){
      if (event.clientX-25 >= 408 && event.clientX+25 <= 808 && event.clientY-25 >= 8 && event.clientY+25 <= 538){
        controllingPaddle.style.left = (event.clientX - 25) + "px";
        controllingPaddle.style.top = (event.clientY - 25) + "px";
        checkCollision(mover2);
      }
    }



    e.stopPropagation();

    if (paddleBeingMoved == mover1){
      var dataObj = { x: mover1.style.left, y: mover1.style.top, moved: "mover1" };
      var jsonString = JSON.stringify(dataObj);
      //update the server with a new location of the moving box
      socket.emit('paddleData', jsonString)
    }else if (paddleBeingMoved == mover2){
      var dataObj = { x: mover2.style.left, y: mover2.style.top, moved: "mover2" };
      var jsonString = JSON.stringify(dataObj);
      //update the server with a new location of the moving box
      socket.emit('paddleData', jsonString)
    }
    //create a JSON string representation of the data object
   //do nothing

    drawCanvas();
  }
}

function handleMouseUp(e) {
  console.log("mouse up");
  e.stopPropagation();
/*
  //remove mouse move and mouse up handlers but leave mouse down handler
  $("#paddlediv1").off("mousemove", handleMouseMove); //remove mouse move handler
  $("#paddlediv1").off("mouseup", handleMouseUp); //remove mouse up handler
  $("#paddlediv2").off("mousemove", handleMouseMove); //remove mouse move handler
  $("#paddlediv2").off("mouseup", handleMouseUp); //remove mouse up handler
  drawCanvas(); //redraw the canvas*/
}

//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs
document.getElementById('button1').onclick = function(){
  playerJoined = playerJoined + 1;
  console.log(playerJoined);
  if (p1Controlled == false){
      paddleImg1.setAttribute("src",'/images/paddle1.png');
      controllingPaddle = mover1;
      p1Controlled = true;
  }
  else if (p2Controlled == false){
    paddleImg2.setAttribute("src",'/images/paddle2.png');
    controllingPaddle = mover2;
    p2Controlled = true;
  }
  if (controllingPaddle != null){
    if (p1Controlled && controllingPaddle == mover1){
      var dataObj = { pControl: p1Controlled, paddle: "p1" };
      //create a JSON string representation of the data object
      var jsonString = JSON.stringify(dataObj);
      //update the server with a new location of the moving box
      socket.emit('paddleControl', jsonString)
    }else if (p2Controlled && controllingPaddle == mover2){
      var dataObj = { pControl: p2Controlled, paddle: "p2" };
      //create a JSON string representation of the data object
      var jsonString = JSON.stringify(dataObj);
      //update the server with a new location of the moving box
      socket.emit('paddleControl', jsonString)
    }
  }
}
function handleTimer() {
  document.getElementById("score1").innerHTML = "P1 Score: " + p1Score;
  document.getElementById("score2").innerHTML = "P2 Score: " + p2Score;

  if (controllingPaddle != null){
    var puckRect = puck.getBoundingClientRect();
    puck.style.left = (puckRect.left + puckMovingX) + "px";
    puck.style.top = (puckRect.top + puckMovingY) + "px";

    if (puckRect.left <= 8){
      if (puckRect.top+(puckRect.height/2) >= 140 && ((puckRect.top+(puckRect.height/2)) <390)){
          p2Score += 1;
          puck.style.left = 300 + "px";
          puck.style.top = 265 + "px"
          puckMovingX = 0;
          puckMovingY = 0;
      }else{
        puck.style.left = 9 + "px";
        puckMovingX = ((puckMovingX/3) *2) * -1;
      }
    }
    if ((puckRect.left+puckRect.width) >= 800){
      if (puckRect.top+(puckRect.width/2) >= 140 && ((puckRect.top+(puckRect.height/2)) <=390)){
          p1Score += 1;
          console.log(p1Score);
          puck.style.left = 500 + "px";
          puck.style.top = 265 + "px"
          puckMovingX = 0;
          puckMovingY = 0;
      }else{
        puck.style.left = (799-puckRect.width) + "px";
        puckMovingX = ((puckMovingX/3) *2) * -1;
      }
    }
    if (puckRect.top <= 8){
      puck.style.top = 9 + "px";
      puckMovingY = ((puckMovingY/3) *2) * -1;
    }
    if (puckRect.top+puckRect.height >= 530){
      puck.style.top = (528-puckRect.height) + "px";
      puckMovingY = ((puckMovingY/3) *2) * -1;
    }

    var dataObj = { x: puck.style.left, y: puck.style.top, movingX: puckMovingX, movingY: puckMovingY };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('puckData', jsonString);

  }
  if (controllingPaddle == mover1){
    var dataObj = { pControl: p1Controlled, paddle: "p1"};
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('paddleControl', jsonString)

    var dataObj = { x: mover1.style.left, y: mover1.style.top, moved: "mover1" };
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('paddleData', jsonString)
  }
  else if (controllingPaddle == mover2){
    var dataObj = { pControl: p2Controlled, paddle: "p2" };
    //create a JSON string representation of the data object
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('paddleControl', jsonString)

    var dataObj = { x: mover2.style.left, y: mover2.style.top, moved: "mover2" };
    var jsonString = JSON.stringify(dataObj);
    //update the server with a new location of the moving box
    socket.emit('paddleData', jsonString)
  }

  if (puckMovingX > 0){
    puckMovingX = puckMovingX - (puckMovingX/(puckMovingX*5));
  }else if (puckMovingX < 0){
    puckMovingX = puckMovingX + (puckMovingX/(puckMovingX*5));
  }else{
    puckMovingX = 0;
  }
  if (puckMovingY > 0){
    puckMovingY = puckMovingY - (puckMovingY/(puckMovingY*5));
  }else if (puckMovingY < 0){
    puckMovingY = puckMovingY + (puckMovingY/(puckMovingY*5));
  }else{
    puckMovingY = 0;
  }

  var paddle1 = mover1.getBoundingClientRect();
  var paddle2 = mover2.getBoundingClientRect();

  paddle1XSpeed = paddle1.left - oldPaddle1X;
  paddle1YSpeed = paddle1.top - oldPaddle1Y;

  paddle2XSpeed = paddle2.left - oldPaddle2X;
  paddle2YSpeed = paddle2.top - oldPaddle2Y;

  oldPaddle1X = paddle1.left;
  oldPaddle1Y = paddle1.top;
  oldPaddle2X = paddle2.left;
  oldPaddle2Y = paddle2.top;

  if (puckMovingX >= 30){
    puckMovingX = 30;
  }else if (puckMovingX <= -30){
    puckMovingX = -30;
  }
  if (puckMovingY >= 30){
    puckMovingX = 30;
  }else if(puckMovingY <= -30){
    puckMovingY = -30;
  }
  checkCollision(mover1);
  checkCollision(mover2);

  if (p1Controlled){
    paddleImg1.setAttribute("src", '/images/paddle1.png')
  }else if (!p1Controlled){
    paddleImg1.setAttribute("src", '/images/paddleUnused.png')
  }

  if (p2Controlled){
    paddleImg2.setAttribute("src", '/images/paddle2.png')
  }else if (!p2Controlled){
    paddleImg2.setAttribute("src", '/images/paddleUnused.png')
  }
  drawCanvas();
}


//KEY CODES
//should clean up these hard coded key codes
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

function handleKeyDown(e) {
  console.log("keydown code = " + e.which);

  var dXY = 5; //amount to move in both X and Y direction
  if (e.which == UP_ARROW && movingBox.y >= dXY) movingBox.y -= dXY; //up arrow
  if (
    e.which == RIGHT_ARROW &&
    movingBox.x + movingBox.width + dXY <= canvas.width
  )
    movingBox.x += dXY; //right arrow
  if (e.which == LEFT_ARROW && movingBox.x >= dXY) movingBox.x -= dXY; //left arrow
  if (
    e.which == DOWN_ARROW &&
    movingBox.y + movingBox.height + dXY <= canvas.height
  )
    movingBox.y += dXY; //down arrow

  //upate server with position data
  //may be too much traffic?
  var dataObj = { x: movingBox.x, y: movingBox.y };
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);
  console.log("String is: " + jsonString);
  //update the server with a new location of the moving box
  socket.emit('blueBoxData', jsonString)    //do nothing
  };


function handleKeyUp(e) {
  console.log("key UP: " + e.which);
  var dataObj = { x: movingBox.x, y: movingBox.y };
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);
  console.log("String is: " + jsonString);
  socket.emit('blueBoxData', jsonString)
}

$(document).ready(function() {
  //add mouse down listener to our canvas object
  $("#background").mousedown(handleMouseDown);
  //add keyboard handler to document
  $(document).keydown(handleKeyDown);
  $(document).keyup(handleKeyUp);

  timer = setInterval(handleTimer, 100);
  //timer.clearInterval(); //to stop

  drawCanvas();
});
