const terminal = document.getElementById('terminal');
const terminalContainer = document.querySelector('.terminal-container');
let currentLine = 0;
let isAnimating = true;

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLastLoginLine() {
  const now = new Date();
  const day = dayNames[now.getDay()];
  const month = monthNames[now.getMonth()];
  const date = now.getDate();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `Last login: ${day} ${month} ${date} ${hh}:${mm}:${ss} on tty1`;
}

let terminalLines = [
  "",
  "whoami",
  "  Andrew Webster - Cybersecurity student | Security+ certified",
  "cat status.txt",
  "  > Open to part-time, internship, and early-career cloud or security roles in Tampa or remote.",
  "ls ~/portfolio",
  '  <a href="about.html" class="hidden-link">about.txt</a>  <a href="projects.html" class="hidden-link">projects/</a>  <a href="resume.html" class="hidden-link">resume.pdf</a>  <a href="contact.html" class="hidden-link">contact.sh</a>',
  "cat about.txt",
  "  > Experience with AWS labs, scripting, networking fundamentals, troubleshooting, and technical instruction.",
  "  > Focused on practical cloud and security work, clear communication, and steady technical growth.",
  "help",
  "  about  projects  resume  contact  clear  help",
];
terminalLines[0] = getLastLoginLine();

const urlParams = new URLSearchParams(window.location.search);
const skipIntro = urlParams.get('noIntro') === 'true';

function createTerminalLine(content, isPrompt = true) {
  const line = document.createElement('div');
  line.className = 'line';

  const promptSpan = document.createElement('span');
  promptSpan.className = 'prompt';
  promptSpan.textContent = isPrompt ? 'andrew@webster:~$ ' : '';

  const contentSpan = document.createElement('span');
  contentSpan.innerHTML = content;

  line.append(promptSpan, contentSpan);
  terminal.appendChild(line);
  return contentSpan;
}

async function typeWithCursor(element, text) {
  return new Promise(resolve => {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'dynamic-cursor';

    function typeCharacter() {
      if (i < text.length) {
        element.textContent = text.slice(0, i);
        element.appendChild(cursor);
        i++;
        setTimeout(typeCharacter, 35);
      } else {
        resolve();
      }
    }

    typeCharacter();
  });
}

async function terminalBootSequence() {
  for (const line of terminalLines) {
    const isPromptLine = currentLine % 2 === 0;
    const contentElement = createTerminalLine('', isPromptLine);
    contentElement.innerHTML = line;
    const textContent = contentElement.textContent;
    contentElement.textContent = '';
    await typeWithCursor(contentElement, textContent);
    contentElement.innerHTML = line;
    const links = contentElement.querySelectorAll('a');
    links.forEach(link => link.classList.replace('hidden-link', 'visible-link'));
    currentLine++;
  }
  isAnimating = false;
  showInputCursor();
  showPersistentNav();
}

function printAllAtOnce() {
  for (const line of terminalLines) {
    const isPromptLine = currentLine % 2 === 0;
    const contentElement = createTerminalLine(line, isPromptLine);
    const links = contentElement.querySelectorAll('a');
    links.forEach(link => link.classList.replace('hidden-link', 'visible-link'));
    currentLine++;
  }
  isAnimating = false;
  showInputCursor();
  showPersistentNav();
}

function showInputCursor() {
  const inputLine = document.createElement('div');
  inputLine.className = 'line input-line';

  const prompt = document.createElement('span');
  prompt.className = 'prompt';
  prompt.textContent = 'andrew@webster:~$ ';

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'input-wrapper';

  const textarea = document.createElement('textarea');
  textarea.className = 'terminal-textarea';
  textarea.rows = 1;
  textarea.setAttribute('wrap', 'soft');

  const mirror = document.createElement('div');
  mirror.className = 'terminal-mirror';

  inputWrapper.appendChild(mirror);
  inputWrapper.appendChild(textarea);
  inputLine.append(prompt, inputWrapper);
  terminal.appendChild(inputLine);

  function updateMirror() {
    const val = textarea.value.replace(/\r\n/g, '\n');
    mirror.innerHTML = val + '<span class="fake-cursor"></span>';
  }

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    updateMirror();
  });

  textarea.addEventListener('focus', updateMirror);
  textarea.addEventListener('keydown', handleCommandInput);
  textarea.focus();
  updateMirror();

  terminalContainer.addEventListener('click', () => {
    textarea.focus();
  });
}

function showPersistentNav() {
  const navBar = document.createElement('div');
  navBar.className = 'nav-bar';
  navBar.innerHTML = `
    [<a href="index.html?noIntro=true" class="nav-link">home</a>]
    [<a href="about.html" class="nav-link">about</a>]
    [<a href="projects.html" class="nav-link">projects</a>]
    [<a href="resume.html" class="nav-link">resume</a>]
    [<a href="contact.html" class="nav-link">contact</a>]
  `;
  terminal.appendChild(navBar);
}

function handleCommandInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const textarea = e.target;
    const command = textarea.value.trim().toLowerCase();
    textarea.value = '';
    processCommand(command);
  }
}

function processCommand(command) {
  const navBar = document.querySelector('.nav-bar');
  terminal.innerHTML = '';
  if (navBar) terminal.appendChild(navBar);
  currentLine = 0;

  if (command === '') {
    showInputCursor();
  } else if (command === 'clear') {
    terminal.innerHTML = '';
    currentLine = 0;
    terminalBootSequence();
  } else if (command === 'help' || command === 'ls' || command === 'home') {
    showNavOptions();
  } else if (command === 'resume') {
    window.location.href = 'resume.html';
  } else if (command === 'projects') {
    window.location.href = 'projects.html';
  } else if (command === 'about') {
    window.location.href = 'about.html';
  } else if (command === 'contact') {
    window.location.href = 'contact.html';
  } else {
    createTerminalLine(`Command not found: ${command}`, false);
    createTerminalLine('Type "help" to navigate the site', false);
    showNavOptions();
  }
}

function showNavOptions() {
  createTerminalLine('ls ~/portfolio', true);
  createTerminalLine(
    '  <a href="about.html" class="visible-link">about.txt</a>  <a href="projects.html" class="visible-link">projects/</a>  <a href="resume.html" class="visible-link">resume.pdf</a>  <a href="contact.html" class="visible-link">contact.sh</a>',
    false
  );
  showInputCursor();
}

if (!skipIntro) {
  terminalBootSequence();
} else {
  printAllAtOnce();
}

function showCodeCredit() {
  const credit = document.getElementById('codeCredit');
  credit.classList.add('show');
}

setTimeout(showCodeCredit, 5000);
