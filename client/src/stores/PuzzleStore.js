import ls from "local-storage";

class PuzzleStore {
  clearExpiredData() {
    Object.entries(ls).forEach(([key, val]) => {
      var expDate = new Date(Date.now() - 12096e5);

      const res = key.split("-");
      const date = res[1].split(":");

      if (
        new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2])) <
        expDate
      ) {
        delete ls[key];
      }
    });
  }

  deletePuzzle(puzzleName, puzzleYear, puzzleMonth, puzzleDay) {
    delete ls.remove(`${puzzleName}-${puzzleYear}:${puzzleMonth}:${puzzleDay}`);
  }
  
  storePuzzle(puzzleName, puzzleYear, puzzleMonth, puzzleDay, puzzleData) {
    ls.set(
      `${puzzleName}-${puzzleYear}:${puzzleMonth}:${puzzleDay}`,
      JSON.stringify(puzzleData)
    );
  }

  getPuzzle(puzzleName, puzzleYear, puzzleMonth, puzzleDay) {
    return JSON.parse(
      ls.get(`${puzzleName}-${puzzleYear}:${puzzleMonth}:${puzzleDay}`)
    );
  }
}

const puzzleStore = new PuzzleStore();
export default puzzleStore;
