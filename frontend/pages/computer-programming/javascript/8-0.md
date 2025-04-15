# Intro
Hey, check out what I'm working on. This code makes 2 portals, and there's a ball I want to go through them. **IF** you try out the code, you'll see that it doesn't work quite yet. **IF** I can figure out how to make this work, this will be pretty cool!
```js
var ballX = 200;
var ballVelocity = 2;

draw = function(){
    background(255, 255, 255);

    stroke(0);
    strokeWeight(1);
    fill(125);
    ellipse(ballX, 200, 60, 60); //ball

    ballX += ballVelocity; //move the ball according to the velocity

    stroke(0, 0, 255);
    strokeWeight(20);
    line(390, 100, 390, 300); //right portal

    stroke(0, 255, 0);
    line(10, 100, 10, 300); //left portal
};
```
So let’s see, I want the ball to go to the left portal **IF** it went through the right portal, and the other way around. So far all of the code we've been writing will always run, no matter what. How can we get certain pieces of code to only run in specific cases? (Hint: **IF** you saw that I'm writing the word **IF** in bold letters, you might see where this is going)

# If Statements
The way we get code to run only under certain conditions is with an if statement. Here's how you write one:
```js
//replace "condition" with the condition you want.
if(condition){
    //code to run
}
```
If the condition is true, the code will run, otherwise it will ignore the code inside. But how do you write conditions? We'll talk a bit more about them later, but one of the symbols we use is the > symbol (hold Shift and press the button right below the L key on your keyboard). This symbol, called the "greater than" symbol sees if the number on the left is greater than the number on the right. We can use this symbol to see if the ball hits the right portal, because the X position will be greater than the width of the canvas, which is 400:
```js
if(ballX > 400){
    ballX = 0;
}
```
Put that code into the draw function, and you'll see that the ball goes through the portal! Now change "ballVelocity" to be -2 (that'll make it go the other way), and you'll see that now it's not working, because we didn't tell the computer what happens when the ball goes through the left portal. Let's fix that! We can use the < symbol (it's to the left of the > symbol on your keyboard), which is called the "less than" symbol. As you might have guessed, it sees if the number on the left is *less than* the number on the right. Let's use it to see if the ball goes through the left portal, meaning its X position will be less than 0:
```js
if(ballX < 0){
    ballX = 400;
}
```
Now let's put it all together!
```js
var ballX = 200;
var ballVelocity = 2;

draw = function(){
    background(255, 255, 255);

    strokeWeight(1);
    fill(125);
    ellipse(ballX, 200, 60, 60); //ball

    ballX += ballVelocity; //move the ball according to the velocity

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
Yay, both portals work! Actually, our code is broken a bit, but I'll discuss that later. For now, they work just fine.

See what you can make with if statements, and **IF** you do, you'll be able to make some cool stuff!
