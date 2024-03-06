# What Are Functions?
So let's talk about something you already know but don't know the name of: functions.
We've been using functions this whole time! Rect, ellipse, line, and text are all examples of functions.
They are chunks of code that were given a name so we can use them more easily. Behind the scenes, the rect function is actually just 4 lines. Aren't you glad that you only have to type "rect(200, 200, 20, 20);" instead of 
having to draw 4 lines?

In a way, we use functions in our daily lives. When you make breakfast, you probably get a bowl, pour cereal, pour milk, and get a spoon to eat it with. That’s a function, because a list of instructions grouped together and given a name: making breakfast. You don’t have to say the entire procedure, because everyone will understand you if you say "making breakfast"

# Custom Functions
I want to make a clone of Preston. I modified the code for his face so we can easily put him anywhere we want:
```js
var x = 200;
var y = 200;

fill(0, 0, 0); //face color
ellipse(x, y, 100, 100); //face

fill(255, 255, 255); //eye color
ellipse(x-20, y-10, 20, 20); //eyes
ellipse(x+20, y-10, 20, 20);
ellipse(x, y+20, 40, 20);
```
I could copy and paste the code for him, but what if I want to make a change to both Prestons? And what if I want to add a third or fourth Preston? It'd be nice if we could make a drawPreston function to make this easier.

Guess what, we *can* have custom functions! Here's how we can make a custom function:
```js
//It's like the draw function when we were doing animation, but with var at the beginning, and a different name. We have var at the beginning because functions are technically a variable.
var functionName = function(){
    //put your code here
};
```
We're going to make a function that draws Preston, like so:
```js
var drawPreston = function(){
    var x = 200;
    var y = 2000;
    
    fill(0, 0, 0); //face color
    ellipse(x, y, 100, 100); //face
    
    fill(255, 255, 255); //eye color
    ellipse(x-20, y-10, 20, 20); //eyes
    ellipse(x+20, y-10, 20, 20);
    ellipse(x, y+20, 40, 20);
};
```
Try out that code. You'll notice that nothing happens, because we need to tell the computer to actually use the drawPreston function (programmers like saying that we call, or run, the function). We do that in the same way we run the rect or ellipse function:
```js
//make sure that you have the drawPreston function before this, or else the computer won't get what you mean
drawPreston();
```
Hey cool, it's drawing Preston again! And what's better, we can run the function again to get 2 Prestons. But if you were to try that (and I would encourage you to), you would notice that you only see 1 Preston. Why? Well, think about it: we didn’t change X or Y for the second Preston, so they were drawn on top of each other. How can we change the X and Y values?

# Parameters
For the rect and ellipse functions, we can put in some numbers describing the position and size of them. With fill and stroke, we can put in 3 numbers describing the color we want. The values you put into functions are called parameters. When you make a rect or ellipse function, the X, Y, width, and height are parameters to those functions. This is how you can make parameters for custom functions:
```js
//the parameters can be used just like variables.
var functionName = function(parameter, anotherParameter){
    //code goes here
}
```
So applying that to the drawPreston function:
```js
var drawPreston = function(x, y){
    fill(0, 0, 0); //face color
    ellipse(x, y, 100, 100); //face
    
    fill(255, 255, 255); //eye color
    ellipse(x-20, y-10, 20, 20); //eyes
    ellipse(x+20, y-10, 20, 20);
    ellipse(x, y+20, 40, 20);
};

//and as always, we have to run the function
drawPreston(100, 200);
drawPreston(300, 200);
```
And look at that, we made our own custom function! Now we can make as many Prestons as we want.
