import Image from "next/image";
import Link from "next/link";
import { CalendarDays, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { computeElectionStatus, formatDate, getStatusLabel } from "@/lib/utils";
import type { Election } from "@/types";

export function ElectionCard({ election }: { election: Election }) {
  const status = computeElectionStatus(election.start_date, election.end_date);
  const listsCount = election.lists?.length ?? 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-slate-100">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          alt={election.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-900">{election.title}</h3>
          <Badge className="bg-blue-50 text-blue-700">{getStatusLabel(status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{election.description}</p>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            {formatDate(election.start_date)} - {formatDate(election.end_date)}
          </div>
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-blue-600" />
            {listsCount} listes
          </div>
        </div>
        <Link href={`/elections/${election.id}`}>
          <Button className="w-full">Voir</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
