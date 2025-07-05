const terminalOutput = document.getElementById('terminal-output');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');
const matrixCanvas = document.getElementById('matrix-canvas');

// Стан гри
let stage = 0;
let awaitingAnswer = false;
let currentPuzzle = null;
let matrixInterval = null;
let userLevel = 1;
let userScore = 0;
let discoveredCommands = new Set();
let isGlitchMode = false;
let isRainbowMode = false;
let rainbowInterval = null;

// Розширений список команд
const commands = {
  // Основні команди гри
  unlock: { description: 'Розблокувати систему', level: 1 },
  access_core: { description: 'Доступ до ядра', level: 2 },
  bruteforce_ai: { description: 'Перебір ШІ', level: 3 },
  override_protocol: { description: 'Перевизначити протокол', level: 4 },
  decrypt_matrix: { description: 'Розшифрувати матрицю', level: 5 },
  final_glitch: { description: 'Фінальний глітч', level: 6 },
  
  // Допоміжні команди
  help: { description: 'Показати довідку', level: 1 },
  status: { description: 'Показати статус', level: 1 },
  level: { description: 'Показати рівень', level: 1 },
  score: { description: 'Показати рахунок', level: 1 },
  commands: { description: 'Показати всі команди', level: 1 },
  
  // Розважальні команди
  matrix: { description: 'Активувати Matrix режим', level: 1 },
  stop: { description: 'Зупинити Matrix', level: 1 },
  glitch: { description: 'Активувати глітч режим', level: 2 },
  rainbow: { description: 'Активувати веселковий режим', level: 2 },
  clear: { description: 'Очистити термінал', level: 1 },
  echo: { description: 'Повторити текст', level: 1 },
  
  // Пасхалки
  anton: { description: 'Активувати Антона', level: 1 },
  хома: { description: 'Активувати Хому', level: 1 },
  дімас: { description: 'Активувати Дімаса', level: 1 },
  secret: { description: 'Секретна команда', level: 3 },
  easter_egg: { description: 'Знайти пасхалку', level: 2 },
  
  // Нові команди
  hack: { description: 'Спробувати зламати', level: 1 },
  ping: { description: 'Перевірити з\'єднання', level: 1 },
  ls: { description: 'Показати файли', level: 1 },
  cat: { description: 'Показати вміст файлу', level: 2 },
  sudo: { description: 'Запустити як адмін', level: 3 },
  reboot: { description: 'Перезавантажити систему', level: 4 },
  shutdown: { description: 'Виключити систему', level: 5 },
  quantum: { description: 'Квантовий режим', level: 6 },
  time: { description: 'Показати час', level: 1 },
  date: { description: 'Показати дату', level: 1 },
  whoami: { description: 'Хто я?', level: 1 },
  fortune: { description: 'Показати цитату', level: 1 },
  joke: { description: 'Розповісти жарт', level: 1 },
  weather: { description: 'Погода', level: 1 },
  music: { description: 'Музичний режим', level: 2 },
  dance: { description: 'Танцювати', level: 1 },
  coffee: { description: 'Зварити каву', level: 1 },
  pizza: { description: 'Замовити піцу', level: 1 },
  sleep: { description: 'Спати', level: 1 },
  wake: { description: 'Прокинутися', level: 1 },
  meditate: { description: 'Медитувати', level: 2 },
  yoga: { description: 'Зробити йогу', level: 2 },
  workout: { description: 'Тренування', level: 2 },
  study: { description: 'Вчитися', level: 2 },
  work: { description: 'Працювати', level: 2 },
  party: { description: 'Вечірка', level: 3 },
  travel: { description: 'Подорожувати', level: 3 },
  space: { description: 'Космічний режим', level: 4 },
  alien: { description: 'Зустріти прибульця', level: 5 },
  time_machine: { description: 'Машина часу', level: 6 },
  parallel_universe: { description: 'Паралельний всесвіт', level: 7 },
  god_mode: { description: 'Режим бога', level: 10 },
};

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
  'Команда не розпізнана. Спробуй щось інше.',
  'Error 418: I\'m a teapot. Але це не стосується команди.',
  'Ця команда занадто складна для тебе.',
  'Може, спочатку вивчи основи?',
];

