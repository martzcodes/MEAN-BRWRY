MEAN-BRWRY
==========

BRWRY Built on the MEAN Stack

See the project development plan here: http://brwry.com/2013/12/updated-project-plan/

Requirements: Node, MongoDB

run: npm install

Setup the sensors (in my case DS18B20 temp sensors):
sudo modprobe wire
sudo modprobe w1-gpio
sudo modprobe w1-therm

run the app.js as sudo (because of the raspberry pi gpio access)
