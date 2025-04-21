let bookX, bookY, bookWidth, bookHeight;
let isBookOpen = false;
let contentDiv; // 用於顯示書本內容的容器

let tones = [
  [7040, 3520, 0, 0.2],
  [3520, 1760, 0.2, 0.7],
  [1760, 880, 0.7, 1],
  [880, 440, 1, 1],
  [440, 220, 1, 1],
  [220, 110, 1, 1],
  [110, 55, 1, 0],
];
let pointers = [];
let osc = [];
let streaks = [];
let clouds = [];
const duration = 10000;
const streaknum = 10;
const cloudnum = 5;

function setup() {
  createCanvas(windowWidth, windowHeight); // 修改為符合螢幕視窗
  createMenu();
  bookWidth = 600; // 增加書本寬度
  bookHeight = 750; // 保持書本高度
  bookX = (width - bookWidth) / 2;
  bookY = (height - bookHeight) / 2;

  // 初始化書本內容容器
  contentDiv = createDiv();
  contentDiv.style('position', 'absolute');
  contentDiv.style('top', `${bookY + 20}px`); // 距離書本上方 20px
  contentDiv.style('left', `${bookX - bookWidth / 2 + 140}px`); // 稍微往右移動，避免壓到按鈕
  contentDiv.style('width', `${bookWidth +400}px`); // 調整寬度以適應右移
  contentDiv.style('height', `${bookHeight - 40}px`); // 書本高度減去上下邊距
  contentDiv.style('overflow', 'auto');
  contentDiv.style('background-color', '#ffffff');
  contentDiv.style('padding', '10px');
  contentDiv.style('display', 'none'); // 初始隱藏

  // Shepard Tone 初始化
  for (let i = 0; i < tones.length; i++) {
    osc[i] = new p5.Oscillator();
    osc[i].freq(tones[i][0]);
    osc[i].amp(tones[i][2]);
    osc[i].start();
  }

  // 雲朵與 streak 初始化
  for (let i = 0; i < streaknum; i++) {
    streaks.push(new streak());
  }
  for (let i = 0; i < cloudnum; i++) {
    clouds.push(new cloud());
  }
}

function createMenu() {
  const menu = createDiv();
  menu.style('position', 'absolute');
  menu.style('display', 'flex');
  menu.style('flex-direction', 'column'); // 改為垂直排列
  menu.style('gap', '5px');

  const buttons = [
    { label: '首頁', action: showHome },
    { label: '自我介紹', action: showIntroduction },
    { label: '作品集', action: showPortfolio },
    { label: '測驗卷', action: showQuiz },
    { label: '教學影片', action: showVideo },
    { label: '關於我們', action: showAbout },
    { label: '筆記', action: showNotes }, // 新增 "筆記" 按鈕
  ];

  buttons.forEach(({ label, action }) => {
    const button = createButton(label);
    button.style('background-color', '#dda15e');
    button.style('border', 'none');
    button.style('padding', '15px 20px'); // 調整按鈕大小
    button.style('font-size', '16px'); // 增加字體大小
    button.style('color', 'white');
    button.style('cursor', 'pointer');
    button.mousePressed(action);
    menu.child(button);
  });

  document.body.appendChild(menu.elt);

  // 更新按鈕位置到書本左頁
  function updateMenuPosition() {
    if (isBookOpen) {
      menu.style('top', `${bookY + 50}px`); // 書本左頁的上方偏移
      menu.style('left', `${bookX - bookWidth / 2 + 20}px`); // 書本左頁的左側偏移
    } else {
      menu.style('top', '-9999px'); // 隱藏按鈕
      menu.style('left', '-9999px');
    }
  }

  // 每次畫面更新時調整按鈕位置
  draw = function () {
    background("#87ceeb"); // 天空背景
    shiftFreqs(); // Shepard Tone 更新

    // 雲朵更新與顯示
    clouds.sort((a, b) => parseFloat(a.speed) - parseFloat(b.speed)); // 按速度排序
    for (let c of clouds) {
      c.update(mouseX); // 雲朵跟隨滑鼠左右移動
      c.display();
    }

    // streak 更新與顯示
    for (let s of streaks) {
      s.update();
      s.display();
    }

    drawBook(); // 繪製書本
    updateMenuPosition(); // 更新按鈕位置
  };
}

function drawBook() {
  if (isBookOpen) {
    // 畫翻開的書本
    fill('#faedcd'); // 設置內容頁顏色
    rect(bookX - bookWidth / 2, bookY, bookWidth, bookHeight); // 左頁
    rect(bookX + bookWidth / 2, bookY, bookWidth, bookHeight); // 右頁
  } else {
    // 畫關閉的書本
    fill('#d4a373'); // 設置封面顏色
    rect(bookX, bookY, bookWidth, bookHeight);

    // 在封面上寫出文字
    fill(0); // 黑色文字
    textSize(32);
    textAlign(CENTER, CENTER);
    const title = '教育科技程式設計';
    const textX = bookX + bookWidth / 2; // 水平置中
    const textYStart = bookY + (bookHeight - title.length * 40) / 2; // 垂直置中起始位置
    for (let i = 0; i < title.length; i++) {
      text(title[i], textX, textYStart + i * 40); // 每個字垂直排列
    }

    // 在封面右下角新增文字
    textSize(16);
    textAlign(RIGHT, BOTTOM);
    text('410730948彭得邦 教育科技4B', bookX + bookWidth - 10, bookY + bookHeight - 10);
  }
}

