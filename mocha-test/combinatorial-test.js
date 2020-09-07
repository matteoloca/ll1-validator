const parser = require ('../lib/parser');
var expect = require('expect.js');
var fs = require('fs');

//Combinatorial Testing
function testCombSimpleCases(){
    var res= parser.parseString(arguments[0]);
    return res;
}

describe('testCombSimpleCases()',function(){
    
    var inputs= [];
    var iLine=1;
    const f =fs.readFileSync('mocha-test/combinatorial-test.csv', 'UTF-8');
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
        it('Combinatorial Test: '+obj.args ,() =>{expect(
           testCombSimpleCases.apply(null,[obj.args])).to.be.an('object');
          });
        });
    
    });
