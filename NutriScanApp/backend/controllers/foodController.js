/* ============================================================
   foodController.js — Análisis de alimentos con Claude Vision
   Rutas que lo usan:
     POST /api/food/analizar    → recibe imagen, devuelve nutrición
     GET  /api/food/historial   → alimentos del día del usuario
   ============================================================ */

const Anthropic = require('@anthropic-ai/sdk');
const db        = require('../config/db');
const fs        = require('fs');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ── Prompt para Claude ── */
const PROMPT_NUTRICION = `
Eres un experto en nutrición. Analiza el alimento en esta imagen y responde 
ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin backticks:

{
  "nombre": "nombre del alimento identificado",
  "calorias": número entero de kcal totales,
  "proteinas": número decimal en gramos,
  "carbohidratos": número decimal en gramos,
  "grasas": número decimal en gramos,
  "peso_estimado_g": número entero en gramos,
  "confianza": número entero del 1 al 100 indicando tu certeza
}

Si no puedes identificar ningún alimento, responde con el mismo JSON pero
todos los valores numéricos en 0 y nombre igual a "No identificado".
`.trim();

/* ── POST /api/food/analizar ── */
exports.analizarFoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
  }

  const rutaArchivo = req.file.path;

  try {
    // Leer imagen y convertir a base64
    const imageData  = fs.readFileSync(rutaArchivo);
    const base64     = imageData.toString('base64');
    const mediaType  = req.file.mimetype; // 'image/jpeg' | 'image/png'

    // ── Llamar a Claude Vision ──
    const respuesta = await client.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 }
          },
          {
            type: 'text',
            text: PROMPT_NUTRICION
          }
        ]
      }]
    });

    // Borrar imagen temporal
    fs.unlinkSync(rutaArchivo);

    // Parsear respuesta JSON de Claude
const textoRespuesta = respuesta.content[0].text.trim();
const limpio = textoRespuesta.replace(/```json|```/g, '').trim();
const nutricion = JSON.parse(limpio);

    // Guardar registro en la base de datos
    await db.query(
      `INSERT INTO alimentos 
       (usuario_id, nombre, calorias, proteinas, carbohidratos, grasas, confianza)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuario.id,
        nutricion.nombre,
        nutricion.calorias,
        nutricion.proteinas,
        nutricion.carbohidratos,
        nutricion.grasas,
        nutricion.confianza
      ]
    );

    res.json(nutricion);

  } catch (err) {
    // Limpiar archivo si existe
    if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);

    console.error('Error al analizar foto:', err);
    res.status(500).json({ error: 'Error al analizar la imagen con IA.' });
  }
};

/* ── GET /api/food/historial ── */
exports.obtenerHistorial = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, calorias, proteinas, carbohidratos, grasas, confianza, fecha
       FROM alimentos
       WHERE usuario_id = ? AND fecha = CURRENT_DATE
       ORDER BY id DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
};
