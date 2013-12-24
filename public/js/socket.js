
var socket;

function connect() {
  socket = io.connect(null);

  // Callbacks for standard socket.io server events
  socket.on('connect', function(){ status_update('Connected to Server'); });
  socket.on('disconnect', function(){ status_update('Disconnected from Server'); });
  socket.on('reconnecting', function( nextRetry ){ status_update('Reconnecting in ' + nextRetry + ' milliseconds'); });
  socket.on('reconnect_failed', function(){ status_update('Reconnect Failed'); });    
}

function status_update(status) {
  $('#status').html(status);
}

function toggle(gpioPin) {
	console.log('toggle: ',gpioPin);
  //socket.send(gpioPin);
}