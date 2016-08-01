// Function for animate.css
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

// Declare global timer variables to allow clearInterval & clearTimeout if not set
var timer, timeoutTimer;

// Reset all variables to switched on state
function reset() {
  compSequence = [], turn = "comp", on = true, inGame = false, count = 0, playBack = false;
// Ensure all color buttons are unpressed
  colorPress("all", "releaseAll");
// Clear the timeout timer
  clearTimeout(timeoutTimer);
// Update the count screen  
  updateScreen("reset");
}

// Reset all variables to an off state
function off() {
  compSequence = [], turn = "comp", on = false, inGame = false, strict = false, count = 0, playBack = false;
// Turn off the strict light  
  $('#strictLight').css("background-color", "#660000");
// clear the timeout timer  
  clearTimeout(timeoutTimer);
// Ensure all color buttons are unpressed and dim the count screen
  colorPress("all", "releaseAll");
  updateScreen("dim");
}

// Function to amend the count screen for various actions
function updateScreen(action) {
  if (action === "dim") {
    $('#display').html("--").css("color", "#660000");
  } else if (action === "reset") {
    $('#display').html("--").css("color", "red");
  } else {
    $('#display').css("color", "red");
    if (count < 10) {
      $('#display').html("0" + count);
    } else {
        $('#display').html(count);
      }
  }
}

// Function to be called if the user selects the wrong sequence or takes too long to press a button
function wrong() {
  document.getElementById("wrongAudio").play();
  flashDisplay();
  if (!strict) {
  turn = "comp";
  playSequence();
  } else {
  setTimeout(function(){document.getElementById("wrongStrictAudio").play();},500);
  setTimeout(newGame,1000);
  }  
}

// Function to flash the count display screen to alert the user
function flashDisplay() {
  $('#display').html("!!");
  $('#display').animateCss('flash');
}

function colorPress(color, action) {
  if (color === "all" && action === "win") {
    // Spin effect using the color buttons on player win
    setTimeout(function(){$('#green').css("box-shadow","inset 0px 0px 300px rgba(255,255,255,0.9), inset 0px 0px 35px black");}, 100);
  
    setTimeout(function(){$('#green').css("box-shadow","inset 0px 0px 30px black");}, 400);
  
    setTimeout(function(){$('#red').css("box-shadow","inset 0px 0px 300px rgba(255,255,255,0.9), inset 0px 0px 35px black");}, 500);
   
    setTimeout(function(){$('#red').css("box-shadow","inset 0px 0px 30px black");}, 800);
    setTimeout(function(){$('#blue').css("box-shadow","inset 0px 0px 300px rgba(255,255,255,0.9), inset 0px 0px 35px black");}, 900);
  
    setTimeout(function(){$('#blue').css("box-shadow","inset 0px 0px 30px black");}, 1200);
  
    setTimeout(function(){$('#yellow').css("box-shadow","inset 0px 0px 300px rgba(255,255,255,0.9), inset 0px 0px 35px black");}, 1300);
   
    setTimeout(function(){$('#yellow').css("box-shadow","inset 0px 0px 30px black");}, 1700); 
    
  }
  // Unpress all color buttons
  if (action === "releaseAll" && color === "all") {
    $('.colorButton').css("box-shadow","inset 0px 0px 30px black");
  }
  // For sequence playback
    if (action === "press" && turn === "comp") {
      $('#' + color).css("box-shadow","inset 0px 0px 300px rgba(255,255,255,0.9), inset 0px 0px 35px black");
      document.getElementById(color+"Audio").play();
      updateScreen("number");
    }
  // If this is the last button in the sequence during computer playback, start a new timeout timer
    if (action === "press" && turn === "comp" && sequenceCount === count-1) {
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(wrong, 7 * getInterval());
    }
    if (action === "release") {
      $('#' + color).css("box-shadow","inset 0px 0px 30px black");
    }
 
  // For player input (record and check button presses)
    if (action === "press" && turn === "player") {
      clearTimeout(timeoutTimer);
      $('#' + color).css("box-shadow","inset 0px 0px 300px rgba(255,255,255,0.9), inset 0px 0px 35px black");
      if (color !== compSequence[playerSequenceCount]) {
        wrong();
      } else {
          document.getElementById(color+"Audio").play();
          if (playerSequenceCount < count-1) {
          playerSequenceCount++;
          } else if (count === 20) {
            flashDisplay();
            document.getElementById("winAudio").play();
            colorPress("all", "win");
            setTimeout(newGame, 2000);
          } else {
            turn = "comp";
            setTimeout(function(){
              count++;
              updateScreen("number");               
              document.getElementById("successAudio").play();
            },500);            
            setTimeout(playSequence,1000);
            } 
         }
  }
}

