export interface IDbTime {
  id: string;
  nome: string;
  emoji: string;
  confederacao: string;
  grupo: string;
}

export interface ITimesClientProps {
  initialTimes: IDbTime[];
}
