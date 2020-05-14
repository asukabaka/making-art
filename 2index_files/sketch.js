/*
  Store an array of amplitude values and draw them over time.

  Inspired by http://tybenz.com/visualizr.

  getLevel() from the p5.Amplitude object and map it to the ellipse position.

  Press "T" to toggle between a sound file and audio input (mic).
 */
 let font,
     fontsize = 80;
 let snowflakes = []; // array to hold snowflake objects
 let c;
var mic, soundFile;
var amplitude;

var prevLevels = new Array(60);

function preload() {
  // Ensure the .ttf or .otf font stored in the assets directory
  // is loaded before setup() and draw() are called
  font = loadFont("Raleway-Regular.ttf");
  song = loadSound("switch.mp3");
  sound = loadSound("beep.mp3");
  music = loadSound("song.mp3");
  //preload the sound file
}

function setup() {
  s = color(mouseX/2, 0, width/2, 0, 1.0);
  r = color(50, mouseY/2, 50, height/2, 1.0);
  b = color(20, 200, 150);
  a = color(200, 200, 150);
  // displayWidth and displayHeight make the canvas response to mobile as well.
  noStroke();
  textSize(fontsize);
  textAlign(CENTER, CENTER);

  colorMode(HSL);
  var colors = [];
  for(var i = 0; i < 3; i++) {
    var newColor = color(random(360), random(100), random(100));
    colors.push(newColor);
    fill(random(colors));
  }
  c = createCanvas(windowWidth, windowHeight);
  background(0);
  noStroke();

  rectMode(CENTER);
  colorMode(HSB);

  mic = new p5.AudioIn();
  mic.start();

  // load the sound, but don't play it yet
  soundFile = loadSound('song.mp3')

  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);
  amplitude.smooth(0.6);
}

function mousePressed() {
  sound.play() //simple function to play sound every time you click
  }

function mouseReleased() {
  song.play()
}

function draw() {
  background(20, 20);
  fill(255, 10)
  text('press t to toggle source', 20, 20);
  text('click', displayWidth/2.5 , displayHeight*0.1)
    text('drag', displayWidth/2 , displayHeight*0.2)
    text('release', displayWidth/1.63 , displayHeight*0.3)
  var level = amplitude.getLevel();

  // rectangle variables
  var spacing = 10;
  var w = width/ (prevLevels.length * spacing);

  var minHeight = 2;
  var roundness = 20;

  // add new level to end of array
  prevLevels.push(level);

  // remove first item in array
  prevLevels.splice(0, 1);

  // loop through all the previous levels
  for (var i = 0; i < prevLevels.length; i++) {

    var x = map(i, prevLevels.length, 0, width/2, width);
    var h = map(prevLevels[i], 0, 0.5, minHeight, height);

    var alphaValue = logMap(i, 0, prevLevels.length, 1, 250);

    var hueValue = map(h, minHeight, height, 200, 255);

    fill(240);

    rect(x, height/2, w, h);
    rect(width - x, height/2, w, h);
  }


  var t = map(mouseX/2, 0, width/2, 0, 1.0);
    var c = lerpColor(r, b, t);
    var d = lerpColor(r, a, t);
    background(c);
    fill(240);

    //I used percentages instead of fixed to make it responsive on mobile as well.

    if (mouseIsPressed) {//if mouse is pressed the sketch progresses at 1 frame per second
    t = frameCount / 1; // update time
    }else{t = frameCount/20;//otherwise the sketch progresses at 20 frames per second.
         }
    // create a random number of snowflakes each frame
    if (mouseIsPressed) {
    for (let i = 0; i < random(1); i++) { // i starts at zero. if i is less than random*1 then i will increment infinitely. i refers to snowflakes.
      snowflakes.push(new snowflake()); // append snowflake object
      //push is required for this string because we are making a new snowflake as each new object
    }
    }else{ for (let i = 0; i < random(0.5); i++) {
      snowflakes.push(new snowflake()); // append snowflake object
    }//else the random here is multiplied but .5 so less snowflakes are generated.
         }


    // loop through snowflakes with a for..of loop
    for (let flake of snowflakes) {
      flake.update(t); // update snowflake position
      //the t is dependant on the framecount above. this makes it so the updated position is faster or slower depending on which t variable is being input in.
      flake.display(); // draw snowflake
    }

    push();
  if (mouseIsPressed){
    strokeWeight(5);
    stroke(map(mouseX, 0, 600, 0, 255, true));
    line(width - mouseX, height - mouseY, width - pmouseX, height - pmouseY);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  pop();
}

// snowflake class
function snowflake() {
  // initialize coordinates
  this.posX = 0;
  this.posY = random(-50, 0);
  //position uses random as a variable to spread it across the horizontal canvas.
  this.initialangle = random(45, 2 * PI);
  this.size = random(2, mouseY/75);
  //this.size is mapped to mouseY is depending on your horizontal mouse location the snowflakes will increase or decrease in size. Fairy dust on the top of canvas and blobs on the bottom.

  // radius of snowflake spiral
  // chosen so the snowflakes are uniformly spread out in area
  if (mouseIsPressed){
  this.radius = sqrt(random(pow(width / 2, 2)));
  } else {
    this.radius = accelerationX;
    //accelerationX uses the accelerometer and this is added to make the sketch interactive on mobile devices as well.
  }
  this.update = function(time) {
    // x position follows a circle
    if (mouseIsPressed) {
     w = 0.00006// angular speed
      //the w when mouse is pressed is very very slow to give a sense of slo mo spin.
    } else { w = 1;
            //w=1 is back to real time speed.
           }
    let angle = w * time + this.initialangle;
    // angle which is used below is created with the string above.
    this.posX = width / 2 + this.radius * sin(angle);
    // the sin value in this string is what makes the object actually oscillate and not just a static trajectory.

    // different size snowflakes fall at slightly different y speeds
    this.posY += pow(this.size, 0.5);

    // delete snowflake if past end of screen
    if (this.posY > height) {
      //if position Y is greater than the value of the canvas height snowflakes get spliced.
      // from p5js editor definition says splicing is basically rearranging the order of the snowflakes.
      let index = snowflakes.indexOf(this);
      snowflakes.splice(index, 1);
      //index is used by P5js to remove items from the array
    }
  };

  this.display = function() {
    ellipse(this.posX, this.posY, this.size);
  };
}
