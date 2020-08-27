// Simulazione del parser
asm ll1validator

import StandardLibrary
import CTLlibrary

signature:
	// DOMAINS
	domain Rules subsetof Prod(String, Seq(String))
	abstract domain State
	
	// FUNCTIONS
	dynamic controlled nonterminal: String -> Boolean
	dynamic monitored input: String
	dynamic controlled ruleList: Seq(Rules)
	dynamic controlled actrule: Seq(String)
	dynamic controlled actnt: String
	dynamic controlled readState: State
	
	derived addrule: Prod(Seq(Rules), String, Seq(String)) -> Seq(Rules)
	static parseInput: String -> State


	static nt: State
	static arrow: State
	static ruleState: State
	static eor: State
	static eof: State
	static err: State
	
definitions:
	// DOMAIN DEFINITIONS
	
	// FUNCTION DEFINITIONS
	function addrule($sr in Seq(Rules), $nt in String, $s in Seq(String)) = append($sr, ($nt, $s))
			
	
	function parseInput($c in String)=
		if $c = ";" then 
			if readState=ruleState or readState=arrow then eor else err endif
		else if $c = "" then 
			if readState=eor then eof else err endif
		else if $c = "->" then 
			if readState=nt then arrow else err endif
		else if readState=eor then nt
		else if readState=ruleState or readState=arrow then ruleState else err
		endif endif endif endif endif

	// rule DEFINITIONS
	rule r_endAction =
		readState:=eof
	
	rule r_waitAction=
		readState:=arrow
	
	rule r_addNontM($i in String)=
	nonterminal($i) := true
	 
	macro rule r_addnt =
	seq
		readState:=nt
		actnt:=input
		if nonterminal(input)= undef then
			r_addNontM[input]
		endif
	endseq

	macro rule r_addruleToList =
	par
		readState:=eor
		ruleList:=addrule(ruleList, actnt,actrule)
		actrule:=[]
	endpar
	
	macro rule r_addTerm=
	par
		readState:=ruleState
		actrule:= append(actrule,input)
	endpar
	// INVARIAntS
	

	// MAIN rule
	main rule r_Main =
	if not ( readState=eof or readState=err ) then
			switch parseInput(input)
				case eof:
					r_endAction[]
				case eor:
					r_addruleToList[]
				case arrow:
					r_waitAction[]
				case nt:
					r_addnt[]
				case ruleState:
					r_addTerm[]
				case err:
					readState:=err
			endswitch
	endif
	
// INITIAL STATE
default init s0:
	function readState = eor
	function actrule = []
	function ruleList = []
	
	function nonterminal($nt in String) = undef	
	
