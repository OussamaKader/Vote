import Image from "next/image";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ElectionList } from "@/types";

export function ListCard({ list }: { list: ElectionList }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image src={list.logo_url} alt={list.name} fill className="object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{list.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{list.description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {list.candidates.length} candidat(s)
          </div>
        </div>
      </div>
    </Card>
  );
}
