document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".nav");
  const footerScrolledPosition = 5498;

  function onScroll() {
    if (window.scrollY > footerScrolledPosition) {
      nav.classList.add("footer-touched");
      nav.classList.remove("scrolled");
    } else if (window.scrollY > 20) {
      nav.classList.add("scrolled");
      nav.classList.remove("footer-touched");
    } else {
      nav.classList.remove("scrolled");
      nav.classList.remove("footer-touched");
    }
  }

  window.addEventListener("scroll", onScroll);

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const scrollElements = document.querySelectorAll('[class*="scroll-element"]');
  scrollElements.forEach((el) => observer.observe(el));

  const year = document.getElementById("year");
  year.textContent = new Date().getFullYear();
});
