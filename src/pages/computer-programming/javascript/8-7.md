# Intro
I want you to get plenty of practice with if statements, because they're very useful, but can get complicated fast.
So let's make something that is somewhat simple, like a button! Before I show you how, try to make a button yourself, and make something happen when you click it.

# Button
First, let's make a button to click:
```js
//it needs to be in a draw function because every frame, we want to check to see if the button was pressed.
draw = function(){
  background(255, 255, 255);
  fill(13, 49, 117);
  rect(100, 300, 200, 100); //button
  
  fill(255, 255, 255);
  textSize(50);
  text("Click Me", 110, 370); //text
};
```
Not the most interesting button in the world, but it'll do. Now we need to make the functionality of the button, the most important part.
How do we do that? Well, clicking on a button means that we clicked, and our mouse was over the button. Detecting if we clicked is easy, you just use `mouseIsPressed`.
But what about detecting if the mouse is over the button? Well, we know that everywhere on the button has an X value greater than 100 (because the Y value of the rect is 100), so let's start there.
```js
//remember when we talked about mouseX and mouseY? If not, they store the position of the cursor (or mouse) at any given time
if(mouseX > 100){
  textSize(20);
  fill(0, 0, 0);
  text("Yay, your mouse is over me!", 110, 290);
}
```
Try it out. You'll see that it looks like a step in the right direction, but we're not quite there yet. It does say "Yay, your mouse is over me!" when we're over the button, but it also says that when we're above, below, and to the right of the button too. Guess we have more work to do. If you want to figure the rest for yourself, you are more than welcome to.

Ok, so what else do we know about every place on the button? Well, it also has an X value less than 300. How do I know? The X value of the rect is 100 and the width is 200, and if you add them up, you get 300. Let's put that into the code:
```js
if(mouseX > 100 && mouseX < 300){
  textSize(20);
  fill(0, 0, 0);
  text("Yay, your mouse is over me!", 110, 290);
}
```
Ok, that's working better (again, try out the code yourself). Now let's apply the same logic for X to Y:
```js
//the Y value of the rect is 300, and the height is 100. So the Y is greater than 300, and less than 300 + 100 which is 400
if(mouseX > 100 && mouseX < 300 && mouseY > 300 && mouseY < 400){
  textSize(20);
  fill(0, 0, 0);
  text("Yay, your mouse is over me!", 110, 290);
}
```
Ayy, now it's working! You can check by moving your mouse in and out of the edges. You should see that the text only shows when you're over the button. But one last thing, we want to *click* the button, not hover over it. So we have to see if the mouse is over the button AND if the mouse is pressed:
```js
if(mouseIsPressed && mouseX > 100 && mouseX < 300 && mouseY > 300 && mouseY < 400){
  textSize(20);
  fill(0, 0, 0);
  text("Yay, you clicked me!", 110, 290);
}
```
Yay, now we have a working button! Buttons are very useful to make things interactive, so that's another tool for your programming toolbelt.

