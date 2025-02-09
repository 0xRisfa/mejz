import Swal from "sweetalert2";
(async () => {
  // RIGHT SIDEBAR
  await Swal.fire({
    title: "Right sidebar 👋",
    html: Swal.version,
    position: "top-end",
    showClass: {
      popup: `
      animate__animated
      animate__fadeInRight
      animate__faster
    `,
    },
    hideClass: {
      popup: `
      animate__animated
      animate__fadeOutRight
      animate__faster
    `,
    },
    grow: "column",
    width: 300,
    showConfirmButton: false,
    showCloseButton: true,
  });
})();
