/*
end turn button
tap effects
*/

// define canvas
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

const maxCanvasWidth = 800;
var minCanvasHeight = canvas.width * (5/7);

// set canvas dimensions
if (window.innerWidth < maxCanvasWidth) {
  canvas.width = window.innerWidth;
}
else {
  canvas.width = maxCanvasWidth;
}
if (window.innerHeight > minCanvasHeight) {
  canvas.height = window.innerHeight;
}
else {
  canvas.height = minCanvasHeight;
}

const cardFront = document.querySelector('#card-front');
const cardBack = document.querySelector('#card-back');

var width = canvas.width;

// define card arena areas
// player zone
var playerFieldY = canvas.height * (14/20);
var playerHandY = canvas.height * (19/20);
var playerDeckX = canvas.width * (19/20);
// enemy zone
var enemyFieldY = canvas.height * (6/20);
var enemyHandY = canvas.height * (1/20);
var enemyDeckX = canvas.width * (1/20);

// max hand size
const maxHandSize = 7;
// hand fan angle
const handArcAngle = Math.PI/3;
// current grabbed card
var currentGrabbedCard;

window.addEventListener('resize', function() {
  // reset field cards positions proportional to last position/window before resetting widths
  for (let i = 0; i < playerField.length; i++) {
    // not quite right here.. still movement downward and left
    if (window.innerHeight > minCanvasHeight){
      playerField[i].cardSprite.y = (playerField[i].cardSprite.y/canvas.height) * window.innerHeight;
    }
    if (window.innerWidth < maxCanvasWidth) {
      playerField[i].cardSprite.x = (playerField[i].cardSprite.x/canvas.width) * window.innerWidth;
    }
  }
  // adjust canvas width and height according to min and max values
  if (window.innerWidth < maxCanvasWidth) {
    canvas.width = window.innerWidth;
  }
  else {
    canvas.width = maxCanvasWidth;
  }
  minCanvasHeight = canvas.width * (5/7);
  if (window.innerHeight > minCanvasHeight) {
    canvas.height = window.innerHeight;
  }
  else {
    canvas.height = minCanvasHeight;
  }
  
  // reset zone locations
  playerFieldY = canvas.height * (14/20);
  playerHandY = canvas.height * (19/20);
  playerDeckX = canvas.width * (19/20);
  enemyFieldY = canvas.height * (6/20);
  enemyHandY = canvas.height * (1/20);
  enemyDeckX = canvas.width * (1/20);
});
window.addEventListener('orientationchange', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // reset zone locations
  playerFieldY = canvas.height * (14/20);
  playerHandY = canvas.height * (19/20);
  playerDeckX = 0;
  enemyFieldY = 0;
  enemyHandY = 0;
  enemyDeckX = 0;
});

// start of card arena code

// player stat object
function Player() {
  this.hp = 10;
  this.mana = 0;
  this.isMyTurn = false;
  this.deck = [];
};

