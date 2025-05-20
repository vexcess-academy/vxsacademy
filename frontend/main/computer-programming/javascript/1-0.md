# Coordinate system
Before we do anything with Processing.js, I should talk about Coordinate systems. A Coordinate system is
how we describe position with numbers. If you were to tell me where your pencil is, you might say "it's
1 inch to the right of my paper". You probably wouldn't say exactly how far way your pencil is from
your paper like that, but that's the basics of a coordinate system. It says how far away to the right or
left something is, and also how far up and down it is.

Us programmers like consistancy, so we use a <strong>reference point</strong>, which is a point we all
agree on for the Coordinate system. So instead of saying "1 inch to the right of my paper", you would
use the paper as a reference point, and say "1 inch to the right of the reference point". In
Processing.js, the reference point is always in the top left corner.

The left/right value is called the X vlaue, and up/down is called the Y value. Increasing the X value
will make it go more to the right, and increasing the Y value will make it go downwards

# Basic Shapes
There are several shapes you can make with Processing.js, like rectangles, ellipses (or ovals), and lines.
I'll start you off with rectangles.

To make rectangles, you write this (try it out for youself [here](https://vxsacademy.org/computer-programming/new/pjs)):
```js
rect(200, 200, 20, 20);
```
What do those numbers mean? Try changing them, see what they do. (PRO TIP: if you click one of the numbers,
you'll see an icon pop above the number. You can drag it to the left and right to adjust the numbers.)

If you messed around with the numbers, you will notice that the first one means how far to the left or
right the square is (the X value), the second one is how far up or down it is (the Y value), the third
one is the width, and the fourth one is the height.

"Ok, but are we measuring in Meters? Feet? Milimeters? Inches?". Actually, we're measuring in pixels.
If you didn't know, pixels are tiny little squares that make up the screen you're looking at. Try
getting close to your screen, you might see them. The canvas is 400 pixels wide and 400 pixels tall,
but you can change that by clicking on the "settings" button below your code.

So that's a rectangle, but that's not very exciting all by itself. So let me show you how to make ellipses
as well (again, try it out for yourself):
```js
ellipse(200, 200, 20, 20);
```
If you play with those numbers, you'll see that they work in the same way. First one's the X value, second
one's the Y value, third one's width, and the fourth one's height. But you might notice a slight difference:
for the rectangle, the X and Y describe the top-left corner, but for the ellipse, they describe the middle.
Keep that in mind when using rectangles and ellipses.

One last shape I want to talk about, lines. Here's what you write:
```js
line(100, 100, 300, 300);
```
The first two numbers (AKA values) are the same as the other shapes, they describe the X and Y. But lines don't
have width or height, so what are the third and fourth values? Try them out for yourself, and see what they do.

You'll notice that the first and second values are the X and Y values for the first end of the line, and the
third and fourth are the X and Y values for the second end of the line. A little bit different from the other
two shapes, but it makes sense for a line.
    
# Comments
If you put a lot of rectangles and ellipses down, you might lose track of what draws what. We have a niftly
little tool that allows us to organize our code better, called comments. You write them like this:
```js
//this is a comment
```
A comment is a note for programmers so they know what certain chunks of code do. The computer ignores
them completely because it's just for the humans.
        
So now that you know how to draw rectangles, ellipses, and lines, see what you can make with them! Maybe a face, a robot,
a cookie, a pizza, or a donut. Yeah I know, it's kinda boring without color, but we'll get to that in the next lesson.
