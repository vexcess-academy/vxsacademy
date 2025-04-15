# Intro
Preston was curious as to how much candy he could eat in a day. He did some testing and saw that he could eat about 1,200 candies in an hour (don't ask me how he knows that). There's 24 hours in a day, so that's 1,200*24 = 28,800 candies in a day! But what if we want to know how many he can eat in 2 hours, or 7 hours, or 5 days? Let's use programming to figure this out (even though it would be easier to use a calculator):
```js
textSize(18);
fill(0);
//yes, you can use numbers inside of text like this. Pretty cool, right?
text("In 2 hours, Preston can eat " + 1200*2 + " candies.", 5, 20);
text("In 7 hours, Preston can eat " + 1200*7 + " candies.", 5, 40);
text("In 5 days, Preston can eat " + 1200*24*5 + " candies.", 5, 60);
text("In 1 week (7 days), Preston can eat " + 1200*24*7 + " candies.", 5, 80);
text("In 1 year (about 365 days), Preston can eat " + 1200*24*365 + " candies.", 5, 100);
fill(0, 0, 255);
text("Wow, Preston can eat so much candy in a year", 5, 120);
text("that it doesn't even show on the screen!", 5, 140);
```
Hmm, I'm doing a lot of multiplying by 1200 in this code. It'd be nice to be able to make something that does all this for me.

# Return Satements
A return statement is something you can use to output a value out of a function. Here's how you make and use one:
```js
var answerToEverything = function(){ //you can use parameters in it just like with normal functions
  return 42; //change the 42 to whatever you want this to output. It can also make it spit out text if you want.
};

fill(0, 0, 0);
text(answerToEverything(), 20, 20); //you should see 42 on the screen, because that's what we told the return statement to output.
```
So I'm going to make a return statement called numOfCandies that will tell us how many candies he can eat in however many hours we give it, like so:
```js
var numOfCandies = function(numOfHours){
  return 1200*numOfHours;
};

textSize(18);
fill(0);
text("In 2 hours, Preston can eat " + numOfCandies(2) + " candies.", 5, 20);
text("In 7 hours, Preston can eat " + numOfCandies(7) + " candies.", 5, 40);
text("In 5 days, Preston can eat " + numOfCandies(24*5) + " candies.", 5, 60);
text("In 1 week (7 days), Preston can eat " + numOfCandies(24*7) + " candies.", 5, 80);
text("In 1 year (about 365 days), Preston can eat " + numOfCandies(24*365) + " candies.", 5, 100);
fill(0, 0, 255);
text("Wow, Preston can eat so much candy in a year", 5, 120);
text("that it doesn't even show on the screen!", 5, 140);
```
This probably isn't the best example, but as you do more complex calculations in your programs, you'll learn to love return statements.
