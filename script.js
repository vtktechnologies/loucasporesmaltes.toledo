// ====== CONTROLE DO CARROSSEL (SLIDER LOUCAS POR ESMALTES) ======
const track = document.querySelector('.slider-track');
const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

let index = 0;

function getVisibleSlidesCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3; // Computador exibe 3 fotos por vez
}

function updateSlider() {
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
}

function nextSlide() {
    const visibleSlides = getVisibleSlidesCount();
    const maxIndex = slides.length - visibleSlides;
    
    if (index >= maxIndex) {
        index = 0; // Volta para o início
    } else {
        index++;
    }
    updateSlider();
}

function prevSlide() {
    const visibleSlides = getVisibleSlidesCount();
    const maxIndex = slides.length - visibleSlides;
    
    if (index <= 0) {
        index = maxIndex; // Vai para o final
    } else {
        index--;
    }
    updateSlider();
}

// Eventos de clique nos botões direcionais
nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

// Configuração do movimento automático (Passa a foto a cada 4 segundos)
let autoSlideInterval = setInterval(nextSlide, 4000);

function resetTimer() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 4000);
}

// Reposiciona o layout caso o usuário mude o tamanho da tela (Ex: girar o celular)
window.addEventListener('resize', () => {
    index = 0; // Reseta o contador para evitar quebra de alinhamento
    updateSlider();
});