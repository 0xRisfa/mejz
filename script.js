//velikost body-ja = velikost okna (za pravilno delovanje na telefonu)
function adjustViewportHeight() {
  document.body.style.height = `${window.innerHeight}px`;
}
window.addEventListener("load", adjustViewportHeight);
window.addEventListener("resize", adjustViewportHeight);

// SPREMENLJIVKE IN KONSTANTE
const mazeLines = document.querySelectorAll("svg line");
const player1Elem = document.getElementById("player1");
const player2Elem = document.getElementById("player2");
const solutionPath = document.getElementById("solution-path");

const endZone = new SAT.Box(new SAT.Vector(0, 482), 500, 500).toPolygon();

let player1 = new SAT.Circle(new SAT.Vector(230, 10), 5);
let player2 = new SAT.Circle(new SAT.Vector(250, 10), 5);

const speed = 2; //hitrost
const maxDistance = 100; //najvecja dovoljena razdalja med playerji

let endConditionMet = false;
let startTime = Date.now();
let endTime = 0;

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

const mobileKeys = {
  up1: false,
  down1: false,
  left1: false,
  right1: false,
  up2: false,
  down2: false,
  left2: false,
  right2: false,
};

const highScoreList = document.getElementById("high-score-list");
// shranimo podatke iz lokalnega pomnilnika v highScores
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

//
//
//
//
//

//poslusanje tipk
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

//
//
//
//

// update highscore lista
function updateHighScoreDisplay() {
  highScoreList.innerHTML = highScores.length
    ? highScores
        .map((score, index) => `<li>${index + 1}. ${score} sec</li>`)
        .join("")
    : "<li>No scores yet</li>";
}
// funkcija za vpis novega score-a
function saveHighScore(time) {
  highScores.push(time);
  highScores.sort((a, b) => a - b); // ascending sort
  highScores = highScores.slice(0, 10); // vzamemo samo prvih 10
  localStorage.setItem("highScores", JSON.stringify(highScores));
  updateHighScoreDisplay();
}
updateHighScoreDisplay();

//
//
//
//

// Uporaba gumbov na mobitelu
function setupTouchControls() {
  const buttons = document.querySelectorAll(".control-button");
  buttons.forEach((button) => {
    button.addEventListener(
      "touchstart",
      (e) => {
        if (e.cancelable) e.preventDefault();
        mobileKeys[button.id] = true;
      },
      { passive: false }
    );

    button.addEventListener(
      "touchend",
      (e) => {
        if (e.cancelable) e.preventDefault();
        mobileKeys[button.id] = false;
      },
      { passive: false }
    );
  });
}
setupTouchControls();

function goBack() {
  window.history.back();
}

//
//
//
//
//

// METODE ZA FUNKCIONALNOST IGRICE

function detectCollision(circle) {
  for (let line of mazeLines) {
    const x1 = parseFloat(line.getAttribute("x1"));
    const y1 = parseFloat(line.getAttribute("y1"));
    const x2 = parseFloat(line.getAttribute("x2"));
    const y2 = parseFloat(line.getAttribute("y2"));

    const wallPolygon = new SAT.Polygon(new SAT.Vector(), [
      new SAT.Vector(x1, y1),
      new SAT.Vector(x2, y2),
    ]);

    if (SAT.testCirclePolygon(circle, wallPolygon)) {
      return true;
    }
  }
  return false;
}

function handleMovement(circle, stationaryCircle, keys = {}) {
  const originalPos = new SAT.Vector(circle.pos.x, circle.pos.y);
  const newPos = new SAT.Vector(circle.pos.x, circle.pos.y);

  // navpicno premikanje
  if (keys.w) newPos.y -= speed;
  if (keys.s) newPos.y += speed;
  const tempCircleY = new SAT.Circle(
    new SAT.Vector(newPos.x, newPos.y),
    circle.r
  );
  if (!detectCollision(tempCircleY)) {
    circle.pos.y = newPos.y;
  }

  // vodoravno premikanje
  if (keys.a) newPos.x -= speed;
  if (keys.d) newPos.x += speed;
  const tempCircleX = new SAT.Circle(
    new SAT.Vector(newPos.x, circle.pos.y),
    circle.r
  );
  if (!detectCollision(tempCircleX)) {
    circle.pos.x = newPos.x;
  }

  // omeji premik, ce sta predalec
  restrictPosition(circle, stationaryCircle, originalPos);
}

function restrictPosition(movingCircle, stationaryCircle, originalPos) {
  const dx = movingCircle.pos.x - stationaryCircle.pos.x;
  const dy = movingCircle.pos.y - stationaryCircle.pos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > maxDistance) {
    const angle = Math.atan2(dy, dx);
    const restrictedX = stationaryCircle.pos.x + Math.cos(angle) * maxDistance;
    const restrictedY = stationaryCircle.pos.y + Math.sin(angle) * maxDistance;

    const restrictedCircle = new SAT.Circle(
      new SAT.Vector(restrictedX, restrictedY),
      movingCircle.r
    );

    // pogleda ce gre pozicija omejenega igralca cez zid. Ce se ne dotika zidu, se premakne
    if (!detectCollision(restrictedCircle)) {
      movingCircle.pos.x = restrictedX;
      movingCircle.pos.y = restrictedY;
    } else {
      movingCircle.pos.x = originalPos.x;
      movingCircle.pos.y = originalPos.y;
    }
  }
}

function isInEndZone(circle) {
  return SAT.testCirclePolygon(circle, endZone);
}

function checkEndCondition() {
  if (!endConditionMet && isInEndZone(player1) && isInEndZone(player2)) {
    endConditionMet = true;
    endTime = Date.now();
    triggerEndSequence();
  }
}

function triggerEndSequence() {
  solutionPath.style.display = "block";
  animateSolutionPath().then(() => {
    setTimeout(displayCompletionOverlay, 1500);
  });
}

function animateSolutionPath() {
  const length = solutionPath.getTotalLength();
  solutionPath.style.strokeDasharray = length;
  solutionPath.style.strokeDashoffset = length;

  return solutionPath.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    {
      duration: 5000,
      easing: "ease-in-out",
    }
  ).finished;
}

function update() {
  handleMovement(player1, player2, {
    w: keys.w || mobileKeys.up1,
    s: keys.s || mobileKeys.down1,
    a: keys.a || mobileKeys.left1,
    d: keys.d || mobileKeys.right1,
  });
  handleMovement(player2, player1, {
    w: keys.ArrowUp || mobileKeys.up2,
    s: keys.ArrowDown || mobileKeys.down2,
    a: keys.ArrowLeft || mobileKeys.left2,
    d: keys.ArrowRight || mobileKeys.right2,
  });

  player1Elem.setAttribute("cx", player1.pos.x);
  player1Elem.setAttribute("cy", player1.pos.y);
  player2Elem.setAttribute("cx", player2.pos.x);
  player2Elem.setAttribute("cy", player2.pos.y);

  if (!endConditionMet) {
    // update timerja, dokler ni konec igre
    let now = Date.now();
    let elapsedTime = ((now - startTime) / 1000).toFixed(2);
    document.getElementById("timer").textContent = `Time: ${elapsedTime}s`;
  }

  requestAnimationFrame(update);
  checkEndCondition();
}

update();
