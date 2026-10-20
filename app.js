document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Animación de entrada inicial del menú
    anime({
        targets: '.module-card',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'easeOutQuad',
        duration: 500
    });

    // 2. SISTEMA DE NAVEGACIÓN SPA (Single Page Application)
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.module-card');
    const backButtons = document.querySelectorAll('.btn-back');

    // Función para cambiar de pantalla con transición
    function navigateTo(targetId) {
        // Ocultar todas las vistas
        views.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });

        // Mostrar la vista objetivo
        const targetView = document.getElementById(targetId);
        targetView.classList.remove('hidden');
        targetView.classList.add('active');

        // Animar la entrada de la nueva vista
        anime({
            targets: targetView,
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 400,
            easing: 'easeOutSine'
        });
    }

    // Escuchar clics en el menú principal
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.currentTarget.id.replace('btn-', 'view-');
            
            // Verificamos si el módulo existe antes de navegar (Escalabilidad)
            if (document.getElementById(moduleId)) {
                navigateTo(moduleId);
            } else {
                alert("Módulo en desarrollo. ¡Pronto disponible!");
            }
        });
    });

    // Escuchar clics en los botones de "Volver"
    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            navigateTo(targetId);
        });
    });


    // 3. LÓGICA DE LA CALCULADORA DE TÉCNICAS (kVp / mAs)
    const calcForm = document.getElementById('calc-form');
    const calcResult = document.getElementById('calc-result');
    const resKvp = document.getElementById('res-kvp');
    const resMas = document.getElementById('res-mas');

    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página recargue

            const region = document.getElementById('region').value;
            const grosor = parseFloat(document.getElementById('grosor').value);

            if (!grosor || grosor <= 0) return;

            // Constantes base simuladas para radiología (Regla de seguridad: cálculo local)
            // Fórmula básica: kVp = (Grosor x 2) + Constante de equipo
            let constanteEquipo = 40; 
            let factorMas = 1;

            if (region === 'torax') {
                constanteEquipo = 50; // Requiere más penetración
                factorMas = 0.5;      // Menor tiempo para evitar movimiento del corazón
            } else if (region === 'extremidad') {
                constanteEquipo = 30; // Menor penetración
                factorMas = 2;        // Mayor contraste
            }

            // Cálculo matemático local
            const kvpCalculado = Math.round((grosor * 2) + constanteEquipo);
            const masCalculado = Math.round(grosor * factorMas);

            // Mostrar resultados en pantalla
            resKvp.textContent = kvpCalculado;
            resMas.textContent = masCalculado;

            calcResult.classList.remove('hidden');

            // Pequeña animación de éxito en los números
            anime({
                targets: ['.values-grid .number'],
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        });
    }
});