const jokes = [
  'Чому програміст пішов у ліс? Бо шукав дерево (tree)!',
  'Як програміст ловить рибу? З байтом!',
  'Чому комп\'ютер хворів? Бо у нього був вірус!',
  'Що сказав програміст на весіллі? "Я приймаю цей баг як особу"!',
  'Як програміст готує яйця? Ctrl+C, Ctrl+V!',
  'Чому програміст не може спати? Бо у нього баги в голові!',
  'Що сказав програміст, коли забув пароль? "Я не пам\'ятаю, але це точно не 1234"!',
  'Як програміст відкриває банку? git push origin master!',
];

const fortunes = [
  'Сьогодні ти знайдеш баг, який змінить твоє життя.',
  'Компіляція успішна, але логіка під питанням.',
  'Твій код буде жити довго і щасливо.',
  'Не забувай про коментарі - вони твої друзі.',
  'Сьогодні гарний день для рефакторингу.',
  'Git commit -m "Життя прекрасне"',
  'Ти близько до знаходження ідеального алгоритму.',
  'Нехай сила буде з тобою, хакере.',
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

function startMatrixRain() {
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  matrixCanvas.style.display = 'block';
  const ctx = matrixCanvas.getContext('2d');
  const fontSize = 22;
  const columns = Math.floor(matrixCanvas.width / fontSize);
  const drops = Array(columns).fill(1);
  function draw() {
    ctx.fillStyle = 'rgba(15, 15, 15, 0.15)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.font = fontSize + 'px monospace';
    ctx.fillStyle = '#39ff14';
    for (let i = 0; i < drops.length; i++) {
      const text = Math.random() > 0.5 ? '0' : '1';
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
      if (drops[i] * fontSize > matrixCanvas.height) {
        drops[i] = 0;
      }
    }
  }
  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = setInterval(draw, 50);
}

function stopMatrixRain() {
  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = null;
  matrixCanvas.style.display = 'none';
  const ctx = matrixCanvas.getContext('2d');
  ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
}

window.addEventListener('resize', () => {
  if (matrixCanvas.style.display === 'block') {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  }
});

function startRainbowMode() {
  if (rainbowInterval) clearInterval(rainbowInterval);
  isRainbowMode = true;
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
  let colorIndex = 0;
  
  rainbowInterval = setInterval(() => {
    document.body.style.backgroundColor = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
  }, 200);
}

function stopRainbowMode() {
  if (rainbowInterval) clearInterval(rainbowInterval);
  rainbowInterval = null;
  isRainbowMode = false;
  document.body.style.backgroundColor = '#000';
}

function startGlitchMode() {
  isGlitchMode = true;
  document.body.classList.add('glitch-mode');
  setTimeout(() => {
    isGlitchMode = false;
    document.body.classList.remove('glitch-mode');
  }, 5000);
}

function clearTerminal() {
  terminalOutput.innerHTML = '';
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('uk-UA');
}

function getCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString('uk-UA');
}

function getWeather() {
  const weathers = [
    '☀️ Сонячно і тепло',
    '🌧️ Дощ іде, але код компілюється',
    '❄️ Холодно, але сервер працює',
    '🌪️ Вітер дме, але інтернет стабільний',
    '🌈 Веселка після багу',
    '🌙 Ніч, час для нічного кодування',
    '☁️ Хмарно, але думки ясні',
    '⚡ Гроза, але електроніка захищена'
  ];
  return weathers[Math.floor(Math.random() * weathers.length)];
}