function Card(img, atk, def, ability) {
  this.effects = [];
  this.atk = atk;
  this.def = def;
  this.ability = ability;
  this.cardSprite = {
    // initialize position
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    grabbed: false,
    selected: false,

    sprite: {
      img: img,
      width: width/10,
      height: (width/10) * (2000/1422)
    },
  
    draw: function(radians) {
      // check if rotated and not grabbed, rotate if so
      if (radians !== undefined && this.grabbed === false) {
        c.translate(this.x+this.sprite.width/2,this.y+this.sprite.height/2);
        c.rotate(radians);
        c.drawImage(this.sprite.img, -this.sprite.width/2, -this.sprite.height/2 + (Math.abs(radians)+1)**3 * 12, this.sprite.width, this.sprite.height);            
        c.rotate(-radians);
        c.translate(-(this.x+this.sprite.width/2), -(this.y+this.sprite.height/2));
      }
      else if (this.selected) {
        // highlight selected card
        let selectedGlowWidth = this.sprite.width * 15/14;
        let selectedGlowHeight = this.sprite.height * 15/14;
        let selectedGlowX = this.x - (selectedGlowWidth - this.sprite.width)/2;
        let selectedGlowY = this.y - (selectedGlowHeight - this.sprite.height)/2;
        c.fillStyle = "#143a0cc5";
        c.fillRect(selectedGlowX, selectedGlowY, selectedGlowWidth, selectedGlowHeight);
        c.drawImage(this.sprite.img, this.x, this.y, this.sprite.width, this.sprite.height);
      }
      else {
        // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        c.drawImage(this.sprite.img, this.x, this.y, this.sprite.width, this.sprite.height);
      }
    },
    
    update: function(radians) {
      let width = canvas.width;
      
      // increase size if grabbed
      if (this.grabbed) {
        this.sprite.width = width/10 * grabSizeMultiplier;
        this.sprite.height = (width/10) * (2000/1422) * grabSizeMultiplier;
      }
      else {
        this.sprite.width = width/10;
        this.sprite.height = (width/10) * (2000/1422);
      }
      
      // track cursor
      if (this.grabbed) {
        this.x = cursor.x - this.sprite.width/2;
        this.y = cursor.y - this.sprite.height/2;
      }
// check if selected by hover
      if (currentGrabbedCard !== undefined) {
        // check if selected via drag and not deck
        let check1 = currentGrabbedCard.cardSprite.x + currentGrabbedCard.cardSprite.sprite.width/2 >= this.x;
        let check2 = currentGrabbedCard.cardSprite.x + currentGrabbedCard.cardSprite.sprite.width/2 <= this.x + this.sprite.width;
        let check3 = currentGrabbedCard.cardSprite.y + currentGrabbedCard.cardSprite.sprite.height/6 >= this.y;
        let check4 = currentGrabbedCard.cardSprite.y + currentGrabbedCard.cardSprite.sprite.height/6 <= this.y + this.sprite.height;
        let check5 = this !== currentGrabbedCard.cardSprite;
        let check6 = function(arg) {
          for (let i = 0; i < playerDeck.length; i++) {
            if (playerDeck[i].cardSprite === arg) {
              return false;
            }
          }
          return true;
        }(this);
        let check7 = function(arg) {
          for (let i = 0; i < enemyDeck.length; i++) {
            if (enemyDeck[i].cardSprite === arg) {
              return false;
            }
          }
          return true;
        }(this);
        if (check1 && check2 && check3 && check4 && check5 && check6 && check7) {
          this.selected = true;
        }
        else {
          this.selected = false;
        }
      }
      else {
        this.selected = false;
      }
// end check
      // check if rotated
      if (radians !== undefined) {
        this.draw(radians);
      }
      else {
        this.draw();
      }
    }
  };
};

function Button(text, img, id, x, y, func) {
  this.effect = func;
  
  this.buttonSprite = {
    // initialize random stats
    x: x,
    y: y,
    dx: 0,
    dy: 0,
    pushed: false,
    text: text,

    sprite: {
      width: width/10,
      height: (width/20) * (1/2)
    },
  
    draw: function() {
      // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
      // c.drawImage(this.sprite.img, this.x, this.y, this.sprite.width, this.sprite.height);
      c.fillStyle = "#61231aec";
      c.fillRect(this.x, this.y, this.sprite.width, this.sprite.height);
      c.font = `${(this.sprite.height/2)}px Monaco`;
      let xCentered = this.x + (this.sprite.width - (this.text.length * this.sprite.width/7))/2;
      let yCentered = this.y + this.sprite.height/2 + this.sprite.height/6;
      c.fillStyle = "#cccccc";
      c.fillText(this.text, xCentered, yCentered, this.sprite.width);
      // check if pushed
      if (this.pushed) {
        // push effect
        c.fillStyle = "#0000003b";
        c.fillRect(this.x, this.y, this.sprite.width, this.sprite.height);
      }
    },
    
    update: function() {
      let width = canvas.width;
      this.sprite.width = width/10;
      this.sprite.height = (width/10) * (1/2);

      this.x = width*17/20;

      this.draw();
    }
  };
};

function clickDeck(array) {
  if (cursor.x >= array[array.length-1].cardSprite.x && cursor.x <= array[array.length-1].cardSprite.x + array[array.length-1].cardSprite.sprite.width
    && cursor.y >= array[array.length-1].cardSprite.y && cursor.y <= array[array.length-1].cardSprite.y + array[array.length-1].cardSprite.sprite.height) {
      // check hand size against max
      if (playerHand.length < maxHandSize) {
        // draw card into hand, render as face-up
        array[array.length-1].cardSprite.sprite.img = cardFront;
        playerHand.push(array.pop());
      }
    }
}

