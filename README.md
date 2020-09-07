
# LL(1) Validator

![](https://github.com/matteoloca/ll1-validator/workflows/Node%20CI/badge.svg)
![](https://github.com/matteoloca/ll1-validator/workflows/Node.js%20Package/badge.svg)
![](https://travis-ci.com/matteoloca/ll1-validator.svg?branch=master)
[![codecov](https://codecov.io/gh/matteoloca/ll1-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/matteoloca/ll1-validator)

LL(1) Validator is a javascript package that checks if a given a [context-free grammar](https://en.wikipedia.org/wiki/Context-free_grammar) is a [LL(1) grammar](https://en.wikipedia.org/wiki/LL_grammar).

# Introduzione
Fork del progetto [ll1-validator](https://github.com/imcatta/ll1-validator), un validatore javascript per la grammatica LL(1). Fornisce
* Parsing di stringhe in grammatiche LL(1)
* Individuazione di regole duplicate, regole irraggiungibili, cicli, Non terminali annullabili, First Sets, Follow Sets, Look Aheads e valutazione se la grammatica fornita è di tipo LL(1)

Per visualizzare una live demo visitare [questo URL](https://ll1-validator.netlify.app/)

Il progetto ha i file eseguibili in *lib/*, in *src/* si trovano i file originali con descrizione di contratti e tipi, in *test/* si trovano i test con AVA e in *mocha-test/* si trovano i test fatti con mocha.

In *ASMETA/* si trova il modello in asm mentre in *YAKINDU* si trova la FSM


# Code testing
## Testing suite
Per effettuare i test è stato utilizzato il package AVA, un packetto ottenibile tramite npm [a questo link](https://www.npmjs.com/package/ava). I suoi punti di forza sono la rapidità d'uso e di esecuzione, include le asserzioni e permette unit test.<br/>
Per poterlo utilizzare è sufficiente scaricare il package e impostarlo come pachetto per l'esecuzione dei test dal file `package.json`
```json
{
  "name": "ll1-validator",
  "version": "0.2.3",
  "description": "A tool that checks if a given grammar is LL(1).",
  "main": "lib/index.js",
  "scripts": {
    "test": "ava",
    [...]
  },
  "devDependencies": {
    "ava": "^2.4.0",
    [...]
  }
}
```
Una volta impostato si può procedere a scrivere ed eseguire i test. Nel file designato per la scrittura dei test occorre importare il pacchetto ava
```javascript
//Da test/test-parser.js
const test = require('ava');
const parser = require('../lib/parser.js');
//...
test('simple case', t => {
    const input = `S -> a S;`
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'S': [
                [
                    { type: parser.TERMINAL, value: 'a' },
                    { type: parser.NONTERMINAL, value: 'S' }
                ]
            ],
        },
        startSymbol: 'S',
        rulesNumber: 1,
        terminals: ['a'],
        nonTerminals: ['S'],
        warnings: [],
    });
});
```
Per eseguire i test occorrre scrivere nella console
```bash
npm test
#oppure
npx ava
```
I test vengono eseguiti e il risultato viene mostrato a schermo
<p><span style="color:green">54 tests passed</span></p>


## Coverage
Per la copertura è stato usato [Istanbul](https://istanbul.js.org/) per avere risultati a riga di comando, mentre [codecov.io](https://codecov.io/gh/matteoloca/ll1-validator) per l'integrazione all'interno di Github.
Per utilizzare Istanbul con ava è sufficiente modificare il comando per lanciare i test
```json
scripts: {
  "test": "nyc ava"
},
```
Questo permette ad Istanbul di analizzare tutti i test eseguiti, e produrre infine il risultato di copertura.  

```
------------------------|---------|----------|---------|---------|---------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
------------------------|---------|----------|---------|---------|---------------
All files               |   85.21 |    64.22 |   74.05 |   84.83 |                                                                                                                                  
 grammarlang            |   76.43 |    37.14 |   30.61 |   76.27 |                                                                                                                                  
  grammarlangLexer.js   |   96.15 |      100 |   66.67 |      96 | 73                                                                                                                               
  grammarlangListener.js|    87.5 |      100 |       0 |    87.5 | 7-8                                                                                                                              
  grammarlangParser.js  |   73.73 |    37.14 |   37.14 |   73.62 | [...] 
 lib                    |   92.08 |    77.03 |     100 |   91.76 |                                                                                                                                  
  errors.js             |     100 |      100 |     100 |     100 |                                                                                                                                  
  ll1.js                |   89.82 |    72.95 |     100 |   89.49 | [...]             
  parser.js             |   98.84 |    96.15 |     100 |   98.75 | 38                                                                                                                               
  warnings.js           |     100 |      100 |     100 |     100 |                                                                                                                                  
------------------------|---------|----------|---------|---------|---------------
```
## Mutation testing
Per effettuare i test di mutazione è stato utilizzato [Mutode](https://www.npmjs.com/package/mutode). Il mutation testing è una tipologia di testing utilizzata per valutare la qualità del testing: i file originali vengono leggermente modificati e si valuta se i test sono in grado di rilevare l'anomalia di funzionamento. Per eseguire i test occorre eseguire
```bash
npx mutode
```
In questo caso abbiamo eseguito i test di mutazione solo su `parser.js` e su `ll1.js`
```bash
npx mutode -c 8 lib/parser.js lib/ll1.js
#I test eseguiti sono circa 450 per file
#[...]
Out of 883 mutants, 670 were killed, 178 survived and 35 were discarded
Mutant coverage: 79.01%
Deleting copies...Done
```
Come si può osservare al termine del test vengono mostrati i risultati: quanti mutanti sono stati rilevati, quanti sono sono andati in timeout e quanti sono sopravvissuti. L'obiettivo del mutation testing è quello di creare dei test che riducano al minimo i mutanti sopravvissuti.

## Parametic testing
Per generare test parametrici è stato necessario utilizzare una seconda test suite: [mocha](https://mochajs.org/). Ad essa abbiamo integrato anche [expect.js](https://www.npmjs.com/package/expect.js).<br/>
I test sono stati posizionati in una differente cartella, visto che le due test-suite sono incompatibili tra loro.
Per l'esecuzione dei test parametrici occorre definire la funzione di test e la funzione che estrae i dati parametrici e lancia la funzione di test N volte.
```javascript
//da mocha-test/parametrictest.js
const ll1 = require('../lib/ll1')
const assert = require('assert');
var expect = require('expect.js');
var fs = require('fs');

function testParIsDifferent(){
    return ll1.isDifferent(arguments[0],arguments[1]);
}
//come dovrà comportarsi mocha per testare la funzione testParIsDifferent
describe('testParIsDifferent()',function(){
    var correctobjects=[
        { args: [ { ']S': [['↙'],['↙'],['↙']],'T': [['a', 'b', 'c'],['a', 'b', 'c', '↙'], ['a', 'b', 'c', '↙']]}, 2 ],
        expected:false},
        { args: [{ 'S': [['↙'],['↙']],'SS': [['nt'],['nt'],['nt']],'RULELIST': [[],['↙'],['↙']],'RULE': [['nt'],['nt', '↙'],['nt', '↙']],'L': [['assign'],['assign'],['assign']],'R': [['semicolon'],['semicolon'],['semicolon']] } ,1],
        expected:true},
        { args: [{ 'S': [['↙'],['↙'],['↙'],['↙']],'R': [['i'],['i', 'n'],['i', 'n', 'v'],['i', 'n', 'v']],'L': [['v'],['v'],['v'],['v']],'X': [['n'],['n', 'v'], ['n', 'v'],['n', 'v']]} ,2],
        expected:true}];
    /*
   ...
   */

    correctobjects.forEach(function(obj,index){
        it('successTest n°'+(index+1).toString(), function () {
            var res = testParIsDifferent.apply(null, obj.args);
            assert.equal(res, obj.expected);
          });
        });
   /*
   ...
   */
});
```
# Verification
## Assertions
Le assertions sono presenti in tutti i linguaggi di programmazione: si rivelano molto utili per i programmatori in quanto validano una condizione booleana che deve essere sempre vera: quando non lo è genera una eccezione, permettendo così agli sviluppatori di individuare comportamenti anomali.<br>
Le asserzioni vengono generalmente disabilitate negli ambienti di produzione dato che la valutazione dell'espressione genera un overhead indesiderabile.
In node.js è presente nativamente un modulo che contiene le asserzioni, ovvero **assert**. è sufficiente importare il modulo per poterlo utilizare
```javascript
//da lib/ll1.js
var assert=require('assert');
/*
[...]
*/
function isDifferent(obj, iter) {
    var ret = false;
    Object.keys(obj).forEach(e => {
        assert(obj[e].length>iter);
        var newRow = obj[e][iter];
        var oldRow = obj[e][iter - 1];

        if (newRow.length != oldRow.length)
            ret = true;
    });
    return ret;
}
```
## Design By Contract
Per l'integrazione con i contratti è stato utilizzato [Babel Contracts](https://github.com/codemix/babel-plugin-contracts). Si tratta di un plugin di [Babel](https://babeljs.io/) che permette di scrivere contratti in una modo simile a quello visto per JML. A differenza di JML però i contratti vengono scritti direttamente nel codice e questo ci obbliga a "compilare" il codice tramite Babel che interpreta il testo e lo trasforma in codice javascript.
La chiamata a Babel che trasforma il codice "sporco" in codice javascript compliant è il seguente
```bash
#Il codice originale è in src/ mentre quello trasformato da Babel in lib/
babel src/ -d lib/
```
Nelle post-condizioni si utilizza ``it`` per riferirsi al valore restituito dalla funzione. Il risultato si può vedere nell'esempio sotto
```javascript
//da src/ll1.js
function getAggregateFirstSet(set, nonTerminal, index) {
    pre:{ set!==null; index>=0;nonTerminal.length>0;}
    post:{ it!==null; }
    const result = new Set();
    set[nonTerminal].forEach(item => {
        item[index].forEach(v => result.add(v));
    })
    return result;
}

//da lib/ll1.js
function getAggregateFirstSet(set, nonTerminal, index) {
  const _getAggregateFirstSetPostcondition = it => {
    if (!(it !== null)) {
      throw new Error("Function \"getAggregateFirstSet\" postcondition failed: it !== null");
    }
    return it;
  };
  if (!(set !== null)) {
    throw new Error("Function \"getAggregateFirstSet\" precondition failed: set !== null");
  }
  if (!(index >= 0)) {
    throw new Error("Function \"getAggregateFirstSet\" precondition failed: index >= 0");
  }
  if (!(nonTerminal.length > 0)) {
    throw new Error("Function \"getAggregateFirstSet\" precondition failed: nonTerminal.length > 0");
  }
  const result = new Set();
  set[nonTerminal].forEach(item => {
    item[index].forEach(v => result.add(v));
  });
  return _getAggregateFirstSetPostcondition(result);
}
```
Si può notare come le precondizioni vengano inserite prima del codice hand-made, mentre la post-condizione diventa una funziona chiamata dopo il return.


La struttura di questo plugin DbC ha portato con se un secondo problema: il type checker rileva i contratti come errori (come si può vedere nell'esempio sopra la sezione dei contratti non è codice javascript), di conseguenza per permettere ai due tool di convivere inseriamo tutti i contratti all'interno di caratteri speciali che il type checker riconosce come commenti, permettendo così ai due tool di coesistere senza problemi.<br>
Un contratto all'interno del codice lo si troverà scritto nel seguente modo
```javascript
function getAggregateFirstSet(set, nonTerminal, index) {
    /*::`*/ pre:{ set!==null; index>=0;nonTerminal.length>0;} /* ::`; */
    /*::`*/ post:{ it!==null; } /*::`;*/
    const result = new Set();
    set[nonTerminal].forEach(item => {
        item[index].forEach(v => result.add(v));
    })
    return result;
}
```

## Analisi statica
Per l'analisi statica è stato utilizzato [EsLynt](https://eslint.org/). Questo tool oltre ad analizzare staticamente il codice permette anche di risolvere automaticamente gli errori trovati. <br>
É stato utilizato su tutti i file presenti in lib/ ha presentato qualche errore per variabili inutilizzate, ma per la maggior parte ha solo presentato warnings riguardanti problemi su virgolette non secondo standard.
```
npx eslint lib/*.js

C:\Users\matte\Documents\github\ll1-validator\lib\index.js
  1:21  warning  Strings must use doublequote  quotes
  3:24  warning  Strings must use doublequote  quotes

C:\Users\matte\Documents\github\ll1-validator\lib\ll1.js
    1:24  warning  Strings must use doublequote                  quotes
    3:24  warning  Strings must use doublequote                  quotes
    5:7   error    'warning' is assigned a value but never used  no-unused-vars
    5:25  warning  Strings must use doublequote                  quotes
    7:24  warning  Strings must use doublequote                  quotes
   77:73  warning  Strings must use doublequote                  quotes
   82:79  warning  Strings must use doublequote                  quotes
  423:9   error    'axiom' is assigned a value but never used    no-unused-vars
  464:9   error    'axiom' is assigned a value but never used    no-unused-vars
  503:42  error    'input' is assigned a value but never used    no-unused-vars

C:\Users\matte\Documents\github\ll1-validator\lib\parser.js
    2:24  warning  Strings must use doublequote   quotes
    4:34  warning  Strings must use doublequote   quotes
    6:35  warning  Strings must use doublequote   quotes
    8:24  warning  Strings must use doublequote   quotes
   10:26  warning  Strings must use doublequote   quotes
   25:38  warning  Strings must use doublequote   quotes
   27:45  warning  Strings must use doublequote   quotes
   39:23  warning  Strings must use doublequote   quotes
   83:40  warning  Strings must use doublequote   quotes
   85:47  warning  Strings must use doublequote   quotes
  141:63  error    'e' is defined but never used  no-unused-vars
  148:63  error    'e' is defined but never used  no-unused-vars

C:\Users\matte\Documents\github\ll1-validator\lib\warnings.js
   3:20  warning  Strings must use doublequote  quotes
  13:20  warning  Strings must use doublequote  quotes
```
I problemi sono stati prontamente risolti e il risultato è il seguente:

```bash
>npx eslint lib/*.js
#No output
```

## Type checking
Per il type checking si è deciso di utilizzare [Flow](https://flow.org/).
Come accennato precedentemente anch'esso si appoggia a Babel e ha necessità di un preset che integri tutti i comandi di Flow (per maggioi informazioni vedere [qui](https://flow.org/en/docs/install/)).<br>
Per segnalare a Flow quali file sono da verificare occorre inserire all'inizio di ogni file la seguente riga
```javascript
// @flow
```
In alternativa si può chiamare Flow con il flag --all per obbligarlo a controllare tutti i file indiscriminatamente.
```bash
npx flow #Controlla solo i file con @flow. Comando equivalente a npx flow check
npx flow check --all #Controlla tutti i file
```
Non è necessario specificare i tipi a flow, in quanto è in grado di capire il tipo di parametro atteso (per maggiori informazioni vedere [qui](https://flow.org/en/docs/getting-started/)), per questo ho forzato i tipi all'interno del solo file `ll1.js`

Visto l'utilizzo di una struttura di dati molto più complicata rispetto alle strutture base (nell'esempio sottostante si può osservare come gli oggetti siano abbastanza complessi) si è deciso di utilizzare il type aliasing (per maggiori informazioni [cliccare qui](https://flow.org/en/docs/types/aliases/)). Il Type aliasing permette di descrivere oggetti complessi in maniera rapida, permettendo poi di utilizzarli in tutto il codice. 
```javascript
//da src/ll1.js
type RuleObject = { type: number ,value:string };
type NullableNonTerminalsObj = {[string]:boolean}
//...
function ruleIsNullable(rule:Array<RuleObject>, nullableNonTerminals:NullableNonTerminalsObj):boolean {
    /*::`*/ pre:{ rule!==null; rule.length>=0;nullableNonTerminals!==null;}/*::`;*/
    /*::`*/ post: it!==null; /*::`;*/

    let currentResult = true;
    for (const item of rule) {
        if (item.type === parser.TERMINAL) {
            return false;
        }
        if (nullableNonTerminals[item.value] === false) {
            return false;
        }
        if (nullableNonTerminals[item.value] === undefined) {
            currentResult = undefined;
        }
    }
    return currentResult;
}
```
Babel nella fase di interpretazione del testo si occuperà di rimuovere tutti i commenti relativi allo static typing e produrrà un file "pulito".<br>
Come detto in precedenza è incompatibile con il DbC e l'inserimento delle righe di commento rende i file di output un po' "sporchi"

## Continuous Integration
Per la continuous integration ho utilizzato [Travis CI](https://travis-ci.org/github/matteoloca/ll1-validator).

Ad ogni pubblicazione il progetto segue una pipeline per poter essere aprovato.
```yml
language: node_js
node_js:
  - 12
install:
  - npm install codecov nyc ava  mocha
  - npm install --save-dev @babel/core @babel/cli @babel/preset-flow
  - npm install --save-dev flow-bin eslint
scripts:
  - npm run flow
  - npm run prepublish
  - npm test
  - npm run mocha
  - npm run staticAnalisys
after_success: npm run coverage
```
Viene istanziata una VM contenente il node.js installato, dopdiché vengono installati tutti i pacchetti, dopodiché viene fatto lo type checking, si creano i file js "puliti" e si effettuano test e analisi statica. Se tutto è passato si effettua la copertura. <br>
Il mutation testing è stato escluso perché la quantità di mutanti creata impiega troppo tempo e manda in timeout la VM di Travis.

# Modeling
## Modello ASM
Utilizzando ASMETA ho creato una macchina che implementa (in maniera semplificata) il persing del testo in input e restituisce la lista di regole con tutti i Non Terminali. Per l'implementazione si faccia riferimento alla cartella  *ASMETA/ll1validator/ll1validator.asm*. L'implementazione fa uso di funzioni n-arie, statihe, derivate e abstract domain.

## Simulazione/Animazione
Il modello asmeta si è compliato correttamente e il funzionamento è come atteso

## Validazione scenari
Sono stati creati alcuni scenari avalla per simulare il comportamento della macchina e constatare che funzioni come previsto. Gli scneari si trovano all'interno della cartella *ASMETA/ll1validator/scenarios*

## Model Checking
Per poter effettuare il model checking della macchina è stato necessario semplificare nettamente la macchina, togliendo di fatto tutta la parte di salvataggio della regola (si mantiene salvata solo la regola attuale) e restringendo il dominio degli input da stringhe ad un sottodominio composto da poche parole. Successivamente sono state implementate formule CTL e LTL per verificare le proprietà della macchina. L'implementazione si trova in *ASMETA/ll1validator/ll1validatorSimplified.asm*
```
-- specification AG (input = EOFILE -> AX done)  is true
-- specification !E [ !(input = EOFILE | readState = ERR) U !((!done | AG !(input = EOFILE | readState = ERR)) | (input = EOFILE | readState = ERR)) ]   is true
-- specification AG ((readState != NT & (input = ARR & !done)) -> AX readState = ERR)  is true
-- specification AG ((readState != EOR & (!done & input = EOFILE)) -> AX readState = ERR)  is true
-- specification AG ((readState = EOR & (!done & input = LX)) -> AX actnt = LX)  is true
-- specification AG ((readState = EOR & (!done & input = LY)) -> AX actnt = LY)  is true
-- specification AG ((readState = EOR & (!done & input = LZ)) -> AX actnt = LZ)  is true
-- specification AG ((readState = EOR & (input = LS & !done)) -> AX actnt = LS)  is true
-- specification (input = EOFILE ->  X done)  is true
-- specification (done ->  Y (input = EOFILE | readState = ERR))  is true
-- specification ((readState != NT & (input = ARR & !done)) ->  X readState = ERR)  is true
-- specification ((readState != EOR & (!done & input = EOFILE)) ->  X readState = ERR)  is true
-- specification ((readState = EOR & (!done & input = LX)) ->  X actnt = LX)  is true
-- specification ((readState = EOR & (!done & input = LY)) ->  X actnt = LY)  is true
-- specification ((readState = EOR & (!done & input = LZ)) ->  X actnt = LZ)  is true
-- specification ((readState = EOR & (input = LS & !done)) ->  X actnt = LS)  is true

```

## Model advisor
É  stato eseguito il Model Advisor e non sono stati riscontrati problemi.

# Model-based Testing
## Input Domain Modeling
Si è deciso di lavorare sul metodo parseString(input) presente nel file ```parser.js```. Vista la complessità dell'input ho usato un approccio functionality-based, che mi ha permesso di implementare un test per ogni categoria rilevata. Si può verificare l'implementazione e le categorie scelte in *test/input-domain-testing.js*

## Combinatorial Testing
É stato utilizzato un approccio 3-WISE per testare il parsing di un regola. I vincoli impediscono di avere una regola composta con un solo non-terminale
### Modello base
```
Model Rule
 Parameters:	
   nt1 : {S, A, B}	
   nt2:  {S, A, B}	
   nt3 : {S, A, B}	
   t1 : {x, y, z}	
   t2 : {x, y, z}	
 Constraints:	
   # nt1==S => (nt2!=S or nt3!=S) #	
   # nt2==A => (nt2!=A or nt3!=A) #	
   # nt3==B => (nt2!=B or nt3!=B) #   	
```
L'implementazione si trova in *mocha-test/parametrictest.js*
## Yakindu
Tramite Yakindu ho generato una state machine che simula il parsing delle regole. Si fa uso di:
- Eventi di input
- Azioni su Transizioni
- Azioni in stati
- Guardie su transizioni
- Variabili

## Author
* Matteo Locatelli
