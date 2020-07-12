import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { Container, Button, TextInput, Progress, Icon } from "nes-react";
import Select from 'react-select';
import nesTheme from 'react-select-nes-css-theme';
import './App.css';
import './extra.css';

import * as plaintextGraph from './graph_component/Util_plain_text.js';
import * as tidyTreeGraph from './graph_component/tidy_tree.js';
import * as indenttreeGraph from './graph_component/Util_indent_tree.js';
import * as tabletoolGraph from './graph_component/Util_table_tool.js';
import * as radialGraph from './graph_component/radial_tidy_tree.js'
import * as dendrogram from './graph_component/dendrogram.js'
import * as radialdendrogram from './graph_component/radial_dendrogram.js'

var sizeof = require('object-sizeof')
var timeMessage = "asdfasdf";
var width = 800;
var height = 600;
function domWatcher(){
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('graph');
}
function App() {
  const DOM_GRAPH_CLASS = ".understandGraph";
  const GRAPH_PLAINTEXT = 0;
  const GRAPH_INDENTTREE = 1;
  const GRAPH_INDENTTAG = 2;
  const GRAPH_TABLETOOL = 3;
  const GRAPH_RADIAL = 4;
  const GRAPH_DENDROGRAM = 5;
  const GRAPH_RADIALDENDROGRAM = 6;
  const [graphType, setGraphType] = useState(0);
  const [graphData, setGraphData] = useState();
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const reader = new FileReader();
  // var jsonRules = {name:'begin', children:[]};

  function graphEvent(){
    alert('change');
  }
  function getByte(){
    var el = document.getElementById("graph");
    var html = el.innerHTML;

    // alert(html.length + "***" +     document.lastModified);
    alert("jsHeapSizeLimit" + window.performance.memory.jsHeapSizeLimit +
    "totalJSHeapSize" + window.performance.memory.totalJSHeapSize +
    "usedJSHeapSize" + window.performance.memory.usedJSHeapSize);


  }

  function timeCallBack(){
    var time = new Date();
    alert(time.getTime())
  }
  function handleGraphTypeChange(){
    clearGraph();
    // var before = new Date();
    if(graphType.value == GRAPH_PLAINTEXT){
      plaintextGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
    }else if(graphType.value == GRAPH_INDENTTREE){
      tidyTreeGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
      // console.log(sizeof(indentTreeByte) + "size");
    }else if(graphType.value == GRAPH_INDENTTAG){
      indenttreeGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
    }else if(graphType.value == GRAPH_TABLETOOL){
      tabletoolGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
    }else if(graphType.value == GRAPH_RADIAL){
      radialGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
    }else if(graphType.value == GRAPH_DENDROGRAM){
        dendrogram.create(graphData, DOM_GRAPH_CLASS, width, height);
    }else if(graphType.value == GRAPH_RADIALDENDROGRAM){
        radialdendrogram.create(graphData, DOM_GRAPH_CLASS, width, height);
    }
  }

  function clearGraph(){
    var graph = document.getElementById("graph");
    graph.innerHTML = '';
  }
  function onUiListener(){
    const uploadButton = document.querySelector('.browse-btn');
    const fileInfo = document.querySelector('.file-info');
    const realInput = document.getElementById('files');

    uploadButton.addEventListener('click', (e) => {
      realInput.click();
    });

    realInput.addEventListener('change', () => {
      const name = realInput.value.split(/\\|\//).pop();
      const truncated = name.length > 20
        ? name.substr(name.length - 20)
        : name;
      fileInfo.innerHTML = truncated;

      readBlob();
    });
  }

  function readBlob() {
    var files = document.getElementById('files').files;
    var file = files[0];
    if (!files.length) {
      alert('Please select a file!');
      return;
    }
    if (file){
      reader.onload = function(e){
        try {
          rulesToJson(e.target.result);
        } catch(e) {
            alert("file syntyx is not supported.");
        }
      };
        reader.readAsText(file);
    } else {
        console.log("failed");
    }
  }

  function isNameInArray(name, array){
    for(var i=0;i<array.length;i++){
      if(array[i].name == name){
        return i;
      }
    }
    return -1;
  }

  function getDupChildIndex(parentNode, nodeName){
    var children = parentNode.children;
    for(var i=0;i<children.length;i++){
      if(children[i].name == nodeName){
        return i;

      }
    }
    return -1;
  }
  function rulesToJson(inputText){

    var rules = inputText.split("\n");

    var jsonRules = {name:'begin', children:[]};


    //loop all rules
     for(var ruleIndex=0; ruleIndex<rules.length;ruleIndex++){
      var thisRule = jsonRules;

      var rule = rules[ruleIndex];
      rule = rule.trim().split(/. (.+)/)[1];

      var antecedent = rule.split("==>")[0].trim();

      var antecedentArray = antecedent.split(' ');
      antecedentArray.pop();
      var consequent = rule.split("==>")[1].trim();
      // if(consequent.includes("<conf")){
      //   consequent = consequent.split("<conf")[0].trim();
      // }else{
      //   consequent = consequent.split("conf")[0].trim();
      // }
      //
      // consequent = consequent.split(" ");
      // consequent.pop();
      consequent = consequent.toString();

      //loop all antecedent
      for(var i = 0; i<antecedentArray.length; i++){
        var nodeName = antecedentArray[i];

        var form = {name:nodeName, children:[]};
        var dupChildIndex = getDupChildIndex(thisRule, antecedentArray[i]);
        if(dupChildIndex == -1){//not duplicate
          thisRule.children.push(form);
          thisRule = thisRule.children[thisRule.children.length-1];
        }else{//duplicate
          thisRule = thisRule.children[dupChildIndex];
        }
      }

      //add consequent
      var form = {name:consequent, children:[]};
      thisRule.children.push(form);

      setGraphData(jsonRules)
    };
  }
  useEffect(() => {
    // onUiListener();
    handleGraphTypeChange();

  });

  useEffect(() => {
    onUiListener();
    domWatcher();
    // console.log('effect');

    // handleGraphTypeChange();
  }, []);
  return (
    <div className="App">
      <Container>
        <div className='line'>
          <input type="file" id="files" name="file" />
          <Button className='browse-btn'>Browse Files</Button>
          <span class="file-info">Upload a file</span>
        </div>
        <div className='line'>
          <div id="byte_content"></div>
        </div>
      </Container>
      <Button onClick={getByte}>get byte</Button>
      <div>{timeMessage}</div>
        <div className='line graphStyle'>
          <input type="text" onChange={e => setWidth(e.target.value)} value={width}/>
          <input type="text" onChange={e => setHeight(e.target.value)} value={height}/>
          <Select
            value={graphType}
            styles={nesTheme} // HERE: Pass the theme object as a prop
            onChange={setGraphType}
            options={[
              { value: 0, label: 'plain text' },
              { value: 1, label: 'tidy tree' },
              { value: 2, label: 'indented tree' },
              { value: 3, label: 'table tool' },
              { value: 4, label: 'radial tidy tree'},
              { value: 5, label: 'dendrogram'},
              { value: 6, label: 'radial dendrogram'}
            ]}
          />
        </div>
        <div id="graph" className="understandGraph" style={{visibility: 'visible'}} ></div>
    </div>
  );
}

export default App;
