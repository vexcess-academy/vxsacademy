# Intro
Remember the program from last lesson that draws Preston's cats onto the screen? If not, here's the code:
```js
var drawCat = function(catObj){ //obj stands for object
    var x = catObj.x;
    var y = catObj.y;
    var furCol = catObj.color; //furCol is short for "fur color"
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

cats.forEach(function(v, i){
    drawCat(v);
});
```
Hmm... look at the cats array. Each cat is basically the same when it comes to code: it's just an X and Y, a color, and a name. Is there a way we can simplify this?

# Object Oriented Design
There are a lot of things that share similar properties. For example, all cars have a brand name, a certain amount of people they can seat, a type of terrain they drive on (mud, road, dirt, etc.), and a type (sports car, station wagon, convertable, etc.). Characters in a game also share similar properties, like race, gender, role, strength, health, etc. So it would be nice to be able to just describe a type of object, like a car, character, or cat, and all of the properties it can have, and just assign the properties to something when we want to create a new object of that type. Luckily, we can do that with what's known as Object Oriented Design. First, we want to create a function we will call whenever we want to create a new object of a certain type. In our case, we're creating cat objects:
```js
//this function will create a new cat object
var cat = function(x, y, color, name){
    //the "this" keyword will refer to the new cat object we will create.
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
};
```
And then we want to create a cat with this function, which is done like this:
```js
var exampleCat = new cat(200, 200, color(20, 20, 20), "boring example cat");
```
Let's do that with Preston's cats now:
```js
var cats = [
    new cat(100, 100, color(66, 41, 20), "Oreo"),
    new cat(300, 100, color(92, 47, 5), "Chester"),
    new cat(100, 300, color(191, 97, 15), "Jasper"),
    new cat(300, 300, color(90, 99, 32), "Thomas")
];
```
And here's where the magic of Object Oriented Design comes in: let's say that I want all of them to have their last name Smith included. I could simply change the cat creating function like this:
```js
var cat = function(x, y, color, name){
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name + " Smith"; //all I did was add " Smith" to this one line, and now all 4 cats have it.
};
```
See how nice Object Oriented Design is? All the cats share similar properties, and yet, they are all individual cats, and Object Oriented Design respects that about them.
