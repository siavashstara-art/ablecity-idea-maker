document.addEventListener('DOMContentLoaded', function() {
  // FAQ toggles
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      item.classList.toggle('active');
    });
  });

  // Contact form submission feedback
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('پیام شما با موفقیت دریافت شد. به زودی با شما تماس خواهیم گرفت.');
      contactForm.reset();
    });
  }

  // Back to Top button
  const backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    });
    backBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});