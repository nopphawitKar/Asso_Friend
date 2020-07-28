import * as d3 from "d3";
import { select } from 'd3-selection';
import * as centralFunc from '../central_resource/central_function.js';

export function create(treeData, selector, width, height) {
	var coord =[];
	var i = 0,duration = 100,root;
	var tooltip = centralFunc.createTooltip(d3, selector);


	var svg = d3.select(selector).append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate("
	          + 50 + "," + 0 + ")");



		// declares a tree layout and assigns the size
		var treemap = d3.tree().size([height - 5, width-200]);

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
						//is leaf
						if(d.id == d.leaves()[0].id){
							return centralFunc.getConsequentTooltip(d, d3, tooltip);
						}else{
							return centralFunc.getAntecedentTooltip(d, d3, tooltip)
						}
					})
					.on("mouseleave", function(d){
						tooltip.html(d.data.name)
								.style("visibility", "hidden")
								.transition()
               .duration('300');
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
						return centralFunc.getProperLengthText(d);
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
		        return centralFunc.diagonal(o, o)
		      });

		  // UPDATE
		  var linkUpdate = linkEnter.merge(link);

		  // Transition back to the parent element position
		  linkUpdate.transition()
		      .duration(duration)
		      .attr('d', function(d){ return centralFunc.diagonal(d, d.parent) });

		  // Remove any exiting links
		  var linkExit = link.exit().transition()
		      .duration(duration)
		      .attr('d', function(d) {
		        var o = {x: source.x, y: source.y}
		        return centralFunc.diagonal(o, o)
		      })
		      .remove();

		  // Store the old positions for transition.
		  nodes.forEach(function(d){
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });

		  function click(d) {

		    	if (d.children) {
		        d._children = d.children;
		        d.children = null;
		      } else {
		        d.children = d._children;
		        d._children = null;
		      }

					// param1 Nodes
					//param2 acceptRange
					//param3 perfectRange
					centralFunc.reportGraphStatus(nodes,8,10);
		    	update(d);

		  }

		}
}
