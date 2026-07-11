const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function generateMathProblem(difficulty) {
  let equation = '';
  let answer = 0;

  switch (difficulty) {
    case 'Easy': {
      // Basic addition/subtraction (1 to 20)
      const a = getRandomInt(1, 15);
      const b = getRandomInt(1, 10);
      if (Math.random() > 0.5) {
        equation = `${a} + ${b} = ?`;
        answer = a + b;
      } else {
        const max = Math.max(a, b);
        const min = Math.min(a, b);
        equation = `${max} - ${min} = ?`;
        answer = max - min;
      }
      break;
    }
    case 'Medium': {
      // Double digit add/sub, single digit mult
      const type = Math.random();
      if (type > 0.6) {
        const a = getRandomInt(3, 9);
        const b = getRandomInt(3, 9);
        equation = `${a} × ${b} = ?`;
        answer = a * b;
      } else if (type > 0.3) {
        const a = getRandomInt(15, 50);
        const b = getRandomInt(10, 40);
        equation = `${a} + ${b} = ?`;
        answer = a + b;
      } else {
        const a = getRandomInt(30, 99);
        const b = getRandomInt(10, a - 1);
        equation = `${a} - ${b} = ?`;
        answer = a - b;
      }
      break;
    }
    case 'Hard': {
      // Double digit mult (10-15), order of operations, division
      const type = Math.random();
      if (type > 0.7) {
        const a = getRandomInt(11, 15);
        const b = getRandomInt(5, 12);
        equation = `${a} × ${b} = ?`;
        answer = a * b;
      } else if (type > 0.4) {
        // a + b * c
        const a = getRandomInt(5, 25);
        const b = getRandomInt(3, 9);
        const c = getRandomInt(3, 9);
        equation = `${a} + ${b} × ${c} = ?`;
        answer = a + (b * c);
      } else {
        // perfect division
        const b = getRandomInt(4, 12);
        const ans = getRandomInt(5, 15);
        const a = b * ans;
        equation = `${a} ÷ ${b} = ?`;
        answer = ans;
      }
      break;
    }
    case 'Expert': {
      // Percentages, Squares, Advanced mixed
      const type = Math.random();
      if (type > 0.6) {
        // Percentage of a multiple of 10
        const percents = [15, 20, 25, 30, 40, 75];
        const p = percents[getRandomInt(0, percents.length - 1)];
        const val = getRandomInt(5, 20) * 20; // 100 to 400
        equation = `${p}% of ${val} = ?`;
        answer = (p / 100) * val;
      } else if (type > 0.3) {
        // Squares
        const a = getRandomInt(11, 20);
        equation = `${a}² = ?`;
        answer = a * a;
      } else {
        // (a * b) - c
        const a = getRandomInt(12, 19);
        const b = getRandomInt(4, 9);
        const c = getRandomInt(10, 30);
        equation = `(${a} × ${b}) - ${c} = ?`;
        answer = (a * b) - c;
      }
      break;
    }
    case 'Impossible': {
      // College level mental math tricks
      const type = Math.random();
      if (type > 0.75) {
        // Large multiplication
        const a = getRandomInt(21, 35);
        const b = getRandomInt(15, 25);
        equation = `${a} × ${b} = ?`;
        answer = a * b;
      } else if (type > 0.5) {
        // Complex percentage
        const percents = [45, 65, 85, 35];
        const p = percents[getRandomInt(0, percents.length - 1)];
        const val = getRandomInt(11, 49) * 20; 
        equation = `${p}% of ${val} = ?`;
        answer = (p / 100) * val;
      } else if (type > 0.25) {
        // (a^2) - (b * c)
        const a = getRandomInt(15, 25);
        const b = getRandomInt(12, 19);
        const c = getRandomInt(5, 12);
        equation = `${a}² - (${b} × ${c}) = ?`;
        answer = (a * a) - (b * c);
      } else {
        // square root multiplication
        const roots = [9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
        const val = roots[getRandomInt(6, roots.length - 1)]; // 81 to 225
        const actualRoot = Math.sqrt(val);
        const mult = getRandomInt(12, 25);
        equation = `√${val} × ${mult} = ?`;
        answer = actualRoot * mult;
      }
      break;
    }
    default:
      equation = `1 + 1 = ?`;
      answer = 2;
  }

  // Generate 3 plausible wrong answers
  const options = new Set([answer]);
  
  // Plausible errors: off by 1, off by 10, common mult errors
  while (options.size < 4) {
    let offset;
    const r = Math.random();
    if (r > 0.7) {
      offset = getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    } else if (r > 0.4) {
      offset = getRandomInt(1, 3) * 10 * (Math.random() > 0.5 ? 1 : -1);
    } else {
      // Just some random noise based on magnitude
      const mag = Math.max(1, Math.floor(answer * 0.2));
      offset = getRandomInt(-mag, mag);
    }
    
    let wrong = answer + offset;
    if (wrong !== answer && wrong >= 0) {
      // Ensure positive answers if answer is positive, mostly to not look weird, unless answer is negative
      if (answer > 0 && wrong < 0) wrong = Math.abs(wrong);
      options.add(wrong);
    }
  }

  const optionsArray = Array.from(options);
  // Shuffle array
  for (let i = optionsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
  }

  return { equation, answer, options: optionsArray };
}
