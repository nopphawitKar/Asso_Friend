import * as d3 from "d3";
import { select } from 'd3-selection';

export function create(treeData, selector, width, height) {
	var tooltip = d3.select(selector)
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.style("background-color", "white")

	var dateStart = new Date();
		var runtimeProblemProtecter = 1;
		var coord =[];
		// Set the dimensions and margins of the diagram
		// var margin = {top: 20, right: 90, bottom: 30, left: 90},
		//     width = 800;//960 - margin.left - margin.right,
		//     height = 600;//(height)? height : 500;//- margin.top - margin.bottom;

		var svg = d3.select(selector).append("svg")
		    .attr("width", width)
		    .attr("height", height)
		  .append("g")
		    .attr("transform", "translate("
		          + 50 + "," + 0 + ")");

		var i = 0,
		    duration = 100,
		    root;

		// declares a tree layout and assigns the size
		var treemap = d3.tree().size([height - 5, width-160]);

		// Assigns parent, children, height, depth
		root = d3.hierarchy(treeData, function(d) { return d.children; });
		root.x0 = height / 2;
		root.y0 = 0;

		// Collapse after the second level
		// root.children.forEach(collapse);

		update(root);

		// Collapse the node and all it's children
		function collapse(d) {
		  if(d.children) {
		    d._children = d.children
		    d._children.forEach(collapse)
		    d.children = null
		  }
		}

		function update(source) {
		  // Assigns the x and y position for the nodes
		  var treeData = treemap(root);

		  // Compute the new tree layout.
		  var nodes = treeData.descendants(),
		      links = treeData.descendants().slice(1);

		  // Normalize for fixed-depth.
		  // nodes.forEach(function(d){ d.y = d.depth * 180});

		  // ****************** Nodes section ***************************

		  // Update the nodes...
		  var node = svg.selectAll('g.node')
		      .data(nodes, function(d) {return d.id || (d.id = ++i); });

		  // Enter any new modes at the parent's previous position.
		  var nodeEnter = node.enter().append('g')
	      .attr('class', 'node')
	      .attr("transform", function(d) {

		        return "translate(" + source.y0 + "," + source.x0 + ")";
		    })
		    .on('click', click)


		  // Add Circle for the nodes
		  nodeEnter.append('circle')
		      .attr('class', 'node')
		      // .attr('r', 1e-6)
		      .style("fill", function(d) {
		          return d._children ? "lightsteelblue" : "#fff";
		      })
					.on("mouseenter", function(d){
						console.log("over" + d.id)
						return tooltip.html(d.data.name)
								.style("visibility", "visible")
								.transition()
               .duration('300')
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
					})
					.on("mouseleave", function(d){
						console.log("out" + d.id)
						tooltip.html(d.data.name)
								.style("visibility", "hidden")
								.transition()
               .duration('300');
						// return tooltip.text(d.data.name).style("visibility", "hidden");
					});

		  // Add labels for the nodes
		  nodeEnter.append('text')
		      .attr("dy", ".35em")
		      .attr("x", function(d) {
		          // return d.children || d._children ? -13 : 13;
							return 9;
		      })
		      .attr("text-anchor", function(d) {
		          // return d.children || d._children ? "end" : "start";
							return 'start';
		      })
		      .text(function(d) {
						if(d.data.name.length>20){
							return d.data.name.substring(0,20)+'...';
						}else{
							return d.data.name;
						}
					})

		  // UPDATE
		  var nodeUpdate = nodeEnter.merge(node);

		  // Transition to the proper position for the node
		  nodeUpdate.transition()
		    .duration(duration)
		    .attr("transform", function(d) {
		        return "translate(" + d.y + "," + d.x + ")";
		     });

		  // Update the node attributes and style
		  nodeUpdate.select('circle.node')
		    .attr('r', 4)
		    .style("fill", function(d) {
		        return d._children ? "lightsteelblue" : "#fff";
		    })
		    .attr('cursor', 'pointer')


		  // Remove any exiting nodes
		  var nodeExit = node.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) {
		          return "translate(" + source.y + "," + source.x + ")";
		      })
		      .remove();

		  // On exit reduce the node circles size to 0
		  nodeExit.select('circle')
		    .attr('r', 1e-6);


			function getBB(selection) {
			    selection.each(function(d){d.bbox = this.getBBox();})
			}
		  // On exit reduce the opacity of text labels
		  nodeExit.select('text')
		    .style('fill-opacity', 1e-6);


		  // Update the links...
		  var link = svg.selectAll('path.link')
		      .data(links, function(d) { return d.id; });

		  // Enter any new links at the parent's previous position.
		  var linkEnter = link.enter().insert('path', "g")
		      .attr("class", "link")
		      .attr('d', function(d){
		        var o = {x: source.x0, y: source.y0}
		        return diagonal(o, o)
		      });

		  // UPDATE
		  var linkUpdate = linkEnter.merge(link);

		  // Transition back to the parent element position
		  linkUpdate.transition()
		      .duration(duration)
		      .attr('d', function(d){ return diagonal(d, d.parent) });

		  // Remove any exiting links
		  var linkExit = link.exit().transition()
		      .duration(duration)
		      .attr('d', function(d) {
		        var o = {x: source.x, y: source.y}
		        return diagonal(o, o)
		      })
		      .remove();

		  // Store the old positions for transition.
		  nodes.forEach(function(d){
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });

		  // Creates a curved (diagonal) path from parent to the child nodes
		  function diagonal(s, d) {

		    var path = `M ${s.y} ${s.x}
		            C ${(s.y + d.y) / 2} ${s.x},
		              ${(s.y + d.y) / 2} ${d.x},
		              ${d.y} ${d.x}`

		    return path
		  }

		  // Toggle children on click.
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
					xpos.push(nodes[i].y0);
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

		    if (d.children) {
		        d._children = d.children;
		        d.children = null;
		      } else {
		        d.children = d._children;
		        d._children = null;
		      }
					// var isSaveInDistance = isProperDistanceNode(nodes);
					// console.log(nodes);
					var coord = getCoord(nodes);
					// console.log("coord:" + coord);
					const acceptRange = 8;
					const perfectRange = 10;
					var unAcceptableDupCount = 0;
					var partDupCount = 0;
					var allNodeCount = 0;

					for (const property in coord) {
						for(var i=0;i<coord[property].length;i++){
							var isUnAcceptableDup = false;
							var isPartDup = false;
							var columnArr =  coord[property];
							var thisElement = coord[property][i];

							if(i < coord[property].length-1){
								var nextElement = coord[property][i+1];
								if(nextElement - thisElement < acceptRange){
									isUnAcceptableDup = true;
								}else if(nextElement - thisElement < perfectRange){
									isPartDup = true;
								}
							}
							if(isUnAcceptableDup == true)unAcceptableDupCount++;
							if(isPartDup == true)partDupCount++;
							allNodeCount++;
						}
					}
					console.log("จำนวนโนดไม่ปลอดภัยใช้งาน" + unAcceptableDupCount + "จำนวนโนดไม่ปลอดภัยสวยงาม" + partDupCount + "allNode:" + allNodeCount);
					console.log("ข้อความ : " + isProperDistanceNode(nodes));

		    update(d);

		  }

			function getCoord(nodes){
				//{a:[],b:[]}
				var arrObj = {};
				var dupCount = 0;
				for(var i=0;i<nodes.length;i++){
					var y0 = nodes[i].y0;
					var x0 = nodes[i].x0;
					if(arrObj[ y0 ]){
						if(arrObj[ y0 ].indexOf(x0) === -1){
							//push
							arrObj[ y0 ].push(x0);
						}else{
							dupCount++;
						}
					}else{
						arrObj[y0] = [];
						arrObj[ y0 ].push(x0);
					}
				}
				return arrObj;
			}
		}
}
