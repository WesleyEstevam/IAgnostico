import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const sources = {
  cardio: "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/",
  brasilCardio: "https://www.gov.br/saude/pt-br/assuntos/pcdt/l/linha-de-cuidado-do-infarto-agudo-do-miocardio-e-o-protocolo-de-sindromes-coronarianas-agudas.pd/view",
  arbovirus: "https://www.who.int/publications/i/item/9789240111110",
  meningitis: "https://www.who.int/publications/i/item/9789240108042",
  tuberculosis: "https://www.who.int/publications/i/item/9789240046764",
};

const profiles = [
  { name: "Ana", ageDelta: 0, context: "procura atendimento no início do plantão" },
  { name: "Bruno", ageDelta: 7, context: "chega acompanhado por um familiar" },
  { name: "Carla", ageDelta: 14, context: "é encaminhada por uma unidade básica" },
  { name: "Diego", ageDelta: 21, context: "chega ao pronto atendimento por meios próprios" },
  { name: "Elisa", ageDelta: 28, context: "é trazida pela equipe de emergência" },
];

const archetypes = [
  {
    specialty: "cardiologia", slug: "iam-com-supra", diagnosis: "infarto agudo do miocárdio com supradesnivelamento do ST", aliases: ["infarto agudo do miocardio com supra", "iam com supra", "iamcsst", "stemi"], difficulty: "facil", baseAge: 38, setting: "Emergência", complaint: "dor torácica opressiva há 50 minutos", opening: "A dor aperta o peito e está indo para o braço esquerdo. Estou suando muito.", clue: "Começou durante o repouso e não melhorou. Também sinto náusea.", summary: "Dor retroesternal intensa, sudorese e irradiação para membro superior esquerdo.", exams: [["ECG", "Supradesnivelamento de ST em derivações contíguas", true], ["Troponina", "Elevada", true], ["Radiografia de tórax", "Sem alterações agudas"]], feedback: "A dor típica associada ao supradesnivelamento de ST exige reconhecimento e reperfusão imediatos.", refs: [sources.brasilCardio, sources.cardio],
  },
  {
    specialty: "cardiologia", slug: "fibrilacao-atrial", diagnosis: "fibrilação atrial", aliases: ["fibrilacao atrial", "fa"], difficulty: "facil", baseAge: 45, setting: "Pronto atendimento", complaint: "palpitações e cansaço de início súbito", opening: "Meu coração começou a bater todo descompassado e fiquei cansado.", clue: "Nunca senti isso antes. Não desmaiei nem tive dor forte no peito.", summary: "Pulso irregular, palpitações e frequência cardíaca elevada.", exams: [["ECG", "Ritmo irregularmente irregular, sem ondas P definidas", true], ["Eletrólitos", "Sem distúrbios relevantes"], ["TSH", "Dentro da referência"]], feedback: "O ritmo irregularmente irregular e a ausência de ondas P organizadas caracterizam fibrilação atrial.", refs: [sources.cardio],
  },
  {
    specialty: "cardiologia", slug: "insuficiencia-cardiaca", diagnosis: "insuficiência cardíaca agudamente descompensada", aliases: ["insuficiencia cardiaca descompensada", "ic descompensada", "edema agudo de pulmao"], difficulty: "intermediario", baseAge: 48, setting: "Emergência", complaint: "falta de ar progressiva e inchaço nas pernas", opening: "Não consigo deitar para dormir porque parece que vou sufocar.", clue: "Ganhei peso nos últimos dias e minhas pernas estão bem inchadas.", summary: "Ortopneia, edema periférico, estertores bibasais e turgência jugular.", exams: [["BNP", "Elevado", true], ["Radiografia de tórax", "Congestão pulmonar e cardiomegalia", true], ["ECG", "Taquicardia sinusal"]], feedback: "Ortopneia, congestão pulmonar e sinais de hipervolemia sustentam descompensação de insuficiência cardíaca.", refs: [sources.cardio],
  },
  {
    specialty: "cardiologia", slug: "pericardite", diagnosis: "pericardite aguda", aliases: ["pericardite", "pericardite aguda"], difficulty: "intermediario", baseAge: 22, setting: "Pronto atendimento", complaint: "dor torácica que piora ao respirar", opening: "A dor melhora quando sento e inclino o corpo para frente.", clue: "Tive um quadro gripal na semana passada e agora dói quando respiro fundo.", summary: "Dor pleurítica e posicional após síndrome viral recente.", exams: [["ECG", "Elevação difusa de ST e depressão de PR", true], ["Troponina", "Discretamente elevada"], ["Ecocardiograma", "Pequeno derrame pericárdico"]], feedback: "A dor posicional e a elevação difusa de ST, sem distribuição territorial, são típicas de pericardite.", refs: [sources.cardio],
  },
  {
    specialty: "cardiologia", slug: "disseccao-aorta", diagnosis: "dissecção aguda de aorta", aliases: ["disseccao de aorta", "disseccao aortica", "dissecção aguda de aorta"], difficulty: "dificil", baseAge: 42, setting: "Emergência", complaint: "dor súbita e muito intensa no peito e nas costas", opening: "Foi como se algo rasgasse meu peito de uma vez e fosse para as costas.", clue: "A dor já começou no máximo. Tenho pressão alta e às vezes esqueço o remédio.", summary: "Dor lancinante de início abrupto, assimetria de pulsos e hipertensão.", exams: [["Angio-TC de aorta", "Flap intimal compatível com dissecção", true], ["ECG", "Sem sinais isquêmicos específicos"], ["Radiografia de tórax", "Mediastino alargado"]], feedback: "Dor máxima no início, irradiação dorsal e assimetria de pulsos devem levantar suspeita imediata de dissecção aórtica.", refs: [sources.cardio],
  },
  {
    specialty: "cardiologia", slug: "emergencia-hipertensiva", diagnosis: "emergência hipertensiva", aliases: ["emergencia hipertensiva", "crise hipertensiva com lesao de orgao alvo"], difficulty: "intermediario", baseAge: 40, setting: "Emergência", complaint: "cefaleia intensa, visão turva e pressão muito elevada", opening: "Minha cabeça está explodindo e comecei a enxergar tudo embaçado.", clue: "Parei os remédios da pressão há algumas semanas.", summary: "PA 230/130 mmHg associada a sintomas neurológicos e papiledema.", exams: [["Fundoscopia", "Papiledema", true], ["Creatinina", "Elevada"], ["TC de crânio", "Sem hemorragia"]], feedback: "Pressão gravemente elevada com lesão aguda de órgão-alvo define emergência hipertensiva.", refs: [sources.cardio],
  },
  {
    specialty: "clinica-geral", slug: "tromboembolismo-pulmonar", diagnosis: "tromboembolismo pulmonar", aliases: ["tromboembolismo pulmonar", "embolia pulmonar", "tep"], difficulty: "intermediario", baseAge: 30, setting: "Emergência", complaint: "falta de ar súbita e dor ao respirar", opening: "A falta de ar começou de repente e sinto uma pontada quando respiro fundo.", clue: "Voltei de uma viagem longa há dois dias e uma perna ficou dolorida.", summary: "Dispneia súbita, dor pleurítica, taquicardia e fator de risco trombótico.", exams: [["D-dímero", "Elevado", true], ["Angio-TC de tórax", "Falha de enchimento em artéria pulmonar", true], ["ECG", "Taquicardia sinusal"]], feedback: "O início súbito, a dor pleurítica e o contexto trombótico apontam para tromboembolismo pulmonar.", refs: [sources.cardio],
  },
  {
    specialty: "clinica-geral", slug: "cetoacidose-diabetica", diagnosis: "cetoacidose diabética", aliases: ["cetoacidose diabetica", "cad", "diabetic ketoacidosis"], difficulty: "intermediario", baseAge: 18, setting: "Emergência", complaint: "vômitos, dor abdominal e muita sede", opening: "Estou vomitando, com muita sede e respirando estranho desde ontem.", clue: "Tenho diabetes tipo 1 e fiquei sem aplicar insulina.", summary: "Desidratação, respiração de Kussmaul, hálito cetônico e hiperglicemia.", exams: [["Glicemia", "468 mg/dL", true], ["Gasometria", "Acidose metabólica com ânion gap elevado", true], ["Cetonemia", "Positiva"]], feedback: "Hiperglicemia, cetose e acidose metabólica com ânion gap elevado formam a tríade diagnóstica.", refs: ["https://www.gov.br/saude/pt-br/assuntos/pcdt"],
  },
  {
    specialty: "clinica-geral", slug: "asma-aguda", diagnosis: "exacerbação aguda de asma", aliases: ["exacerbacao de asma", "crise de asma", "asma aguda", "crise asmatica"], difficulty: "facil", baseAge: 17, setting: "Pronto atendimento", complaint: "chiado e falta de ar após contato com poeira", opening: "Meu peito está chiando e a bombinha não resolveu como costuma resolver.", clue: "Começou depois que limpei um quarto com muita poeira.", summary: "Dispneia, sibilância difusa e prolongamento expiratório em paciente asmático.", exams: [["Pico de fluxo", "45% do melhor valor pessoal", true], ["Oximetria", "91% em ar ambiente"], ["Radiografia de tórax", "Sem consolidação"]], feedback: "A obstrução expiratória variável após gatilho, em paciente asmático, caracteriza exacerbação aguda.", refs: ["https://www.gov.br/saude/pt-br/assuntos/pcdt"],
  },
  {
    specialty: "clinica-geral", slug: "hemorragia-digestiva-alta", diagnosis: "hemorragia digestiva alta", aliases: ["hemorragia digestiva alta", "hda", "sangramento digestivo alto"], difficulty: "intermediario", baseAge: 35, setting: "Emergência", complaint: "vômito com sangue e fezes escuras", opening: "Vomitei sangue e minhas fezes ficaram pretas e com cheiro muito forte.", clue: "Tenho tomado anti-inflamatório todos os dias por causa de dor nas costas.", summary: "Hematêmese, melena, taquicardia e uso frequente de anti-inflamatório.", exams: [["Hemograma", "Hemoglobina reduzida", true], ["Ureia", "Elevada desproporcionalmente à creatinina"], ["Endoscopia digestiva alta", "Úlcera com sangramento recente", true]], feedback: "Hematêmese e melena localizam o sangramento proximalmente ao ligamento de Treitz.", refs: ["https://www.gov.br/saude/pt-br/assuntos/pcdt"],
  },
  {
    specialty: "clinica-geral", slug: "avc-isquemico", diagnosis: "acidente vascular cerebral isquêmico", aliases: ["acidente vascular cerebral isquemico", "avc isquemico", "ave isquemico", "derrame isquemico"], difficulty: "facil", baseAge: 45, setting: "Emergência", complaint: "fraqueza súbita de um lado e fala enrolada", opening: "Meu braço direito ficou fraco de repente e não consigo falar direito.", clue: "Eu estava bem há uma hora. Começou tudo de uma vez.", summary: "Déficit neurológico focal súbito, assimetria facial e disartria.", exams: [["TC de crânio sem contraste", "Sem hemorragia intracraniana", true], ["Glicemia capilar", "Normal"], ["Angio-TC", "Oclusão arterial cerebral"]], feedback: "Déficit focal súbito com exclusão de hemorragia na TC é compatível com AVC isquêmico agudo.", refs: ["https://www.gov.br/saude/pt-br/assuntos/pcdt/a/a"],
  },
  {
    specialty: "clinica-geral", slug: "pielonefrite", diagnosis: "pielonefrite aguda", aliases: ["pielonefrite", "pielonefrite aguda", "infeccao urinaria alta"], difficulty: "facil", baseAge: 21, setting: "Pronto atendimento", complaint: "febre, ardência ao urinar e dor lombar", opening: "Estou com febre alta, ardência para urinar e muita dor nas costas.", clue: "A urina está com cheiro forte e tive calafrios durante a noite.", summary: "Febre, sintomas urinários e dor à punho-percussão lombar.", exams: [["Urina tipo 1", "Piúria e nitrito positivo", true], ["Urocultura", "Crescimento de bacilo gram-negativo"], ["Hemograma", "Leucocitose com neutrofilia"]], feedback: "A associação de febre, sintomas urinários e dor lombar sugere infecção do trato urinário alto.", refs: ["https://www.gov.br/saude/pt-br/assuntos/pcdt"],
  },
  {
    specialty: "infectologia", slug: "dengue-sinais-alarme", diagnosis: "dengue com sinais de alarme", aliases: ["dengue com sinais de alarme", "dengue com sinais de alerta", "dengue"], difficulty: "intermediario", baseAge: 16, setting: "Emergência", complaint: "febre recente, dor abdominal e vômitos persistentes", opening: "A febre melhorou, mas agora a barriga dói muito e não paro de vomitar.", clue: "Percebi pequenos sangramentos na gengiva e estou muito fraco.", summary: "Defervescência seguida por dor abdominal, vômitos e sangramento de mucosa.", exams: [["Hemograma", "Plaquetopenia e hematócrito em elevação", true], ["Teste NS1", "Reagente"], ["Ultrassonografia", "Pequena quantidade de líquido livre"]], feedback: "Dor abdominal persistente, vômitos e hemoconcentração na defervescência são sinais de alarme para dengue.", refs: [sources.arbovirus],
  },
  {
    specialty: "infectologia", slug: "meningite-bacteriana", diagnosis: "meningite bacteriana aguda", aliases: ["meningite bacteriana", "meningite bacteriana aguda", "meningite"], difficulty: "intermediario", baseAge: 18, setting: "Emergência", complaint: "febre alta, cefaleia e rigidez no pescoço", opening: "Minha cabeça dói demais, a luz incomoda e não consigo encostar o queixo no peito.", clue: "Começou com febre e piorou rápido. Também vomitei duas vezes.", summary: "Síndrome febril aguda com rigidez de nuca, fotofobia e alteração do sensório.", exams: [["Líquor", "Neutrofilia, proteína elevada e glicose reduzida", true], ["Hemograma", "Leucocitose com neutrofilia"], ["Hemocultura", "Crescimento bacteriano"]], feedback: "A síndrome meníngea e o padrão do líquor sustentam meningite bacteriana e exigem tratamento imediato.", refs: [sources.meningitis],
  },
  {
    specialty: "infectologia", slug: "tuberculose-pulmonar", diagnosis: "tuberculose pulmonar", aliases: ["tuberculose pulmonar", "tuberculose", "tb pulmonar"], difficulty: "facil", baseAge: 24, setting: "Ambulatório", complaint: "tosse há mais de quatro semanas, febre e perda de peso", opening: "Essa tosse não passa, suo muito à noite e emagreci sem tentar.", clue: "Às vezes sai um pouco de sangue no catarro. Um colega teve tuberculose.", summary: "Tosse crônica, sintomas constitucionais e contato epidemiológico.", exams: [["Teste molecular rápido para TB", "Detectado complexo M. tuberculosis", true], ["Radiografia de tórax", "Infiltrado apical com cavitação"], ["Baciloscopia", "BAAR positivo"]], feedback: "Tosse prolongada, sintomas constitucionais e confirmação microbiológica definem tuberculose pulmonar.", refs: [sources.tuberculosis],
  },
  {
    specialty: "infectologia", slug: "pneumonia-comunitaria", diagnosis: "pneumonia adquirida na comunidade", aliases: ["pneumonia adquirida na comunidade", "pneumonia comunitaria", "pneumonia", "pac"], difficulty: "facil", baseAge: 27, setting: "Pronto atendimento", complaint: "febre, tosse produtiva e dor ao respirar", opening: "Estou com febre alta e tosse com catarro amarelado. Dói para respirar.", clue: "Começou há três dias e hoje fiquei mais cansado para caminhar.", summary: "Síndrome respiratória febril com crepitações focais e hipoxemia leve.", exams: [["Radiografia de tórax", "Consolidação lobar", true], ["Hemograma", "Leucocitose com neutrofilia"], ["Oximetria", "92% em ar ambiente"]], feedback: "Febre, tosse produtiva e novo infiltrado pulmonar sustentam pneumonia adquirida na comunidade.", refs: ["https://www.who.int/health-topics/pneumonia"],
  },
  {
    specialty: "infectologia", slug: "leptospirose", diagnosis: "leptospirose", aliases: ["leptospirose", "doenca de weil", "síndrome de weil"], difficulty: "dificil", baseAge: 23, setting: "Emergência", complaint: "febre, dor intensa nas panturrilhas e olhos avermelhados", opening: "Depois da enchente comecei com febre e uma dor terrível nas panturrilhas.", clue: "Meus olhos ficaram vermelhos e estou urinando menos desde ontem.", summary: "Febre após água de enchente, sufusão conjuntival, mialgia em panturrilhas e injúria renal.", exams: [["Creatinina", "Elevada", true], ["Bilirrubinas", "Hiperbilirrubinemia direta"], ["PCR para Leptospira", "Detectável", true]], feedback: "Exposição à água contaminada, mialgia de panturrilhas e sufusão conjuntival são pistas clássicas de leptospirose.", refs: ["https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/l/leptospirose"],
  },
];

