<?php
/*mailer.php*/
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';
/* mailer.php */
require_once __DIR__ . '/config.php'; // Importamos las claves

function enviarCorreo($destinatario, $asunto, $cuerpoHTML, $archivos = [], $nombreRemitente = 'MiniPortal')
{
    $mail = new PHPMailer(true);

    try {
        $mail->CharSet = 'UTF-8';
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_EMAIL;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;


        // Remitente y destinatario
        // Usamos la cuenta autenticada como remitente para evitar bloqueos, pero permitimos cambiar el nombre
        $mail->setFrom(SMTP_EMAIL, $nombreRemitente);
        $mail->addAddress($destinatario);


        // Contenido del correo
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = $cuerpoHTML;

        // Adjuntar archivos si existen
        if (!empty($archivos)) {
            foreach ($archivos as $ruta) {
                if (file_exists($ruta)) {
                    $mail->addAttachment($ruta);
                }
            }
        }

        $mail->send();
        return true;

    } catch (Exception $e) {
        // error_log("Error enviando correo: {$mail->ErrorInfo}");
        return 'Error: ' . $mail->ErrorInfo;
    }
}
?>