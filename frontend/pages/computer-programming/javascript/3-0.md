# Intro
The little stick figure I made wanted to go to the moon, so I gave him a rocket!
I even added a y variable so we can change the height the rocket's at:
```js
var y = 100;

//rocket
fill(222, 139, 22);
rect(150, 125+y, 100, 165); //rocket body
fill(255, 255, 255);
ellipse(200, 190+y, 70, 70); //window
stroke(115, 75, 7);
strokeWeight(10);
line(200, 25+y, 150, 130+y); //top part
line(200, 25+y, 250, 130+y);

//stickman
noStroke();
fill(0, 0, 0);
ellipse(200, 190+y, 50, 50); //face

fill(255, 255, 255);
ellipse(190, 185+y, 10, 10); //eyes
ellipse(210, 185+y, 10, 10);
ellipse(200, 200+y, 20, 10);
```
You can view it by copying and pasting the code [here](https://vxsacademy.org/computer-programming/new/pjs).
If you mess with the y variable, it kinda looks like he's going up (or down, depending on the way you change
the y variable) But how do we actually launch the rocket? So far we can only draw still pictures. We need a
way to draw a bunch of pictures every second, and change the y variable a little bit every time, so it can
be animated.

# The Draw Function
How we make animations in Processing.js is by using the Draw function. You use it like this:
```js
draw = function(){
  //anything you want to draw a bunch of times a second goes here.
};
```
We'll talk about it later, but a function stores a group of code we can use later, like how variables store 
values. The "draw" is a special one that will allow us to animate our rocket. So put the rocket and stickman
inside the draw function (and leave "var y = 100;" outside). Nothing happens. That's because we're not changing
the y variable, so the rocket stays in place.

# Updating Variables
We need to change the y variable if we want to see the rocket move. How do we do that? Like this:
```js
y = y - 1; //This means "set y to y - 1". So if y was 100, it gets set to 99. And if it's 43, it's set to 42.
```
Every time this is called, y is set to y - 1. If we wanted the rocket to go down, we would do "y = y + 1;".
So now we have:
```js
var y = 100;

draw = function(){
  //rocket
  fill(222, 139, 22);
  rect(150, 125+y, 100, 165); //rocket body
  fill(255, 255, 255);
  ellipse(200, 190+y, 70, 70); //window
  stroke(115, 75, 7);
  strokeWeight(10);
  line(200, 25+y, 150, 130+y); //top part
  line(200, 25+y, 250, 130+y);
  
  //stickman
  noStroke();
  fill(0, 0, 0);
  ellipse(200, 190+y, 50, 50); //face
  
  fill(255, 255, 255);
  ellipse(190, 185+y, 10, 10); //eyes
  ellipse(210, 185+y, 10, 10);
  ellipse(200, 200+y, 20, 10);

  y = y - 1; // <--------- this is where we update the y value
};
```
Yay, now we're going to the moon! But hold on... why does it look like the rocket's getting smeared
across the screen? That's because we forgot to reset the canvas every time we draw by using
"background(255, 255, 255);". Add a background command right before the rocket and it should look fine.

# Shorthand
A pro tip, a short way for typing "y = y - 1;" is "y -= 1;". Same goes with addition, "y = y + 1;" is
the same as "y += 1;".
