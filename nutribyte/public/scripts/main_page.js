

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".tab-link");
    const contents = document.querySelectorAll(".tab-content");
  
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        // Remove active classes
        buttons.forEach(btn => btn.classList.remove("active"));
        contents.forEach(content => content.classList.remove("active"));
  
        // Add active class to clicked button and corresponding tab
        button.classList.add("active");
        const target = document.getElementById(button.getAttribute("data-tab"));
        target.classList.add("active");
      });
    });
  });
  