const SPACE_REG = /\s+/;

export  function getDupChildIndex(parentNode, nodeName){
  var children = parentNode.children;
  for(var i=0;i<children.length;i++){
    if(children[i].name == nodeName){
      return i;

    }
  }
  return -1;
}

//graph component
function getCoord(nodes){
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

function getSummaryMessage(nodes){
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

export function reportGraphStatus(nodes, usabilityThreatRange, goodlookingThreatRange){
  var coord = getCoord(nodes);

  var usabilityThreatCount = 0;
  var goodLookingThreatCount = 0;
  var allNodeCount = 0;

  for (const property in coord) {
    for(var i=0;i<coord[property].length;i++){
      var isUsabilityOverlap = false;
      var isGoodLookingThreatOverlap = false;
      var columnArr =  coord[property];
      var thisElement = coord[property][i];

      if(i < coord[property].length-1){
        var nextElement = coord[property][i+1];
        if(nextElement - thisElement < usabilityThreatRange){
          isUsabilityOverlap = true;
        }else if(nextElement - thisElement < goodlookingThreatRange){
          isGoodLookingThreatOverlap = true;
        }
      }
      if(isUsabilityOverlap == true)usabilityThreatCount++;
      if(isGoodLookingThreatOverlap == true)goodLookingThreatCount++;
      allNodeCount++;
    }
  }
  console.log("จำนวนโนดภัยต่อการใช้งาน" + usabilityThreatCount
  + "จำนวนโนดภัยต่อความสวยงาม(ไม่นับรวมโนดภัยต่อการใช้งาน)" + goodLookingThreatCount
  + "จำนวนโนดทั้งหมด:" + allNodeCount);
  console.log("ข้อความ : " + getSummaryMessage(nodes));
}

// Creates a curved (diagonal) path from parent to the child nodes
export function diagonal(s, d) {

  var path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`

  return path
}

export function createTooltip(d3, selector){
  return d3.select(selector)
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.style("background-color", "white")
}
export function getProperLengthText(d){
  if(!(d.children || d._children)){
    return d.data.name.substring(0,20)+'...';
  }
  return d.data.name;
}

export function getAntecedentTooltip(d, d3, tooltip){
  return tooltip.html("<div style='border-style: groove;'>"
  + "<p style='color:black;font-weight: bold;'>"+ d.data.name +"</p>"+ "</div>")
  .style("left", (30 + d3.event.pageX) + "px")
  .style("top", (30 + d3.event.pageY) + "px")
  .style("visibility", "visible")
  .transition()
  .duration('300');
}

export function getConsequentTooltip(d, d3, tooltip){
  //Antecedent
  var ancestors = d.ancestors();
  //shift number out - pop 'begin'out
  ancestors.shift();
  ancestors.pop();
  ancestors = ancestors.reverse();
  ancestors = ancestors.map(function getName(d){
    return d.data.name;
  });
  var antecedentText = "{" + ancestors.toString().replace("," + ", ") + "}";

  //Consequent
  var consequentText = d.data.name;

  var RHS = [];

  consequentText = consequentText.replace("<","");
  consequentText = consequentText.replace(">","");
  RHS = consequentText.split("sup");

  var consequent = RHS[0];
  var interestingnessMeasures = RHS[1];

  var consequentArray = consequent.trim().split(SPACE_REG);
  // consequentArray.pop();
  consequent = consequentArray.toString().replace(",", ", ")
  // consequent = "{" + consequent + "}";

  return tooltip.html("<div style='border-style: groove;'>"
  + "<p style='color:black;font-weight: bold;'>"+ antecedentText +"</p>"
  + "<p style='color:black;font-weight: bold;'>"+ "=>" +"</p>"
  + "<p style='color:black;font-weight: bold;'>"+ consequent +"</p>"
  +"<p style='color:blue;font-weight: bold;'>" + "sup" + interestingnessMeasures +"</p>"
  + "</div>")
  .style("left", (30 + d3.event.pageX) + "px")
  .style("top", (30 + d3.event.pageY) + "px")
  .style("visibility", "visible")
  .transition()
  .duration('300');
}
