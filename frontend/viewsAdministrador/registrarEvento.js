const nombre = document.getElementById('nombre');
const descripcion = document.getElementById('descripcion');
const fechaInput = document.getElementById('fecha');
const lugar = document.getElementById('lugar');
const capacidad = document.getElementById('capacidad');
const costo = document.getElementById('costo');
const warning = document.getElementById('warnings-evento');
const form = document.getElementById('form-registrar');

form.addEventListener('submit', e => {
    e.preventDefault();
    let advert = '';
    warning.innerHTML = '';
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
    // Normalizar fechas para comparar solo año, mes y día
    const fechaEventoSinHora = new Date(fechaEvento.getFullYear(), fechaEvento.getMonth(), fechaEvento.getDate());
    const fechaActualSinHora = new Date();
    fechaActualSinHora.setHours(0,0,0,0);
    if (isNaN(fechaEventoSinHora.getTime()) || fechaEventoSinHora < fechaActualSinHora) {
        advert += 'La fecha ingresada es una fecha no válida <br>';
        flag = true;
    }

    // Validación: Lugar tiene un máximo de 100 carateres y un mínimo de 10 
    if (/^[a-zA-Z0-9]{10,100}$/.test(lugar)) {
        advert += 'Lugar debe tener un máximo de 100 caracteres y un mínimo de 10 <br>'
        flag = true
    }

    // Validación: El costo de la entrada solo debe ser númerico y no puede ser negativo
    try {
        if (Number(costo) < 0) {
            advert += 'El costo no pueden ser números negativos <br>'
            flag = true
        }
    } catch (err) {
        advert += 'El costo solo pueden números <br>'
        flag = true
    }

    if (flag) {
        warning.innerHTML = advert;
    } else {
        // Si todo es válido, puedes continuar con el submit aquí
        form.submit();
    }

})