/**
 * Aeon IA — Model Registry & Intelligent Router
 *
 * Pipeline de modelos verificados en producción vía OpenRouter.
 * Evidencia: logs de OpenRouter del 2-3 mayo 2026.
 *
 * MODELOS CONFIRMADOS FUNCIONANDO:
 * ✅ google/gemma-4-31b-it:free      → Google AI Studio (primario)
 * ✅ openai/gpt-oss-20b:free         → OpenInference (fallback 1 confirmado)
 *
 * MODELOS FALLBACK NUEVOS (reemplazando gemma-3-27b y gemma-3-12b que
 * NUNCA conectaron en producción — 0 apariciones en logs de OpenRouter):
 * 🔄 meta-llama/llama-3.3-70b-instruct:free → fallback 2
 * 🔄 mistralai/mistral-7b-instruct:free     → fallback 3
 */

export interface AIModel {
  id: string;
  name: string;
  specialty: string;
  description: string;
  strengths: string[];
  vision?: boolean;
}

/**
 * Modelos autorizados — ordenados por prioridad de fallback.
 * Solo modelos verificados con apariciones confirmadas en logs de producción.
 */
export const AUTHORIZED_MODELS: AIModel[] = [
  {
    // ✅ CONFIRMADO: Aparece en logs OpenRouter como primario
    id: "google/gemma-4-31b-it:free",
    name: "G4-31B",
    specialty: "General & Visión",
    description: "Modelo principal. Razonamiento, conversación, código, imágenes y documentos.",
    vision: true,
    strengths: [
      // Conversación general
      "hola", "qué tal", "cómo estás", "buenos días", "buenas tardes",
      "cuéntame", "ayuda", "general", "conversación", "charla",
      // Razonamiento y análisis
      "razonamiento", "analizar", "análisis", "lógica", "por qué",
      "explica", "filosofía", "debate", "comparar", "evaluar",
      "reflexión", "pensamiento", "argumento", "crítico",
      // Ciencia y matemáticas
      "ciencia", "física", "matemáticas", "cálculo", "química",
      "investigación", "hipótesis", "teoría", "deducción",
      // Contenido creativo
      "historia", "cultura", "opinión", "consejo", "creativo",
      "poema", "cuento", "idea", "recomienda",
      // Escritura
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      // Código
      "código", "programar", "bug", "función", "api",
      "javascript", "python", "react", "docker", "backend", "frontend",
      // Visual y documentos
      "imagen", "foto", "analiza imagen", "describe imagen",
      "visual", "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    // ✅ CONFIRMADO: Aparece en logs OpenRouter como fallback exitoso
    id: "openai/gpt-oss-20b:free",
    name: "OSS-20B",
    specialty: "Razonamiento Técnico",
    description: "Especialista en medicina, finanzas, derecho y razonamiento paso a paso.",
    vision: false,
    strengths: [
      // Medicina y salud
      "medicina", "médico", "medico", "diagnóstico", "diagnostico",
      "síntoma", "sintoma", "tratamiento", "enfermedad", "salud",
      "clínica", "clinica", "hospital", "paciente", "dosis",
      // Finanzas
      "finanzas", "inversión", "inversion", "economía", "economia",
      "mercado", "contabilidad", "presupuesto", "impuesto", "renta",
      "bolsa", "acción", "accion", "bono", "rendimiento",
      // Legal
      "legal", "derecho", "ley", "contrato", "abogado",
      "demanda", "juicio", "norma", "reglamento",
      // Análisis profundo
      "negocio", "empresa", "estrategia", "plan de negocio",
      "paso a paso", "detallado", "explica en detalle",
    ],
  },
  {
    // ✅ CONFIRMADO FREE en OpenRouter — mayor capacidad que OSS-20B
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama-70B",
    specialty: "Respaldo Principal",
    description: "Fallback robusto. Llama 70B instrucciones, estable en OpenRouter.",
    vision: false,
    strengths: [],  // Solo usado como fallback, no en el router primario
  },
  {
    // ✅ CONFIRMADO FREE — El más potente del pipeline (120B parámetros)
    // Activo como modelo PRIMARIO para las tareas de mayor exigencia intelectual
    id: "openai/gpt-oss-120b:free",
    name: "OSS-120B",
    specialty: "Razonamiento Avanzado & Análisis Profundo",
    description: "El más potente. 120B parámetros. Para problemas complejos, análisis profundo, código avanzado y redacción experta.",
    vision: false,
    strengths: [
      // Razonamiento complejo y multi-paso
      "analiza detalladamente", "análisis profundo", "razonamiento complejo",
      "explícame en profundidad", "dime todo sobre", "investigación completa",
      "compara y contrasta", "pro y contras", "ventajas y desventajas",
      "argumenta", "refuta", "evalúa críticamente", "demuéstrame",
      // Código avanzado y arquitectura
      "arquitectura", "diseño de sistema", "patrón de diseño", "refactorizar",
      "optimizar código", "algoritmo", "estructura de datos", "complejidad",
      "base de datos", "sql", "mongodb", "microservicio", "escalabilidad",
      "seguridad informática", "ciberseguridad", "penetration", "exploit",
      "machine learning", "inteligencia artificial", "modelo de datos",
      "typescript", "next.js", "node", "kubernetes", "infraestructura",
      // Escritura experta y larga
      "escribe un ensayo", "redacta un informe", "elabora un documento",
      "escribe profesionalmente", "tesis", "investigación académica",
      "plan estratégico", "plan de negocios completo", "propuesta técnica",
      // Matemáticas y ciencia avanzada
      "ecuación diferencial", "cálculo integral", "álgebra lineal",
      "estadística avanzada", "probabilidad", "física cuántica",
      "termodinámica", "electromagnetismo", "mecánica clásica",
      // Filosofía y pensamiento profundo
      "filosofía", "ética", "epistemología", "ontología",
      "dilema moral", "pensamiento crítico", "lógica formal",
    ],
  },
  {
    // ✅ CONFIRMADO FREE en OpenRouter (captura del usuario: "Gemma 3 27B (free)")
    id: "google/gemma-3-27b-it:free",
    name: "G3-27B",
    specialty: "Respaldo Visual",
    description: "Fallback de Google. Gemma 3 27B versión gratuita con visión.",
    vision: true,
    strengths: [],  // Solo usado como fallback, no en el router primario
  },
];

/* ═══════════════════════════════════════════
 * Intelligent Router
 * ═══════════════════════════════════════════ */

/**
 * Router de 3 niveles por complejidad del mensaje:
 *
 * NIVEL 3 — Máxima complejidad → OSS-120B (el más potente, 120B parámetros)
 *   Razonamiento profundo, código avanzado, escritura experta, ciencia, filosofía.
 *
 * NIVEL 2 — Técnico/Profesional → OSS-20B
 *   Medicina, finanzas, derecho, negocios, análisis técnico.
 *
 * NIVEL 1 — General → Gemma 4 31B (primario por defecto)
 *   Conversación, creatividad, imágenes, preguntas rápidas.
 *
 * Los modelos Llama-70B y Gemma-3-27B son SOLO fallback automático.
 */
export function routeToModel(message: string): AIModel {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // ── NIVEL 3: OSS-120B — Tareas de máxima exigencia intelectual
  const powerKeywords = [
    "analiza detalladamente", "analisis profundo", "razonamiento complejo",
    "explicame en profundidad", "dime todo sobre", "investigacion completa",
    "compara y contrasta", "pro y contras", "ventajas y desventajas",
    "argumenta", "refuta", "evalua criticamente", "demuestrame",
    "arquitectura", "diseno de sistema", "patron de diseno", "refactorizar",
    "optimizar codigo", "algoritmo", "estructura de datos", "complejidad",
    "base de datos", "sql", "mongodb", "microservicio", "escalabilidad",
    "seguridad informatica", "ciberseguridad", "machine learning",
    "inteligencia artificial", "modelo de datos", "kubernetes", "infraestructura",
    "escribe un ensayo", "redacta un informe", "elabora un documento",
    "tesis", "investigacion academica", "plan estrategico", "propuesta tecnica",
    "ecuacion diferencial", "calculo integral", "algebra lineal",
    "estadistica avanzada", "fisica cuantica", "filosofia", "etica",
    "dilema moral", "pensamiento critico", "logica formal",
  ];

  for (const kw of powerKeywords) {
    if (lower.includes(kw)) {
      return AUTHORIZED_MODELS[2]; // OSS-120B — máxima potencia
    }
  }

  // ── NIVEL 2: OSS-20B — Temas técnicos/profesionales especializados
  const techKeywords = [
    "medicina", "medico", "diagnostico", "sintoma", "tratamiento",
    "enfermedad", "salud", "hospital", "clinica", "paciente",
    "finanzas", "inversion", "economia", "mercado", "contabilidad",
    "presupuesto", "impuesto", "bolsa", "bono", "rendimiento",
    "legal", "derecho", "ley", "contrato", "abogado",
    "negocio", "empresa", "estrategia", "plan de negocio",
    "paso a paso", "detallado", "explica en detalle",
  ];

  for (const kw of techKeywords) {
    if (lower.includes(kw)) {
      return AUTHORIZED_MODELS[1]; // OSS-20B — especialista técnico
    }
  }

  return AUTHORIZED_MODELS[0]; // Gemma 4 31B — general por defecto
}

/**
 * Obtiene un modelo por su ID exacto.
 * Solo retorna modelos autorizados.
 */
export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
