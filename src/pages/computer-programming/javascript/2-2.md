# Math With Variables
In the last article, I made a stickman and controlled the arm and shoulder heights with
variables. Here's the code:
```js
fill(0, 0, 0); //face color
ellipse(200, 70, 100, 100); //face

fill(255, 255, 255); //eye color
ellipse(180, 60, 20, 20); //eyes
ellipse(220, 60, 20, 20);
ellipse(200, 90, 40, 20);

stroke(0); //body color
strokeWeight(15);
line(200, 120, 200, 280); //body

//yay variables!
var armHeight = 260;
var shoulderHeight = 140;

line(160, armHeight, 200, shoulderHeight); //arms
line(240, armHeight, 200, shoulderHeight);

line(160, 380, 200, 280); //legs
line(240, 380, 200, 280);
```

But let's say I wanted to control how far the arms are from the body? The arms are using two
different values, so we can't use a variable. Well actually, we *can* use a variable! We can
do a bit of math to get the values we need. Before you continue reading, try making a variable
for how far the arms are from the body, and use math to get it to work.
(+ is addition, - is subtraction, * is multiplication, and / is division)

So how do we do this? Well, the arms are to the left and right of the body, and the body has
an X value of 200. We need an arm that is to the left of the body, and one to the right. Here's
how we do it:
```js
var armHeight = 260;
var armDistance = 40; //how far away the arms are from the body
var shoulderHeight = 140;

line(200-armDistance, armHeight, 200, shoulderHeight); //arm that's to the left of the body
line(200+armDistance, armHeight, 200, shoulderHeight); //arm that's to the right of the body
```
Yay, now we can control how far his arms are from his body! Now try experimenting. See what
other variables you can use for the stickman. Maybe one for the height of his waist, or the
size of his head, or maybe even his color. Then try changing the variables you make, see
what kinds of stickmen you can create.
