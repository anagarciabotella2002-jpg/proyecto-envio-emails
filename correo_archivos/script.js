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
    nuevoBloque.className = 'seccion';
    nuevoBloque.id = `bloque${contadorBloques}`;
    
    nuevoBloque.innerHTML = `
        <label style="display:block; margin-bottom:5px;">Para:</label>
        <input type="email" name="destinatario${contadorBloques}" placeholder="ejemplo@correo.com" style="width: 100%; padding: 8px; margin-bottom: 10px;">

        <label style="display:block; margin-bottom:5px;">Asunto:</label>
        <input type="text" name="titulo${contadorBloques}" style="width: 100%; padding: 8px; margin-bottom: 10px; font-weight: bold;">

        <input type="file" name="archivo${contadorBloques}[]" multiple onchange="mostrarArchivos(this, 'lista${contadorBloques}')">
        <div id="lista${contadorBloques}" class="file-list"></div>

        <label style="display:block; margin-top: 15px; margin-bottom:5px;">Mensaje:</label>
        <input type="hidden" name="subtitulo${contadorBloques}" value="Texto del correo">

        <textarea name="email${contadorBloques}" rows="8"></textarea>
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
