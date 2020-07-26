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

export function reportGraphStatus(nodes, acceptRange, perfectRange){
  var coord = getCoord(nodes);

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
