import React from 'react';
import PuzzleGrid from './PuzzleGrid';
import PuzParser from './parsers/PuzParser';
import ClueList from './ClueList';
import Preferences from './Preferences';
import { GoGear } from 'react-icons/go';
import { merge } from 'lodash';
import ls from 'local-storage';
import { puzzleTypes, direction } from './Constants';
import { AllHtmlEntities } from 'html-entities';
import ms from 'pretty-ms';
import classnames from 'classnames';
import ReactModal from 'react-modal';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import WSJParser from './parsers/WSJParser';
import LATimesParser from './parsers/LATimesParser';

const Loader = ({ message }) => {
  return (
    <div className="loader-container">
      <div className="loader" />
      <span className="loading-text">
        {message ? message : "Loading..."}
      </span>
    </div>
  )
}

ReactModal.setAppElement("#root");

export default class Puzzle extends React.Component {
  constructor(props) {
    super(props);

    let i;
    let solution = [];
    let userInput = [];
    let clueNumbers = [];
    
    for (i = 0; i < 30; i++) {
      solution[i] = Array(30).fill(" ");
      userInput[i] = Array(30).fill(" ");
      clueNumbers[i] = Array(30).fill(0);
    }

    this.state = {
      timer: {
	time: 0,
	isOn: false,
	start: 0
      },
      puzzleComplete: false,
      showModal: false,
      preferences: {},
      showPrefs: false,
      isLoading: true,
      selectedX: 0,
      selectedY: 0,
      gridHeight: 15,
      gridWidth: 15,
      gridDirection: direction.ACROSS,
      gridSolution: solution,
      userInput: userInput,
      clueNumbers: clueNumbers,
      acrossNumbers: [],
      downNumbers: [],
      
      acrossClues: [],
      downClues: [],
      circledClues: [],
      meta: [],
    };

    this.gridClick = this.gridClick.bind(this);
    this.gridFocus = this.gridFocus.bind(this);
    this.gridInput = this.gridInput.bind(this);
    this.onClueClicked = this.onClueClicked.bind(this);
    this.displayPrefs = this.displayPrefs.bind(this);
    this.setPreferences = this.setPreferences.bind(this);
    this.startTimer = this.startTimer.bind(this)
    this.pauseTimer = this.pauseTimer.bind(this)
    this.updateTimer = this.updateTimer.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.reveal = this.reveal.bind(this);
    this.checkPuzzle = this.checkPuzzle.bind(this);
    this.load = this.load.bind(this);
    
    document.addEventListener('keydown', this.gridInput);

    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }

    
    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || this.hidden === undefined) {
      console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
      // Handle page visibility change   
      document.addEventListener(this.visibilityChange, this.handleVisibilityChange, false);
    }
  }

  handleVisibilityChange() {
    if (!this.state.puzzleComplete && this.state.preferences.timePuzzle && document[this.hidden]) {
      this.pauseTimer();
    }
  }
  
  onClueClicked(d, clueNumber) {
    const { clueNumbers } = this.state;
    
    let i,j;

    for (i = 0; i < this.state.gridHeight; i++) {
      for (j = 0; j < this.state.gridWidth; j++) {
	if (clueNumbers[i][j] === parseInt(clueNumber, 10)) {
	  this.setState({ gridDirection: d });
	  this.setFocus(j, i);
	  return;
	}
      }
    }
  }
  
  buildGrid(solution) {
    let i;
    let j;
    let userInput = this.state.userInput;
    let clueNumbers = this.state.clueNumbers;
    let clueNumber = 0;
    let downNumbers = [];
    let acrossNumbers = [];
    let incrementClueNumber = true;
    let incorrectAnswers = 0;

    for (i = 0; i < solution.length; i++) {
      for (j = 0; j < solution[i].length; j++) {
	if (i === 0) {
	  if (solution[i][j] !== '.') {
	    ++clueNumber;
	    incrementClueNumber = false;
	    downNumbers.push(clueNumber);
	  }
	} else if (solution[i - 1][j] === '.' && solution[i][j] !== '.') {
	  if (incrementClueNumber) {
	    ++clueNumber;
	    incrementClueNumber = false;
	  }
	  downNumbers.push(clueNumber);
	}
	
	if (j === 0) {
	  if (incrementClueNumber && solution[i][j] !== '.') {
	    ++clueNumber;
	    incrementClueNumber = false;
	  }

	  if (solution[i][j] !== '.') {
	    acrossNumbers.push(clueNumber);
	  }
	} else if (solution[i][j - 1] === '.' && solution[i][j] !== '.') {
	  if (incrementClueNumber) {
	    ++clueNumber;
	    incrementClueNumber = false;
	  }

	  if (solution[i][j] !== '.') {
	    acrossNumbers.push(clueNumber);
	  }
	}

	if (solution[i][j] !== '.') {
	  ++incorrectAnswers;
	}

	if (incrementClueNumber === false) {
	  clueNumbers[i][j] = clueNumber;
	} else {
	  clueNumbers[i][j] = 0;
	}
	
	userInput[i][j] = solution[i][j] === '.' ? '.' : '';
	incrementClueNumber = true;
      }
    }

    const x = this.findFirstSquare(direction.ACROSS);
    const y = this.findFirstSquare(direction.DOWN);

    this.setState({
      acrossNumbers: acrossNumbers,
      downNumbers: downNumbers,
      clueNumbers: clueNumbers,
      userInput: userInput,
      selectedX: x,
      slectedY: y,
      incorrectAnswers: incorrectAnswers,
    });
  }

  findFirstSquare(dir) {
    const { gridWidth, gridHeight, gridSolution } = this.state;
    
    let i = 0;
    
    if (dir === direction.ACROSS) {
      while (i < gridWidth) {
	if (gridSolution[0][i] !== '.') {
	  return i;
	}
	++i;
      }
    } else {
      while (i < gridHeight) {
	if (gridSolution[i][0] !== '.') {
	  return i;
	}
	++i;
      }
    }
  }

  loadPuzzle(puzzle, puzzleType) {
    const defaultPrefs = { endOfWord: 'next', spaceBar: 'change', enterKey: 'next', skipExisting: false, showWrongAnswers: false, timePuzzle: true };
    const prefs = ls.get('preferences') || JSON.stringify(defaultPrefs);

    this.setState({ isLoading: true, preferences: prefs, puzzleComplete: false });

    var puz;

    if (puzzleType === puzzleTypes.PUZ) {
      puz = new PuzParser();
    } else if (puzzleType === puzzleTypes.WSJ) {
      puz = new WSJParser();
    } else if (puzzleType === puzzleTypes.LATIMES) {
      puz = new LATimesParser();
    }
    
    puz.setUrl(puzzle).then(data => {
      this.buildGrid(data.solution);

      const entities = new AllHtmlEntities();

      let len = data.solution.length;
      let i;
      let gridSolution = [];
      
      for (i = 0; i < len; i++) {
	gridSolution[i] = data.solution[i];
      }
      
      this.setState({
	isLoading: false,
	preferences: JSON.parse(prefs),
	acrossClues: data.clues[0].map((c) => { return entities.decode(c) }),
	downClues: data.clues[1].map((c) => { return entities.decode(c) }),
	circledClues: data.circledClues,
	gridSolution: gridSolution,
	gridWidth: data.width,
	gridHeight: data.height,
	meta: data.meta,
      });
    });
  }
  
  componentDidMount() {
    const host = window.location.host;
    this.loadPuzzle(`http://${host}/jz200319.puz`, puzzleTypes.PUZ);
  }

  findCurrentWord() {
    let startWord = 0;
    let endWord = 0;
    let solution = this.state.gridSolution;
    let selectedX = this.state.selectedX;
    let selectedY = this.state.selectedY;
    
    let word = "";
    
    if (this.state.gridDirection === direction.ACROSS) {
      startWord = selectedX;
      while (solution[selectedY][startWord] !== '.' && startWord > 0)
	--startWord;

      if (solution[selectedY][startWord] === '.')
	++startWord;

      endWord = selectedX;
      while (endWord < this.state.gridWidth && solution[selectedY][endWord] !== '.')
	++endWord;
      
      word = solution[selectedY].join('');
      word = word.substring(startWord, endWord)
    }
    else
    {
      startWord = selectedY;
      while (solution[startWord][selectedX] !== '.' && startWord > 0)
	--startWord;
      
      if (solution[startWord][selectedX] === '.')
	++startWord;
      
      endWord = selectedY;
      while (endWord < this.state.gridHeight && solution[endWord][selectedX] !== '.')
	++endWord;
      
      let col = [];
      let i = 0;
      
      for (i = startWord; i < endWord; i++)
	col.push(solution[i][selectedX]);
      
      word = col.join('');
    }
    
    word = word.split(" ").join("_");
    
    return { value: word, length: (endWord - startWord)};
  }

  gridClick(x, y) {
    if (x === this.state.selectedX && y === this.state.selectedY) {
      this.reverseDirection();
      return;
    }

    this.setState({ selectedX: x, selectedY: y });
  }
  
  gridFocus(x, y) {
    if (this.state.selectedX !== x || this.state.selectedY !== y) {
      this.setState({ selectedX: x, selectedY: y });
    }
  }

  gridInput(event) {
    const { key } = event;
    const { userInput, selectedX, selectedY, gridDirection, gridSolution } = this.state;

    if (key === 'Enter') {
      if (this.state.preferences.enterKey === "change") {
	this.reverseDirection();
      } else {
	if (event.shiftKey) {
	  this.focusPreviousClue(selectedX, selectedY);
	} else {
	  this.focusNextClue(selectedX, selectedY);
	}
      }
    }

    if (key === 'ArrowLeft') {
      if (gridDirection === direction.ACROSS) {
	this.focusLeft(selectedX, selectedY);
      } else {
	this.reverseDirection();
      }
    }

    if (key === 'ArrowRight') {
      if (gridDirection === direction.ACROSS) {
	this.focusRight(selectedX, selectedY);
      } else {
	this.reverseDirection();
      }
    }
    
    if (key === 'ArrowUp') {
      if (gridDirection === direction.DOWN) {
	this.focusUp(selectedX, selectedY);
      } else {
	this.reverseDirection();
      }
    }
    
    if (key === 'ArrowDown') {
      if (gridDirection === direction.DOWN) {
	this.focusDown(selectedX, selectedY);
      } else {
	this.reverseDirection();
      }
    }
    
    if (key === 'Backspace' || key === 'Delete') {
      let incorrectAnswers = this.state.incorrectAnswers;

      if (userInput[selectedY][selectedX] !== '' && userInput[selectedY][selectedX].toUpperCase() === gridSolution[selectedY][selectedX].toUpperCase()) {
	++incorrectAnswers;
      }
      
      userInput[selectedY][selectedX] = '';

      this.setState((curState) => { return { userInput, incorrectAnswers } });
      this.focusPreviousInput(selectedX, selectedY);
    }

    if (key === ' ' && this.state.preferences.spaceBar === "change") {
      this.reverseDirection();
      event.preventDefault();
      return;
    }

    if (key.length === 1 && (key === ' ' || (key >= 'a' && key <= 'z') || (key >= 'A' && key <= 'Z') || (key >= '0' && key <= '9')))
    {
      let { timer, incorrectAnswers } = this.state;

      if (timer.isOn === false && !this.state.puzzleComplete) {
	this.startTimer();
      }
      
      /* answer was correct - now it might not be ... */
      if (userInput[selectedY][selectedX].toUpperCase() ===  gridSolution[selectedY][selectedX].toUpperCase()) {
	++incorrectAnswers;
      }

      userInput[selectedY][selectedX] = key;

      if (key.toUpperCase() === this.state.gridSolution[selectedY][selectedX].toUpperCase()) {
	--incorrectAnswers;
      }

      this.setState({ userInput, incorrectAnswers });

      if (incorrectAnswers === 0) {
	this.setState({ puzzleComplete: true });

	if (this.state.preferences.timePuzzle) {
	  this.setState((curState) => { return {showModal: true, timer: {start: curState.timer.start, isOn: false, time: curState.timer.time}}});
	  clearInterval(this.timer)
	}
      }
      
      this.focusNextInput(selectedX, selectedY);
    }
  }

  reverseDirection() {
    let val = direction.ACROSS;
      
    if (this.state.gridDirection === direction.ACROSS) {
      val = direction.DOWN;
    }

    this.setState({ gridDirection: val });
  }
  
  focusPreviousClue() {
    const { gridDirection } = this.state;

    let clueNumber = this.findSelectedClue(gridDirection);
    
    if (gridDirection === direction.ACROSS) {
      const { acrossNumbers } = this.state;
      const len = acrossNumbers.length;
      let i;

      for (i = len - 1; i > 0; i--) {
	if (acrossNumbers[i] === clueNumber) {
	  this.focusClue(acrossNumbers[i - 1])
	  return;
	}
      }

      this.reverseDirection();
      this.focusClue(this.state.downNumbers[this.state.downNumbers.length - 1]);
    } else {
      const { downNumbers } = this.state;
      const len = downNumbers.length;
      let i;

      for (i = len - 1; i > 0; i--) {
	if (downNumbers[i] === clueNumber) {
	  this.focusClue(downNumbers[i - 1])
	  return;
	}
      }

      this.reverseDirection();
      this.focusClue(this.state.acrossNumbers[this.state.acrossNumbers.length - 1]);
    }
  }

  /* TODO - move to empty spon in newly focused word */
  focusClue(num) {
    const { gridWidth, gridHeight, clueNumbers } = this.state;
    let i,j;

    for (i = 0; i < gridHeight; i++) {
      for (j = 0; j < gridWidth; j++) {
	if (clueNumbers[i][j] === num) {
	  this.setFocus(j, i);
	  return;
	}
      }
    }
  }
  
  focusNextClue() {
    const { gridDirection } = this.state;

    let clueNumber = this.findSelectedClue(gridDirection);
    
    if (gridDirection === direction.ACROSS) {
      const { acrossNumbers } = this.state;
      const len = acrossNumbers.length;
      let i;

      for (i = 0; i < len - 1; i++) {
	if (acrossNumbers[i] === clueNumber) {
	  this.focusClue(acrossNumbers[i + 1])
	  return;
	}
      }

      this.reverseDirection();
      this.focusClue(1);
    } else {
      const { downNumbers } = this.state;
      const len = downNumbers.length;
      let i;

      for (i = 0; i < len - 1; i++) {
	if (downNumbers[i] === clueNumber) {
	  this.focusClue(downNumbers[i + 1])
	  return;
	}
      }

      this.reverseDirection();
      this.focusClue(1);
    }
  }

  focusLeft(x, y) {
    let xpos = x;

    --xpos;
    
    while (xpos >= 0 && this.state.gridSolution[y][xpos] === '.') {
      --xpos;
    }

    if (xpos < 0) {
      xpos = x;
    }

    this.setFocus(xpos, y);
  }

  focusRight(x, y) {
    const { gridWidth, gridSolution } = this.state;
    
    let xpos = x;
    
    ++xpos;

    while (xpos < gridWidth && gridSolution[y][xpos] === '.') {
      ++xpos;
    }
    
    if (xpos >= gridWidth) {
      xpos = x;
    }
    
    this.setFocus(xpos, y);
  }
      
  focusDown(x, y) {
    const { gridHeight, gridSolution } = this.state;
    let ypos = y;
    
    ++ypos;
    while (ypos < gridHeight && gridSolution[ypos][x] === '.') {
      ++ypos;
    }

    if (ypos >= gridHeight) {
      ypos = y;
    }
    
    this.setFocus(x, ypos);
  }

  setFocus(x, y) {
    document.getElementById(y + ":" + x).focus();
    this.setState({ selectedX: x, selectedY: y });
  }
  
  focusUp(x, y) {
    const { gridSolution } = this.state;
    let ypos = y;
    
    --ypos;

    while (ypos >= 0 && gridSolution[ypos][x] === '.') {
      --ypos;
    }

    if (ypos < 0) {
      ypos = y;
    }
    
    this.setFocus(x, ypos);
  }
  
  
  focusPreviousInput(x, y) {
    let nextX = x;
    let nextY = y;
    const { gridSolution, gridDirection } = this.state;
    
    if (gridDirection === direction.ACROSS) {
      if (x > 0) {
	x--;
	while (x > 0 && gridSolution[y][x] === '.') {
	  --x;
	}

	nextX = x;
      }
    } else {
      if (y > 0) {
	--y;

	while (y > 0 && gridSolution[y][x] === '.') {
	  --y;
	}

	nextY = y;
      }
    }

    this.setFocus(nextX, nextY);
  }
  
  focusNextInput(x, y) {
    let nextX = x, nextY = y;
    const { gridSolution, gridDirection, gridWidth, gridHeight, preferences } = this.state;
    
    if (gridDirection === direction.ACROSS) {
      if (x < gridWidth) {
	++x;
	
	if (((x < gridWidth && gridSolution[this.state.selectedY][x] === '.') || x === gridWidth) && preferences.endOfWord === "next") {
	  this.focusNextClue();
	  return;
	}
	
	if (preferences.skipExisting) {
	  const { userInput } = this.state;
	  let wordX = x;
	  
	  while (wordX < gridWidth && (userInput[y][wordX] !== '' && userInput[y][wordX] === '.')) {
	    ++wordX;
	  }

	  /* no blank space in word - just move to the next */
	  if (wordX === gridWidth || userInput[y][wordX] === '.') {
	    nextX = x - 1;
	  }
	}
	
	if (x < gridWidth && gridSolution[y][x] !== '.') {
	  nextX = x;
	}
      }
    } else {
      if (y < gridHeight) {
	++y;

	if (((y < gridHeight && gridSolution[y][x] === '.') || y === gridHeight) && preferences.endOfWord === "next") {
	  this.focusNextClue();
	  return;
	}

	if (preferences.skipExisting) {
	  const { userInput } = this.state;
	  let wordY = y;
	  
	  while (wordY < gridHeight && (userInput[wordY][x] !== '' && userInput[wordY][x] !== '.')) {
	    ++wordY;
	  }

	  if (wordY === gridHeight || userInput[wordY][x] === '.') {
	    nextY = y - 1;
	  }
	}

	if (y < gridHeight && gridSolution[y][x] !== '.') {
	  nextY = y;
	}
      }
    }

    this.setFocus(nextX, nextY);
  }
  
  gridDirectionChange(e) {
    this.setState({gridDirection: e.target.value});
  }

  findSelectedClue(dir) {
    const { gridSolution, selectedX, selectedY, clueNumbers } = this.state;

    if (clueNumbers[selectedY][selectedX] !== 0) {
      if (dir === direction.ACROSS) {
	if (selectedX === 0 || gridSolution[selectedY][selectedX - 1] === '.') {
	  return clueNumbers[selectedY][selectedX];
	}
      } else {
	if (selectedY === 0 || gridSolution[selectedY - 1][selectedX] === '.') {
	  return clueNumbers[selectedY][selectedX];
	}
      }
    }
    
    if (dir === direction.ACROSS) {
      let x = selectedX;

      while (x > 0 && gridSolution[selectedY][x - 1] !== '.') {
	--x;
      }

      return clueNumbers[selectedY][x];
    } else {
      let y = selectedY;

      while (y > 0 && gridSolution[y - 1][selectedX] !== '.') {
	--y;
      }

      return clueNumbers[y][selectedX];
    }
  }

  displayPrefs() {
    const timerOn = this.state.timer.isOn;

    this.setState((curState) => {
      return {
	showPrefs: !curState.showPrefs,
	timer : {
	  isOn: !curState.timer.isOn,
	  time: curState.timer.time,
	  start: curState.timer.start,
	}
      }
    });

    if (timerOn) {
      clearInterval(this.timer)
    } else {
      this.timer = setInterval(this.updateTimer, 1);
    }
  }
  
  setPreferences(prefs) {
    const p = merge({}, this.state.preferences, prefs);
    
    ls.set('preferences', JSON.stringify(p));
    
    this.setState({ preferences: p });
  }

  reveal(option) {
    const { gridHeight, gridWidth, gridDirection, userInput, gridSolution, selectedX, selectedY, incorrectAnswers } = this.state;

    let ia = incorrectAnswers;
    
    if (option.value === "Letter") {
      if (userInput[selectedY][selectedX].toUpperCase() !== gridSolution[selectedY][selectedX].toUpperCase()) {
	--ia;
      }
      userInput[selectedY][selectedX] = gridSolution[selectedY][selectedX];
    } else if (option.value === "Word") {
      if (gridDirection === direction.ACROSS) {
	let x = selectedX;

	while (x > 0 && gridSolution[selectedY][x - 1] !== '.') {
	  --x;
	}

	while (x < gridWidth && gridSolution[selectedY][x] !== '.') {
	  if (userInput[selectedY][x].toUpperCase() !== gridSolution[selectedY][x].toUpperCase()) {
	    --ia;
	  }
	  userInput[selectedY][x] = gridSolution[selectedY][x];
	  ++x;
	}
      } else {
	let y = selectedY;

	while (y > 0 && gridSolution[y - 1][selectedX] !== '.') {
	  --y;
	}

	while (y < gridHeight && gridSolution[y][selectedX] !== '.') {
	  if (userInput[y][selectedX].toUpperCase() !== gridSolution[y][selectedX].toUpperCase()) {
	    --ia;
	  }
	  userInput[y][selectedX] = gridSolution[y][selectedX];
	  ++y;
	}
      }
    } else {
      let i,j;

      ia = 0;

      for (i = 0; i < gridHeight; i++) {
	for (j = 0; j < gridWidth; j++) {
	  userInput[i][j] = gridSolution[i][j];
	}
      }
    }

    this.setState({ userInput, incorrectAnswers: ia });
  }
  
  renderRevealDropdown() {
    const options = [ 'Letter', 'Word', 'Solution' ];
    
    return(
      <div className="RevealDropdown">
	<Dropdown options={options} onChange={this.reveal} placeholder={"Reveal"} />
      </div>
    );
  }

  checkPuzzle() {
    var i,j;
    const { gridHeight, gridWidth, userInput, gridSolution } = this.state;
    
    for (i = 0; i < gridHeight; i++) {
      for (j = 0; j < gridWidth; j++) {
	if (userInput[i][j].toUpperCase() !== gridSolution[i][j].toUpperCase()) {
	  userInput[i][j] = '';
	}
      }
    }

    this.setState({ userInput });
  }
  
  renderCheck() {
    return (
	<button onClick={this.checkPuzzle} >Check</button>
    );
  }

  load(option) {
    const host = window.location.host;

    if (option.value === "Sample .puz") {
      this.loadPuzzle(`http://${host}/jz200319.puz`, puzzleTypes.PUZ);
    } else if (option.value === "Sample WSJ") {
      this.loadPuzzle(`http://${host}/wsj-200627.json`, puzzleTypes.WSJ);
    } else if (option.value === "Sample NYT") {
      this.loadPuzzle(`http://${host}/Jul0120.puz`, puzzleTypes.PUZ);
    } else if (option.value === "Sample LA Times") {
      this.loadPuzzle(`http://${host}/la200701.xml`, puzzleTypes.LATIMES);
    }
  }

  renderLoad() {
    const options = [ 'Sample .puz', 'Sample WSJ', 'Sample NYT', 'Sample LA Times' ];

    return(
      <div className="LoadDropdown">
	<Dropdown options={options} onChange={this.load} placeholder={"Load"} />
      </div>
    );
  }
  
  renderRestOfHeader() {
    if (this.state.showPrefs) {
      return null;
    }

    return (
	<div className="RightHeader">
	  {this.renderLoad()}
	  {this.renderCheck()}
	  {this.renderRevealDropdown()}
	  {this.renderTimer()}
        </div>
    );
  }

  renderHeader() {
    return(
        <div className="PuzzleHeader">
	  <div className="PreferencesIcon">
	    <GoGear style={{width: "2rem", height: "2rem"}} aria-label="Preferences" onClick={this.displayPrefs}/>
	  </div>
	  {this.renderRestOfHeader()}
	</div>
    );
  }

  renderGridClues(acrossNumber, downNumber) {
    const { acrossNumbers, acrossClues, downNumbers, downClues } = this.state;
    let acrossIndex = 0, downIndex = 0;
    let i;

    for (i = 0; i < acrossNumbers.length; i++) {
      if (acrossNumbers[i] === acrossNumber) {
	acrossIndex = i;
	break;
      }
    }

    for (i = 0; i < downNumbers.length; i++) {
      if (downNumbers[i] === downNumber) {
	downIndex = i;
	break;
      }
    }
    
    return(
	<div className={classnames({"GridClues": true, "obscured": this.isTimerPaused()})}>
	  <span className="GridClueNumber">{acrossNumber}A. </span><span className="GridClue">{acrossClues[acrossIndex]}</span><br />
	  <span className="GridClueNumber">{downNumber}D. </span><span className="GridClue">{downClues[downIndex]}</span>
	</div>
    );
  }

  updateTimer() {
    this.setState((curState) => { return { timer: {
      time: Date.now() - curState.timer.start,
      isOn: curState.timer.isOn,
      start: curState.timer.start
    }}});
  }
  
  startTimer() {
    this.setState((curState) => { return {
      showModal: false,
      timer: {
        isOn: true,
        time: curState.timer.time,
        start: Date.now() - curState.timer.time
      }
    }});

    this.timer = setInterval(this.updateTimer, 1);
  }
  
  pauseTimer() {
    this.setState((curState) => { return {showModal: true, timer: {start: curState.timer.start, isOn: false, time: curState.timer.time}}});
    clearInterval(this.timer)
  }

  isTimerPaused() {
    return !this.state.puzzleComplete && this.state.timer.start !== 0 && this.state.timer.isOn === false;
  }
  
  renderTimer() {
    if (this.state.preferences.timePuzzle === false) {
      return null;
    }
    
    let pause = (this.state.puzzleComplete || this.state.timer.time === 0 || !this.state.timer.isOn) ? null : <button onClick={this.pauseTimer}>Pause</button>;

    return(
      <div className="PuzzleTimer">
	{ms(this.state.timer.time, {colonNotation: true, secondsDecimalDigits: 0})}
        {pause}
      </div>
    );
  }

  renderBody() {
    if (this.state.showPrefs) {
      return <Preferences setPreferences={this.setPreferences} {...this.state.preferences} />
    } else {
      const acrossNumber = this.findSelectedClue(direction.ACROSS);
      const downNumber = this.findSelectedClue(direction.DOWN);
      
      return (
	  <div className="PuzzleBody">
            <div className="Grid">
	      {this.renderGridClues(acrossNumber, downNumber)}
              <PuzzleGrid
                selectedX={this.state.selectedX}
                selectedY={this.state.selectedY}
                gridDirection={this.state.gridDirection}
                gridWidth={Number(this.state.gridWidth)}
                gridHeight={Number(this.state.gridHeight)}
                gridSolution={this.state.gridSolution}
                userInput={this.state.userInput}
                gridInputCallback={this.gridInput}
                gridFocusCallback={this.gridFocus}
                gridClickCallback={this.gridClick}
                clueNumbers={this.state.clueNumbers}
                circledClues={this.state.circledClues}
	        showWrongAnswers={this.state.preferences.showWrongAnswers}
              />
            </div>
	    <ClueList
              obscured={this.isTimerPaused()}
              title={"Across"}
              clueDirection={direction.ACROSS}
              clueNumbers={this.state.acrossNumbers}
              clues={this.state.acrossClues}
              selectedClue={acrossNumber}
              primary={this.state.gridDirection === direction.ACROSS}
              onClueClicked={this.onClueClicked}
              gridHeight={this.state.gridHeight}
	    />
	    <ClueList
              obscured={this.isTimerPaused()}
              title={"Down"}
              clueDirection={direction.DOWN}
              clueNumbers={this.state.downNumbers}
              clues={this.state.downClues}
              selectedClue={downNumber}
              primary={this.state.gridDirection === direction.DOWN}
              onClueClicked={this.onClueClicked}
              gridHeight={this.state.gridHeight}
	    />
          </div>
      );
    }
  }

  renderFooter() {
    if (this.state.showPrefs) {
      return null;
    }

    return(
	<div className="PuzzleFooter">
	  <span className="Title">{this.state.meta.title}</span> <br />
	  <span className="Published">{this.state.meta.publisher}</span> <br />
        </div>
    );
  }

  renderModal() {
    if (this.state.puzzleComplete) {
      return null;
    }
    
    return(
        <ReactModal 
           isOpen={this.state.showModal}
           contentLabel="Puzzle Paused"
           onRequestClose={this.startTimer}
           shouldCloseOnOverlayClick={false}
           className="Modal"
        >
	<div className="PuzzleModalContent">
          <h2>Puzzle paused.</h2>
          <button onClick={this.startTimer}>Resume</button>
	</div>
        </ReactModal>

    );
  }
  
  render() {
    if (this.state.isLoading) {
      return <Loader />;
    }

    return (
	<div className="Puzzle">
	  {this.renderModal()}
	  {this.renderHeader()}
          {this.renderBody()}
	  {this.renderFooter()}
        </div>
    );
  }
}
