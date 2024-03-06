# Intro
Preston finally learned to read minds, and he wants to celebrate! Preston is hosting a party, and he wants to list everyone that is invited. Here's his list so far:
```js
var invitedPeople = ["Preston (obviously)", "The Student that got this far (you)", "Vexcess", "Prof. Cobra", "Bobert", "Boberta"];
```
Let's say that Preston decides that Pyro should be invited too (if he has a cake with candles, Pyro can light them). We could simply edit the code, but what if we want to modify the array after the fact? Maybe Preston wants to make a program where people can ask to be invited to this party. Most people don't like going into the code and editing it just to add themselves onto a list, so how can we make it automatic?

# Array Methods
There are a lot of ways to modify Arrays, called methods. One of them is the push method. It adds what you want to the very end of the array. Here's how you write it:
```js
var array = ["a", "b", "c"];

array.push("d");

println(array); //it should show as "a,b,c,d"
```
So if we want to add Pyro to the invited people array, we can simply do:
```js
invitedPeople.push("Pyro");
```
And boom, he's invited! And this may seem like more effort than just editing the array, but let's say we want to invite him 100 times (we want to annoy him with all the invitation cards). If you were to edit the array manually, that might take some time, but using push, we can automate it:
```js
for(var i = 0; i < 100; i ++){
    invitedPeople.push("Pyro");
}
```
But let's say we want Pyro at the beginning of the Array, because why not? How we do that is we instead use the unshift method. The unshift method adds things to the *beginning* of Arrays, instead of the end:
```js
//Pyro's invited, but he's at the beginning of the array instead of the end.
invitedPeople.unshift("Pyro");
```
Let's pretend that Boberta was being mean to Preston (Boberta is very nice, but let's pretend). How can we uninvite her? We can use the pop method. The pop method removes the last item in an array:
```js
//the last item of the array is removed, which is Boberta
invitedPeople.pop();
```
And also Preston doesn't need to be invited to his own party, so let's take him off the list. For that, we'll need the shift method. The shift method removes the first item of an Array:
```js
//the first item of the array is removed, which is Preston
invitedPeople.shift();
```
One last thing. Let's say that Preston learns your name. I don't know your actual name, so let's pretend that your name is... Avery. We can change any element of an array just like we're changing a variable:
```js
//the second item of the array is changed to "Avery"
invitedPeople[1] = "Avery";
```
If you want to learn more about modifying arrays, w3schools has good documentation on it. You can go to their documentation [here](https://www.w3schools.com/js/js_array_methods.asp).
