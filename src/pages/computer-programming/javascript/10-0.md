# Intro
I have this function that draws preston at any place on the screen. You might remember it when we were talking about functions:
```js
var drawPreston = function(x, y){
    fill(0, 0, 0); //face color
    ellipse(x, y, 50, 50); //face
    
    fill(255, 255, 255); //eye color
    ellipse(x-10, y-5, 10, 10); //eyes
    ellipse(x+10, y-5, 10, 10);
    ellipse(x, y+10, 20, 10);
};
```
I bring this function up because I want to have an entire army of them so I can take over the world! Mwahahahaha >:).
Ok that was a joke, I don't plan to take over the world, but how would I draw a bunch of prestons? Sure, I could just call the drawPreston function a bunch of times, but I'm lazy. How can we get the computer to do all that for us?

# While loops
While loops are a very handy tool. They repeat code *while* a condition is true (hence the name). Here's an example of one:
```js
var x = 0; //x starts at 0

//repeat while x < 10
while(x < 10){
    println(x);
    x ++; //increment x by 1
}
println("value of x after the loop: " + x);
```
Try that code. It reapeats the code inside 10 times. That's pretty cool! When making loops, you want to ask 3 questions:
1. What do I want to loop?
2. What do I want to change?
3. How long do I want it to loop?

It's very important that you make sure a loop will stop at some point, because computers can't run infinite loops. It takes an infinite amount of time to do an infinite number of things, no matter how fast your computer is:
```js
while(true){
    println("This program will never finish");
}
```
You might be thinking "hey, the draw function repeats, and it never stops. Why's that ok but not infinite while loops?". Well with the draw function, we *want* it to repeat as long as it can, or at least until the user exits the program. It would be annoying if you were playing a game made using a draw function, and the game stopped after a couple minutes or so.

# Making A While Loop For Preston
Ok, so let's make a loop for Preston. Let's go over the 3 questions:
1. What do I want to loop? The `drawPreston` function.
2. What do I want to change? The position of Preston. I'm going to make them go in the x direction as an example.
3. How long do I want it to loop? While the Preston being drawn is still shown on the screen because it would be a waste of time drawing off-screen Prestons.

So now we know what we want to do, let's do it! 
```js
var drawPreston = function(x, y){
    fill(0, 0, 0); //face color
    ellipse(x, y, 50, 50); //face
    
    fill(255, 255, 255); //eye color
    ellipse(x-10, y-5, 10, 10); //eyes
    ellipse(x+10, y-5, 10, 10);
    ellipse(x, y+10, 20, 10);
};

var x = 25; //have the Prestons start at x = 25, because that's where Preston touches the left side of the screen.

//the width of the canvas by default is 400 (you can change that in the settings), so while x < 400
while(x < 400){
    drawPreston(x, 200); //draw Preston where the x value is
    x += 50; //increase the x value by 50, because each Preston is 50 pixels wide.
}
```
