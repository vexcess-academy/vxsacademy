# Intro
Remember the Shadow Text function I made when I was talking about Local vs. Global variables? Well I decided to go one further: ***ULTRA SHADOW TEXT!!!***:
```js
var x = 0;
var y = 100;
var txt = "ULTRA SHADOW TEXT!!!";

//changes the text font
//Documentation on the textFont function: https://bhavjitchauhan.github.io/Essentials/processing/global.html#textFont
//Documentation on the createFont function: https://bhavjitchauhan.github.io/Essentials/processing/global.html#createFont
textFont(createFont("Serif Bold Italics"));

//shadow part of the ULTRA SHADOW TEXT!!!
var offset = 30;
var Brightness = 0;
while(offset > 0){
    //change the size according to the offset variable
    textSize(35-offset);
    
    //change the brightness of the text according to the offset variable
    Brightness = 255*offset/30;
    fill(Brightness, Brightness, Brightness);
    
    //draw text at offset
    text(txt, x+offset, y+offset);
    offset -= 2;
}

//main text
fill(125, 149, 255);
text(txt, x, y);
```
I really blew the first shadow text out of the park with this one!

Hmm, I can't help but to notice something. Whenever you use while loops, you seem to always do something like this:
```js
var i = 0; //starting value
while(i < 10){ //how long it should run
  //some code to run using the i variable
  i += 1; //increase the i variable by some value
}
```
So it makes me wonder, is there a shorthand for this?

# For Loops
A for loop does the same thing as a while loop: it repeats a chunk of code a certain amount of times. The only difference is that the for loop has a different syntax which is more convenient for what we usually use loops for. Here's how you write one:
```js
for(var i = 1; i <= 10; i += 1){
  println(i + " Missisipi...");
}
println("Oh oops, I counted 10 seconds a little too fast.");
```
To help you better understand the for loop, here's the same code, but with a while loop instead:
```js
var i = 1;
while(i <= 10){
  println(i + " Missisipi...");
  i += 1;
}
println("Oh oops, I counted 10 seconds a little too fast.");
```
It's basically the same thing, except you put the `var i = 1;` and `i += 1;` into the parentheses of the for loop (parentheses are the ( and ) symbols). Make sure that you separate the 3 things in the for loop with semi-colons and not commas, because the computer won't understand you if you do:
```js
//the computer will freak out, because there's commas when it needs semi-colons
for(var i = 0, i < 25, i += 1){
  println(i);
}
```
Using while loops or for loops is entirely up to you. Most programmers like for loops, but using while loops is perfectly fine too.
