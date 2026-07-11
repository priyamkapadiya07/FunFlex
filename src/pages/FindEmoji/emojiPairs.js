export const EMOJI_PAIRS = {
  Easy: [
    { base: '🍎', odd: '🍅' }, { base: '🐶', odd: '🦊' }, { base: '🚗', odd: '🚕' },
    { base: '⚽', odd: '🏀' }, { base: '🌞', odd: '🌝' }, { base: '🌲', odd: '🌳' },
    { base: '🍔', odd: '🍟' }, { base: '🐷', odd: '🐮' }, { base: '🍉', odd: '🍈' },
    { base: '🌎', odd: '🌕' }, { base: '🎈', odd: '🏮' }, { base: '💎', odd: '🧿' },
    { base: '🎁', odd: '🎀' }, { base: '📚', odd: '📓' }, { base: '🎵', odd: '🎶' },
    { base: '🎸', odd: '🎷' }, { base: '🔥', odd: '💧' }, { base: '⭐', odd: '🌟' }
  ],
  Medium: [
    { base: '😀', odd: '😃' }, { base: '🐻', odd: '🐨' }, { base: '🍔', odd: '🥪' },
    { base: '✈️', odd: '🛸' }, { base: '🔥', odd: '💥' }, { base: '🎸', odd: '🎻' },
    { base: '🌻', odd: '🌼' }, { base: '🍁', odd: '🍂' }, { base: '🍄', odd: '🌰' },
    { base: '🦁', odd: '🐯' }, { base: '🍇', odd: '🫐' }, { base: '🍵', odd: '☕' },
    { base: '⏰', odd: '⏱️' }, { base: '💡', odd: '🔦' }, { base: '🔑', odd: '🗝️' },
    { base: '✏️', odd: '🖋️' }, { base: '🔨', odd: '🪓' }, { base: '🛡️', odd: '🗡️' }
  ],
  Hard: [
    { base: '😁', odd: '😆' }, { base: '📗', odd: '📘' }, { base: '🐆', odd: '🐅' },
    { base: '🏢', odd: '🏨' }, { base: '🍓', odd: '🍒' }, { base: '😋', odd: '😛' },
    { base: '😗', odd: '😙' }, { base: '🤨', odd: '🧐' }, { base: '😟', odd: '😕' },
    { base: '😥', odd: '😰' }, { base: '🐪', odd: '🐫' }, { base: '🐊', odd: '🦖' },
    { base: '🕊️', odd: '🦅' }, { base: '🐋', odd: '🐬' }, { base: '🏔️', odd: '⛰️' },
    { base: '🌋', odd: '🗻' }, { base: '🏥', odd: '🏦' }, { base: '🏰', odd: '🏯' },
    { base: '📱', odd: '📲' }, { base: '💻', odd: '🖥️' }, { base: '💿', odd: '📀' }
  ],
  Expert: [
    { base: '👩‍🦰', odd: '👨‍🦰' }, { base: '🕰️', odd: '⏰' }, { base: '🚤', odd: '🛥️' },
    { base: '🏂', odd: '⛷️' }, { base: '🚆', odd: '🚈' }, { base: '🙂', odd: '🙃' },
    { base: '😶', odd: '😐' }, { base: '😑', odd: '😐' }, { base: '😏', odd: '😒' },
    { base: '😔', odd: '😌' }, { base: '😪', odd: '😴' }, { base: '😵', odd: '😲' },
    { base: '🤢', odd: '🤮' }, { base: '🤠', odd: '🥸' }, { base: '😸', odd: '😺' },
    { base: '😹', odd: '😂' }, { base: '😻', odd: '😍' }, { base: '😼', odd: '😽' },
    { base: '😾', odd: '😠' }, { base: '🙈', odd: '🙉' }, { base: '🙊', odd: '🙉' },
    { base: '🚶', odd: '🏃' }, { base: '👫', odd: '👬' }, { base: '👭', odd: '👫' },
    { base: '👕', odd: '👚' }, { base: '👞', odd: '👟' }, { base: '💼', odd: '🎒' }
  ],
  Impossible: [
    // Visual tricks with characters and near-identical emojis
    { base: 'O', odd: '0' }, { base: 'I', odd: 'l' }, { base: '1', odd: 'l' },
    { base: 'B', odd: '8' }, { base: 'S', odd: '5' }, { base: 'Z', odd: '2' },
    { base: '日', odd: '曰' }, { base: '大', odd: '犬' }, { base: '王', odd: '玉' },
    { base: '人', odd: '入' }, { base: '土', odd: '士' }, { base: '干', odd: '千' },
    { base: '己', odd: '已' }, { base: '未', odd: '末' }, { base: 'シ', odd: 'ツ' },
    { base: 'ン', odd: 'ソ' }, { base: '❕', odd: '❗' }, { base: '💵', odd: '💴' },
    { base: '🛡️', odd: '🔰' }, { base: '🕛', odd: '🕧' }, { base: '👱‍♀️', odd: '👱' },
    { base: '👨‍⚕️', odd: '👨‍🔬' }, { base: '👩‍🏫', odd: '👩‍🎓' }, { base: '🏃‍♂️', odd: '🚶‍♂️' },
    { base: '👍', odd: '👎' }, { base: '👇', odd: '👆' }, { base: '👈', odd: '👉' },
    { base: '🤛', odd: '🤜' }, { base: '🌒', odd: '🌖' }, { base: '🌓', odd: '🌗' },
    { base: '🌔', odd: '🌘' }, { base: '📉', odd: '📈' }, { base: '✂️', odd: '🖋️' },
    { base: '📎', odd: '🖇️' }, { base: '🔒', odd: '🔓' }, { base: '🔔', odd: '🔕' },
    { base: '⬛', odd: '◼️' }, { base: '⬜', odd: '◻️' }, { base: '⚪', odd: '🔘' }
  ]
};

export const GRID_SIZES = {
  Easy: 4,      // 4x4
  Medium: 6,    // 6x6
  Hard: 8,      // 8x8
  Expert: 10,   // 10x10
  Impossible: 12 // 12x12
};

export function generateEmojiGrid(difficulty) {
  const size = GRID_SIZES[difficulty] || 4;
  const pairs = EMOJI_PAIRS[difficulty] || EMOJI_PAIRS.Easy;
  
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const totalCells = size * size;
  
  const oddIndex = Math.floor(Math.random() * totalCells);
  
  const grid = [];
  let currentIndex = 0;
  
  // Sometimes flip base and odd randomly to increase variety further
  const swap = Math.random() > 0.5;
  const baseChar = swap ? pair.odd : pair.base;
  const oddChar = swap ? pair.base : pair.odd;
  
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      if (currentIndex === oddIndex) {
        row.push({ id: currentIndex, char: oddChar, isOdd: true });
      } else {
        row.push({ id: currentIndex, char: baseChar, isOdd: false });
      }
      currentIndex++;
    }
    grid.push(row);
  }
  
  return { grid, size };
}
