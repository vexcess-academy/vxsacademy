# Intro
We're going to start where we left off from the last lesson. Here's the code:
```js
var drawCat = function(catObj){ //obj stands for object
    var x = catObj.x;
    var y = catObj.y;
    var furCol = catObj.furCol; //furCol is short for "fur color"
    var name = catObj.name;

    strokeWeight(1); //head
    fill(furCol); //remember when I was talking about variables and how you can store colors in variables with the color function?
    ellipse(x, y, 100, 100);
    
    //ears
    //the first 2 values describe one point, the second 2 describe the second point, and the third 2 describe the third point
    triangle(x-47, y-19, x-16, y-44, x-52, y-66);
    triangle(x+47, y-19, x+16, y-44, x+52, y-66);
    
    fill(0, 0, 0); //eyes
    ellipse(x-19, y-13, 20, 20);
    ellipse(x+19, y-13, 20, 20);
    
    strokeWeight(2); //whiskers
    line(x-24, y+5, x-7, y+13);
    line(x-24, y+19, x-7, y+13);
    line(x+24, y+5, x+7, y+13);
    line(x+24, y+19, x+7, y+13);
    
    strokeWeight(5); //mouth
    line(x, y, x, y+20);
    line(x-15, y+26, x, y+20);
    line(x+15, y+26, x, y+20);

    fill(0, 0, 0); //name
    text(name, x-34, y-58);
};

//this function will create a new cat object
var cat = function(x, y, color, name){
    //the "this" keyword will refer to the new cat object we will create.
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
};

var cats = [
    new cat(100, 100, color(66, 41, 20), "Oreo"),
    new cat(300, 100, color(92, 47, 5), "Chester"),
    new cat(100, 300, color(191, 97, 15), "Jasper"),
    new cat(300, 300, color(90, 99, 32), "Thomas")
];

cats.forEach(function(v, i){
    drawCat(v);
});
```
Remember how I was talking about how types of things have similar properties, like cars and characters? Well cars and characters don't just have similar properties, there are similar things that they do. Cars drive, get gas, and get fixed when they're broken. Characters in a game may fight, flee, walk, jump, eat, and talk. With Preston's cats, they all "do" a similar thing: get drawn on the screen. So can we attach the "drawCat" function onto the cat object type?

# Object Methods
Remember when I was talking about arrays, and arrays have these special functions called "methods", like push, and shift? We can also add methods to our cat object type. Here's how you do it:
```js
//"prototype" is a special keyword you type when making methods.
cat.prototype.method = function(){
    println("Hey lookie there, you used the meow-thed");
};
```
Let's do that with the drawCat function:
```js
//make sure that you have this immediately after the "cat" function, or else the computer will freak out and say "cat not defined".
cat.prototype.draw = function(catObj){ //obj stands for object
    var x = catObj.x;
    var y = catObj.y;
    var furCol = catObj.furCol; //furCol is short for "fur color"
    var name = catObj.name;

    //again, I'm not going to the entire function
};
```
How do we call the method? The same as with array methods! I'm just going to use the first cat Oreo as an example:
```js
cats[0].draw(cats[0]);
```
Hmm, that doesn't make much sense. It seems silly to pass in the cat object when we're calling the method on the same object. And you don't have to do that with arrays, like this:
```js
var array = [1, 2, 3];

//you don't have to put in the array you're calling the method on like this, you just have to do "array.pop();"
array.pop(array);
```
So let's look back at the draw method. How can we change the code so we don't have to pass in a cat object? You might recall the "this" keyword, and that it refers to the newly created cat object. So let's use that:
```js
cat.prototype.draw = function(){
    var x = this.x;
    var y = this.y;
    var furCol = this.furCol; //furCol is short for "fur color"
    var name = this.name;

    //...
};

cats[0].draw();
```
Eureka! Using the "this" keyword works! "This" is awesome (pun intended). Let's make it so it loops through all the cats now:
```js
cats.forEach(function(v){
    v.draw();
});
```
You know what? Since we can, let's add another method, a meow method:
```js
cat.prototype.meow = function(){
    fill(0, 0, 0);
    text("Meow", this.x-20, this.y+70);
};
```
And we can call the method in the same way:
```js
cats.forEach(function(v){
    v.draw();
    v.meow();
});
```
So now not only do we have parameters that they all share, but they also have methods we can call whenever we want! It's pretty darn awesome.
