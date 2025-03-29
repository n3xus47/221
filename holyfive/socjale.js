
document.addEventListener('DOMContentLoaded', function() {
    // Funkcja dodająca efekt hover dla ikon social media w profilu
    const profileIcons = document.querySelectorAll('.profile .icons a');
    profileIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}); 