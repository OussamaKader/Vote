"use client";

import { useState } from "react";
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

/**
 * Met un mot au pluriel de façon simple (règle générale du français).
 * Suffisant pour des intitulés de poste ("Délégué" -> "Délégués").
 */
function pluralizeFr(word: string): string {
  const w = word.trim();

  if (!w) return w;

  if (w.endsWith("s") || w.endsWith("x")) {
    return w;
  }

  return `${w}s`;
}

/**
 * Détermine le titre du tableau des membres élus en fonction du type
 * d'élection :
 * 1) Si tous les membres élus partagent le même intitulé de poste
 *    (ex: "Délégué" répété), on utilise ce poste au pluriel.
 * 2) Sinon on tente de déduire le type à partir du titre de l'élection.
 * 3) Par défaut, on retombe sur "Bureau exécutif élu".
 */
function getElectedSectionTitle(
  boardMembers: BoardMember[],
  electionTitle: string,
): string {
  const positions = Array.from(
    new Set(
      boardMembers
        .map((member) => member.position?.trim())
        .filter((position): position is string => Boolean(position)),
    ),
  );

  if (positions.length === 1) {
    return `${pluralizeFr(positions[0])} élu(e)s`;
  }

  const normalizedTitle = electionTitle.toLowerCase();

  if (normalizedTitle.includes("délégué")) {
    return "Délégués élu(e)s";
  }

  if (normalizedTitle.includes("représentant")) {
    return "Représentants élu(e)s";
  }

  if (normalizedTitle.includes("bureau")) {
    return "Bureau exécutif élu";
  }

  return "Bureau exécutif élu";
}

/**
 * Header commun des PDF
 */
function addPdfHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  generatedAt: string,
  options?: { showLogo?: boolean },
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  const showLogo = options?.showLogo ?? true;

  // Dimensions du logo
  const logoSize = 40;
  const logoX = 22;
  const logoY = 12;

  // Position du texte après le logo
  const textX = showLogo ? logoX + logoSize + 12 : 22;

  // ---------------------------------------------------------
  // Fond bleu du header
  // ---------------------------------------------------------
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 64, "F");

  // ---------------------------------------------------------
  // Logo
  // ---------------------------------------------------------
  if (showLogo) {
    try {
      const cx = logoX + logoSize / 2;
      const cy = logoY + logoSize / 2;
      const radius = logoSize / 2;

      doc.saveGraphicsState();

      doc.circle(cx, cy, radius, null as unknown as string);
      doc.clip();
      doc.discardPath();

      doc.addImage(
        ASSOCIATION_LOGO_BASE64,
        "PNG",
        logoX,
        logoY,
        logoSize,
        logoSize,
      );

      doc.restoreGraphicsState();
    } catch {
      // Si le logo ne peut pas être chargé,
      // le PDF continue normalement.
    }
  }

  // ---------------------------------------------------------
  // Nom de l'association
  // ---------------------------------------------------------
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text(
    "Association des Étudiants Mauritaniens au Maroc",
    textX,
    28,
  );

  // ---------------------------------------------------------
  // Titre du document
  // ---------------------------------------------------------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(title, textX, 46);

  // ---------------------------------------------------------
  // Date - à droite
  // ---------------------------------------------------------
  doc.setTextColor(219, 234, 254);
  doc.setFontSize(8);

  doc.text(
    `Généré le ${generatedAt}`,
    pageWidth - 22,
    24,
    {
      align: "right",
    },
  );

  // ---------------------------------------------------------
  // Sous-titre - à droite
  // ---------------------------------------------------------
  doc.setFontSize(10);

  doc.text(
    subtitle,
    pageWidth - 22,
    46,
    {
      align: "right",
    },
  );
}

