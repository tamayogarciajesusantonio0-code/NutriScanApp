-- ============================================================
-- nutricion.sql — Estructura de la base de datos NutriScanApp
-- Ejecutar: mysql -u root -p < database/nutricion.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS nutricion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nutricion;

-- ── Tabla de usuarios ──
CREATE TABLE IF NOT EXISTS usuarios (
  id             INT          AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  correo         VARCHAR(150) NOT NULL UNIQUE,
  password       VARCHAR(255) NOT NULL,
  meta_calorica  INT          NOT NULL DEFAULT 2000,
  creado_en      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Tabla de alimentos registrados ──
CREATE TABLE IF NOT EXISTS alimentos (
  id             INT            AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT            NOT NULL,
  nombre         VARCHAR(150)   NOT NULL,
  calorias       INT            DEFAULT 0,
  proteinas      DECIMAL(6,2)   DEFAULT 0,
  carbohidratos  DECIMAL(6,2)   DEFAULT 0,
  grasas         DECIMAL(6,2)   DEFAULT 0,
  confianza      INT            DEFAULT 0,
  fecha          DATE           DEFAULT (CURRENT_DATE),
  creado_en      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ── Índice para consultas por fecha ──
CREATE INDEX idx_alimentos_fecha ON alimentos(usuario_id, fecha);

-- ── Tabla de sesiones (opcional, para invalidar tokens) ──
CREATE TABLE IF NOT EXISTS sesiones (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT          NOT NULL,
  token       VARCHAR(500),
  expira_en   DATETIME,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
