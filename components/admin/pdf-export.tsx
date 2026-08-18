"use client";

import { Button } from "@/components/ui/button";
import type { ElectionResultSummary } from "@/lib/election-results";
import { Download } from "lucide-react";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { ASSOCIATION_LOGO_BASE64 } from "./logo";

export type VoteExportRow = {
  id: string | number;
  election_id: string | number;
  list_id: string | number;
  election_title: string;
  list_name: string;
  user_name: string;
  created_at: string;
};

export type BoardMember = {
  name: string;
  position: string | null;
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

function addPdfHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  generatedAt: string,
  options?: { showLogo?: boolean },
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const showLogo = options?.showLogo ?? true;
  const logoSize = 40;
  const logoX = 22;
  const logoY = 12;
  // Le texte se décale à droite du logo quand celui-ci est affiché.
  const textX = showLogo ? logoX + logoSize + 12 : 22;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 64, "F");

  if (showLogo) {
    try {
      // jsPDF ne respecte pas toujours le canal alpha des PNG (le fond
      // transparent peut réapparaître en blanc à l'export). Pour obtenir
      // un logo parfaitement circulaire quel que soit le rendu du PNG,
      // on découpe l'image avec un clip path circulaire natif à jsPDF
      // plutôt que de compter sur la transparence de l'image elle-même.
      const cx = logoX + logoSize / 2;
      const cy = logoY + logoSize / 2;
      const radius = logoSize / 2;

      doc.saveGraphicsState();
      doc.circle(cx, cy, radius, null as unknown as string);
      doc.clip();
      doc.discardPath();
      doc.addImage(ASSOCIATION_LOGO_BASE64, "PNG", logoX, logoY, logoSize, logoSize);
      doc.restoreGraphicsState();
    } catch {
      // Si le logo ne peut pas être chargé, on continue sans bloquer l'export.
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text("Association des Étudiants Mauritaniens au Maroc", textX, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(title, textX, 46);

  doc.setTextColor(219, 234, 254);
  doc.text(`Généré le ${generatedAt}`, pageWidth - 180, 28);
  doc.text(subtitle, pageWidth - 180, 46);
}

/**
 * Dessine une grille de "cases d'information" (façon procès-verbal papier) :
 * un fond gris clair, un label en majuscule, et une valeur en gras.
 * `items` est réparti en `columns` colonnes de largeur égale.
 */
function drawInfoBoxes(
  doc: jsPDF,
  items: { label: string; value: string }[],
  startY: number,
  pageWidth: number,
  columns = 2,
) {
  const margin = 22;
  const gap = 10;
  const boxHeight = 34;
  const usableWidth = pageWidth - margin * 2;
  const boxWidth = (usableWidth - gap * (columns - 1)) / columns;

  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + col * (boxWidth + gap);
    const y = startY + row * (boxHeight + gap);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, boxWidth, boxHeight, 4, 4, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(item.label.toUpperCase(), x + 10, y + 13);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(item.value, x + 10, y + 26);
  });

  const rows = Math.ceil(items.length / columns);
  return startY + rows * (boxHeight + gap);
}

export function VotesPdfExport({ votes }: { votes: VoteExportRow[] }) {
  const handleDownload = () => {
    if (!votes.length) {
      window.alert("Aucun vote à exporter pour le moment.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const generatedAt = formatDateTime(new Date());

    addPdfHeader(doc, "AEM-MAROC — Liste des votes", "Administration", generatedAt);

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
        doc.setFontSize(6);
        doc.setTextColor(51, 65, 85);
        doc.text("Association des Étudiants Mauritaniens au Maroc (AEM-MAROC)", 22, finalY);
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

export function SingleResultPdfExport({
  result,
  boardMembers = [],
}: {
  result: ElectionResultSummary;
  boardMembers?: BoardMember[];
}) {
  const handleDownload = () => {
    if (!result.total_votes) {
      window.alert("Aucune donnée de vote pour cette élection.");
      return;
    }

    // Format "procès-verbal" : portrait, cases d'information, tableau des
    // résultats, puis tableau du bureau exécutif élu (liste gagnante).
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const generatedAt = formatDateTime(new Date());
    const participationRate =
      result.total_voters > 0 ? (result.total_votes / result.total_voters) * 100 : 0;

    addPdfHeader(doc, `Procès-verbal — ${result.title}`, "Résultats de l'élection", generatedAt);

    // --- Cases d'information --------------------------------------------
    let cursorY = drawInfoBoxes(
      doc,
      [
        { label: "Votants inscrits", value: String(result.total_voters) },
        { label: "Votes exprimés", value: String(result.total_votes) },
        { label: "Taux de participation", value: `${participationRate.toFixed(1)}%` },
        {
          label: result.isTie ? "Résultat" : "Liste gagnante",
          value: result.winner || "-",
        },
      ],
      82,
      pageWidth,
      2,
    );

    cursorY += 10;

    // --- Tableau des résultats --------------------------------------------
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Résultats du scrutin", 22, cursorY);

    autoTable(doc, {
      startY: cursorY + 10,
      head: [["Liste / Candidat", "Voix", "Pourcentage", "Classement"]],
      body: result.rows.map((row) => [
        row.list_name || "-",
        String(row.vote_count),
        `${row.percentage.toFixed(1)}%`,
        `#${row.rank}`,
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
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
      margin: { left: 22, right: 22 },
    });

    let afterResultsY = ((doc as any).lastAutoTable?.finalY ?? cursorY + 10) + 24;

    // --- Bureau exécutif élu ----------------------------------------------
    if (boardMembers.length > 0) {
      // Nouvelle page si on n'a plus assez de place pour le titre + au
      // moins quelques lignes du tableau.
      const pageHeight = doc.internal.pageSize.getHeight();
      if (afterResultsY > pageHeight - 140) {
        doc.addPage();
        afterResultsY = 40;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Bureau exécutif élu", 22, afterResultsY);

      autoTable(doc, {
        startY: afterResultsY + 10,
        head: [["Poste", "Nom complet"]],
        body: boardMembers.map((member) => [member.position || "-", member.name || "-"]),
        theme: "grid",
        styles: {
          fontSize: 9,
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
        margin: { left: 22, right: 22 },
      });
    }

    doc.save(
      `VoteCampus-resultats-${result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`,
    );
  };

  return (
    <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto" size="sm" type="button">
      <Download className="mr-2 h-4 w-4" />
      Télécharger PDF
    </Button>
  );
}