const partialAliasesBySlug = {
  "iam-com-supra": ["infarto agudo do miocardio", "infarto", "sindrome coronariana aguda", "sca"],
  "fibrilacao-atrial": ["arritmia", "taquiarritmia", "taquicardia supraventricular"],
  "insuficiencia-cardiaca": ["congestao pulmonar", "sobrecarga de volume", "insuficiencia cardiaca"],
  pericardite: ["miopericardite", "dor toracica inflamatoria"],
  "disseccao-aorta": ["sindrome aortica aguda", "aneurisma de aorta"],
  "emergencia-hipertensiva": ["crise hipertensiva", "hipertensao grave"],
  "tromboembolismo-pulmonar": ["tromboembolismo venoso", "trombose venosa profunda", "tvp"],
  "cetoacidose-diabetica": ["diabetes descompensado", "hiperglicemia", "acidose metabolica"],
  "asma-aguda": ["broncoespasmo", "insuficiencia respiratoria obstrutiva"],
  "hemorragia-digestiva-alta": ["ulcera peptica", "sangramento gastrointestinal", "hemorragia digestiva"],
  "avc-isquemico": ["acidente vascular cerebral", "avc", "ave", "ataque isquemico transitorio", "ait"],
  pielonefrite: ["infeccao urinaria", "itu", "cistite"],
  "dengue-sinais-alarme": ["dengue", "arbovirose", "sindrome febril aguda"],
  "meningite-bacteriana": ["meningite", "meningite viral", "sindrome meningea"],
  "tuberculose-pulmonar": ["infeccao por micobacteria", "doenca pulmonar cavitaria"],
  "pneumonia-comunitaria": ["infeccao respiratoria baixa", "infeccao pulmonar", "bronquite"],
  leptospirose: ["sindrome de weil", "sindrome febril ictero hemorragica", "arbovirose"],
};

