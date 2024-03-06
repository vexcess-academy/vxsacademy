# Arrays
Preston has a lot of activities he likes doing: Programming, Math, Science, Art, Gaming, etc. I want to store a list of his favorite activities in a program. Well here's one way I can do it, although it's not very great:
```js
var programming = "Programming";
var math = "Math";
var science = "Science";
var art = "Art";
var gaming = "Gaming";
```
It's not really a list, is it? It's just a bunch of separate variables. And doing it this way, there's almost no way of finding what the next thing in the list is, the first thing, the last thing, or anything like that. Luckily, there's a way we can create an ACTUAL list, called an Array. Here's how you make one:
```js
//you can make square brackets ([ and ]) the same way you make curly brackets ({ and }), but without pressing the shift key
var favActivities = ["Programming", "Math", "Science", "Art", "Gaming"];
```
Let's print it out just to see what it says:
```js
println(favActivities);
```
Hmm, it prints out as "Programming,Math,Science,Art,Gaming". That's great and all if I want everything in the list, but what if I only want the first thing in the list? How you do that is you add [] at the end, and inside of those square brackets you put in the order number (or index) of what we want. We want the first thing in the list, so let's put in the number 1:
```js
println(favActivities[1]); //prints out "Math"
```
Hold up, it's printing out "Math", but "Math" isn't the first thing in the array, "Programming" is! What's going on here? Well in javascript, arrays actually start at 0, not 1 (weird, I know). So you put in 0 for the first thing, 1 for the second thing, 2 for the third thing, etc. Replace the 1 with a 0 in the println function and you should see that it works just fine, printing "Programming" as we want it to.

Ok, so now that we know how to use Arrays, let's do something with it! I'm going to write text on the screen showing everything that Preston likes:
```js
var favActivities = ["Programming", "Math", "Science", "Art", "Gaming"];
fill(0, 0, 0);
text("Preston likes " + favActivities[0], 10, 60); //Programming
text("Preston likes " + favActivities[1], 10, 80); //Math
text("Preston likes " + favActivities[2], 10, 100); //Science
text("Preston likes " + favActivities[3], 10, 120); //Art
text("Preston likes " + favActivities[4], 10, 140); //Gaming
```
Hmm, actually, I want to add something. I want to make it say how many things Preston likes. How you can do that is writing the array name like before, but instead of doing [], you add ".length" at the end. ".length" automatically gets the length of the array for us (once we talk about Objects, the syntax will make a little more sense). So let's add a text function saying how many thing he likes:
```js
text("Preston likes " + favActivities.length + " things.", 10, 40);
```

# Undefined Values
Once you use arrays more, you'll might accidentally input a number that makes no sense, like this:
```js
var fruits = ["Apple", "Banana", "Orange"];
println(fruits[5]); //this outputs "undefined", because there is no 6th element of the array. It only goes up to 3.
println(fruits[-1]); //this outputs "undefined", because 0 is the smallest index number.
println(fruits[0.5]); //this outputs "undefined", because index numbers are always whole numbers.
```
You can avoid this by either changing the number you put in so it does make sense, or by using an if statement like so:
```js
var fruits = ["Apple", "Banana", "Orange"];
var i = 3.14;
if(fruits[i] !== undefined){
    println(fruits[i]); //this won't run, because fruits[i] is undefined.
}
```
