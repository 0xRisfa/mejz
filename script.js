const mazeLines = document.querySelectorAll("svg line");
const player1Elem = document.getElementById("player1");
const player2Elem = document.getElementById("player2");
const solutionPath = document.getElementById("solution-path");

let player1 = new SAT.Circle(new SAT.Vector(240, 300), 5);
let player2 = new SAT.Circle(new SAT.Vector(225, 300), 5);

const speed = 2;
const maxDistance = 100;
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

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

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

  // Move vertically
  if (keys.w) newPos.y -= speed;
  if (keys.s) newPos.y += speed;
  const tempCircleY = new SAT.Circle(
    new SAT.Vector(newPos.x, newPos.y),
    circle.r
  );
  if (!detectCollision(tempCircleY)) {
    circle.pos.y = newPos.y;
  }

  // Move horizontally
  if (keys.a) newPos.x -= speed;
  if (keys.d) newPos.x += speed;
  const tempCircleX = new SAT.Circle(
    new SAT.Vector(newPos.x, circle.pos.y),
    circle.r
  );
  if (!detectCollision(tempCircleX)) {
    circle.pos.x = newPos.x;
  }

  // Restrict position if too far from other circle
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

    // Check if the restricted position collides with walls
    const restrictedCircle = new SAT.Circle(
      new SAT.Vector(restrictedX, restrictedY),
      movingCircle.r
    );
    if (!detectCollision(restrictedCircle)) {
      movingCircle.pos.x = restrictedX;
      movingCircle.pos.y = restrictedY;
    } else {
      // Reset to the original position if restricted position is invalid
      movingCircle.pos.x = originalPos.x;
      movingCircle.pos.y = originalPos.y;
    }
  }
}

const endZone = new SAT.Box(new SAT.Vector(0, 482), 500, 500).toPolygon(); // Adjust position and size as needed

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
  animateSolutionPath().then(() => {
    setTimeout(displayCompletionOverlay, 2000); // Show the overlay 2 seconds after animation ends
  });
}

function animateSolutionPath() {
  const length = solutionPath.getTotalLength();
  solutionPath.style.strokeDasharray = length;
  solutionPath.style.strokeDashoffset = length;

  // Animate the path drawing
  return solutionPath.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    {
      duration: 5000, // Adjust animation duration as needed
      easing: "ease-in-out",
    }
  ).finished; // Return a promise that resolves when the animation is finished
}

function displayCompletionOverlay() {
  const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
  overlay.style.color = "white";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.fontSize = "24px";
  overlay.style.zIndex = "1000";

  const message = document.createElement("div");
  message.textContent = `Congratulations! You completed the maze in ${timeTaken} seconds!`;
  overlay.appendChild(message);

  const button = document.createElement("button");
  button.textContent = "Play Again";
  button.style.marginTop = "20px";
  button.style.padding = "10px 20px";
  button.style.fontSize = "18px";
  button.style.cursor = "pointer";
  button.addEventListener("click", () => {
    overlay.remove();
    // Optionally, you can reset the game state here
    window.location.reload(); // For simplicity, reload the page to restart the game
  });
  overlay.appendChild(button);

  document.body.appendChild(overlay);
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

  requestAnimationFrame(update);
  checkEndCondition();
}

update();
