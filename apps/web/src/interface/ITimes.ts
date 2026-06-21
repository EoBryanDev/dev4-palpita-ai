export interface IDbTime {
  id: string;
  nome: string;
  emoji: string;
  confederacao: string;
  grupo: string;
  idioma?: string | null;
}

export interface ITimesClientProps {
  initialTimes: IDbTime[];
}
