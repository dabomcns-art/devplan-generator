import { NextRequest, NextResponse } from "next/server";

interface ExportDocument {
  filename: string;
  content: string;
  doc_type: string;
}

interface ExportRequest {
  project_name: string;
  documents: ExportDocument[];
  design_html?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { project_name, documents, design_html } = body;

    const completedDocs = documents.filter((d) => d.content && d.content.trim().length > 0);

    const fileStructure = buildFileStructure(project_name, completedDocs, design_html);
    const totalSize = completedDocs.reduce((acc, d) => acc + new Blob([d.content]).size, 0);
    const totalTokens = estimateTokens(completedDocs);

    return NextResponse.json({
      success: true,
      file_structure: fileStructure,
      stats: {
        total_files: completedDocs.length + (design_html ? 1 : 0) + 1, // +README
        total_size_bytes: totalSize,
        estimated_tokens: totalTokens,
        estimated_cost_usd: (totalTokens / 1_000_000) * 3,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}

function buildFileStructure(
  projectName: string,
  documents: ExportDocument[],
  designHtml?: string
) {
  const safeName = projectName.replace(/[^a-zA-Z0-9가-힣\-_]/g, "_") || "project";

  const structure = [
    {
      name: safeName,
      type: "folder",
      children: [
        {
          name: "docs",
          type: "folder",
          children: documents.map((d) => ({
            name: d.filename,
            type: "markdown",
            size: new Blob([d.content]).size,
          })),
        },
        ...(designHtml
          ? [
              {
                name: "design",
                type: "folder",
                children: [
                  {
                    name: "wireframe.html",
                    type: "html",
                    size: new Blob([designHtml]).size,
                  },
                ],
              },
            ]
          : []),
        {
          name: "README.md",
          type: "markdown",
          size: 512,
        },
      ],
    },
  ];

  return structure;
}

function estimateTokens(documents: ExportDocument[]): number {
  // Rough estimate: 1 token ≈ 4 chars
  return documents.reduce((acc, d) => acc + Math.ceil(d.content.length / 4), 0);
}
