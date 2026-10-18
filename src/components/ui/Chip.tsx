import { skillName } from "@/lib/content";

/** Tech chip for a skill id. `data-skill` lets the Neural Map highlight it. */
export function SkillChip({ id, active = false }: { id: string; active?: boolean }) {
  return (
    <span className="chip" data-skill={id} data-active={active}>
      {skillName(id)}
    </span>
  );
}

export function ChipList({ ids, activeId, className = "" }: { ids: string[]; activeId?: string | null; className?: string }) {
  if (!ids.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {ids.map((id) => (
        <li key={id}>
          <SkillChip id={id} active={activeId === id} />
        </li>
      ))}
    </ul>
  );
}
