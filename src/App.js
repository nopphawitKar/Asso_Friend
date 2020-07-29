import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { Container, Button, TextInput, Progress, Icon, Avatar } from "nes-react";
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
import * as radialTidyTreeGraph from './graph_component/radial_tidy_tree.js'
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

const URL_WEKA_RULES_FILES = "https://drive.google.com/drive/folders/17Z6EhtJCfDf7EI0XZ2SC3q6nMJxVEhfu?usp=sharing";

function App() {
  const DOM_GRAPH_CLASS = ".understandGraph";
  const GRAPH_TYPE_LIST = [plaintextGraph
    ,indenttreeGraph
    ,tabletoolGraph
    ,tidyTreeGraph
    ,radialTidyTreeGraph
    ,dendrogram
    ,radialdendrogram]
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
    if(GRAPH_TYPE_LIST[graphType.value]){
      GRAPH_TYPE_LIST[graphType.value].create(graphData, DOM_GRAPH_CLASS, width, height);
    }else{
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
  
  //rStudio input
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
        var temp = antecedent.replace("{", "");
        temp = temp.replace("}", "");
        var antecedentArray = temp.split(",");

        var interestingnessMeasures = getInterestingnessMeasure(consequent);
        if(interestingnessMeasures.conf < confValueConsole.init
          || interestingnessMeasures.conf > confValueConsole.des){
          // console.log(interestingnessMeasures.conf)
          continue;
        }
        if(!eval( interestingnessMeasures.lift.toString() + liftOpConsole + liftValueConsole.toString() )){
          continue;
        }

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
      handleGraphTypeChange(jsonRules);
  }

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

  function goToUrl(url){
    window.open(url)
  }
  return (
    <div className="App">
      <Container>
        <div className='line'>
          <input type="file" id="files" name="file" />
          <Button className='browse-btn'>เพิ่มไฟล์กฎความสัมพันธ์</Button>
        <span className="file-info">อัพโหลดไฟล์</span>
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
                    { value: 1, label: 'indented tree' },
                    { value: 3, label: 'tidy tree' },
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
              <Button onClick={rulesToJson}>สร้างแผนภาพ</Button>
            </div>
          </Container>
          <div class="click-to-top" onClick={()=>goToUrl(URL_WEKA_RULES_FILES)}>
            <Avatar medium={true} rounded={true} className="avatar_config"
            src={require("./central_resource/img/download.png")}/>
            <span>ดาวน์โหลดไฟล์กฎความสัมพันธ์</span>
          </div>
          <div class="click-to-top">
            <Avatar medium={true} rounded={true} className="avatar_config"
            src={require("./central_resource/img/teach.png")}></Avatar>
            <span>วิธีใช้งาน:<br/>1. ดาวน์ดาวน์โหลดไฟล์กฎความสัมพันธ์หรือใช้ไฟล์กฎความสัมพันธ์ที่สร้างจากเวก้า
            <br/>2. อัพโหลดไฟล์
            <br/>3. ตั้งค่าการแสดงผลกฎความสัมพันธ์
            <br/>4.ได้แผนภาพ (ทุกๆโนดบนแผนภาพสามารถซ่อนแสดงได้, เมื่อนำเคอร์เซอร์วางเหนือโนด จะแสดงข้อมูลของโนดนั้นๆและค่าความน่าสนใจ)</span>
          </div>

        </div>
        <div id="graph" className="understandGraph" style={{visibility: 'visible'}} ></div>
    </div>
  );
}

export default App;
