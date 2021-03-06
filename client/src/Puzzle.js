import React from "react";
import PuzzleGrid from "./PuzzleGrid";
import PuzParser from "./parsers/PuzParser";
import ClueList from "./ClueList";
import Preferences from "./Preferences";
import { GoGear, GoX } from "react-icons/go";
import { merge } from "lodash";
import ls from "local-storage";
import { AllHtmlEntities } from "html-entities";
import classnames from "classnames";
import ReactModal from "react-modal";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import WSJParser from "./parsers/WSJParser";
import LATimesParser from "./parsers/LATimesParser";
import BrainsOnlyParser from "./parsers/BrainsOnlyParser";
import OnlineCrosswordsParser from "./parsers/OnlineCrosswordsParser";
import BostonGlobeParser from "./parsers/BostonGlobeParser";
import PuzzleStore from "./stores/PuzzleStore";
import PuzzleList from "./PuzzleList";
import PuzzleInfo from "./PuzzleInfo";
import { inputStates, direction, daysOfTheWeek, puzzleNames, puzzleTypes, puzzleIDs, puzzleFlags } from './Constants';
import Stopwatch from './Stopwatch';

const Loader = ({ message }) => {
  return (
    <div className="loader-container">
      <div className="loader" />
      <span className="loading-text">{message ? message : "Loading..."}</span>
    </div>
  );
};

ReactModal.setAppElement("#root");

export default class Puzzle extends React.Component {
  constructor(props) {
    super(props);

    let i;
    let solution = [];
    let userInput = [];
    let clueNumbers = [];
    let inputState = [];
    
    for (i = 0; i < 30; i++) {
      solution[i] = Array(30).fill(" ");
      userInput[i] = Array(30).fill(" ");
      inputState[i] = Array(30).fill(inputStates.NO_INPUT);
      clueNumbers[i] = Array(30).fill(0);
    }

    this.state = {
      puzzleStartTime: 0,
      showModal: false,
      puzzleComplete: false,
      preferences: {},
      showPrefs: false,
      showPuzzleList: false,
      isLoading: true,
      selectedX: 0,
      selectedY: 0,
      gridHeight: 15,
      gridWidth: 15,
      gridDirection: direction.ACROSS,
      gridSolution: solution,
      userInput: userInput,
      clueNumbers: clueNumbers,
      inputState: inputState,
      acrossNumbers: [],
      downNumbers: [],

      acrossClues: [],
      downClues: [],
      circledClues: [],
      meta: [],
      showIncorrectTotal: false,
      incorrectTotalShown: false,
    };

    this.gridClick = this.gridClick.bind(this);
    this.gridFocus = this.gridFocus.bind(this);
    this.gridInput = this.gridInput.bind(this);
    this.onClueClicked = this.onClueClicked.bind(this);
    this.displayPrefs = this.displayPrefs.bind(this);
    this.setPreferences = this.setPreferences.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.reveal = this.reveal.bind(this);
    this.check = this.check.bind(this);
    this.checkPuzzle = this.checkPuzzle.bind(this);
    this.puzzleList = this.puzzleList.bind(this);
    this.resumePuzzle = this.resumePuzzle.bind(this);
    this.puzzleSelected = this.puzzleSelected.bind(this);
    this.showMain = this.showMain.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.closeAlmost = this.closeAlmost.bind(this);
    
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }

    window.onbeforeunload = () => {
      this.savePuzzle();
      return null;
    };

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (
      typeof document.addEventListener === "undefined" ||
      this.hidden === undefined
    ) {
      console.log(
        "This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API."
      );
    } else {
      // Handle page visibility change
      document.addEventListener(
        this.visibilityChange,
        this.handleVisibilityChange,
        false
      );
    }
    const { SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY } = daysOfTheWeek;
    const WEEKLY = SUNDAY | MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY;
    const MON_TO_SAT = MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY;
    const MON_TO_THU_SAT = MONDAY | TUESDAY | WEDNESDAY | THURSDAY | SATURDAY;

