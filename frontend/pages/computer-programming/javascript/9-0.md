# Intro
Using what we learned when making a button, I made a door you can open when you hover your mouse over it:
```js
draw = function() {
    background(255);

    //if the mouse is over the door
    if(mouseX > 125 && mouseX < 275 && mouseY > 375 && mouseY > 325){
        //draw the door open
        fill(0);
        rect(125, 75, 150, 250);
        fill(0, 255, 0);
        text("Hello :)", 200, 200);
        
        fill(94, 53, 12);
        rect(275, 75, 60, 250);
        fill(0);
        ellipse(325, 225, 10, 20);
    }else{
        //draw the door closed
        fill(94, 53, 12);
        rect(125, 75, 150, 250);
        fill(0);
        ellipse(150, 225, 20, 20);
    }
};
```
One problem though, it's not working right. Try it out for yourself. It doesn't seem like anything will open the door. Did I forget to unlock it? Nah, this door doesn't have a lock. I must have made a mistake somewhere. But where is my mistake?

# Println function
Bugs are problems in code, and debugging is the process of finding and fixing them (like how we need to fix my door). There is a function that is small but mighty and is great for debugging called the println function. Here's how you use it:
```js
println("Hello World!");
```
It displays text in a window that pops up. Try it out to see it work. What makes it so useful? It lets you understand what the computer is doing in the background, which is an essential when debugging. Here's the println function in action:
```js
var x = 0;

println("x was " + x);
x = 1;
println("But now, x is " + x);
```
And that's an overly simple example, but the println function can help you understand much more complex code, like my door. So let's go smash some bugs! No, not literal bugs, you can put down your swatters and insect repellent. I'm talking about computer bugs.

# Debugging
Ok, where to begin? Well, it looks like the problem is with the condition in the if statement, `mouseX > 125 && mouseX < 275 && mouseY > 375 && mouseY > 325`. Just to make sure though, I'm going to replace it with `true`, and the door should open.
```js
//replacing the condition with "true" to see if it'll open
if(true){
    //draw the door open
    fill(0);
    rect(125, 75, 150, 250);
    fill(0, 255, 0);
    text("Hello :)", 200, 200);
    
    fill(94, 53, 12);
    rect(275, 75, 60, 250);
    fill(0);
    ellipse(325, 225, 10, 20);
}else{
    //draw the door closed
    fill(94, 53, 12);
    rect(125, 75, 150, 250);
    fill(0);
    ellipse(150, 225, 20, 20);
}
```
And that worked! Right now I just showed you a technique for debugging: replacement. Temporarily replacing code with something you know will work is a useful way of figuring out where the problem is. Just make sure that you fully understand what will happen if you temporarily replace code like this, otherwise you might confuse yourself with this trick. But anyways, we now know that the problem is with the condition. I'm going to put the condition back in, and get some println functions to tell me when `mouseX > 125 && mouseX < 275` is true, and when `mouseY > 375 && mouseY > 325` is true separately:
```js
//the ( ) symbols (called parentheses) around the conditions are telling the computer that it needs to figure out the conditions first before it adds it to the string. Without the parentheses, the computer gets confused.
println("X part of the condition: " + (mouseX > 125 && mouseX < 275));
println("Y part of the condition: " + (mouseY > 375 && mouseY > 325));
```
Hmm, so it looks like the X part of the condition is working (try it out yourself), but not the Y part. The X part is true when I'm over the door, and false when I'm to the left or right of the door, which is what we want. But the Y part is only true when my mouse is at the very bottom of the canvas. Let's focus on the Y part, and split it up like how we did before:
```js
println("mouseY > 375? " + (mouseY > 375));
println("mouseY > 325? " + (mouseY > 325));
```
Hmm, so it looks like the `mouseY > 375` part is working in the opposite way I want it to: it's true when it's below the door, when I want it to be false when it's below the door. I think it's because I made the mistake of using the > symbol, when I was supposed to use the < symbol, my bad (in programming, you'll notice that a lot of bugs are just little mistakes you made like this one): 
```js
//changed `mouseY > 325` to `mouseY < 325`
if(mouseX > 125 && mouseX < 275 && mouseY > 375 && mouseY < 325){
```
Make sure that when you're debugging with the println function, that you change both the actual code AND what's in the println function so they match, otherwise the println function won't tell you anything useful. Ok, we fixed `mouseY < 325`, now let's fix `mouseY > 375`. We want this to be true when the Y of the mouse is greater than the Y of the rect for the door, which is 75. Oh oops, it looks like I accidentally typed a 3, making it "375". Let's fix that:
```js
//changed `mouseY > 375` to `mouseY < 75`
if(mouseX > 125 && mouseX < 275 && mouseY > 75 && mouseY < 325){
```
Now it should be working (try it out yourself). Lo and behold, it works! Yay! We can get rid of the println functions now, because we were only using them for debugging. So putting it all together:
```js
draw = function() {
    background(255);

    //if the mouse is over the door
    if(mouseX > 125 && mouseX < 275 && mouseY > 75 && mouseY < 325){
        //draw the door open
        fill(0);
        rect(125, 75, 150, 250);
        fill(0, 255, 0);
        text("Hello :)", 200, 200);
        
        fill(94, 53, 12);
        rect(275, 75, 60, 250);
        fill(0);
        ellipse(325, 225, 10, 20);
    }else{
        //draw the door closed
        fill(94, 53, 12);
        rect(125, 75, 150, 250);
        fill(0);
        ellipse(150, 225, 20, 20);
    }
};
```
And now not only is the door working, but now you know how to debug your programs to fix problems you face! Knowing how to do that will open many doors to you (did I make a door in Processing.js just to say that joke? Maybe hehehe)

# Bonus Tips for Debugging
There's many useful things you can do to help you with debugging. For example, you could tell the problem to one of your stuffed animals. The act of simply saying your problem in words helps a lot of programmers to figure out what the problem is.

Another trick is using the functions like rect, ellipse, text, etc. to display information visually, instead of using println. Like they say, a picture is worth a thousand words.

And here's a trick I like to use: If I don't know where the problem is, I comment out code that might be the problem (Pro Tip: you can select the text you comment out, and do ctrl + / to comment it instantly. You can do the same thing to uncomment it). If I don't see the problem anymore, I must have commented it out, so I found where the bug is! Just make sure that when you do this, you're not causing other problems unintentionally.

One last trick, if I have problem code that's running in a draw function, sometimes I'll replace `draw = function(){` with `mousePressed = function(){`. That way, I can go through every frame one at a time, and click to go to the next frame.
