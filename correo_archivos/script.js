const archivosSeleccionados = {};
// Obtener el valor inicial desde el input hidden al cargar la página
let contadorBloques = parseInt(document.getElementById('bloquesVisibles').value) || 0;

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
    const formulario = document.querySelector('#formulario');
    
    // Crear el nuevo bloque
    const nuevoBloque = document.createElement('div');
    // Apply Tailwind classes for the card style
    nuevoBloque.className = 'seccion bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-200 hover:shadow-md transition-shadow duration-300';
    nuevoBloque.id = `bloque${contadorBloques}`;
    
    nuevoBloque.innerHTML = `
        <label class="block mb-2 font-semibold text-gray-700 text-sm">Para:</label>
        <input type="email" name="destinatario${contadorBloques}" placeholder="ejemplo@correo.com" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-5">

        <label class="block mb-2 font-semibold text-gray-700 text-sm">Asunto:</label>
        <input type="text" name="titulo${contadorBloques}" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-5">

        <input type="file" name="archivo${contadorBloques}[]" multiple onchange="mostrarArchivos(this, 'lista${contadorBloques}')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4 transition-all">

        <div id="lista${contadorBloques}" class="file-list border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-4 min-h-[40px] mb-6 flex flex-col justify-center"></div>

        <label class="block mb-2 font-semibold text-gray-700 text-sm">Mensaje:</label>
        <input type="hidden" name="subtitulo${contadorBloques}" value="Texto del correo">

        <textarea name="email${contadorBloques}" rows="8" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-sans"></textarea>
    `;

    // Insertar antes de los botones de envío
    const botonesSubmit = formulario.querySelector('button[type="submit"]');
    formulario.insertBefore(nuevoBloque, botonesSubmit);
    
    // Actualizar el contador global
    document.getElementById('bloquesVisibles').value = contadorBloques;
}

function eliminarBloque() {
    if (contadorBloques <= 0) return; // Nada que borrar

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
