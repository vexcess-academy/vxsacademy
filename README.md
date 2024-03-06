# VExcess Academy
An open source website where anyone can learn computer science for free and share programs in various languages with the community.

![screenshot](https://github.com/vExcess/vexcess-academy/blob/master/screenshot.jpg?raw=true)

## Running Locally
VExcess Academy requires Node JS v15.8.0 or higher to run.  
Follow the instructions in `Setup Guide.md`.  

In `secrets.js` you will need to assign values to `MASTER_KEY`, `RECAPTCHA_KEY`, `key`, `cert`, `port`, `sandboxPort`, and `databaseURL`.  
`MASTER_KEY` is the encryption key used to encrypt profiles and stuff.  
`RECAPTCHA_KEY` is the key for validating the Google Recaptcha on the sign up page.  
`key` is the SSL key used for HTTPS encryption. You don't need this if you change the code to use a plain HTTP server instead.  
`cert` is the SSL certificate used for HTTPS encryption. You don't need this if you change the code to use a plain HTTP server instead.  
`port` is an integer specifying which port to open the server on.  
`sandboxPort` is an integer specifying which port to open the sandbox server on.  
`databaseURL` is a string containing a URL on which the MongoDB instance is running.  

## Contributors
[VExcess](https://github.com/vExcess) - I wrote nearly all the code  
[Shipment](https://github.com/Shipment22) - Wrote a lot of the CSS and created the Bobert avatar  
[WKoA](https://github.com/Reginald-Gillespie) - Helped do pentesting and discover bugs  
[Dat](https://github.com/Dddatt) - Wrote the WebGL tutorial  
[CobraCoder](https://github.com/yu0bab) - Wrote the JS w/ Processing.js tutorial  
[Archbirdplus](https://github.com/archbirdplus) - Helped do pentesting and discover bugs  
[sikn](https://github.com/L1quidH2O) - Added ES6 support to PJS editor  
[WalkWorthy](https://github.com/RandomLegoBrick) - Created the Java runtime iso  
[CylenceScythe](https://www.khanacademy.org/profile/SharleyBoo) - Created Pyro avatar graphics  
[Leslie](https://www.khanacademy.org/profile/ForeverFrostine) - Created Floof avatar graphics  
[Elias Murcray](https://github.com/eliasmurcray) - Debugging  