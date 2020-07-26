import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { Container, Button, TextInput, Progress, Icon } from "nes-react";
import Select from 'react-select';
import {Input, RangeSlider} from 'rsuite';
import nesTheme from 'react-select-nes-css-theme';
import './App.css';
import './extra.css';
import 'rsuite/dist/styles/rsuite-default.css';

import * as centralFunc from './central_resource/central_function.js'
import * as plaintextGraph from './graph_component/Util_plain_text.js';
import * as tidyTreeGraph from './graph_component/tidy_tree.js';
import * as indenttreeGraph from './graph_component/Util_indent_tree.js';
import * as tabletoolGraph from './graph_component/Util_table_tool.js';
import * as radialGraph from './graph_component/radial_tidy_tree.js'
import * as dendrogram from './graph_component/dendrogram.js'
import * as radialdendrogram from './graph_component/radial_dendrogram.js'

var sizeof = require('object-sizeof')
var width = 1500;
var height = 1500;
var lift = 1;
var rulesNum = 0;

var supValueConsole = 0;
var confValueConsole = {init: 0, des: 1};
var liftOpConsole = ">=";
var liftValueConsole = 0;

var fileText = "";

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
  const [filteredGraphData, setFilteredGraphData] = useState();
  const [width, setWidth] = useState(1500);
  const [height, setHeight] = useState(1500);
  const reader = new FileReader();



  useEffect(() => {
    onFileExplorer();
  }, []);

  function handleGraphTypeChange(graphData){

    clearGraph();
    // var before = new Date();
    if(graphType.value == GRAPH_PLAINTEXT){
      plaintextGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
    }else if(graphType.value == GRAPH_INDENTTREE){
      tidyTreeGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
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
    }else{
      //default
      tidyTreeGraph.create(graphData, DOM_GRAPH_CLASS, width, height);
    }
  }

  function clearGraph(){
    var graph = document.getElementById("graph");
    graph.innerHTML = '';
  }
  function onFileExplorer(){
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
          setFileText(e.target.result);
          // rulesToJson(e.target.result);
        } catch(e) {
            alert("file syntyx is not supported.");
        }
      };
        reader.readAsText(file);
    } else {
        console.log("failed");
    }
  }

  function getInterestingnessMeasure(consequent){
    var conf = "";
    var CONF_TEXT = "";
    const COLON = ":";
    const SPACE = " ";
    const LEFT_BRACLET = "(";
    const RIGHT_BRACLET = ")";
    const LEFT_TRI_BRACLET = "<";
    const RIGHT_TRI_BRACLET = ">";

    var lift = "";
    var LIFT_TEXT = "";

    //get confidence
    if(consequent.includes("<conf")){
      CONF_TEXT = "<conf";
    }else{
      CONF_TEXT = "conf";
    }
    conf = consequent.split(CONF_TEXT)[1].trim();
    conf = conf.split(COLON)[1].trim();
    conf = conf.split(SPACE)[0].trim();
    conf = conf.replace(LEFT_BRACLET, SPACE).replace(RIGHT_BRACLET, SPACE);
    conf = conf.replace(LEFT_TRI_BRACLET, SPACE).replace(RIGHT_TRI_BRACLET, SPACE);
    // console.log("conf: " + conf);

    if(consequent.includes("<lift")){
      LIFT_TEXT = "<lift";
    }else{
      LIFT_TEXT = "lift";
    }
    lift = consequent.split(LIFT_TEXT)[1].trim();
    lift = lift.split(COLON)[1].trim();
    lift = lift.split(SPACE)[0].trim();
    lift = lift.replace(LEFT_BRACLET, SPACE);
    lift = lift.replace(RIGHT_BRACLET, SPACE);
    lift = lift.replace(LEFT_TRI_BRACLET, SPACE).replace(RIGHT_TRI_BRACLET, SPACE);
    // console.log("lift: " + lift);

    return {conf: conf, lift: lift};
  }
