const ll1 = require('../lib/ll1');
const parser = require ('../lib/parser');
const assert = require('assert');
var expect = require('expect.js');
var fs = require('fs');

function testParIsDifferent(){
    return ll1.isDifferent(arguments[0],arguments[1]);
}
//come dovrà comportarsi mocka per testare la funzione testParIsDifferent
describe('testParIsDifferent()',function(){
    var correctobjects=[
        { args: [ { ']S': [['↙'],['↙'],['↙']],'T': [['a', 'b', 'c'],['a', 'b', 'c', '↙'], ['a', 'b', 'c', '↙']]}, 2 ],
        expected:false},
        { args: [{ 'S': [['↙'],['↙']],'SS': [['nt'],['nt'],['nt']],'RULELIST': [[],['↙'],['↙']],'RULE': [['nt'],['nt', '↙'],['nt', '↙']],'L': [['assign'],['assign'],['assign']],'R': [['semicolon'],['semicolon'],['semicolon']] } ,1],
        expected:true},
        { args: [{ 'S': [['↙'],['↙'],['↙'],['↙']],'R': [['i'],['i', 'n'],['i', 'n', 'v'],['i', 'n', 'v']],'L': [['v'],['v'],['v'],['v']],'X': [['n'],['n', 'v'], ['n', 'v'],['n', 'v']]} ,2],
        expected:true}];

    var wrongobjects=[
        { args: [ { ']S': [['↙'],['↙'],['↙']],'T': [['a', 'b', 'c'],['a', 'b', 'c', '↙'], ['a', 'b', 'c', '↙']]}, 3 ],
        expected:false},
        { args: [{ 'S': [['↙'],['↙'],['↙']],'SS': [['nt'],['nt'],['nt']],'RULELIST': [[],['↙'],['↙']],'RULE': [['nt'],['nt', '↙'],['nt', '↙']],'L': [['assign'],['assign'],['assign']],'R': [['semicolon'],['semicolon'],['semicolon']] } ,4],
        expected:true}];

    var wrongExpected=[
        { args: [{ 'S': [['↙'],['↙'],['↙'],['↙']],'R': [['i'],['i', 'n'],['i', 'n', 'v'],['i', 'n', 'v']],'L': [['v'],['v'],['v'],['v']],'X': [['n'],['n', 'v'], ['n', 'v'],['n', 'v']]} ,3],
        expected:true},
        { args: [{ 'S': [['↙'],['↙']],'SS': [['nt'],['nt'],['nt']],'RULELIST': [[],['↙'],['↙']],'RULE': [['nt'],['nt', '↙'],['nt', '↙']],'L': [['assign'],['assign'],['assign']],'R': [['semicolon'],['semicolon'],['semicolon']] } ,1],
        expected:false}
    ];

    correctobjects.forEach(function(obj,index){
        it('successTest n°'+(index+1).toString(), function () {
            var res = testParIsDifferent.apply(null, obj.args);
            assert.equal(res, obj.expected);
          });
        });
    wrongobjects.forEach(function(obj,index){
        it('failTest n°'+(index+1).toString(), () =>{
            expect(() =>{
                testParIsDifferent.apply(null, obj.args);
            }).to.throwError();
            });
        });

    wrongExpected.forEach(function(obj,index){
        it('wrongExpectedTest n°'+(index+1).toString(), () =>{
            expect(() =>{
                testParIsDifferent.apply(null, obj.args);
            }).not.to.be(obj.expected);
            });
        });
    });

//combinatorial Testing
function testCombSimpleCases(){
    var res= parser.parseString(arguments[0]);
    return res;
}

describe('testCombSimpleCases()',function(){
    
    var inputs= [];
    var iLine=1;
    const f =fs.readFileSync('mocha-test/ParametricTest.csv', 'UTF-8');
    const lines =f.split(/\r?\n/);

    var fields=[];
    lines.forEach((line) => {
        if(iLine>1)
        {
            fields=line.split(",");
            for(var i=0;i<fields.length;i++){
            var row=fields[0] + " ->";
            fields.forEach((letter,index)=>{
                if (index>0)
                    row+=" "+letter+"";
            });
            row+=";"
            }
            inputs.push({"args": row });
        }
        iLine++;
    });
    inputs.forEach(function(obj){
        it('SimpleTest: '+obj.args ,() =>{expect(
           testCombSimpleCases.apply(null,[obj.args])).to.be.an('object');
          });
        });
    
    });
