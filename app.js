document.addEventListener('DOMContentLoaded', () => {
    
    // 0. REGISTRO DEL SERVICE WORKER
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registrado con éxito', reg))
        .catch(err => console.error('Error al registrar Service Worker', err));
    }

    // 1. Animación inicial del menú
    anime({
        targets: '.module-card',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'easeOutQuad',
        duration: 500
    });

    // 2. NAVEGACIÓN SPA
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.module-card');
    const backButtons = document.querySelectorAll('.btn-back');

    function navigateTo(targetId) {
        views.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });

        const targetView = document.getElementById(targetId);
        targetView.classList.remove('hidden');
        targetView.classList.add('active');

        anime({
            targets: targetView,
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 400,
            easing: 'easeOutSine'
        });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.currentTarget.id.replace('btn-', 'view-');
            if (document.getElementById(moduleId)) navigateTo(moduleId);
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            navigateTo(targetId);
        });
    });

    // ==========================================
    // 3. LÓGICA DE POSICIONAMIENTO CON IMÁGENES REALES
    // ==========================================
    const datosPosicionamiento = {
        'Tórax PA': {
            chasis: '14x17 pulgadas',
            rayo: 'Perpendicular a T7 (aprox. 18-20 cm debajo de vértebra prominente)',
            distancia: '180 cm (72")',
            imagen: 'imagen1.jpg' // Vinculado al nombre exacto en tu repositorio
        },
        'Cráneo AP': {
            chasis: '10x12 pulgadas longitudinal',
            rayo: 'Perpendicular al nasión',
            distancia: '100 cm (40")',
            imagen: 'imagen2.jpg'
        },
        'Mano PA': {
            chasis: '10x12 pulgadas transversal',
            rayo: 'Perpendicular a la 3ra articulación metacarpofalángica',
            distancia: '100 cm (40")',
            imagen: 'imagen3.jpg'
        }
    };

    const listaPartes = document.querySelectorAll('.body-parts-list li');
    const detalleChasis = document.querySelector('#view-posicionamiento .guide-details p:nth-child(1)');
    const detalleRayo = document.querySelector('#view-posicionamiento .guide-details p:nth-child(2)');
    const detalleDistancia = document.querySelector('#view-posicionamiento .guide-details p:nth-child(3)');
    const zonaVisualPos = document.getElementById('img-posicionamiento'); // Seleccionamos la etiqueta img

    listaPartes.forEach(item => {
        item.addEventListener('click', (e) => {
            listaPartes.forEach(li => li.classList.remove('active-part'));
            e.target.classList.add('active-part');

            const nombreParte = e.target.textContent;
            const data = datosPosicionamiento[nombreParte];

            if(data) {
                detalleChasis.innerHTML = `<strong>Chasis:</strong> ${data.chasis}`;
                detalleRayo.innerHTML = `<strong>Rayo Central:</strong> ${data.rayo}`;
                detalleDistancia.innerHTML = `<strong>Distancia:</strong> ${data.distancia}`;
                
                // Cambiar el source de la imagen dinámicamente
                zonaVisualPos.src = data.imagen;

                anime({ targets: '.guide-details, #img-posicionamiento', opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });
            }
        });
    });

    // ==========================================
    // 4. LÓGICA DE ANATOMÍA (Simulador)
    // ==========================================
    const preguntaActual = {
        respuestaCorrecta: 'A) Clavícula'
    };

    const botonesQuiz = document.querySelectorAll('.btn-opcion');
    
    botonesQuiz.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const respuestaUsuario = e.target.textContent;

            botonesQuiz.forEach(b => b.disabled = true);

            if (respuestaUsuario === preguntaActual.respuestaCorrecta) {
                e.target.classList.add('correcto');
                anime({ targets: e.target, scale: [1, 1.05, 1], duration: 400 });
            } else {
                e.target.classList.add('incorrecto');
                anime({ targets: e.target, translateX: [0, -5, 5, -5, 5, 0], duration: 400 });
                
                botonesQuiz.forEach(b => {
                    if(b.textContent === preguntaActual.respuestaCorrecta) b.classList.add('correcto');
                });
            }
        });
    });

    // ==========================================
    // 5. CALCULADORA kVp/mAs
    // ==========================================
    const calcForm = document.getElementById('calc-form');
    const calcResult = document.getElementById('calc-result');
    const resKvp = document.getElementById('res-kvp');
    const resMas = document.getElementById('res-mas');

    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const region = document.getElementById('region').value;
            const grosor = parseFloat(document.getElementById('grosor').value);
            if (!grosor || grosor <= 0) return;

            let constanteEquipo = 40, factorMas = 1;
            if (region === 'torax') { constanteEquipo = 50; factorMas = 0.5; } 
            else if (region === 'extremidad') { constanteEquipo = 30; factorMas = 2; }

            resKvp.textContent = Math.round((grosor * 2) + constanteEquipo);
            resMas.textContent = Math.round(grosor * factorMas);
            calcResult.classList.remove('hidden');
            anime({ targets: ['.values-grid .number'], scale: [0.8, 1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1, .8)' });
        });
    }

    // ==========================================
    // 6. DOSIMETRÍA (Almacenamiento Local)
    // ==========================================
    const formDosimetria = document.getElementById('dosimetria-form');
    const listaDosimetria = document.getElementById('lista-dosimetria');

    function cargarHistorial() {
        listaDosimetria.innerHTML = '';
        const registros = JSON.parse(localStorage.getItem('historialDosimetria')) || [];
        if (registros.length === 0) {
            listaDosimetria.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No hay registros aún.</li>';
            return;
        }
        registros.forEach(reg => {
            const li = document.createElement('li');
            li.className = 'registro-item';
            li.innerHTML = `<span class="registro-fecha">${reg.mes}</span><span class="registro-valor">${reg.dosis} mSv</span>`;
            listaDosimetria.appendChild(li);
        });
    }

    if (formDosimetria) {
        cargarHistorial(); 
        formDosimetria.addEventListener('submit', (e) => {
            e.preventDefault();
            const mes = document.getElementById('mes-registro').value;
            const dosis = document.getElementById('dosis-msv').value;
            if (!mes || !dosis) return;

            const registros = JSON.parse(localStorage.getItem('historialDosimetria')) || [];
            registros.push({ mes, dosis });
            registros.sort((a, b) => new Date(b.mes) - new Date(a.mes));
            localStorage.setItem('historialDosimetria', JSON.stringify(registros));

            cargarHistorial();
            formDosimetria.reset();
            anime({ targets: '.registro-item', translateX: [-20, 0], opacity: [0, 1], delay: anime.stagger(50), duration: 400 });
        });
    }
});
