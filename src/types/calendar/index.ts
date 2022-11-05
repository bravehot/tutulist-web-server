import { DoneEnum, PriorityEnum } from './enum';

type EventInfo = {
  id?: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  isDone: DoneEnum;
  priority: PriorityEnum;
};

export { EventInfo };
