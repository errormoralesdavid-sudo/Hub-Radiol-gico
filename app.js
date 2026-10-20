document.addEventListener('DOMContentLoaded', () => {
    
    // Animación de entrada de las tarjetas usando anime.js
    // ¿Por qué? Da una sensación de fluidez y modernidad al abrir la app.
    anime({
        targets: '.module-card',
        translateY: [50, 0], // Sube desde 50px abajo hasta su posición original
        opacity: [0, 1],     // Aparece gradualmente
        delay: anime.stagger(100), // Cada tarjeta aparece 100ms después de la anterior
        easing: 'easeOutQuad',
        duration: 600
    });

    // Escuchadores de eventos para los botones (Escalabilidad)
    // Aquí es donde conectaremos cada módulo en el futuro.
    const btns = document.querySelectorAll('.module-card');
    
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Un pequeño efecto de click antes de cambiar de pantalla
            anime({
                targets: e.currentTarget,
                scale: [1, 0.95, 1],
                duration: 300,
                easing: 'easeInOutQuad',
                complete: function() {
                    console.log(`Abriendo módulo: ${e.currentTarget.id}`);
                    // Próximamente: Lógica para ocultar el menú y mostrar la pantalla del módulo
                }
            });
        });
    });
});
