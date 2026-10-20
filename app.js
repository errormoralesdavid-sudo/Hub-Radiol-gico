document.addEventListener('DOMContentLoaded', () => {
    
    // 0. REGISTRO DEL SERVICE WORKER
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registrado con éxito', reg))
        .catch(err => console.error('Error al registrar Service Worker', err));
    }

    // 1. ANIMACIÓN INICIAL DEL MENÚ
    anime({ targets: '.module-card', translateY: [30, 0], opacity: [0, 1], delay: anime.stagger(100), easing: 'easeOutQuad', duration: 500 });

    // 2. NAVEGACIÓN SPA
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.module-card');
    const backButtons = document.querySelectorAll('.btn-back');

    function navigateTo(targetId) {
        views.forEach(view => { view.classList.remove('active'); view.classList.add('hidden'); });
        const targetView = document.getElementById(targetId);
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
        anime({ targets: targetView, opacity: [0, 1], translateY: [15, 0], duration: 400, easing: 'easeOutSine' });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const moduleId = e.currentTarget.id.replace('btn-', 'view-');
            if (document.getElementById(moduleId)) navigateTo(moduleId);
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => { navigateTo(e.currentTarget.getAttribute('data-target')); });
    });

    // ==========================================
    // 3. LÓGICA DE POSICIONAMIENTO
    // ==========================================
    const datosPosicionamiento = {
        'Tórax PA': { chasis: '14x17 pulgadas', rayo: 'Perpendicular a T7', distancia: '180 cm (72")', imagen: 'imagen1.jpg' },
        'Cráneo AP': { chasis: '10x12 pulgadas longitudinal', rayo: 'Perpendicular al nasión', distancia: '100 cm (40")', imagen: 'imagen2.jpg' },
        'Mano PA': { chasis: '10x12 pulgadas transversal', rayo: 'Perpendicular a 3ra art. metacarpofalángica', distancia: '100 cm (40")', imagen: 'imagen3.jpg' }
    };

    const listaPartes = document.querySelectorAll('.body-parts-list li');
    const zonaVisualPos = document.getElementById('img-posicionamiento');

    listaPartes.forEach(item => {
        item.addEventListener('click', (e) => {
            listaPartes.forEach(li => li.classList.remove('active-part'));
            e.target.classList.add('active-part');
            const data = datosPosicionamiento[e.target.textContent];
            if(data) {
                document.querySelector('#view-posicionamiento .guide-details p:nth-child(1)').innerHTML = `<strong>Chasis:</strong> ${data.chasis}`;
                document.querySelector('#view-posicionamiento .guide-details p:nth-child(2)').innerHTML = `<strong>Rayo Central:</strong> ${data.rayo}`;
                document.querySelector('#view-posicionamiento .guide-details p:nth-child(3)').innerHTML = `<strong>Distancia:</strong> ${data.distancia}`;
                zonaVisualPos.src = data.imagen;
                anime({ targets: '.guide-details, #img-posicionamiento', opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });
            }
        });
    });

    // ==========================================
    // 4. LÓGICA DE ANATOMÍA (NUEVO SIMULADOR DE EVALUACIÓN)
    // ==========================================
    let puntuacionActual = 0;
    let preguntaIndex = 0;

    // Puedes escalar este array agregando tantas preguntas como quieras
    const preguntasAnatomia = [
        {
            pregunta: '¿Qué hueso se muestra principalmente en la radiografía de la Imagen 4?',
            imagen: 'imagen4.jpg',
            opciones: ['A) Clavícula', 'B) Escápula', 'C) Esternón'],
            correcta: 'A) Clavícula'
        },
        {
            pregunta: 'Según la Imagen 1, ¿qué proyección radiológica estamos viendo?',
            imagen: 'imagen1.jpg',
            opciones: ['A) Abdomen AP', 'B) Tórax PA', 'C) Tórax Lateral'],
            correcta: 'B) Tórax PA'
        },
        {
            pregunta: '¿Cuál es la distancia focal ideal recomendada para tomar la radiografía de la Imagen 1 (Tórax)?',
            imagen: 'imagen1.jpg',
            opciones: ['A) 100 cm', 'B) 120 cm', 'C) 180 cm'],
            correcta: 'C) 180 cm'
        }
    ];

    const quizQuestionEl = document.getElementById('quiz-question');
    const quizImgEl = document.getElementById('img-anatomia');
    const quizOptionsContainer = document.getElementById('quiz-options');
    const quizProgressEl = document.getElementById('quiz-progress');
    const quizScoreEl = document.getElementById('quiz-score');
    const btnNextQuestion = document.getElementById('btn-next-question');

    function cargarPregunta() {
        // Verificar si ya terminamos todas las preguntas
        if (preguntaIndex >= preguntasAnatomia.length) {
            quizQuestionEl.innerHTML = `¡Simulador completado! Puntuación final: <strong>${puntuacionActual} de ${preguntasAnatomia.length}</strong>`;
            quizImgEl.src = 'imagen4.jpg'; // Imagen de cierre por defecto
            quizOptionsContainer.innerHTML = ''; // Vaciar botones
            btnNextQuestion.textContent = 'Reiniciar Simulador';
            btnNextQuestion.classList.remove('hidden');
            return;
        }

        // Cargar datos de la pregunta actual
        const data = preguntasAnatomia[preguntaIndex];
        quizQuestionEl.textContent = data.pregunta;
        quizImgEl.src = data.imagen;
        quizProgressEl.textContent = `Pregunta ${preguntaIndex + 1} de ${preguntasAnatomia.length}`;
        quizOptionsContainer.innerHTML = ''; 
        btnNextQuestion.classList.add('hidden'); // Ocultar botón "Siguiente" hasta que responda

        // Generar botones de opciones automáticamente
        data.opciones.forEach(opcion => {
            const btn = document.createElement('button');
            btn.className = 'btn-opcion';
            btn.textContent = opcion;
            btn.addEventListener('click', (e) => evaluarRespuesta(e, data.correcta));
            quizOptionsContainer.appendChild(btn);
        });
        
        anime({ targets: '.anatomia-layout', opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });
    }

    function evaluarRespuesta(evento, correcta) {
        const botones = document.querySelectorAll('#quiz-options .btn-opcion');
        botones.forEach(b => b.disabled = true); // Bloquear opciones tras tocar

        if (evento.target.textContent === correcta) {
            evento.target.classList.add('correcto');
            puntuacionActual++;
            quizScoreEl.textContent = puntuacionActual;
            anime({ targets: evento.target, scale: [1, 1.05, 1], duration: 400 });
        } else {
            evento.target.classList.add('incorrecto');
            anime({ targets: evento.target, translateX: [0, -5, 5, -5, 5, 0], duration: 400 }); // Vibración de error
            
            // Iluminar la respuesta que era correcta para que el estudiante aprenda
            botones.forEach(b => {
                if (b.textContent === correcta) b.classList.add('correcto');
            });
        }
        btnNextQuestion.classList.remove('hidden'); // Mostrar botón de avanzar
    }

    // Lógica del botón "Siguiente" o "Reiniciar"
    if(btnNextQuestion) {
        btnNextQuestion.addEventListener('click', () => {
            if (preguntaIndex >= preguntasAnatomia.length) {
                // Reiniciar el quiz
                puntuacionActual = 0;
                preguntaIndex = 0;
                quizScoreEl.textContent = puntuacionActual;
                btnNextQuestion.textContent = 'Siguiente Pregunta';
                cargarPregunta();
            } else {
                // Avanzar a la siguiente
                preguntaIndex++;
                cargarPregunta();
            }
        });
        
        // Iniciar el quiz la primera vez que se carga la app
        cargarPregunta();
    }

    // ==========================================
    // 5. CALCULADORA kVp/mAs
    // ==========================================
    const calcForm = document.getElementById('calc-form');
    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const region = document.getElementById('region').value;
            const grosor = parseFloat(document.getElementById('grosor').value);
            if (!grosor || grosor <= 0) return;

            let constanteEquipo = 40, factorMas = 1;
            if (region === 'torax') { constanteEquipo = 50; factorMas = 0.5; } 
            else if (region === 'extremidad') { constanteEquipo = 30; factorMas = 2; }

            document.getElementById('res-kvp').textContent = Math.round((grosor * 2) + constanteEquipo);
            document.getElementById('res-mas').textContent = Math.round(grosor * factorMas);
            document.getElementById('calc-result').classList.remove('hidden');
            anime({ targets: ['.values-grid .number'], scale: [0.8, 1], opacity: [0, 1], duration: 500, easing: 'easeOutElastic(1, .8)' });
        });
    }

    // ==========================================
    // 6. DOSIMETRÍA (Almacenamiento Local)
    // ==========================================
    const formDosimetria = document.getElementById('dosimetria-form');
    function cargarHistorial() {
        const listaDosimetria = document.getElementById('lista-dosimetria');
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