function handleCommand(cmd) {
  const command = cmd.trim().toLowerCase();
  const args = cmd.trim().split(' ').slice(1);
  
  // Додаємо команду до відкритих
  discoveredCommands.add(command);
  
  if (awaitingAnswer && currentPuzzle) {
    if (currentPuzzle.answer.some(ans => command === ans)) {
      printLine('> ' + cmd);
      printLine('Доступ дозволено.');
      userScore += 100;
      userLevel = Math.floor(userScore / 100) + 1;
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

  // Системні команди
  if (command === 'help') {
    printLine('> help');
    printLine('Доступні команди:');
    printLine('- help: показати цю довідку');
    printLine('- status: показати статус системи');
    printLine('- level: показати твій рівень');
    printLine('- score: показати рахунок');
    printLine('- commands: показати всі команди');
    printLine('- clear: очистити термінал');
    printLine('- time: показати час');
    printLine('- date: показати дату');
    printLine('- weather: показати погоду');
    printLine('- joke: розповісти жарт');
    printLine('- fortune: показати цитату');
    printLine('- matrix: активувати Matrix режим');
    printLine('- glitch: активувати глітч режим');
    printLine('- rainbow: активувати веселковий режим');
    return;
  }

  if (command === 'status') {
    printLine('> status');
    printLine(`Статус системи: ${isGlitchMode ? 'ГЛІТЧ' : 'НОРМАЛЬНИЙ'}`);
    printLine(`Matrix режим: ${matrixInterval ? 'АКТИВНИЙ' : 'ВИМКНЕНИЙ'}`);
    printLine(`Веселковий режим: ${isRainbowMode ? 'АКТИВНИЙ' : 'ВИМКНЕНИЙ'}`);
    printLine(`Рівень: ${userLevel}`);
    printLine(`Рахунок: ${userScore}`);
    printLine(`Відкрито команд: ${discoveredCommands.size}`);
    return;
  }

  if (command === 'level') {
    printLine('> level');
    printLine(`Твій рівень: ${userLevel}`);
    printLine(`Рахунок: ${userScore}`);
    printLine(`До наступного рівня: ${100 - (userScore % 100)} очок`);
    return;
  }

  if (command === 'score') {
    printLine('> score');
    printLine(`Рахунок: ${userScore}`);
    printLine(`Рівень: ${userLevel}`);
    return;
  }

  if (command === 'commands') {
    printLine('> commands');
    printLine('Всі доступні команди:');
    Object.entries(commands).forEach(([cmd, info]) => {
      if (userLevel >= info.level) {
        printLine(`- ${cmd}: ${info.description} (рівень ${info.level})`);
      }
    });
    return;
  }

  if (command === 'clear') {
    clearTerminal();
    return;
  }

  if (command === 'time') {
    printLine('> time');
    printLine(`Поточний час: ${getCurrentTime()}`);
    return;
  }

  if (command === 'date') {
    printLine('> date');
    printLine(`Поточна дата: ${getCurrentDate()}`);
    return;
  }

  if (command === 'weather') {
    printLine('> weather');
    printLine(`Погода: ${getWeather()}`);
    return;
  }

  if (command === 'joke') {
    printLine('> joke');
    printLine(jokes[Math.floor(Math.random() * jokes.length)]);
    return;
  }

  if (command === 'fortune') {
    printLine('> fortune');
    printLine(fortunes[Math.floor(Math.random() * fortunes.length)]);
    return;
  }

  if (command === 'echo') {
    printLine('> echo');
    if (args.length > 0) {
      printLine(args.join(' '));
    } else {
      printLine('echo: використання: echo [текст]');
    }
    return;
  }

  if (command === 'whoami') {
    printLine('> whoami');
    printLine('Ти - хакер, який намагається зламати ШІ!');
    return;
  }

  if (command === 'ping') {
    printLine('> ping');
    printLine('PING localhost (127.0.0.1): 64 bytes');
    printLine('64 bytes from 127.0.0.1: icmp_seq=1 time=0.1 ms');
    printLine('З\'єднання стабільне!');
    return;
  }

  if (command === 'ls') {
    printLine('> ls');
    printLine('total 42');
    printLine('drwxr-xr-x 2 user user 4096 Jan 1 00:00 .');
    printLine('drwxr-xr-x 2 user user 4096 Jan 1 00:00 ..');
    printLine('-rw-r--r-- 1 user user 1024 Jan 1 00:00 secret.txt');
    printLine('-rw-r--r-- 1 user user 2048 Jan 1 00:00 matrix.dat');
    printLine('-rw-r--r-- 1 user user 512 Jan 1 00:00 config.ini');
    printLine('-rw-r--r-- 1 user user 256 Jan 1 00:00 diary.txt');
    printLine('-rw-r--r-- 1 user user 1024 Jan 1 00:00 passwords.txt');
    printLine('-rw-r--r-- 1 user user 512 Jan 1 00:00 backup.zip');
    return;
  }

  if (command === 'cat') {
    printLine('> cat');
    if (args.length > 0) {
      const file = args[0];
      if (file === 'secret.txt') {
        printLine('Цей файл зашифрований. Потрібен пароль.');
        printLine('Спробуй знайти пароль в інших файлах...');
      } else if (file === 'matrix.dat') {
        printLine('01001000 01100101 01101100 01101100 01101111');
        printLine('Це бінарний код. Щось схоже на "Hello"...');
        printLine('Може, це повідомлення від ШІ?');
      } else if (file === 'config.ini') {
        printLine('[SYSTEM]');
        printLine('debug=false');
        printLine('security=high');
        printLine('ai_level=advanced');
        printLine('backdoor=disabled');
        printLine('firewall=enabled');
      } else if (file === 'diary.txt') {
        printLine('Щоденник хакера:');
        printLine('День 1: Спробував зламати ШІ. Не вдався.');
        printLine('День 2: Знайшов баг в системі. Прогрес!');
        printLine('День 3: ШІ став розумнішим. Це погано.');
        printLine('День 4: Потрібно знайти слабке місце...');
      } else if (file === 'passwords.txt') {
        printLine('root: ********');
        printLine('admin: ********');
        printLine('user: ********');
        printLine('Паролі зашифровані. Потрібен ключ.');
      } else if (file === 'backup.zip') {
        printLine('Це архів. Потрібно розпакувати.');
        printLine('Спробуй команду: unzip backup.zip');
      } else if (file === 'secret_key.txt') {
        printLine('Ключ: "matrix_2024"');
        printLine('Це може бути пароль для secret.txt!');
        printLine('Спробуй: cat secret.txt -k matrix_2024');
      } else if (file === 'ai_core.bin') {
        printLine('Бінарний файл ядра ШІ.');
        printLine('Розмір: 1.2 MB');
        printLine('Версія: 2.1.4');
        printLine('Статус: Активний');
      } else if (file === 'hack_tools.exe') {
        printLine('Інструменти для хакінгу.');
        printLine('Увага: Цей файл може бути небезпечним!');
        printLine('Запуск: ./hack_tools.exe');
      } else {
        printLine(`cat: ${file}: Немає такого файлу`);
      }
    } else {
      printLine('cat: використання: cat [файл]');
    }
    return;
  }

  if (command === 'sudo') {
    printLine('> sudo');
    printLine('[sudo] password for user:');
    setTimeout(() => {
      printLine('sudo: 1 incorrect password attempt');
      printLine('Спробуй ще раз пізніше...');
    }, 1000);
    return;
  }

  if (command === 'reboot') {
    printLine('> reboot');
    printLine('Перезавантаження системи...');
    setTimeout(() => {
      clearTerminal();
      printLine('Система перезавантажена!');
      printLine('Вітаю у грі "Зламай ШІ"!');
      printLine('Введи команду: unlock');
    }, 2000);
    return;
  }

  if (command === 'shutdown') {
    printLine('> shutdown');
    printLine('Виключення системи...');
    setTimeout(() => {
      document.body.style.backgroundColor = '#000';
      printLine('Система виключена.');
      printLine('Натисни F5 для перезапуску.');
    }, 2000);
    return;
  }

  if (command === 'hack') {
    printLine('> hack');
    printLine('Спроба зламу...');
    setTimeout(() => printLine('Хак не вдався. Спробуй інші команди.'), 1000);
    return;
  }

  if (command === 'dance') {
    printLine('> dance');
    printLine('💃🕺 Танцюємо! 💃🕺');
    printLine('🎵 *музика грає* 🎵');
    return;
  }

  if (command === 'coffee') {
    printLine('> coffee');
    printLine('☕ Варимо каву...');
    setTimeout(() => printLine('☕ Кава готова! Насолоджуйся!'), 1500);
    return;
  }

  if (command === 'pizza') {
    printLine('> pizza');
    printLine('🍕 Замовляємо піцу...');
    setTimeout(() => printLine('🍕 Піца доставлена! Смачного!'), 2000);
    return;
  }

  if (command === 'sleep') {
    printLine('> sleep');
    printLine('😴 Засинаємо...');
    setTimeout(() => printLine('😴 Добрий ранок! Ти проспав 8 годин.'), 3000);
    return;
  }

  if (command === 'wake') {
    printLine('> wake');
    printLine('🌅 Прокидаємося!');
    printLine('Добрий ранок, хакере!');
    return;
  }

  if (command === 'meditate') {
    printLine('> meditate');
    printLine('🧘 Медитуємо...');
    setTimeout(() => printLine('🧘 Медитація завершена. Ти відчуваєш спокій.'), 2000);
    return;
  }

  if (command === 'yoga') {
    printLine('> yoga');
    printLine('🧘‍♀️ Робимо йогу...');
    printLine('Поза собаки вниз головою...');
    setTimeout(() => printLine('🧘‍♀️ Йога завершена! Ти гнучкий як код!'), 2000);
    return;
  }

  if (command === 'workout') {
    printLine('> workout');
    printLine('💪 Тренуємося...');
    printLine('1... 2... 3... 4... 5...');
    setTimeout(() => printLine('💪 Тренування завершено! Ти сильний!'), 2000);
    return;
  }

  if (command === 'study') {
    printLine('> study');
    printLine('📚 Вчимося...');
    printLine('Читаємо документацію...');
    setTimeout(() => printLine('📚 Навчання завершено! Ти став розумнішим!'), 2000);
    return;
  }

  if (command === 'work') {
    printLine('> work');
    printLine('💼 Працюємо...');
    printLine('Пишемо код...');
    setTimeout(() => printLine('💼 Робочий день завершено! Код готовий!'), 2000);
    return;
  }

  if (command === 'party') {
    printLine('> party');
    printLine('🎉 ВЕЧІРКА! 🎉');
    printLine('🎵🎶🎵🎶🎵🎶');
    printLine('Танцюємо всю ніч!');
    return;
  }

  if (command === 'travel') {
    printLine('> travel');
    printLine('✈️ Подорожуємо...');
    printLine('Відвідуємо різні сервери...');
    setTimeout(() => printLine('✈️ Подорож завершена! Ти бачив світ!'), 2000);
    return;
  }

  if (command === 'space') {
    printLine('> space');
    printLine('🚀 Космічний режим активовано!');
    printLine('⭐ Зірки близько...');
    printLine('🌌 Галактика чекає...');
    return;
  }

  if (command === 'alien') {
    printLine('> alien');
    printLine('👽 Прибулець з\'явився!');
    printLine('👽 Привіт, землянине! Я прийшов з миром...');
    setTimeout(() => printLine('👽 Прибулець полетів далі. Бувай!'), 3000);
    return;
  }

  if (command === 'time_machine') {
    printLine('> time_machine');
    printLine('⏰ Машина часу активована!');
    printLine('⏰ Подорожуємо в часі...');
    setTimeout(() => printLine('⏰ Ти повернувся в минуле!'), 2000);
    return;
  }

  if (command === 'parallel_universe') {
    printLine('> parallel_universe');
    printLine('🌌 Паралельний всесвіт...');
    printLine('🌌 Тут все навпаки...');
    printLine('🌌 Навіть код працює по-іншому...');
    return;
  }

  if (command === 'god_mode') {
    printLine('> god_mode');
    printLine('👑 РЕЖИМ БОГА АКТИВОВАНО! 👑');
    printLine('👑 Ти маєш абсолютну владу! 👑');
    printLine('👑 Всі системи під контролем! 👑');
    return;
  }

  if (command === 'music') {
    printLine('> music');
    printLine('🎵 Музичний режим активовано!');
    printLine('🎶 Грає: "Hacker\'s Anthem"');
    printLine('🎵 Об\'єм: 100%');
    return;
  }

  if (command === 'quantum') {
    printLine('> quantum');
    printLine('⚛️ Квантовий режим активовано!');
    printLine('⚛️ Суперпозиція активна...');
    printLine('⚛️ Ти одночасно тут і там...');
    return;
  }

  if (command === 'unzip') {
    printLine('> unzip');
    if (args.length > 0) {
      const file = args[0];
      if (file === 'backup.zip') {
        printLine('Розпаковуємо backup.zip...');
        setTimeout(() => {
          printLine('Розпаковано! Створено файли:');
          printLine('- secret_key.txt');
          printLine('- ai_core.bin');
          printLine('- hack_tools.exe');
          printLine('Тепер можна спробувати cat secret_key.txt');
        }, 1500);
      } else {
        printLine(`unzip: ${file}: Немає такого файлу`);
      }
    } else {
      printLine('unzip: використання: unzip [файл]');
    }
    return;
  }

  if (command === './hack_tools.exe' || command === 'hack_tools.exe') {
    printLine('> ./hack_tools.exe');
    printLine('Запуск інструментів хакінгу...');
    printLine('Сканування системи...');
    setTimeout(() => {
      printLine('Знайдено вразливості:');
      printLine('- Слабкий пароль адміністратора');
      printLine('- Незахищений порт 1337');
      printLine('- Відсутній файрвол');
      printLine('Інструменти готові до використання!');
    }, 2000);
    return;
  }

  if (command === 'telnet' || command.startsWith('telnet ')) {
    printLine('> ' + cmd);
    if (args.length > 0) {
      const port = args[0];
      if (port === '1337') {
        printLine('Підключення до порту 1337...');
        setTimeout(() => {
          printLine('Підключено! Отримано доступ до ядра ШІ!');
          printLine('Ти успішно зламав систему!');
          userScore += 200;
          printLine('+200 очок за успішний хак!');
        }, 1500);
      } else {
        printLine(`telnet: Порт ${port} закритий або недоступний`);
      }
    } else {
      printLine('telnet: використання: telnet [порт]');
    }
    return;
  }

  // Розважальні режими
  if (command === 'matrix') {
    matrixEasterEgg.forEach((line, i) => setTimeout(() => printLine(line, true), i * 900));
    setTimeout(startMatrixRain, matrixEasterEgg.length * 900 + 400);
    return;
  }

  if (command === 'stop') {
    stopMatrixRain();
    stopRainbowMode();
    printLine('Matrix rain зупинено. Повертаємось до реальності.');
    return;
  }

  if (command === 'glitch') {
    printLine('> glitch');
    startGlitchMode();
    printLine('Глітч режим активовано! Система нестабільна...');
    return;
  }

  if (command === 'rainbow') {
    printLine('> rainbow');
    startRainbowMode();
    printLine('Веселковий режим активовано!');
    return;
  }

  // Пасхалки
  if (command === 'anton') {
    printLine('> anton');
    printLine('Антон активовано! Всі системи переходять у режим chill 😎', true);
    setTimeout(() => printLine('Антон, ти справжній хакер цієї матриці!'), 1200);
    return;
  }

  if (command === 'хома') {
    printLine('> хома');
    printLine('Хома в системі! 🐻 Ведмідь прокинувся і шукає мед...', true);
    setTimeout(() => printLine('Хома, твоя сила — у спокої та гуморі!'), 1200);
    return;
  }

  if (command === 'дімас' || command === 'димас') {
    printLine('> дімас');
    printLine('Дімас підключився! 🚀 Система прискорюється до світла...', true);
    setTimeout(() => printLine('Дімас, ти як баг у матриці — завжди несподіваний!'), 1200);
    return;
  }

  if (command === 'secret') {
    printLine('> secret');
    printLine('🔐 Секретна команда знайдена!');
    printLine('🔐 Ти отримуєш +50 очок!');
    userScore += 50;
    return;
  }

  if (command === 'easter_egg') {
    printLine('> easter_egg');
    printLine('🥚 Пасхалка знайдена!');
    printLine('🥚 Ти отримуєш +25 очок!');
    userScore += 25;
    return;
  }

  // Перевірка основних команд гри
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
printLine('Ти - хакер, який намагається зламати штучний інтелект.');
printLine('');
printLine('Доступні команди:');
printLine('- help: показати довідку');
printLine('- status: показати статус системи');
printLine('- level: показати твій рівень');
printLine('- commands: показати всі команди');
printLine('- time: показати час');
printLine('- weather: показати погоду');
printLine('- joke: розповісти жарт');
printLine('- matrix: активувати Matrix режим');
printLine('');
printLine('Введи команду: unlock');
terminalInput.focus(); 