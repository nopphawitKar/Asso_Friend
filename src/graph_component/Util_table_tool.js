import * as d3 from "d3";
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import '../App.css';

const SVG_WIDTH = 1000;
const SVG_HIGHT = 3000;
const BOX_WIDTH = 200;
const BOX_HIGHT = 150;
const MAX_BOX_PER_LINE = 5;
const TEXT_PADDING = BOX_HIGHT/2;//BOX_HIGHT / 2;
const TEXT_PADDING_FOR_LONG_TEXT = 20;
const ORIGINAL_DEPTH = 0;

const TITLE_HIGHT = 25;
const TITLE_WIDTH = 1000;
// const TITLE_TEXT_LENGTH_LIMIT =
const TITLE_TEXT_INDENT = 20;
const TITLE_TEXT_FIRST = 'คุณลักษณะที่เลือกแล้ว';
const TITLE_TEXT_CHOICE = 'คุณลักษณะที่สามารถเลือกได้';

const COLOR_BOX = '#ffac00';
const COLOR_BOX_CHOICE = 'white';

var selectedCount = 0;
// var xCoordinates = [0];
// var yCoordinates = [0];
// var attributes = [];
var attributes = {};
attributes.xCoordinates = [];
attributes.yCoordinates = [];
attributes.texts = [];

// var graphData = [100,2,3];
// var selectData = ['softdrink', 'cola', 'paper']

