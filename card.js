/*
end turn button
tap effects

current:
  make player hand
    cards can get dragged from hand to anywhere
      if dropped within certain y window they will be 'played', otherwise returned to hand
      if dropped onto enemy maybe they will also be 'played' if possible
    cards in hand are arranged depending on how many
*/

// define canvas
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

// set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cardFront = document.querySelector('#card-front');
const cardBack = document.querySelector('#card-back');

var width = canvas.width;

// define card arena areas
// player zone
var playerFieldY = canvas.height * (14/20);
var playerHandY = canvas.height * (19/20);
var playerDeckX = canvas.width * (19/20);
// enemy zone
var enemyFieldY = 0;
var enemyHandY = 0;
var enemyDeckX = 0;

// max hand size
const maxHandSize = 7;

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // reset zone locations
  playerFieldY = canvas.height * (14/20);
  playerHandY = canvas.height * (19/20);
  playerDeckX = canvas.width * (19/20);
  enemyFieldY = 0;
  enemyHandY = 0;
  enemyDeckX = 0;
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

function Button(img, id) {
  
  this.buttonSprite = {
    // initialize random stats
    x: 500,
    y: 500,
    dx: 0,
    dy: 0,
    pushed: false,

    sprite: {
      img: document.querySelector('#card'), // or img?
      width: width/20,
      height: (width/20) * (1/2)
    },
  
    draw: function() {
      // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
      c.drawImage(this.sprite.img, this.x, this.y, this.sprite.width, this.sprite.height);
    },
    
    update: function() {
      let width = canvas.width;
      this.sprite.width = width/20;
      this.sprite.height = (width/20) * (1/2);

//test for centering on canvas
this.x = (width - this.sprite.width)/2;
//end
      if (this.pushed) {
        this.x = cursor.x - this.sprite.width/2;
        this.y = cursor.y - this.sprite.height/2;
      }

      this.draw();
    }
  };
};

function clickDeck(array) {
  if (cursor.x >= array[array.length-1].cardSprite.x && cursor.x <= array[array.length-1].cardSprite.x + array[array.length-1].cardSprite.sprite.width
    && cursor.y >= array[array.length-1].cardSprite.y && cursor.y <= array[array.length-1].cardSprite.y + array[array.length-1].cardSprite.sprite.height) {
      // draw card into hand, render as face-up
      array[array.length-1].cardSprite.sprite.img = cardFront;
      playerHand.push(array.pop());
    }
}

function mouseDownIteration(array) {
  for (let i = array.length-1; i >= 0; i--) {
    if (cursor.x >= array[i].cardSprite.x && cursor.x <= array[i].cardSprite.x + array[i].cardSprite.sprite.width
        && cursor.y >= array[i].cardSprite.y && cursor.y <= array[i].cardSprite.y + array[i].cardSprite.sprite.height) {
        
        array[i].cardSprite.grabbed = true;

        // bug fix
        array[i].cardSprite.x = cursor.x - array[i].cardSprite.sprite.width/2;
        array[i].cardSprite.y = cursor.y - array[i].cardSprite.sprite.height/2;

        // shift location of card to top layer of canvas rendering
        if (array !== playerHand) {
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
    if (array === playerHand && array[currentGrabbedIndex].cardSprite.y + array[currentGrabbedIndex].cardSprite.sprite.height/2 < playerFieldY && array[currentGrabbedIndex].cardSprite.y + array[currentGrabbedIndex].cardSprite.sprite.height/2 >= playerFieldY*7/10) {
      var temp = array[currentGrabbedIndex];
      array.splice(currentGrabbedIndex,1);
      playerField.push(temp);
    }
    // forget what's been grabbed
    currentGrabbedIndex = undefined;
  }
};

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
  mouseDownIteration(arrayOfPlayerCards);
  if (currentGrabbedIndex === undefined) {
    mouseDownIteration(playerHand);
  }
});
canvas.addEventListener('mouseup', function(event) {
  mouseUpIteration(arrayOfPlayerCards);
  mouseUpIteration(playerHand);
});
canvas.addEventListener('dblclick', function(event) {
  event.preventDefault();
});

