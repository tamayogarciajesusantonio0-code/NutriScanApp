const Anthropic = require('@anthropic-ai/sdk');
const db        = require('../config/db');
const fs        = require('fs');

const client = new Anthropic({ 
  apiKey:  process.env.ANTHROPIC_API_KEY,
  timeout: 60000
});

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

exports.analizarFoto = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'No se recibió ninguna imagen.' });

  const rutaArchivo = req.file.path;

  try {
    const imageData = fs.readFileSync(rutaArchivo);
    const base64    = imageData.toString('base64');
    const mediaType = req.file.mimetype;

    const respuesta = await client.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text',  text: PROMPT_NUTRICION }
        ]
      }]
    });

    fs.unlinkSync(rutaArchivo);

    const textoRespuesta = respuesta.content[0].text.trim();
    const limpio    = textoRespuesta.replace(/```json|```/g, '').trim();
    const nutricion = JSON.parse(limpio);

    await db.query(
      `INSERT INTO alimentos (usuario_id, nombre, calorias, proteinas, carbohidratos, grasas, confianza)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, nutricion.nombre, nutricion.calorias, nutricion.proteinas,
       nutricion.carbohidratos, nutricion.grasas, nutricion.confianza]
    );

    res.json(nutricion);

  } catch (err) {
    if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
    console.error('Error al analizar foto:', err);
    res.status(500).json({ error: 'Error al analizar la imagen con IA.' });
  }
};

exports.obtenerHistorial = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, calorias, proteinas, carbohidratos, grasas, confianza, fecha
       FROM alimentos WHERE usuario_id = ? AND fecha = CURRENT_DATE ORDER BY id DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el historial.' });
  }
};