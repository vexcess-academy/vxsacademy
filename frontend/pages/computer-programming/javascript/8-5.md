# Intro
In the last lesson we got Preston to guess a number, and we told him if he's right or not. Here's the code for it:
```js
var ourNumber = 6; //change this to whatever number you want him to guess.
var hisGuess = round(random(1, 10)); //generates a random whole number between 1 and 10

fill(128, 0, 255);
textSize(30);
text("Preston: Is your number " + hisGuess + "?", 20, 100);

fill(255, 0, 0);
if(hisGuess === ourNumber){
    text("Us: Yay, you got it!", 20, 200);
}else{
    text("Us: No, guess again.", 20, 200);
}
```
In this lesson, I want to be able to tell him more: if his guess is too big, too small, or if he got it right. How can we do that? Well, perhaps we could add an "if/else" statement inside and "if/else" statement, like this:
```js
if(hisGuess === ourNumber){
    text("Us: Yay, you got it!", 20, 200);
}else{
    if(hisGuess > ourNumber){
        text("Us: Too large, guess smaller.", 20, 200);
    }else{ //if hisGuess isn't equal, and if it's not greater, it must be smaller
        text("Us: Too small, guess larger.", 20, 200);
    }
}
```
You can try that code and see that it works. Yay, we figured it out! Well yeah, we did, but let's say we wanted more things to say to Preston? If so, then our code would look like:
```js
//Don't worry about what the booleans are, this is just to demonstrate.
if(possibility1){
    //code for possibility 1
}else{
    if(possibility2){
        //code for possibility 2
    }else{
        if(possibility3){
            //code for possibility 3
        }else{
            if(possibility4){
                //code for possibility 4
            }else{
                if(possibility5){
                    //code for possibility 5
                }else{
                    //and this chaos goes on and on until we have as many if/else statements as we need
                }
            }
        }
    }
}
```
Yucky. That just looks nasty, doesn't it? But fear not! There is a solution to this ugly code.

# If/Else If Statements
If/Else If statements work just like what we were doing, but it looks a lot neater. Here's how we would use them for previous example:
```js
if(possibility1){
    //code for possibility 1
}else if(possibility2){
    //code for possibility 2
}else if(possibility3){
    //code for possibility 3
}else if(possibility4){
    //code for possibility 4
}else if(possibility5){
    //code for possibility 5
}else{
    //code for possibility 6
}
```
Ah, so much better! Keep in mind that the first one that turns out to be true will be the one that runs, every one after that will be ignored completely. So let's impliment this into the example with Preston:
```js
var ourNumber = 6; //change this to whatever number you want him to guess.
var hisGuess = round(random(1, 10)); //generates a random whole number between 1 and 10

fill(128, 0, 255);
textSize(30);
text("Preston: Is your number " + hisGuess + "?", 20, 100);

fill(255, 0, 0);
if(hisGuess === ourNumber){
    text("Us: Yay, you got it!", 20, 200);
}else if(hisGuess > ourNumber){
    text("Us: Too large, guess smaller.", 20, 200);
}else{
    text("Us: Too small, guess larger.", 20, 200);
}
```
If you try out the code, you'll see it's working! And the best part is, we can add as many possibilities as we want, and our code won't look any messier.
