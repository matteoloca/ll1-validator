const antlr4 = require("antlr4");

const GrammarlangLexer = require("../grammarlang/grammarlangLexer").grammarlangLexer;

const GrammarlangParser = require("../grammarlang/grammarlangParser").grammarlangParser;

const errors = require("./errors");

const warnings = require("./warnings");

const NONTERMINAL = 0;
const TERMINAL = 1;

class Visitor {
  visitChildren(ctx) {
    return this.visitRuleList(ctx);
  }

  visitRuleList(ctx) {
    const rules = [];
    const nonTerminals = new Set();
    let startSymbol = undefined;
    ctx.children.forEach(child => {
      if (child.constructor.name === "Start_symbolContext") {
        startSymbol = this.visitStartSymbol(child);
      } else if (child.constructor.name === "Rule_Context") {
        const rule = this.visitRule(child);
        rules.push(rule);
        nonTerminals.add(rule.l);

        if (!startSymbol) {
          startSymbol = rule.l;
        }
      }
    });

    if (startSymbol === undefined) {
      throw new Error("Fatal error");
    }

    if (!nonTerminals.has(startSymbol)) {
      throw new errors.StartSymbolNotFound(`At least one production from the start symbol "${startSymbol}" is required`);
    }

    const grammar = {};
    const terminals = new Set();
    rules.forEach(rule => {
      const items = [];
      rule.r.forEach(symbol => {
        const type = nonTerminals.has(symbol) ? NONTERMINAL : TERMINAL;
        items.push({
          type,
          value: symbol
        });

        if (type === TERMINAL) {
          terminals.add(symbol);
        }
      });
      const tmp = grammar[rule.l] || [];
      tmp.push(items);
      grammar[rule.l] = tmp;
    });
    return {
      grammar,
      startSymbol,
      rulesNumber: rules.length,
      terminals: Array.from(terminals).sort(),
      nonTerminals: Array.from(nonTerminals).sort(),
      warnings: this.checkDuplicates(grammar).concat(this.checkUnreachables(grammar, startSymbol, Array.from(nonTerminals)))
    };
  }

  visitStartSymbol(ctx) {
    return ctx.children.find(child => child.symbol.type === GrammarlangParser.SYMBOL).getText();
  }

  visitRule(ctx) {
    let l;
    let r = [];
    ctx.children.forEach(element => {
      if (element.constructor.name === "LContext") {
        l = this.visitL(element);
      } else if (element.constructor.name === "RContext" && element.children) {
        r = this.visitR(element);
      }
    });
    return {
      l: l,
      r: r
    };
  }

  visitL(ctx) {
    return ctx.children[0].getText();
  }

  visitR(ctx) {
    return ctx.children.map(child => child.getText());
  }

  checkDuplicates(grammar) {
    const result = [];
    Object.keys(grammar).forEach(nonTerminal => {
      const tmpRules = [];
      grammar[nonTerminal].forEach((rule, index) => {
        const equalToRule = v => JSON.stringify(v) === JSON.stringify(rule);

        const sameAs = tmpRules.findIndex(equalToRule);

        if (sameAs !== -1) {
          result.push(new warnings.DuplicatedRuleWarning(nonTerminal, index, sameAs));
        }

        tmpRules.push(rule);
      });
    });
    return result;
  }

  checkUnreachables(grammar, startSymbol, nonTerminals) {
    const unreachedNonTerminals = new Set(nonTerminals.filter(v => v !== startSymbol));
    const activeNonTerminals = Array.from(startSymbol);

    while (activeNonTerminals.length) {
      grammar[activeNonTerminals.pop()].forEach(rule => {
        rule.filter(v => v.type === NONTERMINAL && unreachedNonTerminals.has(v.value)).forEach(nonTerminal => {
          unreachedNonTerminals.delete(nonTerminal.value);
          activeNonTerminals.push(nonTerminal.value);
        });
      });
    }

    return Array.from(unreachedNonTerminals).sort().map(v => new warnings.UnreachableRuleWarning(v));
  }

}

class LexerErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
    throw new errors.LexerError(`[${line}:${column}] ${e} - ${msg}`);
  }

}

class ParserErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
    throw new errors.ParserError(`[${line}:${column}] ${e} - ${msg}`);
  }

}

const parseString = input => {
  const chars = new antlr4.InputStream(input);
  const lexer = new GrammarlangLexer(chars);
  lexer.removeErrorListeners();
  lexer.addErrorListener(new LexerErrorListener());
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new GrammarlangParser(tokens);
  parser.removeErrorListeners();
  parser.addErrorListener(new ParserErrorListener());
  parser.buildParseTrees = true;
  const tree = parser.rulelist();
  return tree.accept(new Visitor());
};

module.exports = Object.freeze({
  NONTERMINAL,
  TERMINAL,
  parseString
});