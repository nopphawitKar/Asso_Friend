import * as d3 from "d3";
import { select } from 'd3-selection';

export function create(treeData, selector, width, height) {
	// var margin = {top: 20, right: 90, bottom: 30, left: 90},
	// width = 800,
	// height = 600;

	var svg = d3.select(selector).append("svg")
	.attr("width", width)
	.attr("height", height);
	    // width = +svg.attr("width"),
	    // height = +svg.attr("height"),

	    var g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

	// var stratify = d3.stratify()
	//     .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

	var treemap = d3.cluster()
	    .size([360, (height/2) -160])
	    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

	var root = d3.hierarchy(treeData, function(d) { return d.children; });
	root.x0 = height / 2;
	root.y0 = 0;

	var treeData = treemap(root);

	  var link = g.selectAll(".link")
	    .data(root.descendants().slice(1))
	    .enter().append("path")
	      .attr("class", "link")
	      .attr("d", function(d) {
	        return "M" + project(d.x, d.y)
	            + "C" + project(d.x, (d.y + d.parent.y) / 2)
	            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
	            + " " + project(d.parent.x, d.parent.y);
	      });
	//
	  var node = g.selectAll(".node")
	    .data(root.descendants())
	    .enter().append("g")
	      .attr("class", function(d) {return "node" + " node--leaf"})//{ return "node" + (d.children ? " node--internal" : " node--leaf"); })
	      .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; })
				.on('click', click);

	  node.append("circle")
	      .attr("r", 4)
				.attr("knowpixel", function(d) { return "" + project(d.x, d.y) + ""; })
				.attr("knowDepth", function(d) { return "" + d.depth + ""; })
				.attr("knowBeforePixelX", function(d) { return d.x; })
				.attr("knowBeforePixelY", function(d) { return d.y; });
	//
	  node.append("text")
	      .attr("dy", ".31em")
	      .attr("x", function(d) { return d.x < 180? 9 : -9; })//{ return d.x < 180 === !d.children ? 13 : -13; })
	      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	      .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
				.text(function(d) { if(d.data.name.length>20){
															return d.data.name.substring(0,20)+'...';
														}else{
															return d.data.name;
														}

				});
	// });
	function collapse(d) {
  if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
}

	function isProperDistanceNode(nodes){
		var textTags = document.getElementsByTagName("text");
		var maxWidth = 0;
		var maxText = '';

		for(var i=0;i<textTags.length;i++){
			var bbox = textTags[i].getBBox();
			var width = bbox.width;
			if(width > maxWidth){
				maxWidth = width;
				maxText = textTags[i];
			}
		}

		var radiusFrontandBack = 8;
		var xpos = [];
		for(var i=0;i<nodes.length;i++){
			xpos.push(nodes[i].y);
		}
		let unique = [...new Set(xpos)];
		unique.sort(function(a, b){return b-a});
		var lvlOfBad = 'ปลอดภัยต่อความสวยงาม';
		for(var i=0;i<unique.length-1;i++){
			if(unique[i] - unique[i+1] - radiusFrontandBack >= maxWidth + 5 && unique[i] - unique[i+1] - radiusFrontandBack < maxWidth + 10){
				lvlOfBad = 'ปลอดภัยต่อการใช้งาน';
			}else if(unique[i] - unique[i+1] - radiusFrontandBack < maxWidth + 5){
				return 'ไม่ปลอดภัย';
			}
		}
		return lvlOfBad;
	}

	function click(d) {
		var coord = getCoord();
isProperDistanceNode(root.descendants());
		const acceptRange = 8;
		const perfectRange = 10;
		var unAcceptableDupCount = 0;
		var partDupCount = 0;
		var allNodeCount = 0;
		for (const property in coord) {
			for(var i=0;i<coord[property].length;i++){
				var isUnAcceptableDup = false;
				var isPartDup = false;
				// var columnArr =  coord[property];
				var thisElement = coord[property][i];
				var thisElementXYarray = thisElement.split(',');

				if(i < coord[property].length-1){
					var nextElement = coord[property][i+1];
					var nextElementXYarray = nextElement.split(',');

					if(getDistance(thisElementXYarray, nextElementXYarray) < acceptRange){
						isUnAcceptableDup = true;
					}else if(getDistance(thisElementXYarray, nextElementXYarray) < perfectRange){
						isPartDup = true;
					}

				}
				if(isUnAcceptableDup == true)unAcceptableDupCount++;
				if(isPartDup == true)partDupCount++;
				allNodeCount++;
			}
		}
		console.log("จำนวนโนดไม่ปลอดภัยใช้งาน" + unAcceptableDupCount + "จำนวนโนดไม่ปลอดภัยสวยงาม" + partDupCount + "allNode:" + allNodeCount);
		console.log("ข้อความ : " + isProperDistanceNode(root.descendants()));
	}

function getDistance(point1, point2){
		var x1 = parseInt(point1[0]);
		var y1 = parseInt(point1[1]);
		var x2 = parseInt(point2[0]);
		var y2 = parseInt(point2[1]);

		var ans = Math.pow( Math.pow( Math.abs(x1-x2) , 2 ) + Math.pow( Math.abs(y1-y2), 2 ) , 0.5)
		return ans;
}
function getCoord() {
	var allCircle = document.getElementsByTagName("circle");
	var obj = {};
	for(var i=0;i<allCircle.length;i++){
		var projectPixel = allCircle[i].getAttribute("knowpixel");
		var X = allCircle[i].getAttribute("knowBeforePixelX");
		var Y = allCircle[i].getAttribute("knowBeforePixelY");

		// var angle = (X - 90) / 180 * Math.PI, radius = Y;

		if(obj[Y]){
				obj[Y].push(projectPixel);
		}else{
			obj[Y] = [];
			obj[Y].push(projectPixel);
		}
	}
	return obj;
}
	function project(x, y) {
	  var angle = (x - 90) / 180 * Math.PI, radius = y;
	  return [radius * Math.cos(angle), radius * Math.sin(angle)];
	}
}
