MEAN-BRWRY
==========

BRWRY Built on the MEAN Stack

See the project development plan here: http://brwry.com/2013/12/updated-project-plan/

And the todo list: https://gist.github.com/oehokie/8223644

Requirements: Node, MongoDB

See this post to get MongoDB built on the Raspberry Pi: http://mattmartz.com/mean-pi/

run: npm install

Setup the sensors (in my case DS18B20 temp sensors):
sudo modprobe wire
sudo modprobe w1-gpio
sudo modprobe w1-therm

run the app.js as sudo (because of the raspberry pi gpio access) (sudo node app)