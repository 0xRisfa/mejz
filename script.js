const mazeLines = document.querySelectorAll('svg line');
const player1Elem = document.getElementById('player1');
const player2Elem = document.getElementById('player2');

let player1 = new SAT.Circle(new SAT.Vector(240, 10), 5);
let player2 = new SAT.Circle(new SAT.Vector(225, 10), 5);

const speed = 2;
const maxDistance = 100;

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

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function detectCollision(circle) {
    for (let line of mazeLines) {
        const x1 = parseFloat(line.getAttribute('x1'));
        const y1 = parseFloat(line.getAttribute('y1'));
        const x2 = parseFloat(line.getAttribute('x2'));
        const y2 = parseFloat(line.getAttribute('y2'));

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
    const tempCircleY = new SAT.Circle(new SAT.Vector(newPos.x, newPos.y), circle.r);
    if (!detectCollision(tempCircleY)) {
        circle.pos.y = newPos.y;
    }

    // Move horizontally
    if (keys.a) newPos.x -= speed;
    if (keys.d) newPos.x += speed;
    const tempCircleX = new SAT.Circle(new SAT.Vector(newPos.x, circle.pos.y), circle.r);
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
        const restrictedCircle = new SAT.Circle(new SAT.Vector(restrictedX, restrictedY), movingCircle.r);
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
    if (isInEndZone(player1) && isInEndZone(player2)) {
        triggerEndSequence();
    }
}

function triggerEndSequence() {
    alert("Congratulations! Both players reached the end of the maze!");
}

function update() {
    handleMovement(player1, player2, {
        w: keys.w,
        s: keys.s,
        a: keys.a,
        d: keys.d,
    });
    handleMovement(player2, player1, {
        w: keys.ArrowUp,
        s: keys.ArrowDown,
        a: keys.ArrowLeft,
        d: keys.ArrowRight,
    });

    player1Elem.setAttribute('cx', player1.pos.x);
    player1Elem.setAttribute('cy', player1.pos.y);
    player2Elem.setAttribute('cx', player2.pos.x);
    player2Elem.setAttribute('cy', player2.pos.y);

    requestAnimationFrame(update);
    checkEndCondition();
}

update();