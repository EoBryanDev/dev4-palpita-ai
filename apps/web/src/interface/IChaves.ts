export interface IGroupTeam {
  nome: string;
  emoji: string;
  pontos: number;
}

export interface IGroup {
  nome: string;
  times: IGroupTeam[];
}

export interface IBracketMatch {
  id: string;
  timeA: string;
  emojiA: string;
  timeB: string;
  emojiB: string;
  data: string;
  vencedor?: 'A' | 'B';
}

export interface IChavesClientProps {
  grupos: IGroup[];
}
