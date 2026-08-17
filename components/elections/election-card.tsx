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
    <Card className="min-w-0 overflow-hidden">
      <div className="relative h-40 w-full bg-slate-100">
        <Image
          src="/election-vote.png"
          alt={election.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <h3 className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-slate-900">
            {election.title}
          </h3>
          <Badge className="shrink-0 whitespace-nowrap border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {getStatusLabel(status)}
          </Badge>
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