function mouseDownIteration(array) {
  for (let i = array.length-1; i >= 0; i--) {
    if (cursor.x >= array[i].cardSprite.x && cursor.x <= array[i].cardSprite.x + array[i].cardSprite.sprite.width
        && cursor.y >= array[i].cardSprite.y && cursor.y <= array[i].cardSprite.y + array[i].cardSprite.sprite.height) {
        
        array[i].cardSprite.grabbed = true;
        currentGrabbedCard = array[i];

        // bug fix
        array[i].cardSprite.x = cursor.x - array[i].cardSprite.sprite.width/2;
        array[i].cardSprite.y = cursor.y - array[i].cardSprite.sprite.height/2;

        // shift location of card to top layer of canvas rendering
        if (array !== playerHand && array !== playerField) {
          var temporary = array[i];
          array.splice(i,1);
          array.push(temporary);

          // store index of grabbed card
        currentGrabbedIndex = array.length-1;
        }
        else {
          currentGrabbedIndex = i;
        }

        break;
      }
  }
};
function mouseUpIteration(array) {
  if (array[currentGrabbedIndex] !== undefined && array[currentGrabbedIndex].cardSprite.grabbed === true){
    array[currentGrabbedIndex].cardSprite.grabbed = false;
    // makes ungrabbed cards decrease in size toward middle rather than top left
    array[currentGrabbedIndex].cardSprite.x += ((width/10 * grabSizeMultiplier) - width/10)/2;
    array[currentGrabbedIndex].cardSprite.y += ((width/10 * grabSizeMultiplier) * (2000/1422) - (width/10) * (2000/1422))/2;
    // check if playing cards from hand
    // array[currentGrabbedIndex].cardSprite.y + array[currentGrabbedIndex].cardSprite.sprite.height/2 < playerFieldY && array[currentGrabbedIndex].cardSprite.y + array[currentGrabbedIndex].cardSprite.sprite.height/2 >= playerFieldY*7/10
    if (array === playerHand && array[currentGrabbedIndex].cardSprite.y + array[currentGrabbedIndex].cardSprite.sprite.height/2 < playerFieldY && array[currentGrabbedIndex].cardSprite.y + array[currentGrabbedIndex].cardSprite.sprite.height/2 >= canvas.height/2) {
      var temp = array[currentGrabbedIndex];
      array.splice(currentGrabbedIndex,1);
      playerField.push(temp);
    }
    // forget what's been grabbed
    currentGrabbedCard = undefined;
    currentGrabbedIndex = undefined;
  }
};
function checkForButtonPush() {
  for (let i = 0; i < buttonArray.length; i++) {
    if (cursor.x >= buttonArray[i].buttonSprite.x && cursor.x <= buttonArray[i].buttonSprite.x + buttonArray[i].buttonSprite.sprite.width
      && cursor.y >= buttonArray[i].buttonSprite.y && cursor.y <= buttonArray[i].buttonSprite.y + buttonArray[i].buttonSprite.sprite.height) {
        buttonArray[i].effect();
        buttonArray[i].buttonSprite.pushed = true;
        break;
      }
  }
};
function releaseAnyPushedButton() {
  for (let i = 0; i < buttonArray.length; i++) {
    if (buttonArray[i].buttonSprite.pushed === true && (cursor.x >= buttonArray[i].buttonSprite.x && cursor.x <= buttonArray[i].buttonSprite.x + buttonArray[i].buttonSprite.sprite.width
      && cursor.y >= buttonArray[i].buttonSprite.y && cursor.y <= buttonArray[i].buttonSprite.y + buttonArray[i].buttonSprite.sprite.height)) {
      
        buttonArray[i].buttonSprite.pushed = false;
        buttonArray[i].
        break;
    }
     else if (buttonArray[i].buttonSprite.pushed === true) {
      buttonArray[i].buttonSprite.pushed = false;
      break;
    }
  }
}

// arrays of cards
var arrayOfPlayerCards = [];
var playerHand = [];
var playerField = [];
var playerDeck = [];
var arrayOfOpponentCards = [];
var enemyHand = [];
var enemyField = [];
var enemyDeck = [];

