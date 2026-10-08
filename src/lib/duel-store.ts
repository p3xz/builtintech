// In-memory duel store (server-side only, fine for a demo)
import { DuelState } from '@/types/duel';

const duels = new Map<string, DuelState>();

export function getDuel(id: string): DuelState | undefined {
  return duels.get(id);
}

export function setDuel(duel: DuelState): void {
  duels.set(duel.id, duel);
}

export function generateDuelId(): string {
  return Math.random().toString(36).substring(2, 10);
}
