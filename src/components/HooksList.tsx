import Link from "next/link";
import { hooks } from "@/hooks/registry";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HooksList() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Shitty Hooks 💩
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The best hooks you have ever seen.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hooks.map((h) => (
          <Link key={h.id} href={`/hooks/${h.id}`} className="group">
            <Card className="hover:border-foreground/30">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>{h.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {h.id}
                  </Badge>
                </div>
                {h.description && (
                  <CardDescription>{h.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
