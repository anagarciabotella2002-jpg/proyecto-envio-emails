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
        div.className = type === 'success' 
            ? 'p-4 rounded-lg mb-8 text-center font-medium bg-success-bg text-success-text border border-green-200' 
            : 'p-4 rounded-lg mb-8 text-center font-medium bg-error-bg text-error-text border border-red-200';
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
        const response = await fetch(`enviar-correos.php?accion=obtener_datos&t=${new Date().getTime()}`);
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
    nuevoBloque.className = 'bg-card-bg rounded-xl shadow-sm hover:shadow-lg p-8 mb-6 border border-gray-200 transition-shadow duration-300';
    nuevoBloque.id = `bloque${idNum}`;
    
    nuevoBloque.innerHTML = `
        <label class="block mb-1.5 font-semibold text-gray-700 text-sm">Para:</label>
        <input type="email" name="destinatario${idNum}" placeholder="ejemplo@correo.com" 
            value="${destinatario || ''}" 
            class="w-full box-border p-3 border border-gray-300 rounded-lg text-base mb-5 bg-white transition-colors focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">

        <label class="block mb-1.5 font-semibold text-gray-700 text-sm">Asunto:</label>
        <input type="text" name="titulo${idNum}" 
            value="${titulo || ''}"
            class="w-full box-border p-3 border border-gray-300 rounded-lg text-base mb-5 bg-white transition-colors focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-gray-900">

        <input type="file" name="archivo${idNum}[]" multiple onchange="mostrarArchivos(this, 'lista${idNum}')" class="mb-2">
        <div id="lista${idNum}" class="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-4 min-h-[40px] mb-6 flex flex-col justify-center"></div>

        <label class="block mt-4 mb-1.5 font-semibold text-gray-700 text-sm">Mensaje:</label>
        <input type="hidden" name="subtitulo${idNum}" value="Texto del correo">

        <textarea name="email${idNum}" rows="8" class="w-full box-border p-3 border border-gray-300 rounded-lg text-base mb-5 bg-white transition-colors focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-inherit">${mensaje || ''}</textarea>
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
    cont.innerHTML = archivosSeleccionados[contenedorId].map(n => 
        `<p class="my-1 text-sm text-slate-600 pl-6 relative bg-no-repeat bg-left-center" style="background-image: url('data:image/svg+xml;utf8,<svg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%23475569\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101M17.5 17.5l-3.236-3.236\\' /><path d=\\'M7 7l3.236 3.236\\' /><path d=\\'M10.172 13.828a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.102 1.101\\' /></svg>')">${n}</p>`
    ).join('');
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
