# Color
So we can draw shapes onto the canvas, but it's not very exciting without color, is it?
There are two different things we can color: the outline of the shapes, and the inside.
Here's how we do it:
```js
fill(255, 0, 0); //inside of the shape
stroke(0, 255, 255); //outline of the shape
rect(200, 200, 20, 20); //a shape to draw
```
Fill, stroke, and rect are called "commands". Commands are a piece of code you run.
The fill and stroke commands go before whatever shape you want to color.

You might be wondering what those 3 values do. Try messing with them yourself, see
if you can figure it out before we talk about them in the next section.

Also there is a function to set the background color! It goes just like this:
```js
background(255, 0, 255);
```

# Color Code
The 3 values in the fill and stroke functions are the red, green, and blue values
respectively. You know how red and blue make purple? Well, that's actually for things
like paint. Your screen is emmiting light, so it's actually different: red and blue
make magenta when it comes to light. Here's some examples:
```js
fill(255, 255, 255); //white
fill(128, 128, 128); //gray
fill(0, 0, 0); //black
fill(255, 0, 0); //red
fill(0, 255, 0); //green
fill(0, 0, 255); //blue
fill(255, 255, 0); //yellow
fill(255, 128, 0); //orange
fill(255, 0, 255); //magenta
fill(128, 128, 0); //brown
fill(0, 255, 255); //cyan
```
<details>
  <summary>Why do the values max out at 255?</summary>

  The answer has to do with binary. If you didn't know, computers store numbers with 0s and 1s.
  You know how regular numbers work, where the first digit is the 1s place, the second digit is
  the 10s place and the third digit is the 100s place? Well binary works the same way, but the
  first digit is the 1s place, the second digit is the 2s place, and the third digit is the 4s
  place. So if we were to count in binary, it would be like:

    0                       <- 0x1 = 0
    1                       <- 1x1 = 1
    10                <- 1x2 + 0x1 = 2
    11                <- 1x2 + 1x1 = 3
    100         <- 1x4 + 0x2 + 0x1 = 4
    101         <- 1x4 + 0x2 + 1x1 = 5
    110         <- 1x4 + 1x2 + 0x1 = 6
    111         <- 1x4 + 0x2 + 1x1 = 7
    1000  <- 1x8 + 0x4 + 0x2 + 0x1 = 8

  For these colors, the computer maxes out at 8 digits per value, which is 11111111 in binary, or 255.
  If you want to learn more, [Khan Academy](https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:digital-information/xcae6f4a7ff015e7d:binary-numbers/a/bits-and-binary) has a course on it.
</details>

# Stroke Thickness
It's a bit boring that all the shapes's outlines, or strokes, have the same thickness, right?
What if we wanted to change that? Well, we can! This is how we do it (are you trying out what I
show you? You should, it will help you learn quicker):
```js
strokeWeight(1);
```
The value changes the thickness of the outline (or stroke). And we can also remove the stroke completely!
```js
noStroke();
```
Yup, that's right, a command with no values to put in. That happens sometimes.

So now that you can color your shapes and change the stroke thickness, see what you can make now! I'm sure
there's plenty of things you can make if you get creative with it.
