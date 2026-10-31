import { NextRequest, NextResponse } from "next/server";

// Default telemetry state for active monitored projects
let telemetryProjects = [
  {
    id: "PRJ-001",
    name: "Amazon Reforestation Block 7",
    location: "Brazil",
    area: "12,500 ha",
    status: "Verified",
    cqs: "AAA",
    cqsScore: 94,
    forestCover: "84.5%",
    lastScan: "2 hours ago",
    trend: "+0.2%",
    oracleAccount: "7VbXoAmazonBlock7OracleReg2026",
    deedId: "BR-1500800-AMZ-2026-BLK7",
  },
  {
    id: "PRJ-002",
    name: "Congo Basin Conservation",
    location: "DRC",
    area: "45,000 ha",
    status: "Verified",
    cqs: "AA",
    cqsScore: 88,
    forestCover: "88.0%",
    lastScan: "5 hours ago",
    trend: "0.0%",
    oracleAccount: "9KqmCongoBasinOracleReg2026",
    deedId: "CDF-EQUAT-2026-0941",
  },
  {
    id: "PRJ-003",
    name: "Borneo Peatland Protection",
    location: "Indonesia",
    area: "8,200 ha",
    status: "Suspended",
    cqs: "C",
    cqsScore: 42,
    forestCover: "62.1%",
    lastScan: "12 hours ago",
    trend: "-5.4%",
    oracleAccount: "4TyH89BorneoPeatOracleReg2026",
    deedId: "HGU 00412/KALBAR/2026",
    reason: "Canopy degradation detected below baseline. Token-2022 hook engaged.",
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (id) {
    const found = telemetryProjects.find(
      (p) => p.id.toLowerCase() === id.toLowerCase() || p.name.toLowerCase().includes(id.toLowerCase())
    );
    if (!found) {
      return NextResponse.json({ error: `Project '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json({ project: found }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  return NextResponse.json({ 
    total: telemetryProjects.length,
    projects: telemetryProjects,
    cluster: "devnet",
    lastUpdated: new Date().toISOString()
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, newProject, id, status, cqs, cqsScore, forestCover, trend, lastScan } = body;

    // Handle new project registration
    if (action === "register" && newProject) {
      // Avoid duplicate registration
      const existsIndex = telemetryProjects.findIndex((p) => p.id === newProject.id);
      if (existsIndex >= 0) {
        telemetryProjects[existsIndex] = { ...telemetryProjects[existsIndex], ...newProject };
      } else {
        telemetryProjects = [newProject, ...telemetryProjects];
      }
      return NextResponse.json({ success: true, count: telemetryProjects.length, projects: telemetryProjects }, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Update existing matching project in memory
    let updated = false;
    telemetryProjects = telemetryProjects.map((project) => {
      const isMatch = 
        project.id === id || 
        project.name.toLowerCase().includes((id || "").toLowerCase()) ||
        (id === "1" && project.id === "PRJ-001") ||
        (id === "2" && project.id === "PRJ-003");

      if (isMatch) {
        updated = true;
        return {
          ...project,
          ...(status && { status }),
          ...(cqs && { cqs }),
          ...(cqsScore !== undefined && { cqsScore }),
          ...(forestCover && { forestCover }),
          ...(trend && { trend }),
          lastScan: lastScan || "Just now (Copernicus Sentinel-2)",
        };
      }
      return project;
    });

    return NextResponse.json({ success: true, updated, projects: telemetryProjects }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
