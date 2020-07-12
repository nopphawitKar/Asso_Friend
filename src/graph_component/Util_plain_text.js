import * as d3 from "d3";
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import '../App.css';

const SVG_WIDTH = 1000;
const SVG_HIGHT = 0;
const LINE_HIGHT = 50;
const TEXT_PADDING = LINE_HIGHT/2;//BOX_HIGHT / 2;
const TEXT_PADDING_FOR_LONG_TEXT = 20;
const ORIGINAL_DEPTH = 0;

const TITLE_HIGHT = 25;
const TITLE_WIDTH = SVG_WIDTH;
// const TITLE_TEXT_LENGTH_LIMIT =
const TITLE_TEXT_INDENT = 20;
const TITLE_TEXT_FIRST = 'คุณลักษณะที่เลือกแล้ว';
const TITLE_TEXT_CHOICE = 'คุณลักษณะที่สามารถเลือกได้';
const COMMA = ',';

var lineCounter = 0;
var svgRef = {};

export function create(treeData, selector, updater, width, height) {
	// var margin = {top: 20, right: 90, bottom: 30, left: 90},
	// 		width = 1000,//960 - margin.left - margin.right,
	// 		height = 700;//500 - margin.top - margin.bottom;

	var treeDataCopy = Object.assign({}, treeData);
	var rootNode = d3.hierarchy(treeDataCopy)

	rootNode.sum(function(d) {
	  return d.name;
	});
  function resize(lineCount){
    svgRef.attr("height", lineCount*LINE_HIGHT +50)
  }

	function initiate() {
		var margin = {top: 20, right: 90, bottom: 30, left: 90},
				width = SVG_WIDTH,//960 - margin.left - margin.right,
				height = SVG_HIGHT;//500 - margin.top - margin.bottom;

    function getAncestors(node){
  		var ancestors = [];
  		while(node.parent !== null){
  			ancestors.push(node.parent);
  			node = node.parent;
  		}
  		return ancestors.reverse();
  	}

    function getAssorule(node){
      var ancestors = getAncestors(node);
      var assoText = '{';
      for(var i=0;i<ancestors.length;i++){
        if(i == ancestors.length-1){
          assoText += (ancestors[i].data.name + '} => ');
          assoText += node.data.name;
          continue;
        }
        assoText += (ancestors[i].data.name + COMMA);
      }
			assoText = assoText.replace('begin,', '');
      return assoText;
    }

    var allLine = [];
		svgRef = d3.select(selector).append('svg');

			svgRef
      .attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append('g')
		  .selectAll('rect')
		  .data(rootNode.descendants())
		  .enter()
      // .append('g')
			.append('rect')
			.attr('class', 'paper_line')
      .style("display", (node) => {
        if(node.children){
          return 'none';
        }else{
          allLine.push(node);
          return '';
        }
      })
      .attr('y', function(node) {
        if(node.children){
          return 0;
        }else{
          return lineCounter++ * 50;
        }
      })
		  .attr('width', function(d) { return SVG_WIDTH})
		  .attr('height', function(d) { return LINE_HIGHT });

      lineCounter = 0;
      var lineCounter2 = 0;
      for(var i=0;i<allLine.length;i++){
        d3.selectAll('g')
        .append('text')
        .attr('width', function(d) { return SVG_WIDTH})
        .attr('y', function() {
          return ++lineCounter * 50;
        })
        .attr('font-size', function() {
          return 15;
        })
        .text(()=>{
    			return getAssorule(allLine[i]);
    		})
      }
      resize(allLine.length);

	}
  initiate();

}
