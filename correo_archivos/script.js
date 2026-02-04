const archivosSeleccionados = {};
let contadorBloques = 0;

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    verificarMensajes();
});

// Función para mostrar mensajes de confirmación/error
function verificarMensajes() {
    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('msg');
    const type = urlParams.get('type');

    if (msg && type) {
        const div = document.createElement('div');
        const isSuccess = type === 'success';
        
        div.className = `max-w-2xl mx-auto mb-8 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${
            isSuccess 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
            : 'bg-red-50 text-red-800 border border-red-100'
        }`;
        
        const icon = isSuccess 
            ? '<svg class="w-5 h-5 flex-shrink-0 text-emerald-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="w-5 h-5 flex-shrink-0 text-red-500" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

        div.innerHTML = `${icon} <span class="font-medium text-sm">${decodeURIComponent(msg)}</span>`;
        
        const container = document.getElementById('contenedor-bloques');
        container.insertBefore(div, container.firstChild);

        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function cargarDatos() {
    try {
        const response = await fetch(`enviar-correos.php?accion=obtener_datos&t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const bloques = await response.json();
        
        if (bloques.length === 0) {
             agregarBloqueVisual(1, '', '', '');
             contadorBloques = 1;
        } else {
             bloques.forEach((bloque, index) => {
                 const i = index + 1;
                 let titulo = bloque.titulo || '';
                 if (titulo.includes('Archivos para correo')) titulo = '';
                 
                 agregarBloqueVisual(i, bloque.destinatario, titulo, bloque.mensaje);
                 contadorBloques = i;
             });
        }
        
        document.getElementById('bloquesVisibles').value = contadorBloques;

    } catch (error) {
        console.error(error);
        agregarBloqueVisual(1, '', '', '');
        contadorBloques = 1;
        document.getElementById('bloquesVisibles').value = 1;
    }
}

function agregarBloqueVisual(idNum, destinatario, titulo, mensaje) {
    const formulario = document.querySelector('#formulario');
    const botonesSubmit = formulario.querySelector('.border-t'); // Insertar antes de la barra de botones
    
    if(document.getElementById(`bloque${idNum}`)) return;

    const nuevoBloque = document.createElement('div');
    // Tarjeta con diseño limpio: fondo blanco, sombra suave, bordes redondeados
    nuevoBloque.className = 'bg-white rounded-xl shadow-soft border border-surface-200 p-6 md:p-8 mb-6 transition-all duration-300 hover:shadow-lg group relative';
    nuevoBloque.id = `bloque${idNum}`;
    
    // Indicador de número de bloque
    const badge = `<div class="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shadow-sm border border-white z-10">${idNum}</div>`;

    nuevoBloque.innerHTML = `
        ${badge}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label class="block mb-2 font-medium text-surface-700 text-sm">Destinatario</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                        <svg class="h-4 w-4" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                    </span>
                    <input type="email" name="destinatario${idNum}" placeholder="nombre@ejemplo.com" 
                        value="${destinatario || ''}" 
                        class="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-surface-800 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all">
                </div>
            </div>
            <div>
                <label class="block mb-2 font-medium text-surface-700 text-sm">Asunto del Correo</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                        <svg class="h-4 w-4" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </span>
                    <input type="text" name="titulo${idNum}" placeholder="Asunto importante..."
                        value="${titulo || ''}"
                        class="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-surface-800 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all font-medium">
                </div>
            </div>
        </div>

        <div class="mb-6">
            <label class="block mb-2 font-medium text-surface-700 text-sm">Adjuntar Archivos</label>
            <div class="relative group/file">
                <input type="file" name="archivo${idNum}[]" multiple onchange="mostrarArchivos(this, 'lista${idNum}')" 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                
                <div class="border-2 border-dashed border-surface-300 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-50 transition-colors group-hover/file:bg-brand-50 group-hover/file:border-brand-300">
                    <div class="bg-white p-2 rounded-full shadow-sm mb-3 group-hover/file:scale-110 transition-transform">
                        <svg class="w-6 h-6 text-brand-500" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <p class="text-sm text-surface-600 font-medium">Haz clic o arrastra archivos aquí</p>
                    <p class="text-xs text-surface-400 mt-1">Máximo 5MB por archivo</p>
                </div>
            </div>
            <div id="lista${idNum}" class="mt-3 space-y-2 empty:hidden"></div>
        </div>

        <div>
            <label class="block mb-2 font-medium text-surface-700 text-sm">Mensaje</label>
            <input type="hidden" name="subtitulo${idNum}" value="Texto del correo">
            <textarea name="email${idNum}" rows="4" 
                class="w-full p-4 bg-surface-50 border border-surface-200 rounded-lg text-surface-800 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all resize-y" 
                placeholder="Escribe el contenido de tu correo aquí...">${mensaje || ''}</textarea>
        </div>
    `;

    // Si botonesSubmit es null es porque insertamos al final del form, 
    // pero el form ahora tiene un div con clase border-t al final.
    if (botonesSubmit) {
        formulario.insertBefore(nuevoBloque, botonesSubmit);
    } else {
        formulario.appendChild(nuevoBloque);
    }
}


function mostrarArchivos(input, contenedorId) {
    if (!archivosSeleccionados[contenedorId]) archivosSeleccionados[contenedorId] = [];

    for (let f of input.files) {
        if (f.size > 5 * 1024 * 1024) { 
            alert('El archivo ' + f.name + ' es demasiado grande (Máx 5MB).');
            continue;
        }
        archivosSeleccionados[contenedorId].push(f.name);
    }

    const cont = document.getElementById(contenedorId);
    cont.innerHTML = archivosSeleccionados[contenedorId].map(n => 
        `<div class="flex items-center gap-2 p-2 bg-surface-100 rounded-lg border border-surface-200">
            <svg class="w-4 h-4 text-surface-500" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span class="text-xs text-surface-700 font-medium truncate flex-1">${n}</span>
            <span class="text-xs text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded text-[10px]">Listo</span>
        </div>`
    ).join('');
}

function agregarBloque() {
    contadorBloques++;
    agregarBloqueVisual(contadorBloques, '', '', '');
    document.getElementById('bloquesVisibles').value = contadorBloques;
}

function eliminarBloque() {
    if (contadorBloques <= 0) return;

    const ultimoBloque = document.getElementById(`bloque${contadorBloques}`);
    if (ultimoBloque) {
        ultimoBloque.style.opacity = '0';
        ultimoBloque.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            ultimoBloque.remove();
            delete archivosSeleccionados[`lista${contadorBloques}`];
            contadorBloques--;
            document.getElementById('bloquesVisibles').value = contadorBloques;
        }, 300); // Esperar animación
    } else {
        contadorBloques--;
        document.getElementById('bloquesVisibles').value = contadorBloques;
    }
}

function guardarCambios() {
    const form = document.getElementById('formulario');
    document.getElementById('bloquesVisibles').value = contadorBloques;

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
