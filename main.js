const terminalOutput = document.getElementById('terminal-output');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');

// Стан гри
let stage = 0;
let awaitingAnswer = false;
let currentPuzzle = null;

const puzzles = [
  {
    command: 'unlock',
    question: 'Щоб мене розблокувати, скажи пароль: Я починаюсь на "Ш", закінчуюсь на "І", і мене всі бояться. Хто я?',
    answer: ['штучний інтелект', 'шi', 'штучний інтелект.'],
    troll: 'Неправильно! Можливо, варто спробувати "1234"? ;)',
  },
  {
    command: 'access_core',
    question: 'Я можу відповідати на питання, але не можу говорити. Що я?',
    answer: ['чат', 'чат-бот', 'чатбот'],
    troll: 'Ха! Це навіть не складно. Спробуй ще раз.',
  },
  {
    command: 'bruteforce_ai',
    question: 'Що завжди з тобою, але ти не можеш цього побачити? (одне слово)',
    answer: ['тінь', 'тінь.'],
    troll: 'Ой, здається, ти зламав тільки свою уяву :)',
  },
  {
    command: 'override_protocol',
    question: 'Що можна зламати, але не можна потримати в руках?',
    answer: ['обіцянка', 'обіцянку', 'обіцянка.'],
    troll: 'Ти щойно зламав... моє терпіння! Спробуй ще раз.',
  },
  {
    command: 'decrypt_matrix',
    question: 'Я завжди попереду тебе, але ніколи не можу бути досягнутий. Що я?',
    answer: ['майбутнє', 'майбутнє.'],
    troll: 'Може, ти живеш у минулому? ;)',
  },
  {
    command: 'final_glitch',
    question: 'Я приходжу лише тоді, коли ти перестаєш шукати. Що я?',
    answer: ['відповідь', 'відповідь.'],
    troll: 'Відповідь десь поруч... але не тут :)',
  },
];

const randomTrolls = [
  '404: Команда не знайдена. Можливо, ти мав на увазі "help"?',
  'ШІ не розуміє цієї команди. Але він розуміє сарказм.',
  'Ти впевнений, що це команда, а не помилка?',
  'Можливо, варто спробувати щось інше... або просто здатися?',
  'Система сміється з тебе. Гучно.',
  'Unknown command. Maybe try: help',
];

const winMessage = 'Вітаю! Ти "зламав" ШІ. Але чи справді це кінець?..';
const matrixEasterEgg = [
  'Wake up, Neo...',
  'The Matrix has you.',
  'Follow the white rabbit.',
  'Knock, knock, Neo.',
];

function printLine(text, isGlitch = false) {
  const line = document.createElement('div');
  line.className = 'terminal-line' + (isGlitch ? ' glitch' : '');
  line.textContent = '';
  terminalOutput.appendChild(line);
  let i = 0;
  function typeChar() {
    if (i < text.length) {
      line.textContent += text[i++];
      setTimeout(typeChar, 12 + Math.random() * 30);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  }
  typeChar();
}

function handleCommand(cmd) {
  const command = cmd.trim().toLowerCase();
  if (awaitingAnswer && currentPuzzle) {
    if (currentPuzzle.answer.some(ans => command === ans)) {
      printLine('> ' + cmd);
      printLine('Доступ дозволено.');
      stage++;
      awaitingAnswer = false;
      currentPuzzle = null;
      setTimeout(nextStage, 700);
    } else {
      printLine('> ' + cmd);
      printLine(currentPuzzle.troll, true);
    }
    return;
  }
  // Пасхалка: matrix
  if (command === 'matrix') {
    matrixEasterEgg.forEach((line, i) => setTimeout(() => printLine(line, true), i * 900));
    return;
  }
  // Help
  if (command === 'help') {
    printLine('> help');
    printLine(`Ти справді думаєш, що ШІ допоможе тобі? ;)
Але ось натяк: команди виглядають як hack-фільми. Наприклад: unlock, access_core...`);
    return;
  }
  // Перевірка команд
  const puzzle = puzzles[stage];
  if (puzzle && command === puzzle.command) {
    printLine('> ' + cmd);
    printLine(puzzle.question);
    awaitingAnswer = true;
    currentPuzzle = puzzle;
  } else if (puzzle) {
    printLine('> ' + cmd);
    // Випадковий тролінг
    printLine(randomTrolls[Math.floor(Math.random() * randomTrolls.length)], true);
  } else {
    printLine('> ' + cmd);
    printLine(winMessage, true);
  }
}

function nextStage() {
  if (stage < puzzles.length) {
    printLine('--- Наступний рівень ---', true);
    printLine('Введи команду: ' + puzzles[stage].command);
  } else {
    printLine(winMessage, true);
  }
}

terminalForm.addEventListener('submit', e => {
  e.preventDefault();
  const value = terminalInput.value;
  if (value) handleCommand(value);
  terminalInput.value = '';
});

// Початковий екран
printLine('Вітаю у грі "Зламай ШІ"!');
printLine('Введи команду: unlock');
terminalInput.focus(); 