$(document).ready(function() {
	var margin = {top: 20, right: 80, bottom: 30, left: 50},
    	 width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

  var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .interpolate("monotone")
	    .x(function(d) {
	     return x(d.cycle);
	   })
	    .y(function(d) {
	     return y(d.value);
	   });

	var svg = d3.select("body").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	//gdata={};d3.json('/SimpleFir/getData', function(err, data) { gdata=data});
	d3.json('/SimpleFir/getData', function(err, data) {
		if(err) {
			// console.dir(err);
			throw "Error"+ err.status + " - " + err.statusText;
		}
		color.domain(d3.keys(data.Data[0]).filter(function(key) { return key !== "Tap"; }));

	  var signals = color.domain().map(function(name) {
	    return {
	      name: name,
	      values: data.Data.map(function(d, i) {
	        return {cycle: i, value: d[name]};
	      })
	    };
	  });

	  x.domain(d3.extent(signals[0].values, function(d) { return d.cycle; }));
	  
	  // y.domain([0,2])
	  y.domain([
	    d3.min(signals, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
	    d3.max(signals, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
	  ]);

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
	      .text("Value");

	  var signal = svg.selectAll(".signal")
	      .data(signals)
	    	.enter().append("g")
	      .attr("class", "signal");

	  signal.append("path")
	      .attr("class", "line")
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", function(d) { return color(d.name); });

	  signal.append("text")
	      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
	      .attr("transform", function(d) { return "translate(" + x(d.value.cycle) + "," + y(d.value.value) + ")"; })
	      .attr("x", 3)
	      .attr("dy", ".35em")
	      .text(function(d) { return d.name; });

   	});
});