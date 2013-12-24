// Main application view
exports.index = function(req, res) {
	res.render('index');
};
/*
exports.receive = function(socket) {
	console.log('received')
	socket.on('send:toggle', function(data) {
		console.log('toggled in routes:',data)
	});
};
*/