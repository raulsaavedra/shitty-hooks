import { ReactNode } from "react";
import UseMouseAwayDemo from "@/components/demos/UseMouseAwayDemo";

export type HookItem = {
  id: string; // kebab-case route id
  name: string; // hook export name
  description?: string;
  content: () => ReactNode; // demo/content renderer
};

export const hooks: HookItem[] = [
  {
    id: "use-mouse-away",
    name: "useMouseAway",
    description: "Repels an element away from the mouse pointer.",
    content: () => (
      <div className="max-w-prose space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">useMouseAway</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          A hook that pushes an element away when your cursor approaches.
        </p>
        <UseMouseAwayDemo />
      </div>
    ),
  },
];

export function getHookById(id: string): HookItem | undefined {
  return hooks.find((h) => h.id === id);
}
