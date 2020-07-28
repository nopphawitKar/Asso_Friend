import * as d3 from "d3";
import { select, hierarchy } from 'd3-selection';
import * as centralFunc from '../central_resource/central_function.js';

export function create(treeData, selector, width, height) {
	var tooltip = centralFunc.createTooltip(d3, selector);

  var margin = {top: 30, right: 20, bottom: 30, left: 20},
      barHeight = 20,
      barWidth = (width - margin.left - margin.right) * 0.8;

  var i = 0,
      duration = 0,
      root;

  var diagonal = d3.linkHorizontal()
      .x(function(d) { return d.y; })
      .y(function(d) { return d.x; });

  var svg = d3.select(selector).append("svg")
      .attr("width", width)
      .attr("height", height) // + margin.left + margin.right)
      // .attr("height", 20000)
    .append("g")
      .attr("transform", "translate(" + 60 + "," + 60 + ")");

  //overwrite

  root = d3.hierarchy(treeData);
  root.x0 = 0;
  root.y0 = 0;
  update(root);

  function update(source) {

    // Compute the flattened node list.
    var nodes = root.descendants();

    var height = Math.max(500, nodes.length * barHeight);

    d3.select("svg")
        svg.attr("height", height );

    d3.select(window.frameElement).transition()
        .duration(duration)
        .style("height", height + "px");

    // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
    var index = -1;
    root.eachBefore(function(n) {
      n.x = (index++ -1) * barHeight;
      n.y = n.depth * 20;
    });

    // Update the nodes…
    var node = svg.selectAll(".node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + (source.y0) + "," + source.x0 + ")"; })
        .style("opacity", 0)
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
        })
        .on("click", click);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight/2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)


    nodeEnter.append("text")
        .attr("dy", 3.5)
        // .attr("dx", 5.5 + barHeight/2)
        .attr("dx", 5.5)
        .attr("font-size", "1em")
        .text(function(d) {
          if(d.id == d.leaves()[0].id){
            const SPACE_REG = /\s+/;
            var consequentText = d.data.name;

            var RHS = [];

            consequentText = consequentText.replace("<","");
            consequentText = consequentText.replace(">","");
            RHS = consequentText.split("conf");

            var consequent = RHS[0];
            var consequentArray = consequent.trim().split(SPACE_REG);
            consequentArray.pop();
            consequent = consequentArray.toString().replace(",", ", ")
            consequent = "{" + consequent + "}";

            return consequent;
          }else{
            return d.data.name;
          }
        })
        .on("click", click);;

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + (d.x) + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + (d.x ) + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 0)
        .remove();

    // Update the links…
    var link = svg.selectAll(".link")
      .data(root.links(), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: (source.x0), y: (source.y0)};
          return diagonal({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: (source.x), y: (source.y)};
          return diagonal({source: o, target: o});

        })
        .remove();

    // Stash the old positions for transition.
    root.each(function(d) {
      d.x0 = d.x;

      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function color(d) {


    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }
}
