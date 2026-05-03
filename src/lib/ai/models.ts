/**
 * Aeon IA — Model Registry & Intelligent Router
 * 
 * 5 modelos autorizados, todos gratuitos vía OpenRouter.
 * El router analiza el mensaje del usuario y selecciona
 * automáticamente el modelo óptimo para la tarea.
 */

/* ═══════════════════════════════════════════
 * Model Definitions
 * ═══════════════════════════════════════════ */

export interface AIModel {
  id: string;            // OpenRouter API slug
  name: string;          // Nombre corto para UI
  specialty: string;     // Área de especialización
  description: string;   // Descripción para el usuario
  strengths: string[];   // Palabras clave de fortaleza
}

/**
 * ÚNICO REGISTRO DE MODELOS AUTORIZADOS.
 * Prohibido agregar modelos que no estén en esta lista.
 */
export const AUTHORIZED_MODELS: AIModel[] = [
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4",
    specialty: "Razonamiento General",
    description: "Razonamiento profundo, análisis complejo, ciencia, lógica y conversación",
    strengths: [
      "razonamiento", "analizar", "análisis", "lógica", "ciencia", "física",
      "matemáticas", "cálculo", "explica", "por qué", "filosofía", "debate",
      "comparar", "evaluar", "reflexión", "pensamiento", "argumento",
      "investigación", "hipótesis", "teoría", "deducción", "crítico",
      "hola", "qué tal", "cómo estás", "cuéntame", "historia", "cultura",
      "recomienda", "opinión", "consejo", "creativo", "poema", "cuento",
      "idea", "conversación", "charla", "ayuda", "general",
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      "código", "programar", "bug", "función", "api", "javascript",
      "python", "react", "docker", "backend", "frontend",
    ],
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS",
    specialty: "Razonamiento Técnico",
    description: "Razonamiento paso a paso, medicina, finanzas, derecho y problemas complejos",
    strengths: [
      "paso a paso", "detallado", "medicina", "médico", "diagnóstico",
      "síntoma", "tratamiento", "salud", "finanzas", "inversión", "economía",
      "mercado", "contabilidad", "presupuesto", "impuesto", "legal",
      "derecho", "ley", "contrato", "negocio", "empresa", "estrategia",
    ],
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3",
    specialty: "Respaldo General",
    description: "Modelo de respaldo para conversación general y análisis visual",
    strengths: [],
  },
];

/* ═══════════════════════════════════════════
 * Intelligent Router
 * Analiza el mensaje y selecciona el mejor modelo
 * ═══════════════════════════════════════════ */

/**
 * Selecciona el modelo óptimo basado en el contenido del mensaje.
 * Usa scoring por coincidencia de palabras clave.
 * Default: Llama 3.3 (mejor para conversación general).
 */
export function routeToModel(message: string): AIModel {
  const lowerMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  let bestModel = AUTHORIZED_MODELS[0]; // Default: Gemma 4 (general purpose)
  let bestScore = 0;

  for (const model of AUTHORIZED_MODELS) {
    let score = 0;
    for (const keyword of model.strengths) {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lowerMessage.includes(normalizedKeyword)) {
        score += 1;
        // Bonus for exact word match (not just substring)
        const regex = new RegExp(`\\b${normalizedKeyword}\\b`, "i");
        if (regex.test(lowerMessage)) {
          score += 0.5;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestModel = model;
    }
  }

  return bestModel;
}

/**
 * Obtiene un modelo por su ID exacto.
 * Solo retorna modelos autorizados.
 */
export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