/**
 * Dessine les cases d'information
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

  const boxWidth =
    (usableWidth - gap * (columns - 1)) / columns;

  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    const x =
      margin + col * (boxWidth + gap);

    const y =
      startY + row * (boxHeight + gap);

    // Fond
    doc.setFillColor(248, 250, 252);

    // Bordure
    doc.setDrawColor(226, 232, 240);

    doc.roundedRect(
      x,
      y,
      boxWidth,
      boxHeight,
      4,
      4,
      "FD",
    );

    // Label
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      item.label.toUpperCase(),
      x + 10,
      y + 13,
    );

    // Valeur
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text(
      item.value,
      x + 10,
      y + 26,
    );
  });

  const rows = Math.ceil(
    items.length / columns,
  );

  return (
    startY +
    rows * (boxHeight + gap)
  );
}

/**
 * Dessine un bloc de description libre (texte multi-lignes) juste
 * en dessous du header, sous forme d'encadré stylé (fond clair +
 * liseré bleu à gauche + libellé), afin que tout le texte saisi par
 * l'admin soit toujours lisible et bien mis en forme.
 * Gère automatiquement le saut de page si le texte est trop long
 * pour tenir sur la page courante.
 * Retourne la position Y où continuer le dessin.
 */
function drawDescriptionBlock(
  doc: jsPDF,
  description: string,
  startY: number,
  pageWidth: number,
) {
  const margin = 22;
  const usableWidth = pageWidth - margin * 2;

  const trimmed = description.trim();

  if (!trimmed) {
    return startY;
  }

  const paddingX = 14;
  const paddingY = 12;
  const labelHeight = 16;
  const lineHeight = 13;
  const textWidth = usableWidth - paddingX * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lines = doc.splitTextToSize(trimmed, textWidth) as string[];

  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 40;

  // On découpe le texte en "pages" de lignes si l'encadré ne tient
  // pas entièrement sur la page courante (texte long).
  let cursorY = startY;
  let remainingLines = lines;

  while (remainingLines.length > 0) {
    const availableHeight =
      pageHeight - bottomMargin - cursorY - paddingY * 2 - labelHeight;

    const maxLinesOnPage = Math.max(
      1,
      Math.floor(availableHeight / lineHeight),
    );

    // Si même le début de l'encadré ne tient pas, on démarre une
    // nouvelle page avant de dessiner quoi que ce soit.
    if (availableHeight < lineHeight) {
      doc.addPage();
      cursorY = 40;
      continue;
    }

    const linesForThisPage = remainingLines.slice(0, maxLinesOnPage);
    remainingLines = remainingLines.slice(maxLinesOnPage);

    const blockHeight =
      linesForThisPage.length * lineHeight + paddingY * 2 + labelHeight;

    // Fond de l'encadré
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, cursorY, usableWidth, blockHeight, 6, 6, "F");

    // Liseré bleu à gauche
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin, cursorY, 4, blockHeight, 2, 2, "F");

    // Libellé
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.text(
      "CONTEXTE",
      margin + paddingX,
      cursorY + paddingY + 2,
    );

    // Texte
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    linesForThisPage.forEach((line, index) => {
      doc.text(
        line,
        margin + paddingX,
        cursorY + paddingY + labelHeight + index * lineHeight,
      );
    });

    cursorY += blockHeight + 14;

    if (remainingLines.length > 0) {
      doc.addPage();
      cursorY = 40;
    }
  }

  return cursorY;
}

/* =========================================================
   EXPORT DES VOTES
========================================================= */

