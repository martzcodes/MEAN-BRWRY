//Angular service module for connecting to JSON APIs
angular.module('brwryServices', ['ngResource'])
	.factory('Recipe', function($resource) {
		return $resource('/recipe/:recipeid', {}, {
			// Use this method for getting a list of recipes
			query: { method: 'GET', params: { recipeId: 'recipe' }, isArray: true } });
		})
	.factory('History', function($resource) {
		return $resource('/history/:historyid', {}, {
			// Use this method for getting a list of previous brews
			query: { method: 'GET', params: { historyId: 'histories' }, isArray: true } });
		})
	.factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket,args);
						}
					});
				});
			}
		};
	})
	.directive('d3', function(){
		return {
      		restrict: 'E',
      		link: function (scope, element, attrs) {

				var margin = {top: 20, right: 20, bottom: 30, left: 50},
				    width = 960 - margin.left - margin.right,
				    height = 500 - margin.top - margin.bottom;

				var parseTime = d3.time.format("%X").parse;

				var x = d3.time.scale()
				    .range([0, width]);

				var y = d3.scale.linear()
				    .range([height, 0])
				    .domain([0,100]);

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left");

				var svg = d3.select("d3").append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      			scope.$watch('temperaturehistory', function (newVal, oldVal) {
      				svg.selectAll('*').remove();

      				// if 'val' is undefined, exit
			        if (!newVal) {
			          return;
			        }

					var line = d3.svg.line()
					    .x(function(d) { return x(d.time); })
					    .y(function(d) { return y(d.value); });

					var data = scope.temperaturehistory;
					data.forEach(function(d) {
						//console.log(d.time);
						//d.time = parseTime(d.time);
						d.value = +d.value;
					});

					x.domain(d3.extent(data, function(d) { return d.time; }));
					//y.domain(d3.extent(data, function(d) { return d.value; }));

					svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis);

					svg.append("g")
						.attr("class", "y axis")
						.call(yAxis)
					.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 6)
						.attr("dy", ".71em")
						.style("text-anchor", "end")
						.text("Temperature C");

					svg.append("path")
						.datum(data)
						.attr("class", "line")
						.attr("d", line);
				},true);
/*
			    var t = 1297110663, // start time (seconds since epoch)
					v = 70, // start value (subscribers)
					data = d3.range(33).map(next); // starting dataset

				function next() {
					return {
						time: ++t,
						value: v = ~~Math.max(10, Math.min(90, v + 10 * (Math.random() - .5)))
					};
				}

				var w = 20,
				    h = 80;

				var x = d3.scale.linear()
				    .domain([0, 1])
				    .range([0, w]);

				var y = d3.scale.linear()
				    .domain([0, 100])
				    .rangeRound([0, h]);

				var chart = d3.select("d3").append("svg")
				    .attr("class", "chart")
				    .attr("width", w * data.length - 1)
				    .attr("height", h);

				chart.append("line")
				    .attr("x1", 0)
				    .attr("x2", w * data.length)
				    .attr("y1", h - .5)
				    .attr("y2", h - .5)
				    .style("stroke", "#000");

				redraw();

				function redraw() {

				  var rect = chart.selectAll("rect")
				      .data(data, function(d) { return d.time; });

				  rect.enter().insert("rect", "line")
				      .attr("x", function(d, i) { return x(i + 1) - .5; })
				      .attr("y", function(d) { return h - y(d.value) - .5; })
				      .attr("width", w)
				      .attr("height", function(d) { return y(d.value); })
				    .transition()
				      .duration(1000)
				      .attr("x", function(d, i) { return x(i) - .5; });

				  rect.transition()
				      .duration(1000)
				      .attr("x", function(d, i) { return x(i) - .5; });

				  rect.exit().transition()
				      .duration(1000)
				      .attr("x", function(d, i) { return x(i - 1) - .5; })
				      .remove();

				}

				setInterval(function() {
					data.shift();
					data.push(next());
					redraw();
				}, 1500);
*/
      		}
    	};
	});