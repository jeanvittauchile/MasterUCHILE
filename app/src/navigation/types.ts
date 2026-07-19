export type RootStackParamList = {
  Login: undefined;
  ChangePin: undefined;
  CoachTabs: undefined;
  SwimmerTabs: undefined;
  SwimmerDetail: { swimmerId: string };
  SessionDetail: { trainingId: string };
  TournamentDetail: { tournamentId: string };
  EvaluateDetail: { swimmerId: string };
  MarkDetail: { prueba: string };
  Coaches: undefined;
};

export type CoachTabParamList = {
  Inicio: undefined;
  Nadadores: undefined;
  Sesiones: undefined;
  Evaluar: undefined;
  Torneos: undefined;
  Reportes: undefined;
};

export type SwimmerTabParamList = {
  Inicio: undefined;
  Sesiones: undefined;
  Progreso: undefined;
  Torneos: undefined;
  Perfil: undefined;
};
