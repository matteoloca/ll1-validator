asm ll1validatorSimplified

import StandardLibrary
import CTLlibrary

signature:
	// DOMAINS
	enum domain State={ NT | ARROW | RULE | EOR | EOF | ERR }
	enum domain Rules={ LS | LX | LY | LZ | ARR | SEMICOLON | EOFILE } 
	// FUNCTIONS
	dynamic controlled nonterminal: Rules -> Boolean
	dynamic monitored input: Rules
	dynamic controlled actrule: Rules
	dynamic controlled ruleList: Rules
	dynamic controlled actnt: Rules
	dynamic controlled readState: State
	dynamic controlled done: Boolean
		
	static parseInput: Rules -> State

	
definitions:
	function parseInput($c in Rules)=
			if $c = SEMICOLON then if readState=RULE or readState=ARROW then EOR else ERR endif
			else if $c = EOFILE then if readState=EOR then EOF else ERR endif
			else if $c = ARR then if readState=NT then ARROW else ERR endif
			else if readState=EOR then NT
			else if readState=RULE or readState=ARROW then RULE else ERR
			endif endif endif endif endif
	

	// rule DEFINITIONS
	rule r_endAction =
	par
		readState:=EOF
		done:=true
	endpar
	
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
			else
			skip
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
	

	// se l'input è EOF allo stato successivo termina
	CTLSPEC ag(input = EOFILE implies ax(done))
	// non può terminare finché input = EOF
	CTLSPEC absenceBefore(done, input = EOFILE or readState=ERR) 
	
	//Se leggo la freccia devo essere in stato NT 
	CTLSPEC ag((not done and input = ARR and readState != NT) implies ax(readState=ERR))
	//Se leggo un NT ad inizio riga esso diventerà il carattere non terminale di inizio
	CTLSPEC ag((not done and input = LX and readState = EOR) implies ax(actnt=LX))
	//Se leggo un NT ad inizio riga esso diventerà il carattere non terminale di inizio
	CTLSPEC ag((not done and input = LY and readState = EOR) implies ax(actnt=LY))
	//Se leggo un NT ad inizio riga esso diventerà il carattere non terminale di inizio
	CTLSPEC ag((not done and input = LZ and readState = EOR) implies ax(actnt=LZ))
	//Se leggo un NT ad inizio riga esso diventerà il carattere non terminale di inizio
	CTLSPEC ag((not done and input = LS and readState = EOR) implies ax(actnt=LS))
	
	//Se leggo EOF senza prima essere in EOR allora vado in errore
	CTLSPEC ag((not done and input = EOFILE and readState != EOR) implies ax(readState=ERR))
	
	
	// MAIN rule
	main rule r_Main =
	if not ( done ) then
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
				par
					readState:=ERR
					done:=true
				endpar
			endswitch
	endif
	
// INITIAL STATE
default init s0:
	function done=false
	function readState = EOR
	function nonterminal($nt in Rules) = false
		