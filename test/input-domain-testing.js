/*  Input domain testing
    Target: parser.js -> parseString(input)
    Il dominio si divide in 9 tipi:
    Invalidi
    Regola Duplicata con assioma
    Regola Irraggiungibile con assioma
    Regola Duplicata e regola Irraggiungibile con assioma
    Regola Duplicata senza assioma
    Regola Irraggiungibile senza assioma
    Regola Duplicata e regola Irraggiungibile senza assioma
    Con assioma
    Senza assioma

    La divisione è stata effettuata valutando il comportamento della funzione:
    La funzione si occupa di costruire la grammatica dividendo i non terminali dai terminali, impostare l'assioma, calcolare il numero di regole e creare gli array di regole per ogni non terminale.
    I punti in cui la funzione presenta punti di divisione sono:
    - Presenza o assenza di un assioma: Se l'assioma non è specificato deve essere assegnato di default al primo non terminale trovato
    - Controllo di regole inconsistenti (regola duplicata o regola irraggiungibile);
    - Input invalidi (tutti gli input che non seguono la specifica LL(1))

    A seguire si presentano test per ognuno dei blocchi
 */
import test from 'ava';
const parser = require('../lib/parser.js');
const errors = require('../lib/errors');
const warnings = require('../lib/warnings');

test('invalid: missing ; at row 2. Specification violated', t => {
    const input = `#start_symbol Q;
    Q -> F b
    F -> a ;
    F -> ;`;
    const f = () => parser.parseString(input);
    t.throws(f, errors.ParserError);
});


test('Duplicated rule - with axiom', t => {
    const input = `#start_symbol Q;
    Q -> F b;
    F -> ;
    F -> ;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' }
                ]
            ],
            'F':[[],[]]  
        },
        startSymbol: 'Q',
        rulesNumber: 3,
        terminals: ['b'],
        nonTerminals: ['F','Q'],
        warnings: [new warnings.DuplicatedRuleWarning('F', 1, 0)],
    });
});
test('Unreachable rule - with axiom', t => {
    const input = `#start_symbol Q;
    Q -> F b;
    F -> ;
    A -> ;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' }
                ]
            ],
            'F':[[]],
            'A':[[]]  
        },
        startSymbol: 'Q',
        rulesNumber: 3,
        terminals: ['b'],
        nonTerminals: ['A','F','Q'],
        warnings: [new warnings.UnreachableRuleWarning('A')],
    });
});

test('Unreachable and unused rule - with axiom', t => {
    const input = `#start_symbol Q;
    Q -> F b;
    F -> ;
    A -> l;
    F -> ;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' }
                ]
            ],
            'F':[[],[]],
            'A':[[
                { type: parser.TERMINAL, value: 'l' }
            ]]  
        },
        startSymbol: 'Q',
        rulesNumber: 4,
        terminals: ['b','l'],
        nonTerminals: ['A','F','Q'],
        warnings: [new warnings.DuplicatedRuleWarning('F', 1, 0),
                    new warnings.UnreachableRuleWarning('A')],
    });
});

test('Duplicated rule - without axiom', t => {
    const input = `Q -> F b;
    F -> ;
    F -> ;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' }
                ]
            ],
            'F':[[],[]]  
        },
        startSymbol: 'Q',
        rulesNumber: 3,
        terminals: ['b'],
        nonTerminals: ['F','Q'],
        warnings: [new warnings.DuplicatedRuleWarning('F', 1, 0)],
    });
});
test('Unreachable rule - without axiom', t => {
    const input = `Q -> F b;
    F -> ;
    A -> ;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' }
                ]
            ],
            'F':[[]],
            'A':[[]] 
        },
        startSymbol: 'Q',
        rulesNumber: 3,
        terminals: ['b'],
        nonTerminals: ['A','F','Q'],
        warnings: [new warnings.UnreachableRuleWarning('A')],
    });
});

test('Unreachable and unused rule - without axiom', t => {
    const input = `Q -> F b;
    F -> ;
    A -> l;
    F -> ;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' }
                ]
            ],
            'F':[[],[]],
            'A':[[
                { type: parser.TERMINAL, value: 'l' }
            ]]  
        },
        startSymbol: 'Q',
        rulesNumber: 4,
        terminals: ['b','l'],
        nonTerminals: ['A','F','Q'],
        warnings: [new warnings.DuplicatedRuleWarning('F', 1, 0),
                    new warnings.UnreachableRuleWarning('A')],
    });
});


test('without warnings - with axiom', t => {
    const input = `#start_symbol Q;
    Q -> F b A;
    F -> ;
    A -> l;
    F -> b;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' },
                    { type: parser.NONTERMINAL, value: 'A' }
                ]
            ],
            'F':[[],[{ type: parser.TERMINAL, value: 'b' }]],
            'A':[[
                { type: parser.TERMINAL, value: 'l' }
            ]]  
        },
        startSymbol: 'Q',
        rulesNumber: 4,
        terminals: ['b','l'],
        nonTerminals: ['A','F','Q'],
        warnings: [],
    });
});

test('without warnings - without axiom', t => {
    const input = `Q -> F b A;
    F -> ;
    A -> l;
    F -> b;`;
    t.deepEqual(parser.parseString(input), {
        grammar: {
            'Q': [
                [
                    { type: parser.NONTERMINAL, value: 'F' },
                    { type: parser.TERMINAL, value: 'b' },
                    { type: parser.NONTERMINAL, value: 'A' }
                ]
            ],
            'F':[[],[{ type: parser.TERMINAL, value: 'b' }]],
            'A':[[
                { type: parser.TERMINAL, value: 'l' }
            ]]  
        },
        startSymbol: 'Q',
        rulesNumber: 4,
        terminals: ['b','l'],
        nonTerminals: ['A','F','Q'],
        warnings: [],
    });
});
