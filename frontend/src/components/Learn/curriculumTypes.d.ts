export interface FieldFactItem {
  label: string;
  value: string;
  tag: string;
  color: string;
}

export interface FieldFact {
  title: string;
  badge: string;
  items: FieldFactItem[];
}

export interface MistakeWarning {
  title: string;
  desc: string;
}

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface TopicQuiz {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface CurriculumTopic {
  id: string;
  topicCode: string;
  title: string;
  moduleNum: number;
  moduleTitle: string;
  specimenKey: "composite" | "motherboard" | "cpu" | "ram" | "storage" | "gpu" | "psu" | "case";
  hotspotId: string | null;
  youtubeId: string;
  videoTitle: string;
  explanation: string;
  fieldFact: FieldFact;
  mistakeWarning: MistakeWarning;
  quiz: TopicQuiz;
  moduleId?: string;
}

export interface CurriculumModule {
  id: string;
  moduleNum: number;
  title: string;
  description: string;
  topics: CurriculumTopic[];
}
