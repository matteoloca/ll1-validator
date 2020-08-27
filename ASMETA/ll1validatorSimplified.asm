asm ll1validatorSimplified

import StandardLibrary
import CTLlibrary

signature:
	// DOMAINS
	enum domain State={ NT | ARROW | RULE | EOR | EOF | ERR }
	enum domain Rules={ LS | LX | LY | LZ | LA | LB | ARR | SEMICOLON | EOFILE } 
	// FUNCTIONS
	dynamic controlled nonterminal: Rules -> Boolean
	dynamic monitored input: Rules
	dynamic controlled actrule: Rules
	dynamic controlled ruleList: Rules
	dynamic controlled actnt: Rules
	dynamic controlled readState: State
	
	static parseInput: Rules -> State

	
definitions:
	function parseInput($c in Rules)=
			if $c = SEMICOLON then EOR
			else if $c = EOFILE then EOF
			else if $c = ARR then ARROW
			else if readState=EOR then NT
			else RULE
			endif endif endif endif
	

	// rule DEFINITIONS
	rule r_endAction =
		readState:=EOF
	
	rule r_waitAction=
		readState:=ARROW
	
	rule r_addNontM($i in Rules)=
	nonterminal($i) := true
	 
	rule r_addnt =
	seq
		readState:=NT
		actnt:=input
		if nonterminal(input)= false then
			r_addNontM[input]
		endif
	endseq
	
	
	macro rule r_addruleToList =
	par
		readState:=EOR
		ruleList:=actrule
	endpar
	
	macro rule r_addTerm=
	par
		readState:=RULE
		actrule:= input
	endpar
	
	// INVARIAntS
	

	// MAIN rule
	main rule r_Main =
	if not ( readState=EOF or readState=ERR ) then
			switch parseInput(input)
				case EOF:
					r_endAction[]
				case EOR:
					r_addruleToList[]
				case ARROW:
					r_waitAction[]
				case NT:
					r_addnt[]
				case RULE:
					r_addTerm[]
				case ERR:
					readState:=ERR
			endswitch
	endif
	
// INITIAL STATE
default init s0:
	function readState = EOR
	function nonterminal($nt in Rules) = false
		