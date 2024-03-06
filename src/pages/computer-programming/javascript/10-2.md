# Nested For Loops
After playing around with for loops, I got a little curious... can you put a for loop inside a for loop? So I decided to put the idea to the test:
```js
strokeWeight(3);
for(var j = 0; j < 400; j += 20){
    for(var i = 0; i < 400; i += 20){
        point(i, j);
    }
}
```
Woah cool, it works! If you try out that code, you'll see that it made a grid of points. And you could also replace the point with something more interesting, like Preston (no, I'm not trying to take over the world again).

But hmm, what's actually going on with the code I wrote? To make things easier to understand, I'm going to turn the y loop into a function, and pass in the j variable:
```js
//you don't have to do this I'm just showing it to you in a different way
var drawRow = function(j){
    for(var i = 0; i < 400; i += 20){
        point(i, j);
    }
};

strokeWeight(3);
for(var j = 0; j < 400; j += 20){
    drawRow(j);
}
```
Does that make a little more sense now? We're looping over the drawRow function, which also has a for loop in it. If you want to get a better understanding of it, try making some nested for loops yourself.
