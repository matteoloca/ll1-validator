const ll1 = require('../lib/ll1');
const assert = require('assert');
var expect = require('expect.js');

function testParIsDifferent(){
    return ll1.isDifferent(arguments[0],arguments[1]);
}
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

    correctobjects.forEach(function(obj){
        it('successTest', function () {
            var res = testParIsDifferent.apply(null, obj.args);
            assert.equal(res, obj.expected);
          });
        });
    wrongobjects.forEach(function(obj){
        it('failTest', () =>{
            expect(() =>{
                testParIsDifferent.apply(null, obj.args);
            }).to.throwError();
            });
        });

    wrongExpected.forEach(function(obj){
        it('wrongExpectedTest', () =>{
            expect(() =>{
                testParIsDifferent.apply(null, obj.args);
            }).not.to.be(obj.expected);
            });
        });
    });