function mouseMoved() {
  // 檢查滑鼠是否接觸到書本
  if (
    mouseX > bookX - bookWidth / 2 &&
    mouseX < bookX + bookWidth + bookWidth / 2 &&
    mouseY > bookY &&
    mouseY < bookY + bookHeight
  ) {
    isBookOpen = true; // 翻開書本
  } else if (
    mouseX < bookX - bookWidth / 2 ||
    mouseX > bookX + bookWidth + bookWidth / 2 ||
    mouseY < bookY ||
    mouseY > bookY + bookHeight
  ) {
    isBookOpen = false; // 關閉書本
  }
}

function shiftFreqs() {
  for (let i = 0; i < tones.length; i++) {
    pointers[i] = (floor(millis() / duration) + i) % tones.length;
  }

  let ticks = map(millis() % duration, 0, duration, 0, 1);
  for (let i = 0; i < tones.length; i++) {
    let p = pointers[i];
    osc[i].amp(easeInOutQuad(map(ticks, 0, 1, tones[p][2], tones[p][3])));
    osc[i].freq(map(ticks, 0, 1, tones[p][0], tones[p][1]));
  }
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function showHome() {
  contentDiv.html('');
  contentDiv.style('display', 'none'); // 隱藏內容
}

function showIntroduction() {
  contentDiv.html('');
  contentDiv.style('display', 'block');
  contentDiv.style('background-color', '#f7e1d7'); // 新增背景顏色

  const marquee = createDiv('<marquee behavior="scroll" direction="left">大家好，我是410730948彭得邦</marquee>');
  marquee.style('font-size', '24px');
  marquee.style('color', '#000'); // 黑色文字
  marquee.style('text-align', 'center');
  contentDiv.child(marquee);
}

function showPortfolio() {
  const links = [
    { label: '第一周', url: 'https://pengiii18.github.io/20250303/' },
    { label: '第二周', url: 'https://pengiii18.github.io/20250310/' },
    { label: '第三周', url: 'https://pengiii18.github.io/20250317/' },
    { label: '第四周', url: 'https://pengiii18.github.io/20250324/' },
    { label: '第五周', url: 'https://pengiii18.github.io/20250407./' },
  ];

  let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
  links.forEach(({ label, url }) => {
    html += `<button style="background-color: #dda15e; color: white; border: none; padding: 10px; font-size: 16px; cursor: pointer;" onclick="openPortfolio('${url}')">${label}</button>`;
  });
  html += '</div>';

  contentDiv.html(html);
  contentDiv.style('display', 'block');
}

function openPortfolio(url) {
  contentDiv.html(`<iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>`);
}

function showQuiz() {
  const questions = [
    { q: '1 + 1 = ?', options: ['1', '2', '3', '4'], a: '2' },
    { q: '5 * 6 = ?', options: ['30', '25', '20', '15'], a: '30' },
    { q: '12 / 4 = ?', options: ['2', '3', '4', '5'], a: '3' },
    { q: '7 - 3 = ?', options: ['5', '4', '3', '2'], a: '4' },
    { q: '9 + 10 = ?', options: ['19', '20', '21', '22'], a: '19' },
  ];

  let currentQuestionIndex = 0;

  function renderQuestion(index) {
    const { q, options, a } = questions[index];
    let html = `<form id="quizForm" style="font-size: 24px; line-height: 1.5;">`; // 放大文字
    html += `<p style="font-size: 28px; font-weight: bold;">${q}</p>`; // 問題文字更大
    options.forEach((option, i) => {
      html += `
        <div style="margin-bottom: 10px;">
          <input type="radio" id="option${i}" name="answer" value="${option}" style="transform: scale(1.5); margin-right: 10px;">
          <label for="option${i}" style="font-size: 24px;">${option}</label>
        </div>`;
    });
    html += `
      <button type="button" onclick="submitAnswer('${a}')" style="font-size: 24px; padding: 10px 20px; margin-top: 20px;">提交答案</button>
      </form>`;
    contentDiv.html(html);
    contentDiv.style('display', 'block');
  }

  window.submitAnswer = function (correct) {
    const form = document.getElementById('quizForm');
    const selected = form.answer.value;
    if (selected === correct) {
      alert('答對了！');
    } else {
      alert('答錯了！');
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      renderQuestion(currentQuestionIndex);
    } else {
      contentDiv.html('<p style="font-size: 28px; font-weight: bold;">測驗結束！</p>'); // 結束文字更大
    }
  };

  renderQuestion(currentQuestionIndex);
}

function showVideo() {
  contentDiv.html(
    '<video controls width="100%"><source src="https://cfchen58.synology.me/%E7%A8%8B%E5%BC%8F%E8%A8%AD%E8%A8%882024/A2/week8/20250411_092029.mp4" type="video/mp4"></video>'
  );
  contentDiv.style('display', 'block');
}

function showAbout() {
  contentDiv.html(
    '<iframe src="https://pengiii18.github.io/20250317/" width="100%" height="100%" style="border:none;"></iframe>'
  );
  contentDiv.style('display', 'block');
}

function showNotes() {
  contentDiv.html(
    '<iframe src="https://hackmd.io/@YNTBtVfdQV2_UOEfSoxNPg/SkqH_x9Ckl" width="100%" height="100%" style="border:none;"></iframe>'
  );
  contentDiv.style('display', 'block');
}

class cloud {
  constructor() {
    this.x = random(width);
    this.y = random(height / 2);
    this.size = random(50, 150);
    this.speed = random(0.5, 2);
  }

  update(mouseX) {
    this.x += (mouseX - width / 2) * 0.01 * this.speed; // 跟隨滑鼠左右移動
    if (this.x > width + this.size) this.x = -this.size;
    if (this.x < -this.size) this.x = width + this.size;
  }

  display() {
    fill(255, 255, 255, 200);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size / 2);
  }
}

class streak {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.length = random(10, 50);
    this.speed = random(2, 5);
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
  }

  display() {
    stroke(255, 255, 255, 150);
    line(this.x, this.y, this.x, this.y - this.length);
  }
}
