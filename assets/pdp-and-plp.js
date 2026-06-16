// document.addEventListener("DOMContentLoaded", () => {
//   document.body.addEventListener("click", (event) => {
//     // Open tooltip when clicking on elements with class totalvalue_tooltip_open
//     if (event.target.closest(".totalvalue_tooltip_open")) {
//       document.body.classList.add("totalvalue_popup_open");
//     }

//     // Close tooltip when clicking outside of the tooltip content
//     if (event.target.closest(".totalvalue_overlay") && !event.target.closest(".total-value-tooltip-inner")) {
//       document.body.classList.remove("totalvalue_popup_open");
//     }

//     // Close tooltip when clicking the close button
//     if (event.target.closest(".total-value-tooltip__close")) {
//       document.body.classList.remove("totalvalue_popup_open");
//     }
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   document.body.addEventListener("click", (event) => {
//     console.log("Clicked element:", event.target);

//     if (event.target.closest(".totalvalue_tooltip_open")) {
//       console.log("Tooltip open triggered");
//       document.body.classList.add("totalvalue_popup_open");
//     } else if (event.target.closest(".totalvalue_overlay") && !event.target.closest(".total-value-tooltip-inner")) {
//       console.log("Clicked outside tooltip, closing");
//       document.body.classList.remove("totalvalue_popup_open");
//     } else if (event.target.closest(".total-value-tooltip__close")) {
//       console.log("Close button clicked");
//       document.body.classList.remove("totalvalue_popup_open");
//     }
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (event) => {
    console.log("Click detected on body");

    // Open tooltip when clicking on elements with class totalvalue_tooltip_open
    const tooltipTrigger = event.target.closest(".totalvalue_tooltip_open");

    if (tooltipTrigger) {
      console.log("Tooltip trigger clicked", tooltipTrigger);

      const productId = tooltipTrigger.dataset.id; // Fix: Extracting data-id from the trigger itself
      console.log("Product ID extracted:", productId);

      if (!productId) return;

      const overlay = document.getElementById(productId) || document.querySelector(".totalvalue_overlay");
      console.log("Overlay found:", overlay);

      if (!overlay) return;

      // Close any other open overlays before opening the new one
      document.querySelectorAll(".totalvalue_overlay").forEach((el) => {
        el.style.display = "none";
        el.style.opacity = "0";
        el.classList.remove("open");
      });

      // Open the selected overlay
      overlay.style.display = "block"; // Make it visible
      setTimeout(() => {
        overlay.style.opacity = "1"; // Smooth fade-in effect
      }, 10);
      overlay.classList.add("open");

      console.log("Opened overlay", overlay);
    }

    // Close the tooltip when clicking outside the tooltip content
    const overlayClicked = event.target.closest(".totalvalue_overlay");
    if (overlayClicked && !event.target.closest(".total-value-tooltip-inner")) {
      console.log("Clicked outside the tooltip, closing overlay");
      overlayClicked.style.opacity = "0";
      setTimeout(() => {
        overlayClicked.style.display = "none";
      }, 300);
      overlayClicked.classList.remove("open");
    }

    // Close the tooltip when clicking the close button
    const closeButton = event.target.closest(".total-value-tooltip__close");
    if (closeButton) {
      const overlayToClose = closeButton.closest(".totalvalue_overlay");
      console.log("Close button clicked, closing overlay", overlayToClose);
      overlayToClose.style.opacity = "0";
      setTimeout(() => {
        overlayToClose.style.display = "none";
      }, 300);
      overlayToClose.classList.remove("open");
    }
  });
});


