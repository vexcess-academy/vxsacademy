# Arrays of objects
Remember the object I made for Preston's cat, Oreo? Well I think the other cats feel left out, so I made a program that has all of Preston's cats on it:
```js
var drawCat = function(x, y, furCol, name){ //furCol is short for "fur color"
    //head
    strokeWeight(1);
    fill(furCol); //remember when I was talking about variables and how you can store colors in variables with the color function?
    ellipse(x, y, 100, 100);
    
    //ears
    //the first 2 values describe one point, the second 2 describe the second point, and the third 2 describe the third point
    triangle(x-47, y-19, x-16, y-44, x-52, y-66);
    triangle(x+47, y-19, x+16, y-44, x+52, y-66);
    
    //eyes
    fill(0, 0, 0);
    ellipse(x-19, y-13, 20, 20);
    ellipse(x+19, y-13, 20, 20);
    
    //whiskers
    strokeWeight(2);
    line(x-24, y+5, x-7, y+13);
    line(x-24, y+19, x-7, y+13);
    line(x+24, y+5, x+7, y+13);
    line(x+24, y+19, x+7, y+13);
    
    //mouth
    strokeWeight(5);
    line(x, y, x, y+20);
    line(x-15, y+26, x, y+20);
    line(x+15, y+26, x, y+20);

    //name
    fill(0, 0, 0);
    text(name, x-34, y-58);
};

drawCat(100, 100, color(66, 41, 20), "Oreo");
drawCat(300, 100, color(92, 47, 5), "Chester");
drawCat(100, 300, color(191, 97, 15), "Jasper");
drawCat(300, 300, color(90, 99, 32), "Thomas");
```
Hmm, look at the last 4 lines of the code. I can't help but to notice how repeatable that is, so I wonder if I can use a loop. We have 4 different things to store for each cat (x, y, color, and name), so I'll make 4 different arrays to store it all:
```js
var catXvalues = [100, 300, 100, 300];
var catYvalues = [100, 100, 300, 300];
var catColValues = [color(66, 41, 20), color(92, 47, 5), color(191, 97, 15), color(90, 99, 32)];
var catNameValues = ["Oreo", "Chester", "Jasper", "Thomas"];
```
Hmm, I mean, it works but it doesn't seem like a great way to do it. You can't easily tell which X position is for Oreo, or which color is for Jasper. And if Preston were to get a new cat, it would be a pain to add the new cat in.

Let's represent the data for the cats in a different way. Instead of an array for each thing we want to know for each cat, how about we have a single array, and each element in the array is an object representing a single cat:
```js
var cats = [
    {
        x: 100,
        y: 100,
        color: color(66, 41, 20),
        name: "Oreo"
    },
    {
        x: 100,
        y: 300,
        color: color(92, 47, 5),
        name: "Chester"
    },
    {
        x: 300,
        y: 100,
        color: color(191, 97, 15),
        name: "Jasper"
    },
    {
        x: 300,
        y: 300,
        color: color(90, 99, 32),
        name: "Thomas"
    }
];
```
Ok now let's loop through it. Again, I'm going to ask the 3 questions when looping:
1. What do I want to loop? The function that draws cats.
2. How long should it loop? For as many cats as there are.
3. What should change? The cat we're drawing.

Alright so let's make the loop:
```js
var cat = {}; //a variable to store the current cat we're drawing to make things easier to read
for(var i = 0; i < cats.length; i ++){
    cat = cats[i];
    drawCat(cat.x, cat.y, cat.color, cat.name);
}
```
There we go, now we have fully automated the drawing of cats! And what's better, if Preston adopts another cat, we can just add another object into the cats array.

And we can actually make our code even simpler, due to the fact that you can use an object as a parameter (remember, parameters are the values you put into functions). We can replace all the parameters in the drawCat function with a single object paramter, like this:
```js
var drawCat = function(catObj){ //obj stands for object
    var x = catObj.x;
    var y = catObj.y;
    var furCol = catObj.color;
    var name = catObj.name;

    //I'm not displaying all the code in this function, because it's just too much
};
```
And we also have to change the part where we call the function accordingly:
```js
for(var i = 0; i < cats.length; i ++){
    drawCat(cats[i]);
}
```
And if you remember the lesson where we talked about the forEach method, we can simplify this even further:
```js
cats.forEach(function(v, i){
    drawCat(v);
});
```
So not only do we get automated code, but simple code as well!
