import type { RankingInstance } from '@/types'

interface RankingInstanceDef {
  value: RankingInstance
  label: string
  order: number
}

export const RANKING_INSTANCES: RankingInstanceDef[] = [
  { value: 'fase_grupos', label: 'Fase de grupos', order: 0 },
  { value: 'dieciseisavos', label: '16avos', order: 1 },
  { value: 'octavos', label: '8vos', order: 2 },
  { value: 'cuartos', label: '4tos', order: 3 },
  { value: 'semis', label: 'Semis', order: 4 },
  { value: 'finalista', label: 'Finalista', order: 5 },
  { value: 'campeon', label: 'Campeon', order: 6 },
]

export const DEFAULT_RANKING_POINTS: Record<RankingInstance, number> = {
  fase_grupos: 1,
  dieciseisavos: 5,
  octavos: 10,
  cuartos: 20,
  semis: 30,
  finalista: 40,
  campeon: 50,
}

export function instanceLabel(instance: RankingInstance): string {
  return RANKING_INSTANCES.find((i) => i.value === instance)?.label ?? instance
}

export function instanceOrder(instance: RankingInstance): number {
  return RANKING_INSTANCES.find((i) => i.value === instance)?.order ?? 0
}

export function bestInstance(a: RankingInstance, b: RankingInstance): RankingInstance {
  return instanceOrder(b) > instanceOrder(a) ? b : a
}
