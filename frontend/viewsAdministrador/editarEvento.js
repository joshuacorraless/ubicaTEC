const nombre = document.getElementById('nombre-evento');
const descripcion = document.getElementById('descripcion-editar');
const fechaInput = document.getElementById('fecha-editar');
const lugar = document.getElementById('lugar-editar')
const form = document.getElementById('form-editar');
const capacidad = document.getElementById('capacidad-editar');
const costo = document.getElementById('costo-editar');
const fechaActual = new Date();

// Esto sirve para crear las advertencias
const warning = document.getElementById('warnings-editar');


form.addEventListener('submit', e => {
    e.preventDefault();
    let advert = "";
    warning.innerHTML = "";
    let flag = false;

    // Validación: Nombre del evento puede tener un máximo de 100 caracteres alfanuméricos
    if (/^[a-zA-Z0-9]{1,100}$/.test(nombre)) {
        advert += 'Nombre debe contener un máximo de 100 caracteres los cuales solo pueden ser alfanuméricos <br>';
        flag = true;
    }

    // Validación: Descripción con un mínimo de 20 caracteres y un máximo de 500
    if (descripcion.value.length < 20 || descripcion.value.length > 500) {
        advert += 'Descripción debe tener un mínimo de 20 caracteres y un máximo de 500 <br>';
        flag = true;
    }

    // Validación: Fecha solo permite de la actualidad hacia adelante
    const fechaEvento = new Date(fechaInput.value);
    if (isNaN(fechaEvento.getTime()) || fechaEvento < fechaActual) {
        advert += 'La fecha ingresada es una fecha no válida <br>';
        flag = true;
    }

    // Validación: Lugar tiene un máximo de 100 carateres y un mínimo de 10 
    if (/^[a-zA-Z0-9]{10,100}$/.test(lugar)) {
        advert += 'Lugar debe tener un máximo de 100 caracteres y un mínimo de 10 <br>'
        flag = true
    }

    // Validación: Capacidad no puede ser 0 ni números negativos
    if (capacidad <= 0) {
        advert += 'La capacidad no puede ser cero ni números negativos <br>'
        flag = true
    }
    
    // Validación: El costo de la entrada solo debe ser númerico
    if (/^\d+$/.test(costo)) {
        advert += 'El costo solo puede ser númerico <br>'
        flag = true
    }

    if (flag) {
        warning.innerHTML = advert;
    } else {
        // Si todo es válido, puedes continuar con el submit aquí
        form.submit();
    }
});





// Validaciones

