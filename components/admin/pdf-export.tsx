"use client";

import { Button } from "@/components/ui/button";
import type { ElectionResultSummary } from "@/lib/election-results";
import { Download } from "lucide-react";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

export type VoteExportRow = {
  id: string | number;
  election_id: string | number;
  list_id: string | number;
  election_title: string;
  list_name: string;
  user_name: string;
  created_at: string;
};

function formatDateTime(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function addPdfHeader(doc: jsPDF, title: string, subtitle: string, generatedAt: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 64, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text("VoteCampus", 22, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(title, 22, 46);

  doc.setTextColor(219, 234, 254);
  doc.text(`Généré le ${generatedAt}`, pageWidth - 180, 28);
  doc.text(subtitle, pageWidth - 180, 46);
}

export function VotesPdfExport({ votes }: { votes: VoteExportRow[] }) {
  const handleDownload = () => {
    if (!votes.length) {
      window.alert("Aucun vote à exporter pour le moment.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const generatedAt = formatDateTime(new Date());

    addPdfHeader(doc, "VoteCampus — Liste des votes", "Administration", generatedAt);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Total de votes : ${votes.length}`, 22, 90);

    autoTable(doc, {
      startY: 108,
      head: [["Élection", "Liste / Candidat", "Utilisateur", "Date du vote"]],
      body: votes.map((vote) => [
        vote.election_title || "-",
        vote.list_name || "-",
        vote.user_name || "-",
        formatDateTime(vote.created_at),
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 6,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didDrawPage: (data) => {
        const finalY = (data.cursor?.y ?? 0) + 12;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text("VoteCampus — Liste des votes", 22, finalY);
      },
    });

    const finalY = ((doc as any).lastAutoTable?.finalY ?? 120) + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Date de génération : ${generatedAt}`, 22, finalY);

    doc.save(`VoteCampus-votes-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Button
      onClick={handleDownload}
      className="w-full sm:w-auto"
      size="md"
      type="button"
    >
      <Download className="mr-2 h-4 w-4" />
      Télécharger PDF
    </Button>
  );
}

export function ResultsPdfExport({ results }: { results: ElectionResultSummary[] }) {
  const handleDownload = () => {
    const filteredResults = results.filter((result) => result.total_votes > 0);

    if (!filteredResults.length) {
      window.alert("Aucun résultat à exporter pour le moment.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const generatedAt = formatDateTime(new Date());
    const totalVoters = filteredResults.reduce((sum, result) => sum + result.total_voters, 0);
    const totalVotes = filteredResults.reduce((sum, result) => sum + result.total_votes, 0);
    const overallWinner = filteredResults
      .map((result) => ({ title: result.title, winner: result.winner, isTie: result.isTie }))
      .find((result) => result.winner && result.winner !== "-");

    addPdfHeader(doc, "VoteCampus — Résultats des élections", "Administration", generatedAt);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Total de votants : ${totalVoters}`, 22, 90);
    doc.text(`Total de votes : ${totalVotes}`, 220, 90);
    doc.text(`${overallWinner?.isTie ? "Résultat :" : "Gagnant :"} ${overallWinner?.winner ?? "-"}`, 440, 90);

    autoTable(doc, {
      startY: 110,
      head: [["Élection", "Liste / Candidat", "Nombre de votes", "Pourcentage", "Classement"]],
      body: filteredResults.flatMap((result) =>
        result.rows.map((row) => [
          result.title,
          row.list_name || "-",
          String(row.vote_count),
          `${row.percentage.toFixed(1)}%`,
          `#${row.rank}`,
        ]),
      ),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 6,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save(`VoteCampus-resultats-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Button onClick={handleDownload} className="w-full sm:w-auto" size="md" type="button">
      <Download className="mr-2 h-4 w-4" />
      Télécharger les résultats PDF
    </Button>
  );
}

export function SingleResultPdfExport({ result }: { result: ElectionResultSummary }) {
  const handleDownload = () => {
    if (!result.total_votes) {
      window.alert("Aucune donnée de vote pour cette élection.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const generatedAt = formatDateTime(new Date());

    addPdfHeader(doc, `VoteCampus — Résultats — ${result.title}`, "Élection", generatedAt);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Total de votants : ${result.total_voters}`, 22, 90);
    doc.text(`Total de votes : ${result.total_votes}`, 220, 90);
    doc.text(`${result.isTie ? "Résultat :" : "Liste gagnante :"} ${result.winner || "-"}`, 440, 90);

    autoTable(doc, {
      startY: 110,
      head: [["Liste / Candidat", "Nombre de votes", "Pourcentage", "Classement"]],
      body: result.rows.map((row) => [
        row.list_name || "-",
        String(row.vote_count),
        `${row.percentage.toFixed(1)}%`,
        `#${row.rank}`,
      ]),
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 6,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save(`VoteCampus-resultats-${result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto" size="sm" type="button">
      <Download className="mr-2 h-4 w-4" />
      Télécharger PDF
    </Button>
  );
}
