export function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const targetNum = +entry.target.dataset.n;
      let current = 0;
      const timer = setInterval(() => {
        current++;
        entry.target.textContent = current;
        if (current >= targetNum) clearInterval(timer);
      }, 200);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-n]').forEach((el) => observer.observe(el));
}