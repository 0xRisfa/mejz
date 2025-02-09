const menuButton = document.getElementById("menu-button");

menuButton.addEventListener("click", async () => {
  // Hide the menu button
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
      // Add event listeners after menu opens
      popup.querySelector("#play-again").addEventListener("click", () => {
        window.location.reload();
      });

      popup.querySelector("#go-home").addEventListener("click", () => {
        window.location.href = "index.html";
      });

      // Only show "Best Times" button on mobile and open highscores.html
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (isMobile) {
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