// misc variables
var arrayOfStatusEffectImages = [];
var currentGrabbedIndex;
var grabSizeMultiplier = 10/9;

// cursor attributes
var cursor = {
  
  x: 0,
  y: 0,
  w: 5,
  h: 5,


  draw: function() {
    
    // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    
    c.beginPath();
    c.rect(this.x, this.y, this.w, this.h);
    c.stroke();
  },

  update: function() {
    // this.dx = 0; this.dy = 0;
    this.draw();
  }
};

// desktop mouse functions
canvas.addEventListener('mousemove', function(event) {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
});
canvas.addEventListener('click', function(event) {
  clickDeck(playerDeck);
});
canvas.addEventListener('mousedown', function(event) {
  checkForButtonPush();
  mouseDownIteration(arrayOfPlayerCards);
  if (currentGrabbedIndex === undefined) {
    mouseDownIteration(playerHand);
    if (currentGrabbedIndex === undefined) {
      mouseDownIteration(playerField);
    }
  }
});
canvas.addEventListener('mouseup', function(event) {
  releaseAnyPushedButton();
  mouseUpIteration(arrayOfPlayerCards);
  mouseUpIteration(playerHand);
  mouseUpIteration(playerField);
});
canvas.addEventListener('dblclick', function(event) {
  event.preventDefault();
});

// mobile touch functions
canvas.addEventListener('touchmove', function(event){
  event.preventDefault();
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});
canvas.addEventListener('touchstart', function(event) {
  event.preventDefault();
  checkForButtonPush();
  mouseDownIteration(arrayOfPlayerCards);
  if (currentGrabbedIndex === undefined) {
    mouseDownIteration(playerHand);
    if (currentGrabbedIndex === undefined) {
      mouseDownIteration(playerField);
    }
  }
});
canvas.addEventListener('touchend', function(event) {
  event.preventDefault();
  releaseAnyPushedButton();
  mouseUpIteration(arrayOfPlayerCards);
  mouseUpIteration(playerHand);
  mouseUpIteration(playerDeck);
});


// create some cards
arrayOfPlayerCards.push(new Card(cardFront,0,0,0));
arrayOfPlayerCards.push(new Card(cardFront,1,0,0));
arrayOfPlayerCards.push(new Card(cardFront,2,0,0));
arrayOfPlayerCards.push(new Card(cardFront,3,0,0));
arrayOfPlayerCards.push(new Card(cardFront,4,0,0));

playerHand.push(new Card(cardFront,0,0,0));
playerHand.push(new Card(cardFront,0,0,0));
playerHand.push(new Card(cardFront,0,0,0));
playerHand.push(new Card(cardFront,0,0,0));
playerHand.push(new Card(cardFront,0,0,0));
playerHand.push(new Card(cardFront,0,0,0));
playerHand.push(new Card(cardFront,0,0,0));

enemyHand.push(new Card(cardFront,0,0,0));
enemyHand.push(new Card(cardFront,0,0,0));
enemyHand.push(new Card(cardFront,0,0,0));
enemyHand.push(new Card(cardFront,0,0,0));
enemyHand.push(new Card(cardFront,0,0,0));
enemyHand.push(new Card(cardFront,0,0,0));
enemyHand.push(new Card(cardFront,0,0,0));

playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));
playerDeck.push(new Card(cardBack,0,0,0));

enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));
enemyDeck.push(new Card(cardBack,0,0,0));

enemyField.push(new Card(cardBack,0,0,0));

var endButton = new Button("End",0,0, canvas.width*3/4, canvas.height/2, function() {console.log('End')});
var attackButton = new Button("Attack",0,0, canvas.width*3/4, canvas.height/2 - 50, function() {console.log('Attack')});
var abilityButton = new Button("Ability",0,0, canvas.width*3/4, canvas.height/2 + 50, function() {console.log('Ability')});


var buttonArray = [];
buttonArray.push(endButton, attackButton, abilityButton);

