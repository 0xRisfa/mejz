const menuButton = document.getElementById("menu-button");

menuButton.addEventListener("click", async () => {
  // skrije menu button
  menuButton.style.display = "none";

  await Swal.fire({
    title: "Menu",
    position: "top-start",
    width: 300,
    grow: "column",
    showCloseButton: true,
    showConfirmButton: false,
    html: `
      <button id="check-scores" class="swal-menu-btn">Best Times</button>
      <button id="play-again" class="swal-menu-btn">Play Again</button>
      <button id="go-home" class="swal-menu-btn">Back to Start</button>
    `,
    didOpen: (popup) => {
      popup.querySelector("#play-again").addEventListener("click", () => {
        window.location.reload();
      });

      popup.querySelector("#go-home").addEventListener("click", () => {
        window.location.href = "index.html";
      });

      // best times button samo na telefonu, odpre highscores.html
      if (window.matchMedia("(max-width: 768px)").matches) {
        popup.querySelector("#check-scores").addEventListener("click", () => {
          window.location.href = "highscores.html";
        });
      } else {
        popup.querySelector("#check-scores").style.display = "none";
      }
    },
    willClose: () => {
      menuButton.style.display = "block"; // Show the menu button again when closed
    },
  });
});

// prikaz po koncu
function displayCompletionOverlay() {
  const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
  saveHighScore(timeTaken); // shrani cas

  Swal.fire({
    title: "Congratulations! 🎉",
    html: `<p>You completed the maze in <strong>${timeTaken} seconds</strong>!</p>`,
    icon: "success",
    confirmButtonText: "Play Again",
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: "rgba(0, 0, 0, 0.75)",
  }).then(() => {
    window.location.reload(); // refresha okno
  });
}
