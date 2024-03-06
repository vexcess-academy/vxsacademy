# Intro
In the last lesson, we made an object describing Preston's book (keep in mind that it's an imaginary book):
```js
var book = {
    title: "Not so Fantastic Bugs and Where to Find Them",
    description: "Lots of tips and tricks on how to debug your Javascript programs. For debugging C++ programs, try the book 'How to smash sea bugs.'.",

    ratings: {
        average: 3,
        preston: 5,
        array: [
            "1/5. It doesn't talk about bugs at all, just programming stuff. I want a refund!",
            "5/5. This book is amazing! Taught me a lot about debugging.",
            "4/5. I was hoping it was going to talk about insects, but I'm a programmer so I still found it enjoyable.",
            "2/5. This book is WAY below my level. I don't even know why I got it, I work for NASA lol"
        ]
    },

    author: "Bobert Rossert",
    numOfPages: 271,
    audience: "Not for people who work for NASA",
    genre: "Science nonfiction. Not to be confused with science fiction."
};
```
Bobert Rossert saw this object describing his book, and he would actually prefer that we include his middle name, Normert, which makes his full name "Bobert Normert Rossert". We could simply edit the code, but if we want to make a program where authors could publish books, I doubt authors would want to go into the code to make updates to their book. So how else can we update the author name parameter?

# Modifying Objects
Remember how we update variables, or items in arrays? If not, you do it like this:
```js
var numOfCats = 3; //Preston has 4 cats
numOfCats = 4; //he got a new cat, so we're going to update the variable

var namesOfCats = ["Oreo", "Chester", "Jasper", "Shakespeare"]; //Preston's first idea for the new cat's name was "Shakespeare"
namesOfCats[3] = "Thomas"; //He actually decided on the name "Thomas", so we have to update the array.
```
You update object parameters in a similar way:
```js
//information on his first cat Oreo (I'm not writing the info for all the other cats)
var Oreo = {
    lives: 9,
    eyes: "brown",
    age: 5 //in years
};

Oreo.age = 3; //Oreo got younger. Oreo doesn't obey the laws of physics because he's a cat
```
So let's use this knowledge to update Mr. Rossert's name:
```js
println("The author name was " + book.author);
book.author = "Bobert Normert Rossert";
println("But now it's" + book.author);
```
Mr. Rossert decided to make an update to his book so that there's exactly 1 more page in the book (don't ask me why, I'm not Mr. Rossert). We can update the number of pages accordingly:
```js
book.numOfPages += 1;
```
Mr. Rossert made ANOTHER update to his book so that there's exactly 1 more page than the previous update. What on earth is going on in his mind? But reguardless, let's update the number of pages again:
```js
//I got lazy
book.numOfPages ++;
```
Mr. Rossert made ANOTHER update, but this time, there's 3 more pages than the previous update. At this rate, we should have a version parameter to keep track of this madness. Adding a new parameter is actually quite easy:
```js
book.version = 4; //If you count them, we're on version 4 of the book now

book.numOfPages += 3; //we also have to make sure to update the number of pages.
```
I don't know about you, but I'm getting tired of updating the number of pages for him. As a challenge, try making an interactable program so that Mr. Rossert can update the number of pages himself. You can look at the lesson [Button with if statements](thisisafakelink.com) if you want to use buttons to make it.
