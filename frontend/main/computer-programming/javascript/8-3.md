# mouseX and mouseY
You might remember me talking about mouseX and mouseY a little while ago. If you forgot, those 2 variables describe the X and Y of the mouse position, which allows you to interact with the program! I used it, along with a few other things, to make this:
```js
var r = 0;

draw = function(){
    //there's no background function in here, which means we can draw with the ellipse!
    
    noStroke();
    fill(r, 255-r, 0); //the red value of the color is set to r, and the same for the green value but inverted.
    ellipse(mouseX, mouseY, 50, 50); //draw an ellipse where the mouse is

    r += 0.5; //increase r by 0.5 every frame
    if(r > 255){ //if r is greater than the max value
        r = 0; //reset r to 0
    }
}
```
But I want to make it so that the ellipse is only drawn when you press down the mouse button. How can we do that?

# mouseIsPressed
There's another special variable for the mouse, called mouseIsPressed. As the name implies, it's set to true if the mouse is being pressed down, and false if it's not. So we can use mouseIsPressed like this:
```js
var r = 0;

draw = function(){
    //there's no background function in here, which means we can draw with the ellipse!

    if(mouseIsPressed){
        noStroke();
        fill(r, 255-r, 0); //the red value of the color is set to r, and the same for the green value but inverted.
        ellipse(mouseX, mouseY, 50, 50); //draw an ellipse where the mouse is
    }

    r += 0.5; //increase r by 0.5 every frame
    if(r > 255){ //if r is greater than the max value
        r = 0; //reset r to 0
    }
}
```
Copy and paste that code, and you'll see that it's working how I want it to (yay!!). There's also keyIsPressed, which is just like mouseIsPressed, but instead of a mouse button press, it's a keyboard button press.
