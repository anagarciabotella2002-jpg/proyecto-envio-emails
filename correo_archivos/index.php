<?php
/*index.php*/
include 'enviar-correos.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Envío de Archivos</title>
    <link rel="stylesheet" href="/proyecto_email/correo_archivos/style.css?v=<?= time() ?>">
</head>

<body>

    <h2>Formulario de envío de correos con archivos</h2>

    <?php if (isset($_SESSION['msg_success'])): ?>
        <div class="msg-success">
            <?= htmlspecialchars($_SESSION['msg_success']) ?>
        </div>
    <?php endif; ?>

    <?php if (isset($_SESSION['msg_error_global'])): ?>
        <div class="msg-error-global">
            <?= htmlspecialchars($_SESSION['msg_error_global']) ?>
        </div>
    <?php endif; ?>

    <div id="contenedor-bloques">

        <div class="block-controls" style="margin: 10px 0;">
            <button type="button" onclick="agregarBloque()">➕ Añadir nuevo bloque</button>
            <button type="button" onclick="eliminarBloque()">➖ Eliminar último bloque</button>
        </div>

        <form method="POST" enctype="multipart/form-data" id="formulario">
            <input type="hidden" name="bloques_visibles" id="bloquesVisibles" value="<?= $bloques_visibles ?>">

            <?php for ($i = 1; $i <= $bloques_visibles; $i++): ?>
                <div class="seccion" id="bloque<?= $i ?>">

                    <label style="display:block; margin-bottom:5px;">Para:</label>
                    <input type="email" name="destinatario<?= $i ?>" placeholder="ejemplo@correo.com"
                        value="<?= htmlspecialchars($destinatarios[$i] ?? '') ?>"
                        style="width: 100%; padding: 8px; margin-bottom: 10px;">

                    <label style="display:block; margin-bottom:5px;">Asunto:</label>
                    <input type="text" name="titulo<?= $i ?>" value="<?= htmlspecialchars($titulos[$i]) ?>"
                        style="width: 100%; padding: 8px; margin-bottom: 10px; font-weight: bold;">

                    <input type="file" name="archivo<?= $i ?>[]" multiple
                        onchange="mostrarArchivos(this, 'lista<?= $i ?>')">
                    <div id="lista<?= $i ?>" class="file-list"></div>

                    <label style="display:block; margin-top: 15px; margin-bottom:5px;">Mensaje:</label>
                    <input type="hidden" name="subtitulo<?= $i ?>" value="Texto del correo">
                    <!-- Valor por defecto para mantener BD feliz -->

                    <textarea name="email<?= $i ?>" rows="8"><?= htmlspecialchars($mensajes[$i] ?? '') ?></textarea>
                </div>
            <?php endfor; ?>

            <button type="submit">📤 Enviar</button>
            <button type="button" onclick="guardarCambios()">💾 Guardar cambios</button>
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