export function create(treeData, selector, updater) {
	var dateStart = new Date();
	
	var treeDataCopy = Object.assign({}, treeData);
	var rootNode = d3.hierarchy(treeDataCopy)

	rootNode.sum(function(d) {
	  return d.name;
	});

	function initiate(depth) {
		var margin = {top: 20, right: 90, bottom: 30, left: 90},
				width = SVG_WIDTH,//960 - margin.left - margin.right,
				height = SVG_HIGHT;//500 - margin.top - margin.bottom;

		// var	x = scaleLinear().range([0, width]),
	  //     y = scaleLinear().range([0, height]);

		d3.select(selector).append('svg')
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom)
			.append('g')
		  .selectAll('rect')
		  .data(rootNode.descendants())
		  .enter()
			.append('rect')
			.attr('class', 'tabletool_top')
		  .attr('width', function(d) { return BOX_WIDTH})
		  .attr('height', function(d) { return BOX_HIGHT })
			.attr('y', function(d) {return TITLE_HIGHT + 0;})
			.attr("id", function(d,i){
				// console.log(i + ':' + d.data.name+' hierarchy ' + d.depth);
				return "tabletool" + i
			})
			.style("display", function(d) {
		    if (d.depth > depth) {
		      return "none";//nodes whose depth is more than 1 make its vanish
		    }
		  })

			d3.selectAll('g')
			.append('rect')
			.attr('class', 'box_title')
			.attr('width', (d) => { return TITLE_WIDTH})
			.attr('height', (d) => { return TITLE_HIGHT })

			d3.selectAll('g')
			.append('rect')
			.attr('class', 'box_title')
			.attr('y', (d) => { return TITLE_HIGHT + BOX_HIGHT})
			.attr('width', (d) => { return TITLE_WIDTH})
			.attr('height', (d) => { return TITLE_HIGHT })

			createBoxTexts(rootNode, true);
	}

	function createTitleText(){
		d3.selectAll('g')
		.append('text')
		.attr('class', 'title_text')
		.attr('alignment-baseline', () => { return 'central';})
		.attr('x', () => { return TITLE_TEXT_INDENT;})
		.attr('y', () => { return TITLE_HIGHT/2;})
		.text(()=>{
			return TITLE_TEXT_FIRST;
		})

		d3.selectAll('g')
		.append('text')
		.attr('class', 'title_text')
		.attr('alignment-baseline', () => { return 'central';})
		.attr('x', () => { return TITLE_TEXT_INDENT;})
		.attr('y', () => { return (1.5 * TITLE_HIGHT) + BOX_HIGHT;})
		.text(()=>{
			return TITLE_TEXT_CHOICE;
		})
	}
	function createBoxTexts(clickedNode, isInitiation){
		//inner fucntion to create HTML
		// fucntion buildParentTitle
		function buildBoxTextsHTML(node, index, clickedNode){
			d3.selectAll('g')
			.append('text')
			.attr('class', 'box_text')
			.attr('text-anchor', () => { return 'middle';})
			.attr('alignment-baseline', () => { return 'central';})
			.html(()=>{
				const TSPAN_HEAD = '<tspan';
				const TSPAN_X = ' x=';
				const TSPAN_Y =' y=';
				const TSPAN_HEAD_CLOSE = '>';
				const TSPAN_TAIL = '</tspan>';
				const TSPAN_GAP = 25;

				var html = '';
				var titleName = node.data.name;
				var title_parts = titleName.split(",");
				var beginOfX = (index * BOX_WIDTH) + (BOX_WIDTH/2) - (Math.floor(index/MAX_BOX_PER_LINE)*1000);
				var beginOfY = 0;
				var yTextPadding = TEXT_PADDING;
				if(title_parts.length > 2){
					yTextPadding = TEXT_PADDING_FOR_LONG_TEXT;
				}

				if(node.depth <= clickedNode.depth){//ancestors and me lvl
					// beginOfY = TITLE_HIGHT + 0 + TEXT_PADDING;
					beginOfY = TITLE_HIGHT + yTextPadding;

				}else{//children lvl
					// beginOfY = (2 * TITLE_HIGHT) + (1 * BOX_HIGHT) + TEXT_PADDING + (Math.floor(index/MAX_BOX_PER_LINE)*BOX_HIGHT);
					beginOfY = (2 * TITLE_HIGHT) + (1 * BOX_HIGHT) + (Math.floor(index/MAX_BOX_PER_LINE)*BOX_HIGHT) + yTextPadding;
				}
				var textSpanYRange = BOX_HIGHT / title_parts.length;
				// var y = beginOfY / title_parts.length
				for(var i=0;i<title_parts.length;i++){
					var y = beginOfY + (i*TSPAN_GAP);
					html += TSPAN_HEAD + TSPAN_X + beginOfX + TSPAN_Y + y + TSPAN_HEAD_CLOSE+ title_parts[i] + (i == title_parts.length -1 ? '':',') + TSPAN_TAIL;
				}
				return  html;
			})
		}

		//create html
		d3.selectAll('text').remove();
		createTitleText();

		var ancestors = getAncestors(clickedNode);
		ancestors.push(clickedNode);
		var children = clickedNode.children || [];
		if(isInitiation){
			children = [];
		}

		ancestors.forEach((ancestor, index) => {
		  buildBoxTextsHTML(ancestor, index, clickedNode);
		});
		children.forEach((child, index) => {
		  buildBoxTextsHTML(child, index, clickedNode);
		});
	}

	function resetCoordinate(depth) {
		d3.selectAll('.tabletool_top')
		.attr('x', (node) => {
			if (node.depth > depth) {
				return;
			}
			return node.x;
		})
		.attr('y', (node) => {
			if (node.depth > depth) {
				return;
			}
			return node.x;
		})
	}

	function getAncestors(node){
		var ancestors = [];
		while(node.parent !== null){
			ancestors.push(node.parent);
			node = node.parent;
		}
		return ancestors.reverse();
	}

	function isTheSameNode(node1, node2){
		if(node1.depth != node2.depth){
			isTheSameNode = false;
		}
		if(node1.depth == 0){
			return true;
		}
		while(node1.parent!=undefined){
			node1 = node1.parent;
			node2 = node2.parent;
			if(node1.data.name != node2.data.name){
				return false;
			}
		}
	}
	function onTabletoolClick(){
		d3.selectAll('.tabletool_top').on('click', function(d) {




			//kill same hierarchy when (select)
			var parent = d;
			var ancestors = getAncestors(parent);
			var children = parent.children || [];
			var childDepth = parent.depth + 1;

			createBoxTexts(parent);

			d3.selectAll('.tabletool_top')
			.style('fill', (node) => {
				if(node.depth == childDepth){
					return COLOR_BOX_CHOICE;
				}
				return COLOR_BOX;
			})
			.style("display", (node) => {
				var childIndex = children.findIndex((child, index) => {


					return (child.data.name == node.data.name);
				});
				var isAncestor = ancestors.find((ancestor, index) => {
					var isTheSameNode = true;
					var node1 = ancestor;
					var node2 = node;
					if(node1.depth != node2.depth){
						isTheSameNode = false;
					}else if(node1.depth == 0){
						isTheSameNode = true;
					}else{
						while(node1.parent!=undefined){
							if(node1.data.name != node2.data.name){
								isTheSameNode = false;
								break;
							}
							node1 = node1.parent;
							node2 = node2.parent;
						}
					}


					return isTheSameNode? true: false;//(ancestor.data.name == node.data.name);
				});

				if(node.depth == parent.depth){//parent lvl
					var isTheSameNode = true;
					var node1 = node;
					var node2 = parent;
					if(node1.depth != node2.depth){
						isTheSameNode = false;
					}else if(node1.depth == 0 || node2.depth == 0){
						isTheSameNode = true;
					}else{
						while(node1.parent!=undefined){
							if(node1.data.name != node2.data.name){
								isTheSameNode = false;
								break;
							}
							node1 = node1.parent;
							node2 = node2.parent;
						}
					}
					return (isTheSameNode)? '': 'none';
					// return (node.data.name == parent.data.name ? "" : "none")
				}else if (node.depth < parent.depth) {//ancestors lvl
					if(isAncestor){
						return "";
					}else{
						return "none";
					}
					// return "";
				}else{//child lvl
					//isTheSameNode
					var isTheSameNode = true;
					var node1 = node.parent;
					var node2 = parent;
					if(node1.depth != node2.depth){
						isTheSameNode = false;
					}else if(node1.depth == 0 || node2.depth == 0){
						isTheSameNode = true;
					}else{
						while(node1.parent!=undefined){
							if(node1.data.name != node2.data.name){
								isTheSameNode = false;
								break;
							}
							node1 = node1.parent;
							node2 = node2.parent;
						}
					}


					if(childIndex > -1 && node.depth == parent.depth +1){//parent.data.name == node.parent.data.name){
						if(isTheSameNode){
							return '';
						}
						return 'none';
					}
					return "none";
				}
			})
			.attr('x', (node) => {
				var childIndex = children.findIndex((child, index) => {
					return (child.data.name == node.data.name);
				});

				if(node.depth <= parent.depth){//parent
					return node.depth * BOX_WIDTH;
				}else if(node.depth == childDepth){//child

					if( childIndex > -1){
						node.x = childIndex * BOX_WIDTH - (Math.floor(childIndex/MAX_BOX_PER_LINE) * 1000);
					}
					return node.x;
				}else{//grand grand grand ... child
					return 0;
				}
			})
			.attr('y', (node) => {
				var childIndex = children.findIndex((child, index) => {
					return (child.data.name == node.data.name);
				});

				if (node.depth <= parent.depth){//parent and grand grand grand
					return TITLE_HIGHT + 0;
				}else{
					var selectedElementHeight = (2 * TITLE_HIGHT) + BOX_HIGHT;
					var newLineHeight = (Math.floor(childIndex/MAX_BOX_PER_LINE)*BOX_HIGHT);
					return selectedElementHeight + newLineHeight;//childDepth * BOX_HIGHT;
				}
			})
		});
	}

	initiate(ORIGINAL_DEPTH);
	onTabletoolClick();
}