// mobile touch functions
canvas.addEventListener('touchmove', function(event){
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});
canvas.addEventListener('touchdown', function(event) {
  mouseDownIteration(arrayOfPlayerCards);
  if (currentGrabbedIndex === undefined) {
    mouseDownIteration(playerHand);
  }
});
canvas.addEventListener('touchup', function(event) {
  mouseUpIteration(arrayOfPlayerCards);
  mouseUpIteration(playerHand);
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



var testButton = new Button(0,0);

function animate() {
  
  requestAnimationFrame(animate);

  c.clearRect(0, 0, innerWidth, 2 * innerHeight);

  for (let i = 0; i < playerField.length; i++) {
    playerField[i].cardSprite.update();
  }
  for (let i = 0; i < arrayOfPlayerCards.length; i++) {
    arrayOfPlayerCards[i].cardSprite.update();
  }
  for (let i = 0; i < playerHand.length; i++) {
    // set player hand location correctly
    // create relative card positions in hand
    playerHand[i].cardSprite.x = ((canvas.width - (playerHand[i].cardSprite.sprite.width * (playerHand.length/2))) + (playerHand[i].cardSprite.sprite.width * i))/2 - playerHand[i].cardSprite.sprite.width/4;
    let arcAngle = Math.PI/3
    let radians = ((arcAngle) * (i + 0.5)/playerHand.length)-(arcAngle/2);
    // playerHand[i].cardSprite.x = (canvas.width - playerHand[i].cardSprite.sprite.width)/2;
    playerHand[i].cardSprite.y = (playerHandY -  playerHand[i].cardSprite.sprite.height);
    playerHand[i].cardSprite.update(radians);
  }
  for (let i = 0; i < playerDeck.length; i++) {
    playerDeck[i].cardSprite.x = playerDeckX - canvas.width/10;
    playerDeck[i].cardSprite.y = playerHandY - playerDeck[i].cardSprite.sprite.height - i; // thicken deck with more cards
    playerDeck[i].cardSprite.update();
  }
  testButton.buttonSprite.update();
  // cursor.update();
}

animate();

//
// recycling bin
//


// mouse down
// for (let i = arrayOfPlayerCards.length-1; i >= 0; i--) {
  //   if (cursor.x >= arrayOfPlayerCards[i].cardSprite.x && cursor.x <= arrayOfPlayerCards[i].cardSprite.x + arrayOfPlayerCards[i].cardSprite.sprite.width
  //       && cursor.y >= arrayOfPlayerCards[i].cardSprite.y && cursor.y <= arrayOfPlayerCards[i].cardSprite.y + arrayOfPlayerCards[i].cardSprite.sprite.height) {
        
  //       arrayOfPlayerCards[i].cardSprite.grabbed = true;

  //       // bug fix
  //       arrayOfPlayerCards[i].cardSprite.x = cursor.x - arrayOfPlayerCards[i].cardSprite.sprite.width/2;
  //       arrayOfPlayerCards[i].cardSprite.y = cursor.y - arrayOfPlayerCards[i].cardSprite.sprite.height/2;

  //       // shift location of card to top layer of canvas rendering
  //       var temporary = arrayOfPlayerCards[i];
  //       arrayOfPlayerCards.splice(i,1);
  //       arrayOfPlayerCards.push(temporary);

  //       // store index of grabbed card
  //       currentGrabbedIndex = arrayOfPlayerCards.length-1;
       
  //       break;
  //     }
  // }


  // mouse up
  // arrayOfPlayerCards[currentGrabbedIndex].cardSprite.grabbed = false;
  // // makes ungrabbed cards decrease in size toward middle rather than top left
  // arrayOfPlayerCards[currentGrabbedIndex].cardSprite.x += ((width/10 * grabSizeMultiplier) - width/10)/2;
  // arrayOfPlayerCards[currentGrabbedIndex].cardSprite.y += ((width/10 * grabSizeMultiplier) * (2000/1422) - (width/10) * (2000/1422))/2;
  // // forget what's been grabbed
  // currentGrabbedIndex = undefined;