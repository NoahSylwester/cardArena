/*
drag effects
end turn button
tap effects
*/

// define canvas
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

// set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var width = canvas.width;

// define card arena areas
// player zone
var playerRow = 0;
var playerHand = 0;
var playerDeck = 0;
// enemy zone
var enemyRow = 0;
var enemyHand = 0;
var enemyDeck = 0;

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
window.addEventListener('orientationchange', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
    // initialize random stats
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    grabbed: false,

    sprite: {
      img: document.querySelector('#card'), // or img?
      width: width/10,
      height: (width/10) * (2000/1422)
    },
  
    draw: function() {
      // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
      c.drawImage(this.sprite.img, this.x, this.y, this.sprite.width, this.sprite.height);
    },
    
    update: function() {
      let width = canvas.width;
      
      // increase size if grabbed
      if (this.grabbed) {
        this.sprite.width = width/9;
        this.sprite.height = (width/9) * (2000/1422);
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

      this.draw();
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
      
      if (this.pushed) {
        this.x = cursor.x - this.sprite.width/2;
        this.y = cursor.y - this.sprite.height/2;
      }

      this.draw();
    }
  };
};

var arrayOfPlayerCards = [];
var arrayOfOpponentCards = [];
var arrayOfStatusEffectImages = [];
var currentGrabbedIndex;




// define pet sprite
// var cardSprite = {
//   // initialize random stats
//   x: 0,
//   y: 0,
//   dx: 0,
//   dy: 0,

//   sprite: {
//     img: document.querySelector('#card'),
//     width: 200,
//     height: this.width * (2000/1422)
//   },

//   draw: function() {
//     // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
//     c.drawImage(this.sprite.img, 100, 200, this.sprite.width, this.sprite.height);
//   },
  
//   update: function() {

//     this.draw();
//   }
// };

// $('#feed-button').on('click', function(event) {
//   event.preventDefault();
//   if (steaks > 0 && meat.exists === false) {

//     meat.exists = true;
//     meat.x = Math.random() * (canvas.width - 100);
//     meat.y = 0;
//     meat.dy = 0;
//     petArr[currentPet].feed(cookie.foodValue);
//     steaks --;
//     if (steaks === 0 || steaks < 0) {
//       steaks = 0;
//     }
//     $("#feedBadge").html(steaks);
//   };
// });

// $('#love-button').on('click', function(event) {
//   event.preventDefault();
//   heart.show = true;
//   setTimeout(() => {
//     heart.show = false
//   }, 1500);
// });


var cursor = {
  // initialize random stats
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
canvas.addEventListener('mousemove', function(event){
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
});

canvas.addEventListener('mousedown', function(event) {
  for (let i = 0; i < arrayOfPlayerCards.length; i++) {
  if (cursor.x >= arrayOfPlayerCards[i].cardSprite.x && cursor.x <= arrayOfPlayerCards[i].cardSprite.x + arrayOfPlayerCards[i].cardSprite.sprite.width
      && cursor.y >= arrayOfPlayerCards[i].cardSprite.y && cursor.y <= arrayOfPlayerCards[i].cardSprite.y + arrayOfPlayerCards[i].cardSprite.sprite.height) {
        arrayOfPlayerCards[i].cardSprite.grabbed = true;
        currentGrabbedIndex = i;
        break;
      }
  }
});

// mobile touch functions
canvas.addEventListener('touchmove', function(event){
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});
canvas.addEventListener('touchdown', function(event) {
for (let i = 0; i < arrayOfPlayerCards.length; i++) {
if (cursor.x >= arrayOfPlayerCards[i].cardSprite.x && cursor.x <= arrayOfPlayerCards[i].cardSprite.x + arrayOfPlayerCards[i].cardSprite.sprite.width
    && cursor.y >= arrayOfPlayerCards[i].cardSprite.y && cursor.y <= arrayOfPlayerCards[i].cardSprite.y + arrayOfPlayerCards[i].cardSprite.sprite.height) {
      arrayOfPlayerCards[i].cardSprite.grabbed = true;
      currentGrabbedIndex = i;
      break;
    }
}
});

canvas.addEventListener('mouseup', function(event) {
  arrayOfPlayerCards[currentGrabbedIndex].cardSprite.grabbed = false;
});

// create some cards
arrayOfPlayerCards.push(new Card(0,0,0,0));
arrayOfPlayerCards.push(new Card(0,0,0,0));
arrayOfPlayerCards.push(new Card(0,0,0,0));
arrayOfPlayerCards.push(new Card(0,0,0,0));
arrayOfPlayerCards.push(new Card(0,0,0,0));
var testButton = new Button(0,0);

function animate() {
  
  requestAnimationFrame(animate);

  c.clearRect(0, 0, innerWidth, 2 * innerHeight);
  for (let i = 0; i < arrayOfPlayerCards.length; i++) {
    arrayOfPlayerCards[i].cardSprite.update();
  }
  testButton.buttonSprite.update();
  cursor.update();
}

animate();