function animate() {
  
  requestAnimationFrame(animate);

  c.clearRect(0, 0, innerWidth, 2 * innerHeight);
  // render field lines
  c.beginPath(); 
  // startpoint
  c.moveTo(0, canvas.height/2);
  // endpoint
  c.lineTo(canvas.width, canvas.height/2);
  // Make the line visible
  c.stroke();

  // render enemy cards
  for (let i = 0; i < enemyField.length; i++) {
    // displays centered player field cards
    let spacing = canvas.width/20;
    let startPointFromLeft = (canvas.width/2 - (enemyField[i].cardSprite.sprite.width * enemyField.length)/2);
    enemyField[i].cardSprite.x = startPointFromLeft + i * (enemyField[i].cardSprite.sprite.width);
    enemyField[i].cardSprite.y = canvas.height/2 - enemyField[i].cardSprite.sprite.height - canvas.height/30;
    enemyField[i].cardSprite.update();
  }
  for (let i = 0; i < enemyHand.length; i++) {
    // flip cards
    enemyHand[i].cardSprite.sprite.img = cardBack;
    // set enemy hand location correctly
    // create relative card positions in hand
    enemyHand[i].cardSprite.x = ((canvas.width - (enemyHand[i].cardSprite.sprite.width * (enemyHand.length/2))) + (enemyHand[i].cardSprite.sprite.width * i))/2 - enemyHand[i].cardSprite.sprite.width/4;
    let radians = (((handArcAngle) * (i + 0.5)/enemyHand.length)-(handArcAngle/2));
    enemyHand[i].cardSprite.y = enemyHandY/10;// - enemyHand[i].cardSprite.sprite.height;
    enemyHand[i].cardSprite.update(radians);
  }
  for (let i = 0; i < enemyDeck.length; i++) {
    enemyDeck[i].cardSprite.x = enemyDeckX;
    enemyDeck[i].cardSprite.y = enemyHandY - i;
    enemyDeck[i].cardSprite.update();
  }
  // render buttons
  let buttonSpacing = canvas.height/40;
  for (let i = 0; i < buttonArray.length; i++) {
    buttonArray[i].buttonSprite.y = canvas.height/2 - (buttonArray.length*(buttonArray[i].buttonSprite.sprite.height + buttonSpacing*(3/4))/2) + (i * (buttonArray[i].buttonSprite.sprite.height + buttonSpacing));
    buttonArray[i].buttonSprite.update();
  }
  // animate player deck
  for (let i = 0; i < playerDeck.length; i++) {
    playerDeck[i].cardSprite.x = playerDeckX - canvas.width/10;
    playerDeck[i].cardSprite.y = playerHandY - playerDeck[i].cardSprite.sprite.height - i; // thicken deck with more cards
    playerDeck[i].cardSprite.update();
  }
  // animate player field
 if (playerField.length > 0) {
   // default lastRendered index is last item in array
   let lastRendered = playerField.length - 1;
  for (let i = 0; i <= playerField.length; i++) {
    if (i === playerField.length) {
      playerField[lastRendered].cardSprite.update();
    }
    else if (playerField[i].cardSprite.grabbed) {
      // stores grabbed card and waits to render it so that it appears above everything else
      lastRendered = i;
    }
    else {
      // displays centered player field cards
      let spacing = canvas.width/20;
      let startPointFromLeft = (canvas.width/2 - (playerField[i].cardSprite.sprite.width * playerField.length)/2);
      playerField[i].cardSprite.x = startPointFromLeft + i * (playerField[i].cardSprite.sprite.width);
      playerField[i].cardSprite.y = canvas.height/2 + canvas.height/30;// playerFieldY - canvas.height/6;
      playerField[i].cardSprite.update();
    }
  }
 }
  // animate player hand
  for (let i = 0; i < playerHand.length; i++) {
    // set player hand location correctly
    // create relative card positions in hand
    playerHand[i].cardSprite.x = ((canvas.width - (playerHand[i].cardSprite.sprite.width * (playerHand.length/2))) + (playerHand[i].cardSprite.sprite.width * i))/2 - playerHand[i].cardSprite.sprite.width/4;
    let radians = ((handArcAngle) * (i + 0.5)/playerHand.length)-(handArcAngle/2);
    playerHand[i].cardSprite.y = (playerHandY -  playerHand[i].cardSprite.sprite.height);
    playerHand[i].cardSprite.update(radians);
  }
}

animate();