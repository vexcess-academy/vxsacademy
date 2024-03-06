# Value Types
If you are an artist, you probably know that there are many different tools, and they're used for different things. Pencils are used for drawing, crayons are used for coloring, erasers are used for erasing, brushes are used for painting, tablets are used for digital art and animation, and so on so forth. When you use them together in the right ways, you can make some pretty amazing art (of course, you need other things for great art, like practice, good ideas, references, etc.). Just like with art utensils, there are many programing "utensils" called value types. You already know of a few, like numbers, strings of text, and functions. They're all used for different things, like how text is for words, and functions are to run certain chunks of code. I'm going to teach you a new value type: the Boolean.

# Booleans
Booleans, which were invented by George Boole, are an answer to a yes or no question (maybe isn't an answer tho). Programmers don't call them "yes", and "no", but "true" and "false". If you type "true" or "false" into the coding environment you'll see that they're in color, which means that they're special little fellas. What's the point of booleans? For if statements! You might have guessed that the condition we put in an if statement is secretly a boolean in disguise, which it is. Here's an example of booleans in action:
```js
fill(0, 0, 0);

var programmingIsCool = true; //Yup, we can assign variables to a boolean. We can assign a variable to a value of any type, actually.
if(programmingIsCool){
  //programingIsCool is true, so this will run
  text("Yay, programming is cool!", 100, 50);
}

var profCobraIsHuman = false; //I'm prof. Cobra, and I'm not human, but a snake-droid.
if(profCobraIsHuman){
  //profCobraIsHuman is false, so this won't run
  text("And Cobra is a human!", 100, 100);
}
```

One of the ways we can make booleans is by comparing numbers. We used 2 comparing symbols when making the portals: < and >. Another one is <=, meaning "less than or equal to". As you might guess, it sees if the number on the left is less than or equal to the one on the right, as so:
```js
fill(0, 0, 255);

if(41 <= 42){
  //41 is less than or equal to 42, so this will run.
  text("41 <= 42", 100, 50);
}

if(42 <= 42){
  //42 is less than or equal to 42, so this will run.
  text("42 <= 42", 100, 100);
}

if(43 <= 42){
  //43 is NOT less than or equal to 42, so this will not run.
  text("43 <= 42", 100, 150);
}
```

There's 3 more, let me show you them:
```js
fill(255, 0, 0); //make the text red because why not?

if(5 >= 6){ //checks if the number on the left is greater or equal to the one on the right.
  //5 is not greater than or equal to 6, so this won't run.
  text("5 >= 6", 100, 50);
}

if(10 === 10){ //checks if the two numbers are equal. Remember how = means "set this variable to"? The reason why this is 3 equal signs is so the computer doesn't get confused (computers get confused very easily)
  //10 equals 10, so this will run.
  text("10 === 10", 100, 100);
}

if(100 !== 78){ //checks if two numbers are NOT equal. I don't know why there's a ! in there. Sometimes javascript is just weird like that.
  //100 doesn't equal 78, so this will run.
  text("100 !== 78", 100, 150);
}
```

Make sure you're putting a boolean or a comparison of 2 numbers (which is just a boolean in disguise) in an if statement, because putting anything else doesn't make sense:
```js
//these examples don't make sense, but the computer doesn't care.
fill(125, 125, 125);

//what does "if 4" mean? lol
if(4){
  //this runs for some reason
  text("if 4 (whatever that means)", 100, 50);
}

//Again, what does 'if "purple"' mean?
if("purple"){
  //this runs for some reason
  text("if purple (whatever that means)", 100, 100);
}
```

 Yay, now we know booleans! Another awesome tool under our toolbelt.

# Bonus Stuff
When it comes to === and !==, you can use them with text as well! Very big day for people who like comparing strings of text.
```js
fill(255, 0, 255);
var prestonName = "Preston";

if(prestonName === "Preston"){
  //prestonName equals "Preston", so this will run.
  text("His name is Preston", 100, 50);
}

if(prestonName !== "Prof. Cobra"){
  //prestonName doesn't equal "Prof. Cobra", so this will run.
  text("His name isn't Prof. Cobra", 100, 100);
}

if(prestonName === "preston"){
  //Javascript is case-sensitive, meaning uppercase letters and lowercase letters are treated as different things, so this won't run.
  text("His name is spelled with a capital P", 100, 150);
}
```
And if you ever wonder if you can or can't do something in Javascript, you are more than welcome to try it out for yourself, and see if it works. It's a great way of learning programming, or anything really.
