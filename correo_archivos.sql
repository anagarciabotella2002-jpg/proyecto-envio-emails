CREATE DATABASE IF NOT EXISTS correo_archivos;
USE correo_archivos;

CREATE TABLE bloques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden INT NOT NULL,
    destinatario VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    visible TINYINT(1) DEFAULT 1
);
