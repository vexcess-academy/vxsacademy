# Vexcess Academy Setup Guide

## Create a Linux environment
Vexcess Academy cannot run on Windows and I don't know if it runs on Mac. It must be run on Linux. I run it on Ubuntu, however it probably works on any Debian fork and will run on most other Linux distros with minimal modification.

## Install Node JS
VExcess Academy requires Node JS v15.8.0 or higher to run.
We can't just do
```
sudo apt-get install nodejs
```
because this will install Node JS v12 which is too outdated. Therefore, we must install Node Version Manager to install it for us. Run one of the following commands to install NVM
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# or

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
After that you must restart your terminal. Then run
```
nvm install --lts
```
to install the latest long term support version of Node.

## Install Java Development Kit
First ensure your package repository is up to date by running
```
sudo apt update
```
You can then install either Oracle JDK or OpenJDK, but because I'm a open source enjoyer run the following
```
sudo apt-get install openjdk-21-jdk
```

## Installing Zig
Head over to [https://ziglang.org/download](https://ziglang.org/download) and download the current master version of Zig for your system. Create a `.zig` folder in your home directory and then extract the compressed archive you downloaded into the `.zig` folder. Next you must add the binary to your path so open your bashrc file using
```
vim ~/.bashrc
```
If you don't have vim installed then you can install it using `sudo apt install vim` or just use a different editor. Press `i` on your keyboard to go into "insert" mode and add
```
export PATH="/home/$USER/.zig/pathToZigBinary:$PATH"
```
somewhere in the file. Press the `Esc` key to go back into normal mode and then type `:wq` and press the `Enter` key to write the file and quit vim. Restart your terminal again. And now Zig is installed.

## Installing MongoDB
Go to [https://www.mongodb.com/docs/manual/tutorial/](https://www.mongodb.com/docs/manual/tutorial/) and follow the installation instructions for your particular Linux distro. Since I'm using Ubuntu I am following the "Install on Ubuntu" instructions. If you don't want to have to manually start mongodb whenever you restart your computer then run 
```
sudo systemctl enable mongod
```
to make your system automatically start MongoDB on startup. Otherwise run
```
sudo systemctl start mongod
```
to manually start mongodb. And run
```
sudo systemctl status mongod
```
to check if mongodb is running.

## Installing MongoDB Compass (*optional*)
Although not strictly necessary it makes your life easier to have a GUI instead of doing everything from the command line interface. Just go to [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass) and download the version for your system. Again I'm using the Ubuntu version. For me it downloaded a .deb package and I can just double click it to install it.

## Configuring a database
Next create a database called `vxsacademy` and create 4 collections in that database named `programs`, `salts`, `discussions`, and `users`. This is very easy from the MongoDB Compass app. If you happen to have data for each collection you can then click the "Import Data" button to easily import the data into the basebase from a JSON file.

## MongoDB Auth
If you are not running the database behind a firewall make sure to enable authentication. To do this first connect to the database using mongosh
```
mongosh mongodb://<host>:<port>
```
then
```
use admin
```
next create an admin account
```js
db.createUser(
  {
    user: "adminuser",
    pwd: "SECRET_ADMIN_PASSWORD",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
```
disconnect from the database and then add the following to your `/etc/mongod.conf` file
```
security:
    authorization: "enabled"
```
next restart the database using
```
sudo service mongod restart
```
finally create a user specific for vxsacademy
```js
db.createUser({
    user: "vxsacademyuser",
    pwd: "SECRET_VXSACADEMYUSER_PASSWORD",
    roles: [{role: "readWrite", db: "vxsacademy"}]
})
```

## Installing Git
To install Git run
```
sudo apt install git-all
```

## Cloning the repo
To clone the repo run the following:
```
git clone https://github.com/vexcess-academy/vxsacademy.git
```

## Installing Node modules
To install all Node dependencies navigate into the project directory and run
```
npm install
```

## Run Server
To start all servers and dependency processes run
```
npm start
```

## Notes to self for production
### Install Rathole reverse proxy
[https://github.com/rapiz1/rathole](https://github.com/rapiz1/rathole)

### Setup SSL certificates
Install certbot and run
```
sudo certbot certonly --manual --preferred-challenges dns -d "vxsacademy.org,*.vxsacademy.org"
```
Move `privkey.pem` to `server.key` and `fullchain.pem` to `server.cert`.