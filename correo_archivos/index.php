<?php
/*index.php*/
include 'enviar-correos.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Envío de Archivos</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4f46e5',
                        'primary-hover': '#4338ca',
                    }
                }
            }
        }
    </script>
</head>

<body class="bg-gray-100 text-gray-800 font-sans p-5 antialiased">

    <h2 class="text-center text-gray-900 text-3xl font-bold mb-10">Formulario de envío de correos con archivos</h2>

    <?php if (isset($_SESSION['msg_success'])): ?>
        <div class="bg-green-50 text-green-800 p-4 rounded-lg mb-8 text-center border border-green-200 font-medium max-w-3xl mx-auto shadow-sm">
            <?= htmlspecialchars($_SESSION['msg_success']) ?>
        </div>
    <?php endif; ?>

    <?php if (isset($_SESSION['msg_error_global'])): ?>
        <div class="bg-red-50 text-red-800 p-4 rounded-lg mb-8 text-center border border-red-200 font-medium max-w-3xl mx-auto shadow-sm">
            <?= htmlspecialchars($_SESSION['msg_error_global']) ?>
        </div>
    <?php endif; ?>

    <div id="contenedor-bloques" class="max-w-3xl mx-auto pb-12">

        <div class="block-controls flex justify-center gap-4 mb-8">
            <button type="button" onclick="agregarBloque()" class="bg-white border border-gray-300 text-gray-700 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2">
                ➕ Añadir nuevo bloque
            </button>
            <button type="button" onclick="eliminarBloque()" class="bg-white border border-gray-300 text-gray-700 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2">
                ➖ Eliminar último bloque
            </button>
        </div>

        <form method="POST" enctype="multipart/form-data" id="formulario">
            <input type="hidden" name="bloques_visibles" id="bloquesVisibles" value="<?= $bloques_visibles ?>">

            <?php for ($i = 1; $i <= $bloques_visibles; $i++): ?>
                <div class="seccion bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-200 hover:shadow-md transition-shadow duration-300" id="bloque<?= $i ?>">

                    <label class="block mb-2 font-semibold text-gray-700 text-sm">Para:</label>
                    <input type="email" name="destinatario<?= $i ?>" placeholder="ejemplo@correo.com"
                        value="<?= htmlspecialchars($destinatarios[$i] ?? '') ?>"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-5">

                    <label class="block mb-2 font-semibold text-gray-700 text-sm">Asunto:</label>
                    <input type="text" name="titulo<?= $i ?>" value="<?= htmlspecialchars($titulos[$i]) ?>"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-5">

                    <input type="file" name="archivo<?= $i ?>[]" multiple
                        onchange="mostrarArchivos(this, 'lista<?= $i ?>')"
                        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4 transition-all">

                    <div id="lista<?= $i ?>" class="file-list border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-4 min-h-[40px] mb-6 flex flex-col justify-center"></div>

                    <label class="block mb-2 font-semibold text-gray-700 text-sm">Mensaje:</label>
                    <input type="hidden" name="subtitulo<?= $i ?>" value="Texto del correo">
                    <!-- Valor por defecto para mantener BD feliz -->

                    <textarea name="email<?= $i ?>" rows="8" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-sans"><?= htmlspecialchars($mensajes[$i] ?? '') ?></textarea>
                </div>
            <?php endfor; ?>

            <button type="submit" class="w-full bg-indigo-600 text-white font-bold text-lg py-3.5 rounded-lg shadow hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2">
                📤 Enviar
            </button>
            <button type="button" onclick="guardarCambios()" class="w-full bg-transparent text-gray-500 font-semibold py-3 border-2 border-transparent hover:border-gray-300 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200 mt-4 flex justify-center items-center gap-2">
                💾 Guardar cambios
            </button>
        </form>
    </div>

    <?php
    // Limpiar mensajes después de mostrarlos
    unset($_SESSION['msg_success']);
    unset($_SESSION['msg_error_global']);
    ?>

    <script src="script.js?v=<?= microtime(true) ?>"></script>
</body>

</html>
