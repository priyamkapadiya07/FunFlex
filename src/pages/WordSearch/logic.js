const DIRECTIONS = {
  ALL: [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]], // All 8 directions
};

const SETTINGS = {
  Easy: { size: 8, wordCount: 4, dirs: DIRECTIONS.ALL },
  Medium: { size: 9, wordCount: 6, dirs: DIRECTIONS.ALL },
  Hard: { size: 10, wordCount: 8, dirs: DIRECTIONS.ALL },
  Expert: { size: 11, wordCount: 10, dirs: DIRECTIONS.ALL },
  Impossible: { size: 12, wordCount: 12, dirs: DIRECTIONS.ALL },
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

  // Pick random words that fit in the grid
  const validWords = wordList.filter(w => w.length <= settings.size);
  const selectedWords = [];
  const wordsCopy = [...validWords];
  
  for (let i = 0; i < settings.wordCount && wordsCopy.length > 0; i++) {
    const idx = getRandomInt(wordsCopy.length);
    selectedWords.push(wordsCopy[idx]);
    wordsCopy.splice(idx, 1);
  }

  // Initialize grid
  const grid = Array(settings.size).fill(null).map(() => Array(settings.size).fill(''));
  const placedWords = [];

  // Try to place each word
  for (const word of selectedWords) {
    const possiblePlacements = [];

    // Scan the entire board and all directions for valid placements
    for (let r = 0; r < settings.size; r++) {
      for (let c = 0; c < settings.size; c++) {
        for (const dir of settings.dirs) {
          let fits = true;
          let intersections = 0;

          for (let i = 0; i < word.length; i++) {
            const nr = r + i * dir[0];
            const nc = c + i * dir[1];

            // Out of bounds
            if (nr < 0 || nr >= settings.size || nc < 0 || nc >= settings.size) {
              fits = false;
              break;
            }

            const gridChar = grid[nr][nc];
            // Conflict
            if (gridChar !== '' && gridChar !== word[i]) {
              fits = false;
              break;
            }

            // Intersection
            if (gridChar === word[i]) {
              intersections++;
            }
          }

          if (fits) {
            possiblePlacements.push({ r, c, dir, intersections });
          }
        }
      }
    }

    if (possiblePlacements.length > 0) {
      // Find the maximum number of intersections available
      const maxIntersections = Math.max(...possiblePlacements.map(p => p.intersections));
      
      // Filter out only the best placements (to maximize overlaps)
      const bestPlacements = possiblePlacements.filter(p => p.intersections === maxIntersections);
      
      // Randomly pick one of the best placements
      const chosen = bestPlacements[getRandomInt(bestPlacements.length)];

      // Place the word on the grid
      for (let i = 0; i < word.length; i++) {
        const nr = chosen.r + i * chosen.dir[0];
        const nc = chosen.c + i * chosen.dir[1];
        grid[nr][nc] = word[i];
      }
      
      placedWords.push(word);
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
