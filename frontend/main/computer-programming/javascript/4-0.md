# Math Warning
**WARNING:** Lots of math in this lesson. If you want to skip and go to the
next one, you have my permission.

# Intro
So let's say I want to resize the stickman's head. First we'll need his head
(I put his face in the center so it will be easier to do this):
```js
fill(0, 0, 0); //face color
ellipse(200, 200, 100, 100); //face

fill(255, 255, 255); //eye color
ellipse(180, 190, 20, 20); //eyes
ellipse(220, 190, 20, 20);
ellipse(200, 220, 40, 20);
```
So how do we go about resizing his head? Like always, try doing it yourself.
(+ is addition, - is subtraction, * is multiplication, and / is division)

# Resizing With Math - Size
So there's two things we need to figure out for the 4 ellipses that make up
the face: their position (X and Y) and their dimensions (width and height).
I'll start with dimensions because it's easier. When you scale any shape by
a factor of 2, the width and height of that shape also go up by a factor of
2. In other words, we multiply the width and height by 2:
```js
var scaleFactor = 2;

fill(0, 0, 0); //face color
ellipse(200, 200, 100*scaleFactor, 100*scaleFactor); //face

fill(255, 255, 255); //eye color
ellipse(180, 190, 20*scaleFactor, 20*scaleFactor); //eyes
ellipse(220, 190, 20*scaleFactor, 20*scaleFactor);
ellipse(200, 220, 40*scaleFactor, 20*scaleFactor);
```
Yay, now the shapes get bigger! But if you mess around with that code, you'll
see that we're not done yet, because we also need to figure out the position
of the shapes as well.

# Resizing With Math - Position
We want to scale at the center of the screen because that looks the nicest.
The face is at the center, so it won't move. What about everything else? Well,
we'll need to specify how far left/right and up/down each shape is from the
center. I'm going to focus on the left eye (the ellipse with an X value of 180)
When it's at a scale factor of 1 (meaning we didn't scale), the left eye's X
is at 180, which is 200 - 180 = 20 pixels to the left. What happens when
we change the scale factor? Well, so does this amount of pixels to the left.
That means that the equation for the X position is 200 - 20*scaleFactor (remember
learning about PEMDAS? Parentheses, Exponents, Multiplying/Dividing, and
Adding/Subtracting? So 20\*scaleFactor is caldulated first, then the subtraction part).
And it's the same for the Y, so we have:
```js
var scaleFactor = 2;

fill(0, 0, 0); //face color
ellipse(200, 200, 100*scaleFactor, 100*scaleFactor); //face

fill(255, 255, 255); //eye color
ellipse(200-20*scaleFactor, 200-10*scaleFactor, 20*scaleFactor, 20*scaleFactor); //eyes

//I did the same math wich these ellipses. Try going through the math yourself to understand it better
ellipse(200+20*scaleFactor, 200-10*scaleFactor, 20*scaleFactor, 20*scaleFactor);
ellipse(200+0*scaleFactor, 200+20*scaleFactor, 40*scaleFactor, 20*scaleFactor);
```
Yay, now we can change the size of shapes! I would encourage you to make your own
drawings to resize, and see what else you can do with math.
