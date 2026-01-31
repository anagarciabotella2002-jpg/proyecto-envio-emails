const archivosSeleccionados = {};
// El contador se actualizará según los datos recibidos
let contadorBloques = 0;

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    verificarMensajes();
});

// Función para mostrar mensajes de la URL
function verificarMensajes() {
    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('msg');
    const type = urlParams.get('type');

    if (msg && type) {
        const div = document.createElement('div');
        div.className = type === 'success' ? 'msg-success' : 'msg-error-global';
        div.textContent = decodeURIComponent(msg);
        
        // Insertar después del título h2
        const h2 = document.querySelector('h2');
        if(h2) {
            h2.parentNode.insertBefore(div, h2.nextSibling);
        }

        // Limpiar URL para que no salga el mensaje si se recarga limpiamente
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function cargarDatos() {
    try {
        const response = await fetch('enviar-correos.php?accion=obtener_datos');
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const bloques = await response.json();
        
        const contenedor = document.querySelector('form button[type="submit"]'); // Punto de referencia
        
        // Si no hay bloques, la BD devuelve array vacío.
        if (bloques.length === 0) {
            // Caso por defecto: 1 bloque vacío
             agregarBloqueVisual(1, '', '', '');
             contadorBloques = 1;
        } else {
             bloques.forEach((bloque, index) => {
                 const i = index + 1;
                 // Limpieza de título por defecto
                 let titulo = bloque.titulo || '';
                 if (titulo.includes('Archivos para correo')) titulo = '';
                 
                 agregarBloqueVisual(i, bloque.destinatario, titulo, bloque.mensaje);
                 contadorBloques = i;
             });
        }
        
        document.getElementById('bloquesVisibles').value = contadorBloques;

    } catch (error) {
        console.error(error);
        // Fallback: añadir 1 bloque vacío si falla
        agregarBloqueVisual(1, '', '', '');
        contadorBloques = 1;
        document.getElementById('bloquesVisibles').value = 1;
    }
}

// Función auxiliar para generar el HTML de un bloque
function agregarBloqueVisual(idNum, destinatario, titulo, mensaje) {
    const formulario = document.querySelector('#formulario');
    const botonesSubmit = formulario.querySelector('button[type="submit"]');
    
    // Evitar duplicados
    if(document.getElementById(`bloque${idNum}`)) return;

    const nuevoBloque = document.createElement('div');
    nuevoBloque.className = 'seccion';
    nuevoBloque.id = `bloque${idNum}`;
    
    nuevoBloque.innerHTML = `
        <label style="display:block; margin-bottom:5px;">Para:</label>
        <input type="email" name="destinatario${idNum}" placeholder="ejemplo@correo.com" 
            value="${destinatario || ''}" 
            style="width: 100%; padding: 8px; margin-bottom: 10px;">

        <label style="display:block; margin-bottom:5px;">Asunto:</label>
        <input type="text" name="titulo${idNum}" 
            value="${titulo || ''}"
            style="width: 100%; padding: 8px; margin-bottom: 10px; font-weight: bold;">

        <input type="file" name="archivo${idNum}[]" multiple onchange="mostrarArchivos(this, 'lista${idNum}')">
        <div id="lista${idNum}" class="file-list"></div>

        <label style="display:block; margin-top: 15px; margin-bottom:5px;">Mensaje:</label>
        <input type="hidden" name="subtitulo${idNum}" value="Texto del correo">

        <textarea name="email${idNum}" rows="8">${mensaje || ''}</textarea>
    `;

    formulario.insertBefore(nuevoBloque, botonesSubmit);
}


function mostrarArchivos(input, contenedorId) {
    if (!archivosSeleccionados[contenedorId]) archivosSeleccionados[contenedorId] = [];

    // Validación de archivos
    for (let f of input.files) {
        if (f.size > 5 * 1024 * 1024) { // Limitar a 5 MB por archivo
            alert('El archivo es demasiado grande. Debe ser menor a 5MB.');
            return;
        }
        archivosSeleccionados[contenedorId].push(f.name);
    }

    const cont = document.getElementById(contenedorId);
    cont.innerHTML = archivosSeleccionados[contenedorId].map(n => `<p>${n}</p>`).join('');
}

function agregarBloque() {
    contadorBloques++;
    // Añadimos bloque vacío
    agregarBloqueVisual(contadorBloques, '', '', '');
    
    // Actualizar el contador global
    document.getElementById('bloquesVisibles').value = contadorBloques;
}

function eliminarBloque() {
    if (contadorBloques <= 0) return;

    const ultimoBloque = document.getElementById(`bloque${contadorBloques}`);
    if (ultimoBloque) {
        ultimoBloque.remove();
        delete archivosSeleccionados[`lista${contadorBloques}`];
        contadorBloques--;
        
        // Actualizar el contador global
        document.getElementById('bloquesVisibles').value = contadorBloques;
    } else {
        // En caso de desincronización
        contadorBloques--;
        document.getElementById('bloquesVisibles').value = contadorBloques;
    }
}

function guardarCambios() {
    const form = document.getElementById('formulario');

    // Actualizar el valor de bloques visibles
    const bloquesInput = document.getElementById('bloquesVisibles');
    bloquesInput.value = contadorBloques;

    // Asegurar que el campo "guardar_cambios" esté presente
    let guardarInput = form.querySelector('input[name="guardar_cambios"]');
    if (!guardarInput) {
        guardarInput = document.createElement('input');
        guardarInput.type = 'hidden';
        guardarInput.name = 'guardar_cambios';
        guardarInput.value = '1';
        form.appendChild(guardarInput);
    }

    form.submit();
}
