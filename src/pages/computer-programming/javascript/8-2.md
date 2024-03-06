# Logical Operators
In the previous article, I talked about booleans and how to make them with comparison symbols (like < and ===). But let's say we want to combine booleans together, like how you can combine numbers together. How do we do that? One of the ways we can do that is checking if one boolean OR another is true. How we do that is by typing "||" (hold shift and press the \ key, which should be above the enter key).
```js
fill(255, 125, 0);

//It's looking to see if one OR the other boolean is true
if(false || false){
  //none of them are true, so this won't run
  text("false OR false", 100, 50);
}

if(true || false){
  //one of them is true, so this will run
  text("true OR false", 100, 100);
}

if(false || true){
  //one of them is true, so this will run
  text("false OR true", 100, 150);
}

if(true || true){
  //both are true, so this will run
  text("true OR true", 100, 200);
}
```
Another one checks if both the first AND the second booleans are true. We do that by typing "&&" (hold shift and press the 7 key).
```js
//It's looking to see if both the first AND the second booleans are true
fill(125, 70, 0); //running out of interesting colors to use lol

if(false && false){
  //none of them are true, so this won't run
  text("false AND false", 100, 50);
}

if(true && false){
  //only one of them are true, so this won't run
  text("true AND false", 100, 100);
}

if(false && true){
  //only one of them is true, so this won't run
  text("false AND true", 100, 150);
}

if(true && true){
  //both are true, so this will run
  text("true AND true", 100, 200);
}
```

# Example
Remember the portal I made, and how I said that there's a problem with the code? Here's the code for it in case you forgot:
```js
var ballX = 200;
var ballSpeed = 2;

draw = function(){
    background(255, 255, 255);

    strokeWeight(1);
    fill(125);
    ellipse(ballX, 200, 60, 60); //ball

    ballX += ballSpeed; //move the ball according to the speed

    if(ballX > 400){ //if the ball goes into the right portal, go to the left portal
        ballX = 0;
    }
    if(ballX < 0){ //if the ball goes into the left portal, go to the right portal
        ballX = 400;
    }

    stroke(0, 0, 255);
    strokeWeight(20);
    line(390, 100, 390, 300); //right portal

    stroke(0, 255, 0);
    line(10, 100, 10, 300); //left portal
};
```
Let's say that we want the ball to be a bit more to the left when it exits the left portal, and a bit to the right when it exits the right portal:
```js
if(ballX > 400){
    ballX = 0 - 2; //have the ball a bit to the left when it exits the left portal
}
if(ballX < 0){
    ballX = 400 + 2; //have the ball a bit to the right when it exits the right portal
}
```
If you replace the code with that, you'll see that when the ball goes into the right portal, it just stops. Are the if statements not working anymore? No, I can assure you that they're still working. Let me show you what the computer is doing when it sees these new code:
```js
//when it hits the right portal, ballX will be greater than 400

if(ballX > 400){
    //ballX is greater than 400, so this will run and will set ballX to be 0 - 2, which is -2.
    ballX = 0 - 2;
}
if(ballX < 0){
    //since ballX is now -2, and -2 < 0, this code will run, and set ballX to be 400 + 2, which is 402.
    ballX = 400 + 2;
}

//now ballX is 402, which is greater than 400. So the same thing will happen the next frame.
```
Both if statements are being ran, so the ball just stays at the right portal. But that's not what we want, we only want the first if statement to be ran. So what can we do? Hmm, well we're only checking if the ball is in the portal, but we also want to check is the ball is GOING in the portal. In other words, we want it to go through the right portal if the ball's on the right side of the screen AND the ball is moving towards the right. And we know how to do AND, we just type &&:
```js
//if the ball is on the right edge AND the ball is moving to the right
if(ballX > 400 && ballSpeed > 0){
    ballX = 0 - 2;
}

//we do similar logic here: if the ball is on the left edge AND the ball is moving to the left
if(ballX < 0 && ballSpeed < 0){
    ballX = 400 + 2;
}
```
Let's try this in the actual program:
```js
var ballX = 200;
var ballSpeed = 2;

draw = function(){
    background(255, 255, 255);

    strokeWeight(1);
    fill(125);
    ellipse(ballX, 200, 60, 60); //ball

    ballX += ballSpeed; //move the ball according to the speed

    if(ballX > 400 && ballSpeed > 0){ //if the ball goes into the right portal
        ballX = 0 - 2;
    }
    
    if(ballX < 0 && ballSpeed < 0){ //if the ball goes into the left portal
        ballX = 400 + 2;
    }

    stroke(0, 0, 255);
    strokeWeight(20);
    line(390, 100, 390, 300); //right portal

    stroke(0, 255, 0);
    line(10, 100, 10, 300); //left portal
};
```
Ah finally, it's working as it should! It almost looks the same, but our code is written a little smarter, so it's harder to break. With if statements, booleans, and now logical operators, you can make a lot of complex behavior!

# Bonus
You can use multiple logical operators at once, just like with math operators like + and -:
```js
var rosesAreRed = true;
var violetsAreBlue = true;
var programmingIsAwesome = true;
var soAreYou = true;
if(rosesAreRed && violetsAreBlue && programmingIsAwesome && soAreYou){
    fill(0, 255, 0);
    text("all booleans are true!!", 200, 200);
}
```
There's also a third operator, which sees if a boolean is NOT true, in other words, if it's false. You write it with a ! (remember, you hold shift and press the 1 key):
```js
var wafflesAreYummy = true;
if(!wafflesAreYummy){
    fill(0, 0, 0);
    text("Add some syrup, see if that helps", 200, 200); //this won't run, because it's seeing if waffles are NOT yummy
}
```