    this.puzzles = [
      new PuzzleInfo(WEEKLY, puzzleNames.NYT_DAILY, puzzleIDs.NYT_DAILY, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Daily, subscription required"),
      new PuzzleInfo(WEEKLY, puzzleNames.LA_TIMES, puzzleIDs.LA_TIMES, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(WEEKLY, puzzleNames.BRAINS_ONLY, puzzleIDs.BRAINS_ONLY, puzzleTypes.BRAINSONLY_COM, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(WEEKLY, puzzleNames.UNIVERSAL, puzzleIDs.UNIVERSAL, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(WEEKLY, puzzleNames.USA_TODAY, puzzleIDs.USA_TODAY, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(WEEKLY, puzzleNames.DAILY_AMERICAN, puzzleIDs.DAILY_AMERICAN, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_1, puzzleIDs.OCP_1, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_2, puzzleIDs.OCP_2, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_3, puzzleIDs.OCP_3, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_4, puzzleIDs.OCP_4, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_5, puzzleIDs.OCP_5, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_6, puzzleIDs.OCP_6, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.OCP_7, puzzleIDs.OCP_7, puzzleTypes.ONLINE_CROSSWORDS, puzzleFlags.NO_ARCHIVE, true, "Daily, no archive"),
      new PuzzleInfo(WEEKLY, puzzleNames.ARKADIUM, puzzleIDs.ARKADIUM, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(WEEKLY, puzzleNames.PENNYDELL, puzzleIDs.PENNYDELL, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(MON_TO_SAT, puzzleNames.KFSSHEFFER, puzzleIDs.KFSSHEFFER, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Daily"),
      new PuzzleInfo(MON_TO_SAT, puzzleNames.KFSJOSEPH, puzzleIDs.KFSJOSEPH, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Monday thru Saturday"),
      new PuzzleInfo(MON_TO_THU_SAT, puzzleNames.WSJ, puzzleIDs.WSJ, puzzleTypes.WSJ, puzzleFlags.NO_FLAG, true, "Monday thru Thursday and Saturday"),
      new PuzzleInfo(MONDAY, puzzleNames.NYTCLASSIC, puzzleIDs.NYTCLASSIC, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Monday"),
      new PuzzleInfo(MONDAY, puzzleNames.NYTCLASSIC2, puzzleIDs.NYTCLASSIC2, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Monday"),
      new PuzzleInfo(MONDAY, puzzleNames.NYTCLASSIC3, puzzleIDs.NYTCLASSIC3, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Monday"),
      new PuzzleInfo(TUESDAY, puzzleNames.BEQ_TUESDAY, puzzleIDs.BEQ_TUESDAY, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Tuesday"),
      new PuzzleInfo(THURSDAY, puzzleNames.JONESIN, puzzleIDs.JONESIN, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Thursday"),
      new PuzzleInfo(FRIDAY, puzzleNames.BEQ_FRIDAY, puzzleIDs.BEQ_FRIDAY, puzzleTypes.ACROSS_LITE, puzzleFlags.NO_FLAG, true, "Friday"),
      new PuzzleInfo(SUNDAY, puzzleNames.KFSPREMIER, puzzleIDs.KFSPREMIER, puzzleTypes.UCLICK, puzzleFlags.NO_FLAG, true, "Sunday"),
      new PuzzleInfo(SUNDAY, puzzleNames.BOSTON_GLOBE, puzzleIDs.BOSTON_GLOBE, puzzleTypes.BOSTON_GLOBE, puzzleFlags.NO_ARCHIVE, true, "Sunday, no archive"),
    ];
  }

  parseDate(date) {
    var d = new Date(date);

    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  
  puzzleSelected(id, date) {
    const puzzle = this.state.preferences.puzzles[id];
    const host = window.location.hostname;

    var d = this.parseDate(date);
    const url = `http://${host}:3001/puzzle/${puzzle.ID}/${d.year}/${d.month}/${d.day}`;
    this.loadPuzzle(puzzle.name, url, puzzle.type, d.year - 2000, d.month, d.day);
  }
  
  handleVisibilityChange() {
    if (
      !this.state.puzzleComplete &&
      this.state.preferences.timePuzzle &&
      this.state.puzzleStartTime
    ) {
      if (document[this.hidden]) {
	this.setState((curState) => { return ({ timerOn: false, showModal: false, puzzleTime: Date.now() - curState.puzzleStartTime }); });
      } else {
	this.setState((curState) => { return ({ timerOn: true, showModal: false, puzzleStartTime: Date.now() - curState.puzzleTime }); });
      }
    }
  }

  onClueClicked(d, clueNumber) {
    const { clueNumbers } = this.state;

    let i, j;

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
          if (solution[i][j] !== ".") {
            ++clueNumber;
            incrementClueNumber = false;
            downNumbers.push(clueNumber);
          }
        } else if (solution[i - 1][j] === "." && solution[i][j] !== ".") {
          if (incrementClueNumber) {
            ++clueNumber;
            incrementClueNumber = false;
          }
          downNumbers.push(clueNumber);
        }

        if (j === 0) {
          if (incrementClueNumber && solution[i][j] !== ".") {
            ++clueNumber;
            incrementClueNumber = false;
          }

          if (solution[i][j] !== ".") {
            acrossNumbers.push(clueNumber);
          }
        } else if (solution[i][j - 1] === "." && solution[i][j] !== ".") {
          if (incrementClueNumber) {
            ++clueNumber;
            incrementClueNumber = false;
          }

          if (solution[i][j] !== ".") {
            acrossNumbers.push(clueNumber);
          }
        }

        if (solution[i][j] !== ".") {
          ++incorrectAnswers;
        }

        if (incrementClueNumber === false) {
          clueNumbers[i][j] = clueNumber;
        } else {
          clueNumbers[i][j] = 0;
        }

        userInput[i][j] = solution[i][j] === "." ? "." : "";
        incrementClueNumber = true;
      }
    }

    const [ x, y ]  = this.findFirstSquare(solution);

    this.setState({
      acrossNumbers: acrossNumbers,
      downNumbers: downNumbers,
      clueNumbers: clueNumbers,
      userInput: userInput,
      selectedX: x,
      selectedY: y,
      incorrectAnswers: incorrectAnswers,
      totalAnswers: incorrectAnswers,
    });
  }

  findFirstSquare(gridSolution) {
    let i = 0;
    let j = 0;

    for (i = 0; i < gridSolution.length; i++) {
      for (j = 0; j < gridSolution[0].length; j++) {
	if (gridSolution[i][j] !== ".") {
	  return [ j, i ];
	}
      }
    }
    return [0, 0];
  }

  savePuzzle() {
    const { puzzleName, puzzleYear, puzzleMonth, puzzleDay } = this.state;
    
    if (puzzleName && puzzleYear && puzzleMonth && puzzleDay) {
      ls.set("lastpuzzle", `${puzzleName}-${puzzleYear}-${puzzleMonth}-${puzzleDay}`);

      PuzzleStore.storePuzzle(
	puzzleName,
	puzzleYear,
	puzzleMonth,
	puzzleDay,
	{
          acrossNumbers: this.state.acrossNumbers,
          downNumbers: this.state.downNumbers,
          clueNumbers: this.state.clueNumbers,
          userInput: this.state.userInput,
          acrossClues: this.state.acrossClues,
          downClues: this.state.downClues,
          circledClues: this.state.circledClues,
          gridSolution: this.state.gridSolution,
          gridWidth: this.state.gridWidth,
          gridHeight: this.state.gridHeight,
          meta: this.state.meta,
	  selectedX: this.state.selectedX,
	  selectedY: this.state.selectedY,
	  incorrectAnswers: this.state.incorrectAnswers,
	  totalAnswers: this.state.totalAnswers,
	  puzzleComplete: this.state.puzzleComplete,
	  gridDirection: this.state.gridDirection,
	  puzzleTime: Date.now() - this.state.puzzleStartTime,
	  timerOn: this.state.timerOn,
	  inputState: this.state.inputState,
	}
      );
    }
  }

  loadPreferences() {
    const defaultPrefs = {
      endOfWord: "next",
      spaceBar: "change",
      enterKey: "next",
      skipExisting: false,
      showWrongAnswers: false,
      timePuzzle: true,
      puzzles: this.puzzles,
    };

    var prefs = JSON.parse(ls.get("preferences")) || defaultPrefs;

    if (!prefs.puzzles) {
      prefs.puzzles = this.puzzles;
    }

    return prefs;
  }

  loadPuzzle(
    puzzleName,
    puzzle,
    puzzleType,
    puzzleYear,
    puzzleMonth,
    puzzleDay
  ) {
    const prefs = this.loadPreferences();
    
    this.setState({
      isLoading: true,
      preferences: prefs,
      puzzleComplete: false,
    });

    const p = PuzzleStore.getPuzzle(
      puzzleName,
      puzzleYear,
      puzzleMonth,
      puzzleDay
    );

    if (p) {
      this.setState({ showPuzzleList: false, isLoading: false, ...p, puzzleStartTime: Date.now() - p.puzzleTime });
      return;
    }

    var puz;

    if (puzzleType === puzzleTypes.ACROSS_LITE) {
      puz = new PuzParser();
    } else if (puzzleType === puzzleTypes.WSJ) {
      puz = new WSJParser();
    } else if (puzzleType === puzzleTypes.UCLICK) {
      puz = new LATimesParser();
    } else if (puzzleType === puzzleTypes.BRAINSONLY_COM) {
      puz = new BrainsOnlyParser();
    } else if (puzzleType === puzzleTypes.ONLINE_CROSSWORDS) {
      puz = new OnlineCrosswordsParser();
    } else if (puzzleType === puzzleTypes.BOSTON_GLOBE) {
      puz = new BostonGlobeParser();
    }

    puz.setUrl(puzzle).then((data) => {
      this.buildGrid(data.solution);

      const entities = new AllHtmlEntities();

      let len = data.solution.length;
      let i;
      let gridSolution = [];

      for (i = 0; i < len; i++) {
        gridSolution[i] = [];
	var j;
	for (j = 0; j < data.solution[i].length; j++) {
	  if (typeof data.solution[i][j] === "string") {
	    gridSolution[i][j] = data.solution[i][j].toUpperCase();
	  } else if (typeof data.solution[i][j] === "object") {
	    gridSolution[i][j] = data.solution[i][j]['0'].toUpperCase();
	  }
	}
      }

      const acrossClues = data.clues[0].map((c) => {
        return entities.decode(c);
      });
      const downClues = data.clues[1].map((c) => {
        return entities.decode(c);
      });

      var inputState = [];

      for (i = 0; i < data.height; i++) {
	inputState[i] = Array(data.width).fill(inputStates.NO_INPUT);
      }

      PuzzleStore.storePuzzle(puzzleName, puzzleYear, puzzleMonth, puzzleDay, {
        acrossNumbers: this.state.acrossNumbers,
        downNumbers: this.state.downNumbers,
        clueNumbers: this.state.clueNumbers,
        userInput: this.state.userInput,
        acrossClues: acrossClues,
        downClues: downClues,
        circledClues: data.circledClues,
        gridSolution: gridSolution,
        gridWidth: data.width,
        gridHeight: data.height,
        meta: data.meta,
	selectedX: this.state.selectedX,
	selectedY: this.state.selectedY,
	inputState: inputState,
      });

      this.setState({
	puzzleName: puzzleName,
	puzzleType: puzzleType,
	puzzleYear: puzzleYear,
	puzzleMonth: puzzleMonth,
	puzzleDay: puzzleDay,
	showPuzzleList: false,
        isLoading: false,
        acrossClues: acrossClues,
        downClues: downClues,
        circledClues: data.circledClues,
        gridSolution: gridSolution,
        gridWidth: data.width,
        gridHeight: data.height,
        meta: data.meta,
	inputState: inputState,
	puzzleStartTime: 0,
	puzzleTime: 0,
	timerOn: false,
	showIncorrectTotal: false,
	incorrectTotalShown: false,
      });
    }).catch((error) => {
      alert("Unable to load puzzle: " + error);
      this.setState({ showPuzzleList: false, isLoading: false, ...p });
    });
  }

  loadPrefs() {
    const defaultPrefs = {
      endOfWord: "next",
      spaceBar: "change",
      enterKey: "next",
      skipExisting: false,
      showWrongAnswers: false,
      timePuzzle: true,
    };

    return ls.get("preferences") || JSON.stringify(defaultPrefs);
  }

  componentDidMount() {
    const lastPuzzle = ls.get("lastpuzzle");
    const prefs = this.loadPreferences();
    
    if (lastPuzzle) {
      const vals = lastPuzzle.split('-');
      const p = PuzzleStore.getPuzzle(vals[0], vals[1], vals[2], vals[3]);
      if (p) {
	this.setState( { preferences: prefs, isLoading: false, ...p, puzzleStartTime: Date.now() - p.puzzleTime });
	return;
      }
    } 

    this.setState( { isLoading: false, preferences: prefs, showPuzzleList: true } );
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
      while (solution[selectedY][startWord] !== "." && startWord > 0)
        --startWord;

      if (solution[selectedY][startWord] === ".") ++startWord;

      endWord = selectedX;
      while (
        endWord < this.state.gridWidth &&
        solution[selectedY][endWord] !== "."
      )
        ++endWord;

      word = solution[selectedY].join("");
      word = word.substring(startWord, endWord);
    } else {
      startWord = selectedY;
      while (solution[startWord][selectedX] !== "." && startWord > 0)
        --startWord;

      if (solution[startWord][selectedX] === ".") ++startWord;

      endWord = selectedY;
      while (
        endWord < this.state.gridHeight &&
        solution[endWord][selectedX] !== "."
      )
        ++endWord;

      let col = [];
      let i = 0;

      for (i = startWord; i < endWord; i++) col.push(solution[i][selectedX]);

      word = col.join("");
    }

    word = word.split(" ").join("_");

    return { value: word, length: endWord - startWord };
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
    const { data, inputType, navigationType, shiftKey } = event;
    const {
      userInput,
      selectedX,
      selectedY,
      gridDirection,
      gridSolution,
      inputState,
    } = this.state;

    if (
      inputType === "deleteContentBackward" ||
      inputType === "deleteContentForward"
    ) {
      let { incorrectAnswers, totalAnswers }  = this.state;

      if (userInput[selectedY][selectedX] !== "") {
	++totalAnswers;
	
	if (userInput[selectedY][selectedX] === gridSolution[selectedY][selectedX]) {
          ++incorrectAnswers;
	}
      }

      userInput[selectedY][selectedX] = "";
      inputState[selectedY][selectedX] = inputStates.NO_INPUT;
      
      this.setState({ userInput, totalAnswers, incorrectAnswers, inputState });
      this.focusPreviousInput(selectedX, selectedY);

      return;
    }

    if (navigationType !== "" && data === "") {
      if (navigationType === "cursorLeft") {
        if (gridDirection === direction.ACROSS) {
          this.focusLeft(selectedX, selectedY);
        } else {
          this.reverseDirection();
        }
      }

      if (navigationType === "cursorRight") {
        if (gridDirection === direction.ACROSS) {
          this.focusRight(selectedX, selectedY);
        } else {
          this.reverseDirection();
        }
      }

      if (navigationType === "cursorUp") {
        if (gridDirection === direction.DOWN) {
          this.focusUp(selectedX, selectedY);
        } else {
          this.reverseDirection();
        }
      }

      if (navigationType === "cursorDown") {
        if (gridDirection === direction.DOWN) {
          this.focusDown(selectedX, selectedY);
        } else {
          this.reverseDirection();
        }
      }
    }

    if (data === "Tab") {
      if (gridDirection === direction.ACROSS) {
	if (shiftKey) {
	  this.focusLeft(selectedX, selectedY);
	} else {
	  this.focusRight(selectedX, selectedY);
	}
      } else {
	if (shiftKey) {
	  this.focusUp(selectedX, selectedY);
	} else {
	  this.focusDown(selectedX, selectedY);
	}
      }
    }
    
    if (data === "Enter") {
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

    if (data === ".") {
      if (gridDirection === direction.ACROSS) {
        this.focusRight(selectedX, selectedY);
      } else {
        this.focusDown(selectedX, selectedY);
      }
    }

    if (data === ",") {
      if (gridDirection === direction.ACROSS) {
        this.focusLeft(selectedX, selectedY);
      } else {
        this.focusUp(selectedX, selectedY);
      }
    }

    if (data === " " && this.state.preferences.spaceBar === "change") {
      this.reverseDirection();
    }

    if (
      data &&
      data.length === 1 &&
	((data === " " && this.state.preferences.spaceBar !== "change") ||
        (data >= "a" && data <= "z") ||
        (data >= "A" && data <= "Z") ||
        (data >= "0" && data <= "9"))
    ) {
      let { totalAnswers, incorrectAnswers, inputState } = this.state;

      if (
        !this.state.puzzleComplete &&
          this.state.preferences.timePuzzle &&
	  this.state.puzzleStartTime === 0
      ) {
	this.setState({ timerOn: true, puzzleStartTime: Date.now() });
      }

      if (userInput[selectedY][selectedX] === '') {
	--totalAnswers;
      }
      
      /* answer was correct - now it might not be ... */
      if (
        userInput[selectedY][selectedX] ===  gridSolution[selectedY][selectedX]
      ) {
        ++incorrectAnswers;
      }

      userInput[selectedY][selectedX] = data.toUpperCase();

      if (
        userInput[selectedY][selectedX].toUpperCase() === gridSolution[selectedY][selectedX].toUpperCase()
      ) {
        --incorrectAnswers;
	inputState[selectedY][selectedX] = inputStates.CORRECT;
      } else {
	inputState[selectedY][selectedX] = inputStates.INCORRECT;
      }

      this.setState({ totalAnswers, inputState, userInput, incorrectAnswers });

      if (totalAnswers === 0 && incorrectAnswers !== 0) {
	this.setState( { showIncorrectTotal: true } );
      }
      
      if (incorrectAnswers === 0) {
        this.savePuzzle();
        this.setState({ timerOn: false, puzzleComplete: true });
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
          this.focusClue(acrossNumbers[i - 1]);
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
          this.focusClue(downNumbers[i - 1]);
          return;
        }
      }

      this.reverseDirection();
      this.focusClue(
        this.state.acrossNumbers[this.state.acrossNumbers.length - 1]
      );
    }
  }

  focusOnEmptySpace(x, y) {
    const { gridHeight, gridWidth, gridDirection, userInput } = this.state;

    if (userInput[y][x] === ' ') {
      this.setFocus(x, y);
      return;
    }
    
    if (gridDirection === direction.ACROSS) {
      var newX = x;

      while (newX < gridWidth && userInput[y][newX] !== '' && userInput[y][newX] !== '.') {
	++newX;
      }

      if (newX < gridWidth && userInput[y][newX] === '') {
	this.setFocus(newX, y);
	return;
      }
    } else {
      var newY = y;

      while (newY < gridHeight && userInput[newY][x] !== '' && userInput[newY][x] !== '.') {
	++newY;
      }

      if (newY < gridHeight && userInput[newY][x] === '') {
	this.setFocus(x, newY);
	return;
      }
    }

    this.setFocus(x, y);
  }
  
  /* TODO - move to empty spon in newly focused word */
  focusClue(num) {
    const { gridWidth, gridHeight, clueNumbers } = this.state;
    let i, j;

    for (i = 0; i < gridHeight; i++) {
      for (j = 0; j < gridWidth; j++) {
        if (clueNumbers[i][j] === num) {
	  if (this.state.preferences.skipExisting) {
	    this.focusOnEmptySpace(j, i);
	  } else {
            this.setFocus(j, i);
	  }
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
          this.focusClue(acrossNumbers[i + 1]);
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
          this.focusClue(downNumbers[i + 1]);
          return;
        }
      }

      this.reverseDirection();
      this.focusClue(1);
    }
  }

  focusLeft(x, y) {
    let xpos = x;

    // reset to the end and work back
    if (xpos === 0) {
      xpos = this.state.gridWidth;
    }
    
    --xpos;

    while (xpos >= 0 && this.state.gridSolution[y][xpos] === ".") {
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

    if (xpos === gridWidth - 1) {
      xpos = -1;
    }
    
    ++xpos;

    while (xpos < gridWidth && gridSolution[y][xpos] === ".") {
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

    if (ypos === gridHeight - 1) {
      ypos = -1;
    }
    
    ++ypos;
    while (ypos < gridHeight && gridSolution[ypos][x] === ".") {
      ++ypos;
    }

    if (ypos >= gridHeight) {
      ypos = y;
    }

    this.setFocus(x, ypos);
  }

  setFocus(x, y) {
    document
      .getElementById(y + ":" + x)
      .getElementsByTagName("input")[0]
      .focus();
    this.setState({ selectedX: x, selectedY: y });
  }

  focusUp(x, y) {
    const { gridHeight, gridSolution } = this.state;
    let ypos = y;

    if (ypos === 0) {
      ypos = gridHeight;
    }
    
    --ypos;

    while (ypos >= 0 && gridSolution[ypos][x] === ".") {
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
    const { gridWidth, gridHeight, gridSolution, gridDirection } = this.state;

    if (gridDirection === direction.ACROSS) {
      if (x > 0) {
        x--;

	if (gridSolution[y][x] === ".") {
	  while (x < gridWidth && gridSolution[y][x] === ".") {
	    ++x;
	  }
	}
        nextX = x;
      }
    } else {
      if (y > 0) {
        --y;

	if (gridSolution[y][x] === ".") {
	  while (y < gridHeight && gridSolution[y][x] === ".") {
	    ++y;
	  }
	}

        nextY = y;
      }
    }

    this.setFocus(nextX, nextY);
  }

  focusNextInput(x, y) {
    let nextX = x,
      nextY = y;

    const {
      gridSolution,
      gridDirection,
      gridWidth,
      gridHeight,
      preferences,
    } = this.state;

    if (gridDirection === direction.ACROSS) {
      if (x < gridWidth) {
        ++x;

        if (
          ((x < gridWidth && gridSolution[this.state.selectedY][x] === ".") ||
            x === gridWidth) &&
          preferences.endOfWord === "next"
        ) {
          this.focusNextClue();
          return;
        }

        if (preferences.skipExisting) {
          const { userInput } = this.state;
          let wordX = x;

          while (
            wordX < gridWidth &&
            userInput[y][wordX] !== "" &&
            userInput[y][wordX] !== "."
          ) {
            ++wordX;
          }

          /* no blank space in word - just move to the next */
          if (wordX === gridWidth || userInput[y][wordX] === ".") {
            nextX = x - 1;
          } else {
	    x = wordX;
	  }
        }

        if (x < gridWidth && gridSolution[y][x] !== ".") {
          nextX = x;
        }
      }
    } else {
      if (y < gridHeight) {
        ++y;

        if (
          ((y < gridHeight && gridSolution[y][x] === ".") ||
            y === gridHeight) &&
          preferences.endOfWord === "next"
        ) {
          this.focusNextClue();
          return;
        }

        if (preferences.skipExisting) {
          const { userInput } = this.state;
          let wordY = y;

          while (
            wordY < gridHeight &&
            userInput[wordY][x] !== "" &&
            userInput[wordY][x] !== "."
          ) {
            ++wordY;
          }

          if (wordY === gridHeight || userInput[wordY][x] === ".") {
            nextY = y - 1;
          } else {
	    y = wordY;
	  }
        }

        if (y < gridHeight && gridSolution[y][x] !== ".") {
          nextY = y;
        }
      }
    }

    this.setFocus(nextX, nextY);
  }

  gridDirectionChange(e) {
    this.setState({ gridDirection: e.target.value });
  }

  findSelectedClue(dir) {
    const { gridSolution, selectedX, selectedY, clueNumbers } = this.state;

    if (clueNumbers[selectedY][selectedX] !== 0) {
      if (dir === direction.ACROSS) {
        if (selectedX === 0 || gridSolution[selectedY][selectedX - 1] === ".") {
          return clueNumbers[selectedY][selectedX];
        }
      } else {
        if (selectedY === 0 || gridSolution[selectedY - 1][selectedX] === ".") {
          return clueNumbers[selectedY][selectedX];
        }
      }
    }

    if (dir === direction.ACROSS) {
      let x = selectedX;

      while (x > 0 && gridSolution[selectedY][x - 1] !== ".") {
        --x;
      }

      return clueNumbers[selectedY][x];
    } else {
      let y = selectedY;

      while (y > 0 && gridSolution[y - 1][selectedX] !== ".") {
        --y;
      }

      return clueNumbers[y][selectedX];
    }
  }

  resumePuzzle() {
    this.setState((curState) => { return { timerOn: true, showModal: false, puzzleStartTime: Date.now() - curState.puzzleTime }; });
  }
  
  displayPrefs() {
    this.setState((curState) => {
      return {
        showPrefs: !curState.showPrefs,
	showPuzzleList: false,
      };
    });
  }

  setPreferences(prefs) {
    const p = merge({}, this.state.preferences, prefs);

    ls.set("preferences", JSON.stringify(p));

    this.setState({ preferences: p });
  }

  reveal(option) {
    const {
      gridHeight,
      gridWidth,
      gridDirection,
      userInput,
      gridSolution,
      selectedX,
      selectedY,
      incorrectAnswers,
      inputState,
    } = this.state;

    let ia = incorrectAnswers;
    let puzzleComplete = false;
    
    if (option.value === "Letter") {
      if (
        userInput[selectedY][selectedX] !== gridSolution[selectedY][selectedX]
      ) {
        --ia;
      }
      userInput[selectedY][selectedX] = gridSolution[selectedY][selectedX];
      inputState[selectedY][selectedX] = inputStates.CORRECT;
    } else if (option.value === "Word") {
      if (gridDirection === direction.ACROSS) {
        let x = selectedX;

        while (x > 0 && gridSolution[selectedY][x - 1] !== ".") {
          --x;
        }

        while (x < gridWidth && gridSolution[selectedY][x] !== ".") {
          if (
            userInput[selectedY][x] !== gridSolution[selectedY][x]
          ) {
            --ia;
          }
          userInput[selectedY][x] = gridSolution[selectedY][x];
	  inputState[selectedY][x] = inputStates.CORRECT;
          ++x;
        }
      } else {
        let y = selectedY;

        while (y > 0 && gridSolution[y - 1][selectedX] !== ".") {
          --y;
        }

        while (y < gridHeight && gridSolution[y][selectedX] !== ".") {
          if (
            userInput[y][selectedX] !== gridSolution[y][selectedX]
          ) {
            --ia;
          }
          userInput[y][selectedX] = gridSolution[y][selectedX];
	  inputState[y][selectedX] = inputStates.CORRECT;
          ++y;
        }
      }
    } else {
      let i, j;

      ia = 0;

      for (i = 0; i < gridHeight; i++) {
        for (j = 0; j < gridWidth; j++) {
          userInput[i][j] = gridSolution[i][j];
	  inputState[i][j] = inputStates.CORRECT;
        }
      }
    }

    if (ia === 0) {
      puzzleComplete = true;
    }
    
    this.setState({ timerOn: !puzzleComplete, userInput, incorrectAnswers: ia, puzzleComplete, inputState });
  }

  renderRevealDropdown() {
    const options = ["Letter", "Word", "Solution"];

    return (
      <div className="RevealDropdown">
        <Dropdown
          tabindex="0"
          arrowOpen=<span className="Dropdown-arrow-open" />
	  arrowClosed=<span className="Dropdown-arrow-closed" />
          options={options}
          onChange={this.reveal}
          placeholder={"Reveal..."}
        />
      </div>
    );
  }

  check(option) {
    const { userInput, gridSolution, inputState, selectedX, selectedY } = this.state;
    
    if (option.value === "Grid") {
      this.checkPuzzle();
    } else if (option.value === "Letter") {
      if (userInput[selectedY][selectedX] !== '' && userInput[selectedY][selectedX].toUpperCase() !== gridSolution[selectedY][selectedX].toUpperCase()) {
	inputState[selectedY][selectedX] = inputStates.CHECKED_INCORRECT;
	this.setState({ inputState });
      }
    } else {
      this.checkWord();
    }
  }

  checkWord() {
    const { inputState, gridWidth, gridHeight, gridDirection, userInput, gridSolution, selectedX, selectedY } = this.state;

    if (gridDirection === direction.ACROSS) {
      let x = selectedX;

      while (x > 0 && gridSolution[selectedY][x - 1] !== '.') {
	x--;
      }

      while (x < gridWidth && gridSolution[selectedY][x] !== '.') {
	if (userInput[selectedY][x] !== '' && userInput[selectedY][x].toUpperCase() !== gridSolution[selectedY][x].toUpperCase()) {
	  inputState[selectedY][x] = inputStates.CHECKED_INCORRECT;
	}
	++x;
      }
    } else {
      let y = selectedY;

      while (y > 0 && gridSolution[y - 1][selectedX] !== '.') {
	y--;
      }

      while (y < gridHeight && gridSolution[y][selectedX] !== '.') {
	if (userInput[y][selectedX] !== '' && userInput[y][selectedX].toUpperCase() !== gridSolution[y][selectedX].toUpperCase()) {
	  inputState[y][selectedX] = inputStates.CHECKED_INCORRECT;
	}
	++y;
      }
    }

    this.setState({ inputState });
  }

  checkPuzzle() {
    var i, j;
    const { inputState, gridHeight, gridWidth, userInput, gridSolution } = this.state;

    for (i = 0; i < gridHeight; i++) {
      for (j = 0; j < gridWidth; j++) {
        if (userInput[i][j] !== '' && 
            userInput[i][j].toUpperCase() !== gridSolution[i][j].toUpperCase()
        ) {
	  inputState[i][j] = inputStates.CHECKED_INCORRECT;
        }
      }
    }

    this.setState({ inputStates });
  }

  renderCheck() {
    const options = ["Letter", "Word", "Grid"];

    return (
      <div className="CheckDropdown">
        <Dropdown
          tabindex="0"
          arrowOpen=<span className="Dropdown-arrow-open" />
	  arrowClosed=<span className="Dropdown-arrow-closed" />
          options={options}
          onChange={this.check}
          placeholder={"Check..."}
        />
      </div>
    );
  }

  puzzleList() {
    this.savePuzzle();
    this.setState( { showPuzzleList: true } );
  }
  
  renderLoad() {
    return <button onClick={this.puzzleList}>Puzzles...</button>;
  }

  showMain() {
    this.setState( {showPrefs: false, showPuzzleList: false } );
  }

  pauseTimer() {
    this.setState((prevState) => { return( { timerOn: false , showModal: true, puzzleTime: Date.now() - prevState.puzzleStartTime  } ); } );
  }
  
  renderStopwatch() {
    if (!this.state.preferences.timePuzzle) {
      return null;
    }

    return (
	<Stopwatch
          timerOn={this.state.timerOn}
          timerStart={this.state.puzzleStartTime}
          timerTime={this.state.puzzleTime}
          onPause={this.pauseTimer}
	/>
    );
  }
  
  renderRestOfHeader() {
    if (this.state.showPrefs || this.state.showPuzzleList) {
      return (
	<div className="RightHeader">
	  <GoX
            style={{ cursor: "hand", width: "2rem", height: "2rem", right: 0 }}
            aria-label="Close Preferences"
            onClick={this.showMain}
          />
	</div>
      );
    }

    return (
      <div className="RightHeader">
	{this.renderStopwatch()}
        {this.renderLoad()}
        {this.renderCheck()}
        {this.renderRevealDropdown()}
      </div>
    );
  }

  renderHeader() {
    return (
      <div className="PuzzleHeader">
	<div className="MenuHeader">
          <div className="PreferencesIcon">
            <GoGear
              style={{ cursor: "hand", width: "2rem", height: "2rem" }}
              aria-label="Preferences"
              onClick={this.displayPrefs}
            />
          </div>
          {this.renderRestOfHeader()}
        </div>
	<div>
	  {this.renderGridClues()}
        </div>
      </div>
    );
  }

  renderGridClues() {
    const { acrossNumbers, acrossClues, downNumbers, downClues, puzzleComplete } = this.state;

    const acrossNumber = this.findSelectedClue(direction.ACROSS);
    const downNumber = this.findSelectedClue(direction.DOWN);

    if (this.state.showPrefs || this.state.showPuzzleList) {
      return null;
    }

    if (puzzleComplete) {
      return (
	<div>
	  <span className="Complete">Puzzle Complete!</span>
	</div>
      );
    }
    
    let acrossIndex = 0,
      downIndex = 0;
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

    if (this.state.gridDirection === direction.ACROSS) {
      return (
	  <div
            className={classnames({
              GridClues: true,
              obscured: this.state.showModal,
            })}
	  >
            <span className="GridClueNumber">{acrossNumber}A. </span>
            <span className="GridClue">{acrossClues[acrossIndex]}</span>
            <br />
            <span className="GridClueNumber">{downNumber}D. </span>
            <span className="GridClue">{downClues[downIndex]}</span>
	  </div>
      );
    } else {
      return (
	  <div
            className={classnames({
              GridClues: true,
              obscured: this.state.showModal,
            })}
	  >
            <span className="GridClueNumber">{downNumber}D. </span>
            <span className="GridClue">{downClues[downIndex]}</span>
            <br />
            <span className="GridClueNumber">{acrossNumber}A. </span>
            <span className="GridClue">{acrossClues[acrossIndex]}</span>
	  </div>
      );
    }
  }

  findMatches(clue) {
    let matches = [];
    matches.across = [];
    matches.down = [];

    var acrossReg = new RegExp(/-Across/i);
    var downReg = new RegExp(/-Down/i);

    let am = acrossReg.exec(clue);
    let dm = downReg.exec(clue);

    // both clues match -Across && -Down ...
    if (am && dm) {
      let acrStr = "";
      let dwnStr = "";
      
      if (am.index < dm.index) {
	acrStr = clue.substring(am.index);
	dwnStr = clue.substring(am.index + 6, dm.index);
      } else {
	acrStr = clue.substring(dm.index + 4, am.index);
	dwnStr = clue.substring(dm.index);
      }

      var numReg = new RegExp(/(\d+)-/g);

      let acm = numReg.exec(acrStr);

      while (acm) {
	matches.across = matches.across.concat(acm[1]);
	acm = numReg.exec(acrStr);
      }

      let dwm = numReg.exec(dwnStr);

      while (dwm) {
	matches.down = matches.downconcat(dwm[1]);

	dwm = numReg.exec(dwnStr);
      }

    } else {
      var reg = new RegExp(/(\d+)-/g);
      let m = reg.exec(clue);

      while (m) {
	if (am) {
	  matches.across = matches.across.concat(m[1]);
	} else {
	  matches.down = matches.down.concat(m[1]);
	}
	m = reg.exec(clue);
      }
    }

    return matches;
  }
  
  renderBody() {
    if (this.state.showPuzzleList) {
      return (
	  <PuzzleList
            puzzles={this.state.preferences.puzzles}
            puzzleSelected={this.puzzleSelected}
	  />
      );
    } else if (this.state.showPrefs) {
      return (
        <Preferences
          setPreferences={this.setPreferences}
          {...this.state.preferences }
        />
      );
    } else {
      const acrossNumber = this.findSelectedClue(direction.ACROSS);
      const downNumber = this.findSelectedClue(direction.DOWN);

      const acrossClue = this.state.acrossClues[this.state.acrossNumbers.indexOf(acrossNumber)];
      const downClue = this.state.downClues[this.state.downNumbers.indexOf(downNumber)];

      let matches = [];
      if (this.state.gridDirection === direction.ACROSS) {
	matches = this.findMatches(acrossClue);
      } else {
	matches = this.findMatches(downClue);
      }	

      return (
        <div className="PuzzleBody">
          <div className="PuzzleGrid">
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
	      inputState={this.state.inputState}
	      showWrongAnswers={this.state.preferences.showWrongAnswers}
	      downAlternates={matches.down}
	      acrossAlternates={matches.across}
            />
          <ClueList
            obscured={this.state.showModal}
            title={"Across"}
            clueDirection={direction.ACROSS}
            clueNumbers={this.state.acrossNumbers}
            clues={this.state.acrossClues}
            selectedClue={acrossNumber}
            primary={this.state.gridDirection === direction.ACROSS}
            onClueClicked={this.onClueClicked}
            gridHeight={this.state.gridHeight}
   	    alternates={matches.across}
          />
          <ClueList
            obscured={this.state.showModal}
            title={"Down"}
            clueDirection={direction.DOWN}
            clueNumbers={this.state.downNumbers}
            clues={this.state.downClues}
            selectedClue={downNumber}
            primary={this.state.gridDirection === direction.DOWN}
            onClueClicked={this.onClueClicked}
            gridHeight={this.state.gridHeight}
   	    alternates={matches.down}
          />
          </div>
        </div>
      );
    }
  }

  renderFooter() {
    if (this.state.showPrefs || this.state.showPuzzleList) {
      return null;
    }

    return (
      <div className="PuzzleFooter">
        <span className="Title">{this.state.meta.title}</span> <br />
        <span className="Author">{this.state.meta.author}</span> <br />
        <span className="Published">{this.state.meta.publisher}</span> <br />
      </div>
    );
  }

  closeAlmost() {
    this.setState({ showIncorrectTotal: false, incorrectTotalShown: true });
  }
    
  renderModal() {
    if (this.state.puzzleComplete || this.state.showPuzzleList || this.state.showPrefs) {
      return null;
    }

    if (this.state.showIncorrectTotal) {
      if (this.state.incorrectTotalShow) {
	return null;
      }

      return (
	  <ReactModal
	    isOpen={this.state.showIncorrectTotal}
	    contentLable="Almost there ..."
	    onRequestClose={this.closeAlmost}
	    shouldCloseOnOverlayClick={false}
	    className="Modal"
	  >
 	    <div className="PuzzleModalContent">
	      <h2> Almost there ...</h2>
	      <p>You have {this.state.incorrectAnswers} incorrect answers in the puzzle.</p>
              <button onClick={this.closeAlmost}>Resume</button>
	    </div>
	  </ReactModal>
      );
    }

    return (
      <ReactModal
        isOpen={this.state.showModal}
        contentLabel="Puzzle Paused"
        onRequestClose={this.resumePuzzle}
        shouldCloseOnOverlayClick={false}
        className="Modal"
      >
        <div className="PuzzleModalContent">
          <h2>Puzzle paused.</h2>
          <button onClick={this.resumePuzzle}>Resume</button>
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
