# Text in Variables
So text (or string) are kinda interesting, but can we do more with it? Well yeah actually,
we can stick them in a variable (visible happiness).
```js
var txt = "I'm in a variable!";
```

And just like with numbers, you can also change text! For numbers, the + symbol will add them
together, and for strings, it will stick them together, like so:
```js
var name = "Preston";
text("My name is " + name, 200, 200); //will display "My name is Preston"
```
So can we subtract, multiply, and divide strings as well? No, but that would be cool. Maybe some
day in the future, when mathematicians figure out what that means (who knows, maybe it will be you)

# Extra (optional)
If you want to add quotation marks in your text, you can do it like this:
```js
var ok = "I'm using \"quotation marks\" in a string";

//the computer thinks that "I'm using " and " in a string" are separate strings of text,
//and "quotation marks" is a variable. I mean, how is it supposed to know otherwise?
var notOk = "I'm using "quotation marks" in a string";
```

And another thing, if you want a string of text to have multiple lines, there's two ways
you can do it:
```js
// "\n" adds a new line
var slashNMethod = "this \nhas \nmultiple \nlines";

// doing a \ and then adding a new line is ok
var slashMethod = "this\
has\
multiple\
lines";

//this makes the computer freak out.
var notOk = "this
has
multiple
lines";
```
