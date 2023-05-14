// Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// Eventos
enventListener();
function enventListener() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}


// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        // console.log(gasto);
        this.gastos = [...this.gastos, gasto];
        // console.log(this.gastos);
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        // console.log(gastado);
        this.restante = this.presupuesto - gastado;
        // console.log(this.restante);
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        console.log(this.gastos);
        this.calcularRestante();
    }
}

class UI {
    insertarPresaupuesto(cantidad) {
        // console.log(cantidad);

        // Extrayendo el Valor
        const { presupuesto, restante } = cantidad;

        // Agrega al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {
        /// Crear el div
        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert');

        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de Error
        divMensaje.textContent = mensaje;

        // Insertar en el HTML
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // Eliminar del HTML
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos(gastos) {
        // console.log(gastos); 
        this.limpiarHTML(); // Limpia el HTML Previo

        // Iterar sobre los Gastos
        gastos.forEach(gasto => {
            // console.log(gasto);
            const { cantidad, nombre, id } = gasto;

            // Crear LI
            const nuevoGasto = document.createElement('LI');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            // nuevoGasto.setAttribute('data-id', id);
            nuevoGasto.dataset.id = id;
            // console.log(nuevoGasto);

            // Agregar el HTML de Gasto
            nuevoGasto.innerHTML = `
            ${nombre}
            <span class="badge badge-primary badge-pill">
            $ ${cantidad}
            </span>
             `;

            // Boton para Borrar el Gasto
            const btnBorrar = document.createElement('BUTTON');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            // Agregar el HTML
            gastoListado.appendChild(nuevoGasto);
        });
    }
    // Limpia los Duplicados del HTML
    limpiarHTML() {
        while (gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    // Comprueba el presupuesto restante
    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    // Cambia de color el presupuesto restante
    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');

        // console.log(restante);
        // console.log( presupuesto);

        // Comprobar el 25% 
        if ((presupuesto / 4) > restante) {
            // console.log('Ya Gastaste el 75%...!');
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            // console.log('Ya Gastaste el 50%...!');
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Si presupuesta es igual o Menor a 0 
        if (restante <= 0) {
            ui.imprimirAlerta('El Presupuesto se ha Agotado...', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}


// Instancias
const ui = new UI();
let presupuesto;



// Funciones
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cual es tu Presupuesto?');
    // console.log(Number(presupuestoUsuario));
    if (presupuestoUsuario === '' || presupuestoUsuario === null
        || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }

    // Presuuesto Valido
    presupuesto = new Presupuesto(presupuestoUsuario);
    console.log(presupuesto);

    ui.insertarPresaupuesto(presupuesto);
}


// Agregar Gastos
function agregarGasto(e) {
    e.preventDefault();

    // Leer Datos del Formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    // Validar
    if (nombre === '' || cantidad === '') {
        // console.log('Ambos Campos son Obligatorios...');
        ui.imprimirAlerta('Ambos Campos son Obligatorios...', 'error');
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('La Cantidad No es Valida...', 'error');
        return;
    }
    // console.log('Agregando Gasto...');

    // Generar Un Objeto Gasto
    const gasto = { nombre, cantidad, id: Date.now() };
    /*
        const gasto = { 
        nombre:nombre, 
        cantidad:cantidad, 
        id: Date.now() }; 
    */
    // Añade un Nueo Gasto
    // console.log(gasto);
    presupuesto.nuevoGasto(gasto);

    // Mensaje Exitoso
    ui.imprimirAlerta('Gasto Agregado Correctamente...!');

    // Imprimir los Gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    // Reinicio del Formulario
    formulario.reset();
}

function eliminarGasto(id) {
    // Elimina del Objeto
    presupuesto.eliminarGasto(id);

    // Elimina los Gastos del HTML
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
}
