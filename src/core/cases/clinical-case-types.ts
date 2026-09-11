export type CaseSpecialty = "cardiologia" | "clinica-geral" | "infectologia" | "pediatria" | "ginecologia-obstetricia" | "anestesiologia" | "ortopedia" | "radiologia" | "oncologia" | "dermatologia";
export const MAX_PATIENT_CHAT_MESSAGES = 10;
export const PRO_CASE_SPECIALTIES: CaseSpecialty[] = ["pediatria", "ginecologia-obstetricia", "anestesiologia", "ortopedia", "radiologia", "oncologia", "dermatologia"];

export type ClinicalCaseDocument = {
  schemaVersion: 1;
  plan?: "free" | "pro";
  status: "draft" | "published" | "archived";
  specialty: CaseSpecialty;
  difficulty: "facil" | "intermediario" | "dificil";
  title: string;
  setting: string;
  summary: string;
  patient: { name: string; age: number; avatar: string };
  initialMessages: Array<{ who: "patient" | "you"; text: string }>;
  fallbackReply: string;
  exams: Array<{ name: string; result: string; kind?: "relevant" | "neutral" | "distractor"; highlighted?: boolean }>;
  durationSeconds: number;
  maxXp: number;
  diagnosis: string;
  diagnosisAliases: string[];
  partialDiagnosisAliases: string[];
  feedback: string;
  sourceRefs: string[];
};

export type PublicClinicalCase = Omit<ClinicalCaseDocument, "diagnosis" | "diagnosisAliases" | "partialDiagnosisAliases" | "feedback" | "status" | "schemaVersion"> & {
  id: string;
  specialtyLabel: string;
  requestedSpecialty: CaseSpecialty | "aleatorio";
  remainingSeconds: number;
  chatMessages: Array<{ who: "patient" | "you"; text: string }>;
  remainingChatMessages: number;
};
