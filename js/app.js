// Variables y Selectores
const formulario = document.querySelector('#agregar-gasto'); // Selecciona el formulario con el id 'agregar-gasto'.
const gastoListado = document.querySelector('#gastos ul'); // Selecciona la lista no ordenada dentro del elemento con id 'gastos'.

// Eventos
enventListener();
function enventListener() {
    // Cuando el documento esté listo, pregunta el presupuesto.
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    // Cuando se envíe el formulario, agrega el gasto.
    formulario.addEventListener('submit', agregarGasto);
}

// Clases
class Presupuesto {
    // Esta clase maneja el presupuesto, los gastos y el cálculo del presupuesto restante.
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    // Agrega un nuevo gasto al arreglo de gastos y recalcula el presupuesto restante.
    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    // Calcula el presupuesto restante, restando la suma de los gastos del presupuesto inicial.
    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    // Elimina un gasto del arreglo de gastos usando su id, y recalcula el presupuesto restante.
    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

class UI {
    // Esta clase maneja las interacciones y la visualización en la interfaz de usuario.
    insertarPresaupuesto(cantidad) {
        // Inserta el presupuesto y el presupuesto restante en el HTML.
        const { presupuesto, restante } = cantidad;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    // Muestra una alerta en la UI.
    imprimirAlerta(mensaje, tipo) {
        // El tipo puede ser 'error' o cualquier otra cosa (generalmente 'success').
        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert');
        // Según el tipo, agrega una clase diferente al div del mensaje.
        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }
        divMensaje.textContent = mensaje;
        document.querySelector('.primario').insertBefore(divMensaje, formulario);
        // Elimina el mensaje después de 3 segundos.
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    // Muestra los gastos en la UI.
    mostrarGastos(gastos) {
        this.limpiarHTML(); // Limpia el HTML Previo
        // Itera sobre los gastos, creando y agregando un nuevo elemento 'li' por cada uno.
        gastos.forEach(gasto => {
            const { cantidad, nombre, id } = gasto;
            const nuevoGasto = document.createElement('LI');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>`;

            const btnBorrar = document.createElement('BUTTON');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () => { eliminarGasto(id); }
            nuevoGasto.appendChild(btnBorrar);
            gastoListado.appendChild(nuevoGasto);
        });
    }

    // Limpia los elementos de la lista de gastos en el HTML.
    limpiarHTML() {
        while (gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    // Actualiza el presupuesto restante en la UI.
    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    // Comprueba el presupuesto restante y cambia el color de la UI según el porcentaje del presupuesto que queda.
    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        if ((presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if ((presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }
        if (restante <= 0) {
            ui.imprimirAlerta('El Presupuesto se ha Agotado...', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}

// Instancias
const ui = new UI(); // Se crea una nueva instancia de UI.
let presupuesto; // Variable para la instancia de Presupuesto que se creará más adelante.

// Funciones
function preguntarPresupuesto() {
    // Pregunta al usuario su presupuesto y crea una nueva instancia de Presupuesto con ese valor.
    const presupuestoUsuario = prompt('¿Cual es tu Presupuesto?');
    if (presupuestoUsuario === '' || presupuestoUsuario === null
        || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        window.location.reload();
    }
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresaupuesto(presupuesto);
}

// Agrega un gasto al presupuesto.
function agregarGasto(e) {
    e.preventDefault();
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    // Valida los datos del gasto.
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos Campos son Obligatorios...', 'error');
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('La Cantidad No es Valida...', 'error');
        return;
    }

    // Crea un objeto de gasto y lo agrega al presupuesto.
    const gasto = { nombre, cantidad, id: Date.now() };
    presupuesto.nuevoGasto(gasto);

    // Actualiza la UI.
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    // Reinicia el formulario.
    formulario.reset();
}

// Elimina un gasto del presupuesto y actualiza la UI.
function eliminarGasto(id) {
    presupuesto.eliminarGasto(id);
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}
