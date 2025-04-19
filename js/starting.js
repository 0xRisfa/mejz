const playButton = document.getElementById("play-game");

playButton.addEventListener("click", () => {
  window.location.href = "game.html";
});

document
  .getElementById("show-instructions")
  .addEventListener("click", async () => {
    await Swal.fire({
      title: "Instructions",
      html: `
        <p>Navigate the maze using the controls:</p>
        <ul id="list">
          <li><strong>Player 1:</strong> Use W, A, S, D to move.</li>
          <li><strong>Player 2:</strong> Use Arrow Keys to move.</li>
        </ul>
        <p>
          Both players must reach the end of the maze together to win. Beware of
          obstacles and stay within the distance limit between players!
        </p>
        <h2>Credits</h2>
        <p>Game by Faris</p>
      `,
      customClass: {
        popup: "custom-swal",
      },
      confirmButtonText: "Close",
    });
  });
