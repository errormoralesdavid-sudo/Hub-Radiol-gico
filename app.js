document.addEventListener('DOMContentLoaded', () => {
    
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
            if (document.getElementById(moduleId)) {
                navigateTo(moduleId);
            }
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            navigateTo(targetId);
        });
    });


    // 3. CALCULADORA kVp/mAs
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

            let constanteEquipo = 40; 
            let factorMas = 1;

            if (region === 'torax') {
                constanteEquipo = 50; 
                factorMas = 0.5;      
            } else if (region === 'extremidad') {
                constanteEquipo = 30; 
                factorMas = 2;        
            }

            resKvp.textContent = Math.round((grosor * 2) + constanteEquipo);
            resMas.textContent = Math.round(grosor * factorMas);

            calcResult.classList.remove('hidden');

            anime({
                targets: ['.values-grid .number'],
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        });
    }

    // 4. DOSIMETRÍA (Almacenamiento Local)
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
        cargarHistorial(); // Cargar datos previos al iniciar

        formDosimetria.addEventListener('submit', (e) => {
            e.preventDefault();
            const mes = document.getElementById('mes-registro').value;
            const dosis = document.getElementById('dosis-msv').value;

            if (!mes || !dosis) return;

            const registros = JSON.parse(localStorage.getItem('historialDosimetria')) || [];
            
            // Guardar nuevo registro
            registros.push({ mes, dosis });
            
            // Ordenar por fecha descendentemente
            registros.sort((a, b) => new Date(b.mes) - new Date(a.mes));
            
            localStorage.setItem('historialDosimetria', JSON.stringify(registros));

            cargarHistorial();
            formDosimetria.reset();

            anime({
                targets: '.registro-item',
                translateX: [-20, 0],
                opacity: [0, 1],
                delay: anime.stagger(50),
                duration: 400
            });
        });
    }
});