//rule to json rstudio version
function rulesToJson(){
    var rules = fileText.split("\n");
    var jsonRules = {name:'begin', children:[]};
    var isInFiltered = true;
    rulesNum = rules.length;
    //loop all rules
     for(var ruleIndex=0; ruleIndex<rules.length;ruleIndex++){
      var thisRule = jsonRules;
      var rule = rules[ruleIndex];

      if(rule==""){
        break;
      }

      rule = rule.trim().split(/\s+/);
      var antecedent = rule[1]
      var consequent = rule[3] + " sup:"+ rule[4] + " conf:" + rule[5]
      + " lift:" + rule[6];

      // rule = rule.trim().split(/. (.+)/)[1];
      // var antecedent = rule.split("==>")[0].trim();
      // var antecedentArray = antecedent.split(' ');
      var temp = antecedent.replace("{", "");
      temp = temp.replace("}", "");
      var antecedentArray = temp.split(",");

      // antecedentArray.pop();
      // var consequent = rule.split("==>")[1].trim();


      var interestingnessMeasures = getInterestingnessMeasure(consequent);
      if(interestingnessMeasures.conf < confValueConsole.init
        || interestingnessMeasures.conf > confValueConsole.des){
        // console.log(interestingnessMeasures.conf)
        continue;
      }
      if(!eval( interestingnessMeasures.lift.toString() + liftOpConsole + liftValueConsole.toString() )){
        continue;
      }

      // if(interestingnessMeasures.lift < )

      consequent = consequent.toString();

      //loop all antecedent
      for(var i = 0; i<antecedentArray.length; i++){
        var nodeName = antecedentArray[i];
        var form = {name:nodeName, children:[]};
        var dupChildIndex = centralFunc.getDupChildIndex(thisRule, antecedentArray[i]);
        if(dupChildIndex == -1){//not duplicate
          thisRule.children.push(form);
          thisRule = thisRule.children[thisRule.children.length-1];
        }else{//duplicate
          thisRule = thisRule.children[dupChildIndex];
        }
      }
      //add consequent
      var form = {name:consequent};
      thisRule.children.push(form);
    }
    // setGraphData(thisRule)
    handleGraphTypeChange(jsonRules);
    // setFilteredGraphData(thisRule);
}

  // function rulesToJson(){
  //   var rules = fileText.split("\n");
  //   var jsonRules = {name:'begin', children:[]};
  //   var isInFiltered = true;
  //   rulesNum = rules.length;
  //   //loop all rules
  //    for(var ruleIndex=0; ruleIndex<rules.length;ruleIndex++){
  //     var thisRule = jsonRules;
  //     var rule = rules[ruleIndex];
  //
  //     if(rule==""){
  //       break;
  //     }
  //
  //     rule = rule.trim().split(/. (.+)/)[1];
  //     var antecedent = rule.split("==>")[0].trim();
  //     var antecedentArray = antecedent.split(' ');
  //     antecedentArray.pop();
  //     var consequent = rule.split("==>")[1].trim();
  //
  //
  //     var interestingnessMeasures = getInterestingnessMeasure(consequent);
  //     if(interestingnessMeasures.conf < confValueConsole.init
  //       || interestingnessMeasures.conf > confValueConsole.des){
  //       // console.log(interestingnessMeasures.conf)
  //       continue;
  //     }
  //     if(!eval( interestingnessMeasures.lift.toString() + liftOpConsole + liftValueConsole.toString() )){
  //       continue;
  //     }
  //
  //     // if(interestingnessMeasures.lift < )
  //
  //     consequent = consequent.toString();
  //
  //     //loop all antecedent
  //     for(var i = 0; i<antecedentArray.length; i++){
  //       var nodeName = antecedentArray[i];
  //       var form = {name:nodeName, children:[]};
  //       var dupChildIndex = centralFunc.getDupChildIndex(thisRule, antecedentArray[i]);
  //       if(dupChildIndex == -1){//not duplicate
  //         thisRule.children.push(form);
  //         thisRule = thisRule.children[thisRule.children.length-1];
  //       }else{//duplicate
  //         thisRule = thisRule.children[dupChildIndex];
  //       }
  //     }
  //     //add consequent
  //     var form = {name:consequent};
  //     thisRule.children.push(form);
  //   }
  //   // setGraphData(thisRule)
  //   handleGraphTypeChange(thisRule);
  //   // setFilteredGraphData(thisRule);
  // }

  function setSup(value){
    supValueConsole = value;
  }

  function setConf(value){
    confValueConsole.init = value[0];
    confValueConsole.des = value[1];
  }

  function setLiftOp(value){
    liftOpConsole = value.value;
  }
  function setLift(value){
    liftValueConsole = value;
  }

  function setFileText(value){
    fileText = value;
  }
  return (
    <div className="App">
      <Container>
        <div className='line'>
          <input type="file" id="files" name="file" />
          <Button className='browse-btn'>Browse Files</Button>
        <span className="file-info">Upload a file</span>
        </div>
        <div className='line'>
          <div id="byte_content"></div>
        </div>
      </Container>

        <div className='line graphStyle'>
          <Container>
            <div className="divline">
              <label>Width:  </label>
              <Input type="text" onChange={setWidth} value={width}/>
            </div>
            <div className="divline">
              <label>Height:  </label>
              <Input type="text" onChange={setHeight} value={height}/>
            </div>
            <div className="divline">
              <label>Graph Type:  </label>
                <Select
                  placeholder={"tidy tree"}
                  value={graphType}
                  onChange={setGraphType}
                  options={[
                    // { value: 0, label: 'plain text' },
                    { value: 1, label: 'tidy tree' },
                    // { value: 2, label: 'indented tree' },
                    // { value: 3, label: 'table tool' },
                    { value: 4, label: 'radial tidy tree'},
                    { value: 5, label: 'dendrogram'},
                    { value: 6, label: 'radial dendrogram'}
                  ]}
                />
            </div>
            <div className="divfullline">

              <label>Confidence</label>
              <RangeSlider defaultValue={[0, 1]} step={0.1} max={1} onChange={setConf}/>
              <label>Lift</label>
                <Select
                  placeholder={">="}
                  onChange={setLiftOp}
                  options={[
                    { value: '<', label: '<' },
                    { value: '<=', label: '<=' },
                    { value: '=', label: '=' },
                    { value: '>=', label: '>=' },
                    { value: '>', label: '>'}
                  ]}
                />
              <Input type="number" defaultValue={0} onChange={setLift}/>
            </div>
            <div className="divfullline">
              <Button onClick={rulesToJson}>Create Graph</Button>
            </div>
          </Container>


        </div>
        <div id="graph" className="understandGraph" style={{visibility: 'visible'}} ></div>
    </div>
  );
}

export default App;