const cases = archetypes.flatMap((archetype) => profiles.map((profile, index) => {
  const age = archetype.baseAge + profile.ageDelta;
  const maxXp = archetype.difficulty === "dificil" ? 300 : archetype.difficulty === "intermediario" ? 240 : 200;
  return {
    id: `${archetype.specialty}-${archetype.slug}-${String(index + 1).padStart(2, "0")}`,
    schemaVersion: 1,
    status: "published",
    specialty: archetype.specialty,
    difficulty: archetype.difficulty,
    title: `${profile.name}, ${age} anos · ${archetype.complaint}`,
    setting: archetype.setting,
    summary: `${archetype.summary} O paciente ${profile.context}.`,
    patient: { name: profile.name, age, avatar: index % 2 === 0 ? "👩" : "👨" },
    initialMessages: [
      { who: "patient", text: archetype.opening },
      { who: "you", text: "Conte um pouco mais sobre o início dos sintomas e outros sinais associados." },
      { who: "patient", text: archetype.clue },
    ],
    fallbackReply: "Posso tentar explicar melhor, doutor(a), mas estou preocupado com esses sintomas.",
    exams: archetype.exams.map(([name, result, highlighted]) => ({ name, result, highlighted: highlighted === true })),
    durationSeconds: 8 * 60,
    maxXp,
    diagnosis: archetype.diagnosis,
    diagnosisAliases: archetype.aliases.filter((alias) => !(
      (archetype.slug === "dengue-sinais-alarme" && alias === "dengue")
      || (archetype.slug === "meningite-bacteriana" && alias === "meningite")
    )),
    partialDiagnosisAliases: partialAliasesBySlug[archetype.slug] ?? [],
    feedback: archetype.feedback,
    sourceRefs: archetype.refs,
    catalogVersion: "mvp-1",
    updatedAt: FieldValue.serverTimestamp(),
  };
}));

if (cases.length !== 85) throw new Error(`O catálogo deve conter 85 casos, mas contém ${cases.length}.`);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) throw new Error("Preencha as variáveis FIREBASE_ADMIN_* em .env.local.");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
const firestore = getFirestore(app);
const batch = firestore.batch();
for (const clinicalCase of cases) {
  const { id, ...data } = clinicalCase;
  batch.set(firestore.collection("clinicalCases").doc(id), data);
}
await batch.commit();

const counts = cases.reduce((result, clinicalCase) => ({ ...result, [clinicalCase.specialty]: (result[clinicalCase.specialty] ?? 0) + 1 }), {});
console.log(`Seed concluído: ${cases.length} casos publicados.`, counts);