function newGame() {
  // Clear any previous game data
  reset();
  clearInterval(timer);
  clearTimeout(timeoutTimer);
  inGame = true;
  // Create a new sequence
  for (i=0; i<20; i++) {
    var num = Math.floor(Math.random() * 4);
      switch (num)
      {
      case 0: compSequence.push("green");
      break;
      case 1: compSequence.push("red");
      break;
      case 2: compSequence.push("yellow");
      break;
      case 3: compSequence.push("blue");
      }    
  }
  // Set/Reset the sequence step count
  count=1;
  // Play the new sequence
  playSequence();
}

// Decides the speed of sequence playback and user timeout length based on number of steps user has successfully completed (gradually speeds up)
function getInterval() {
  if (count < 5) {
    return 1000;
  }
  if (count >= 5 && count < 9) {
    return 800;
  }
  if (count >= 9 && count < 13) {
    return 600;
  }
  if (count >= 13) {
    return 500;
  }    
}

// Start the playback of the current sequence up to the current step count
function playSequence(){
    playBack = true;
    sequenceCount = 0;
    timer = setInterval(function(){
      intervals()
    }, getInterval());
}
   
function intervals() {
  colorPress("all", "releaseAll");
  setTimeout(function(){
    if (sequenceCount < count) {
    colorPress(compSequence[sequenceCount], "press");
    sequenceCount++
    } else {
      // If we reach the step count, stop playback and prepare for player input
      clearInterval(timer);
      playBack = false;
      turn = "player";
      playerSequenceCount = 0;
    }
  }, 200);

}  
  

$('document').ready(function(){
  // Start in off state
  off();
  
  $('.colorButton').mousedown(function(){
  // Prevent press of color buttons unless we are in a game and it's our turn
  if (!on || !inGame || playBack === true) {
    return;
  }
  colorPress($(this).attr('id'), "press");
  }).mouseup(function(){
  colorPress($(this).attr('id'), "release");
  });
  
  // On/Off switch
  $('#switch').click(function(){  
    if (!on) {
      $('#switchBlock').css("left", "0");
      reset();
    } else {
      $('#switchBlock').css("left", "50%");
      off();
    }
  });  
  
  // Start a new game if the start button is pressed. Uses setTimeout to create a depressed button animation effect
  $('#start').click(function(){  
    if (!on) {
      $(this).css("box-shadow", "inset 1px 1px 1px black, 1px 1px 1px gray");
      setTimeout(function(){$('#start').css("box-shadow", "inset 1px 1px 1px gray, 1px 1px 1px black");}, 100);
    } else {
      $(this).css("box-shadow", "inset 1px 1px 1px black, 1px 1px 1px gray");
      setTimeout(function(){$('#start').css("box-shadow", "inset 1px 1px 1px gray, 1px 1px 1px black");}, 100);
      newGame();
    }
  });
     
// Toggle strict mode if the strict button is pressed. Uses setTimeout to create a depressed button animation effect and switches the strict light on/off
  $('#strict').click(function(){  
    if (!on) {
      $(this).css("box-shadow", "inset 1px 1px 1px black, 1px 1px 1px gray");
      setTimeout(function(){$('#strict').css("box-shadow", "inset 1px 1px 1px gray, 1px 1px 1px black");}, 100);
    } else if (!strict) {
      strict = true;
      $(this).css("box-shadow", "inset 1px 1px 1px black, 1px 1px 1px gray");
      setTimeout(function(){$('#strict').css("box-shadow", "inset 1px 1px 1px gray, 1px 1px 1px black");}, 100);
      $('#strictLight').css("background-color", "red");
    } else {
      strict = false;
      $(this).css("box-shadow", "inset 1px 1px 1px black, 1px 1px 1px gray");
      setTimeout(function(){$('#strict').css("box-shadow", "inset 1px 1px 1px gray, 1px 1px 1px black");}, 100);      
      $('#strictLight').css("background-color", "#660000");
    }
  });  
  
});