# Intro
In the last lesson, we made a list of Preston's favorite activities. Here's the code:
```js
var favActivities = ["Programming", "Math", "Science", "Art", "Gaming"];
fill(0, 0, 0);
text("Preston likes " + favActivities.length + " things.", 10, 40);
text("Preston likes " + favActivities[0], 10, 60);
text("Preston likes " + favActivities[1], 10, 80);
text("Preston likes " + favActivities[2], 10, 100);
text("Preston likes " + favActivities[3], 10, 120);
text("Preston likes " + favActivities[4], 10, 140);
```
But let's say that Preston finds an interest in music all of a sudden. Or he lost interest in Art. I'd have to add or remove a text function and change the values. But I don't want to because I'm lazy. Well I see a lot of repetition, maybe we can use a for loop?

# Looping with Arrays
Aight let's recall the 3 questions when making loops and answer them:
1. What are we looping? (the text function)
2. How long do we want to loop? (as many times as there are items in the Array)
3. What do we want to change? (the item we're writing onto the screen)

Ok so let's make the loop:
```js
//start the variable i at 0, make it repeat until the end of the array, and count up every time.
for(var i = 0; i < favActivities.length; i++){
  text("Preston likes " + favActivities[i], 10, 60 + 20*i); //we also have to change the y value, which is what the "60 + 20*i" is all about.
}
```
