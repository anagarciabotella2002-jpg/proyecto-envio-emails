<?php
/*enviar_correos.php */
session_start();

require_once __DIR__ . '/../conexion/conexion.php';
require_once __DIR__ . '/mailer.php';

// Inicializar variables
$mensajes = [];
$titulos = [];
$subtitulos = [];
$destinatarios = [];
$resultado = '';

//LEER BLOQUES DESDE MYSQL
// Solo leemos lo básico: titulo, subtitulo, mensaje
$stmt = $pdo->query("
    SELECT destinatario, titulo, subtitulo, mensaje
    FROM bloques 
    WHERE visible = 1 
    ORDER BY orden
");

$bloques = $stmt->fetchAll();
$bloques_visibles = count($bloques);

if ($bloques_visibles === 0) {
    $bloques_visibles = 1;
    $destinatarios[1] = "";
    $titulos[1] = ""; // Ahora sale vacío
    $subtitulos[1] = ""; // También quitamos el subtítulo por defecto si quieres
    $mensajes[1] = "";
} else {
    foreach ($bloques as $i => $bloque) {
        $n = $i + 1;
        $destinatarios[$n] = $bloque['destinatario'];

        // Si el título es el genérico por defecto (independientemente del número o icono), lo mostramos vacío
        $t = $bloque['titulo'];
        if (strpos($t, 'Archivos para correo') !== false) {
            $t = "";
        }

        $titulos[$n] = $t;
        $subtitulos[$n] = $bloque['subtitulo'];
        $mensajes[$n] = $bloque['mensaje'];
    }
}

// PROCESAR FORMULARIO
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $enviosExitosos = 0;

    $es_guardado = isset($_POST['guardar_cambios']);

    // 🔹 GUARDAR CAMBIOS EN MYSQL
    $stmtAll = $pdo->query("SELECT id, orden FROM bloques WHERE visible = 1 ORDER BY orden ASC");
    $bloques_existentes = $stmtAll->fetchAll(PDO::FETCH_ASSOC);
    $num_existentes = count($bloques_existentes);

    $nuevos_bloques_visibles = isset($_POST['bloques_visibles']) ? (int) $_POST['bloques_visibles'] : $bloques_visibles;

    // Actualizamos destinatario, titulo, subtitulo, mensaje
    $stmtUpdate = $pdo->prepare("UPDATE bloques SET destinatario = ?, titulo = ?, subtitulo = ?, mensaje = ?, orden = ? WHERE id = ?");
    $stmtInsert = $pdo->prepare("INSERT INTO bloques (orden, destinatario, titulo, subtitulo, mensaje, visible) VALUES (?, ?, ?, ?, ?, 1)");
    $stmtDelete = $pdo->prepare("DELETE FROM bloques WHERE id = ?");

    for ($i = 1; $i <= $nuevos_bloques_visibles; $i++) {

        $destinatario = $_POST["destinatario$i"] ?? '';
        $titulo = $_POST["titulo$i"] ?? '';
        $subtitulo = $_POST["subtitulo$i"] ?? '';
        $email = $_POST["email$i"] ?? '';

        $index_array = $i - 1;

        if ($index_array < $num_existentes) {
            $bloque_actual = $bloques_existentes[$index_array];
            $stmtUpdate->execute([$destinatario, $titulo, $subtitulo, $email, $i, $bloque_actual['id']]);
        } else {
            $stmtInsert->execute([$i, $destinatario, $titulo, $subtitulo, $email]);
        }
    }

    if ($num_existentes > $nuevos_bloques_visibles) {
        for ($k = $nuevos_bloques_visibles; $k < $num_existentes; $k++) {
            $stmtDelete->execute([$bloques_existentes[$k]['id']]);
        }
    }

    //ENVIAR CORREOS
    if (!$es_guardado) {

        for ($i = 1; $i <= $nuevos_bloques_visibles; $i++) {

            // Tus variables originales se mantienen
            $t = $_POST["titulo$i"] ?? '';
            $b = $_POST["email$i"] ?? '';
            $d = $_POST["destinatario$i"] ?? '';
            $archivosRaw = $_FILES["archivo$i"]; // El array original de $_FILES

            $tieneContenido = !empty($b) || !empty(array_filter($archivosRaw['name']));

            if (!empty($t) && !empty($d) && $tieneContenido) {

                // --- NUEVA LÓGICA: GUARDAR EN CARPETA 'UPLOADS' ---
                $rutasParaEnviar = []; // Array limpio para pasar al mailer

                // 1. Definir carpeta (usamos el email del destinatario para organizar)
                // Limpiamos el email para evitar caracteres raros en nombres de carpeta
                $nombreCarpeta = preg_replace('/[^a-zA-Z0-9@._-]/', '', $d);
                $carpetaDestino = 'uploads/' . $nombreCarpeta . '/';

                if (!is_dir($carpetaDestino)) {
                    mkdir($carpetaDestino, 0777, true);
                }

                // 2. Procesar los archivos si existen
                if (!empty($archivosRaw['name'][0])) {
                    $total = count($archivosRaw['name']);

                    for ($k = 0; $k < $total; $k++) {
                        // Extraemos datos del archivo actual
                        $nombreOriginal = $archivosRaw['name'][$k];
                        $tmpName = $archivosRaw['tmp_name'][$k];
                        $error = $archivosRaw['error'][$k];

                        if ($error === UPLOAD_ERR_OK) {
                            // Renombrado (Logica del 1, 2, 3...)
                            $info = pathinfo($nombreOriginal);
                            $base = $info['filename'];
                            $ext = isset($info['extension']) ? '.' . $info['extension'] : '';

                            $nombreFinal = $base . $ext;
                            $contador = 1;

                            while (file_exists($carpetaDestino . $nombreFinal)) {
                                $nombreFinal = $base . '_' . $contador . $ext;
                                $contador++;
                            }

                            $rutaCompleta = $carpetaDestino . $nombreFinal;

                            // Movemos el archivo de TMP a UPLOADS
                            if (move_uploaded_file($tmpName, $rutaCompleta)) {
                                $rutasParaEnviar[] = $rutaCompleta;
                            }
                        }
                    }
                }
                // --- FIN NUEVA LÓGICA ---

                // Usamos tu misma llamada, pero pasando el nuevo array de rutas
                if (enviarCorreo($d, $t, $b, $rutasParaEnviar) === true) {
                    $enviosExitosos++;
                }
            }
        }

        // Determinar mensaje y tipo
        if ($enviosExitosos > 0) {
            $msg = "Se enviaron $enviosExitosos correos correctamente.";
            $type = "success";
        } else {
            $msg = "No se enviaron correos (verifica datos).";
            $type = "error";
        }
    } else {
        $msg = "Cambios guardados correctamente.";
        $type = "success";
    }

    // Redirección a index.html con parámetros
    header("Location: index.html?msg=" . urlencode($msg) . "&type=" . $type);
    exit;
} else if (isset($_GET['accion']) && $_GET['accion'] === 'obtener_datos') {
    // API para obtener datos en JSON
    header('Content-Type: application/json');
    echo json_encode($bloques);
    exit;
}