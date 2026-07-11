const DIRECTIONS = {
  EASY: [[0, 1], [1, 0]], // Right, Down
  MEDIUM: [[0, 1], [1, 0], [0, -1], [-1, 0]], // Right, Down, Left, Up
  HARD: [[0, 1], [1, 0], [1, 1], [1, -1]], // Right, Down, Diag-DR, Diag-DL
  EXPERT: [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]], // All 8 directions
};

const SETTINGS = {
  Easy: { size: 8, wordCount: 4, dirs: DIRECTIONS.EASY },
  Medium: { size: 10, wordCount: 6, dirs: DIRECTIONS.MEDIUM },
  Hard: { size: 12, wordCount: 8, dirs: DIRECTIONS.HARD },
  Expert: { size: 14, wordCount: 10, dirs: DIRECTIONS.EXPERT },
  Impossible: { size: 15, wordCount: 12, dirs: DIRECTIONS.EXPERT },
};

const getRandomInt = (max) => Math.floor(Math.random() * max);

const getRandomLetter = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[getRandomInt(letters.length)];
};

export const generatePuzzle = async (difficulty) => {
  const settings = SETTINGS[difficulty] || SETTINGS.Easy;
  
  // Fetch word list
  let wordList = [];
  try {
    const res = await fetch(`/words/${difficulty.toLowerCase()}.json`);
    wordList = await res.json();
  } catch (e) {
    console.error('Failed to load words, using fallback', e);
    wordList = ["RELAX", "PLAY", "FUN", "GAME", "SMILE"];
  }

  // Pick random words
  const selectedWords = [];
  const wordsCopy = [...wordList];
  for (let i = 0; i < settings.wordCount && wordsCopy.length > 0; i++) {
    const idx = getRandomInt(wordsCopy.length);
    const word = wordsCopy[idx];
    if (word.length <= settings.size) {
      selectedWords.push(word);
    }
    wordsCopy.splice(idx, 1);
  }

  // Initialize grid
  const grid = Array(settings.size).fill(null).map(() => Array(settings.size).fill(''));

  const placedWords = [];

  // Try to place each word
  for (const word of selectedWords) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const dir = settings.dirs[getRandomInt(settings.dirs.length)];
      const row = getRandomInt(settings.size);
      const col = getRandomInt(settings.size);

      // Check if word fits
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dir[0];
        const c = col + i * dir[1];
        if (r < 0 || r >= settings.size || c < 0 || c >= settings.size) {
          fits = false;
          break;
        }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = row + i * dir[0];
          const c = col + i * dir[1];
          grid[r][c] = word[i];
        }
        placedWords.push(word);
        placed = true;
      }
    }
  }

  // Fill remaining spaces
  for (let r = 0; r < settings.size; r++) {
    for (let c = 0; c < settings.size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = getRandomLetter();
      }
    }
  }

  return {
    grid,
    wordsToFind: placedWords,
  };
};