export function VotesPdfExport({
  votes,
}: {
  votes: VoteExportRow[];
}) {
  const handleDownload = () => {
    if (!votes.length) {
      window.alert(
        "Aucun vote à exporter pour le moment.",
      );

      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const generatedAt =
      formatDateTime(new Date());

    // Header
    addPdfHeader(
      doc,
      "AEM-MAROC — Liste des votes",
      "Administration",
      generatedAt,
    );

    // Total
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Total de votes : ${votes.length}`,
      22,
      90,
    );

    // Tableau
    autoTable(doc, {
      startY: 108,

      head: [
        [
          "Élection",
          "Liste / Candidat",
          "Utilisateur",
          "Date du vote",
        ],
      ],

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
    });

    // Date de génération
    const finalY =
      ((doc as any).lastAutoTable?.finalY ??
        120) + 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    doc.text(
      `Date de génération : ${generatedAt}`,
      22,
      finalY,
    );

    // Télécharger
    doc.save(
      `VoteCampus-votes-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`,
    );
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

/* =========================================================
   EXPORT DES RÉSULTATS
========================================================= */

export function ResultsPdfExport({
  results,
}: {
  results: ElectionResultSummary[];
}) {
  const handleDownload = () => {
    const filteredResults =
      results.filter(
        (result) => result.total_votes > 0,
      );

    if (!filteredResults.length) {
      window.alert(
        "Aucun résultat à exporter pour le moment.",
      );

      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const generatedAt =
      formatDateTime(new Date());

    const totalVoters =
      filteredResults.reduce(
        (sum, result) =>
          sum + result.total_voters,
        0,
      );

    const totalVotes =
      filteredResults.reduce(
        (sum, result) =>
          sum + result.total_votes,
        0,
      );

    const overallWinner =
      filteredResults
        .map((result) => ({
          title: result.title,
          winner: result.winner,
          isTie: result.isTie,
        }))
        .find(
          (result) =>
            result.winner &&
            result.winner !== "-",
        );

    // Header
    addPdfHeader(
      doc,
      "Association des Étudiants Mauritaniens au Maroc — Résultats des élections",
      "Administration",
      generatedAt,
    );

    // Informations
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Total de votants : ${totalVoters}`,
      22,
      90,
    );

    doc.text(
      `Total de votes : ${totalVotes}`,
      220,
      90,
    );

    doc.text(
      `${overallWinner?.isTie
        ? "Résultat :"
        : "Gagnant :"
      } ${overallWinner?.winner ?? "-"}`,
      440,
      90,
    );

    // Tableau
    autoTable(doc, {
      startY: 110,

      head: [
        [
          "Élection",
          "Liste / Candidat",
          "Nombre de votes",
          "Pourcentage",
          "Classement",
        ],
      ],

      body: filteredResults.flatMap(
        (result) =>
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

    // Télécharger
    doc.save(
      `AEM-MAROC-resultats-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`,
    );
  };

  return (
    <Button
      onClick={handleDownload}
      className="w-full sm:w-auto"
      size="md"
      type="button"
    >
      <Download className="mr-2 h-4 w-4" />

      Télécharger les résultats PDF
    </Button>
  );
}

/* =========================================================
   EXPORT D'UN SEUL RÉSULTAT
========================================================= */

export function SingleResultPdfExport({
  result,
  boardMembers = [],
  totalUsers = 0,
}: {
  result: ElectionResultSummary;
  boardMembers?: BoardMember[];
  totalUsers?: number;
}) {
  const [description, setDescription] = useState("");

  // Commission indépendante des élections
  const [commissionPresident, setCommissionPresident] = useState("");
  const [commissionVicePresident, setCommissionVicePresident] = useState("");
  const [commissionRapporteur, setCommissionRapporteur] = useState("");

  const handleDownload = () => {
    if (!result.total_votes) {
      window.alert(
        "Aucune donnée de vote pour cette élection.",
      );

      return;
    }

    // PDF portrait
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const generatedAt =
      formatDateTime(new Date());

    const participationRate =
      totalUsers > 0
        ? (result.total_votes / totalUsers) * 100
        : 0;

    // Header
    addPdfHeader(
      doc,
      `Procès-verbal — ${result.title}`,
      "Résultats de l'élection",
      generatedAt,
    );

    /* =====================================================
       DESCRIPTION (facultative, juste après le header)
       -> encadré stylé, texte intégralement affiché, avec
          saut de page automatique si nécessaire.
    ===================================================== */

    const infoBoxesStartY = drawDescriptionBlock(
      doc,
      description,
      82,
      pageWidth,
    );

    /* =====================================================
       CASES D'INFORMATION
    ===================================================== */

    let cursorY = drawInfoBoxes(
      doc,
      [
        {
          label: "Électeurs inscrits",
          value: String(totalUsers),
        },

        {
          label: "Votes exprimés",
          value: String(result.total_votes),
        },

        {
          label: "Taux de participation",
          value: `${participationRate.toFixed(1)}%`,
        },

        {
          label: result.isTie ? "Résultat" : "Liste gagnante",
          value: result.winner || "-",
        },
      ],

      infoBoxesStartY,

      pageWidth,

      2,
    );

    cursorY += 10;

    /* =====================================================
       TABLEAU DES RÉSULTATS
    ===================================================== */

    doc.setTextColor(15, 23, 42);

    doc.setFont(
      "helvetica",
      "bold",
    );

    doc.setFontSize(12);

    doc.text(
      "Résultats de l'élection",
      22,
      cursorY,
    );

    autoTable(doc, {
      startY: cursorY + 10,

      head: [
        [
          "Liste / Candidat",
          "Voix",
          "Pourcentage",
          "Classement",
        ],
      ],

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

      margin: {
        left: 22,
        right: 22,
      },
    });

    let afterResultsY =
      ((doc as any).lastAutoTable?.finalY ??
        cursorY + 10) + 20;

    /* =====================================================
       MEMBRES ÉLUS (titre adapté au type d'élection :
       "Délégués élu(e)s", "Représentants élu(e)s",
       "Bureau exécutif élu", etc.)
    ===================================================== */

    if (boardMembers.length > 0) {
      const pageHeight =
        doc.internal.pageSize.getHeight();

      if (
        afterResultsY >
        pageHeight - 140
      ) {
        doc.addPage();
        afterResultsY = 40;
      }

      const electedSectionTitle =
        getElectedSectionTitle(
          boardMembers,
          result.title,
        );

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text(
        electedSectionTitle,
        22,
        afterResultsY,
      );

      autoTable(doc, {
        startY: afterResultsY + 10,

        head: [
          [
            "Poste",
            "Nom complet",
          ],
        ],

        body: boardMembers.map((member) => [
          member.position || "-",
          member.name || "-",
        ]),

        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        margin: {
          left: 22,
          right: 22,
        },
      });

      afterResultsY =
        ((doc as any).lastAutoTable?.finalY ??
          afterResultsY + 10) + 12;
    }

    /* =====================================================
       COMMISSION INDÉPENDANTE DES ÉLECTIONS
       La commission reste sur la même page, juste sous
       le tableau des élus, afin d'éviter tout chevauchement.
    ===================================================== */

    const commissionTitleY = afterResultsY + 10;

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(
      "Commission indépendante des élections",
      pageWidth / 2,
      commissionTitleY,
      {
        align: "center",
      },
    );

    const margin = 22;
    const gap = 8;
    const columnWidth =
      (pageWidth - margin * 2 - gap * 2) / 3;
    const cardHeight = 82;
    const cardTopY = commissionTitleY + 18;

    const commissionMembers = [
      {
        role: "Président",
        name: commissionPresident.trim() || "-",
      },
      {
        role: "Vice-président",
        name: commissionVicePresident.trim() || "-",
      },
      {
        role: "Rapporteur",
        name: commissionRapporteur.trim() || "-",
      },
    ];

    commissionMembers.forEach((member, index) => {
      const x = margin + index * (columnWidth + gap);
      const centerX = x + columnWidth / 2;
      const nameY = cardTopY + 28;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(
        x,
        cardTopY,
        columnWidth,
        cardHeight,
        4,
        4,
        "FD",
      );

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(
        member.role,
        centerX,
        cardTopY + 14,
        {
          align: "center",
        },
      );

      const nameLines = doc.splitTextToSize(
        member.name,
        columnWidth - 16,
      );

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(nameLines, centerX, nameY, {
        align: "center",
      });

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.7);
      doc.line(
        x + 12,
        cardTopY + cardHeight - 18,
        x + columnWidth - 12,
        cardTopY + cardHeight - 18,
      );
    });

    /* =====================================================
       TÉLÉCHARGEMENT
    ===================================================== */

    doc.save(
      `AEM-MAROC-resultats-${result.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`,
    );
  };

  return (
    <div className="flex w-full flex-col items-end gap-3 sm:w-auto">
      {/* Description */}
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description à afficher dans le PDF (facultatif)"
        rows={2}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-72"
      />

      {/* Commission indépendante des élections */}
      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 sm:w-72">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">
          Commission indépendante des élections
        </p>

        <div className="space-y-2">
          {/* Président */}
          <input
            type="text"
            value={commissionPresident}
            onChange={(event) =>
              setCommissionPresident(event.target.value)
            }
            placeholder="Président"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Vice-président */}
          <input
            type="text"
            value={commissionVicePresident}
            onChange={(event) =>
              setCommissionVicePresident(event.target.value)
            }
            placeholder="Vice-président"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Rapporteur */}
          <input
            type="text"
            value={commissionRapporteur}
            onChange={(event) =>
              setCommissionRapporteur(event.target.value)
            }
            placeholder="Rapporteur"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Télécharger */}
      <Button
        onClick={handleDownload}
        variant="outline"
        className="w-full sm:w-auto"
        size="sm"
        type="button"
      >
        <Download className="mr-2 h-4 w-4" />
        Télécharger PDF
      </Button>
    </div>
  );
}