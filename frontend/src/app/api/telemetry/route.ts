import { NextResponse } from "next/server";

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
  },
];

export async function GET() {
  return NextResponse.json({ projects: telemetryProjects }, {
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
      const exists = telemetryProjects.some((p) => p.id === newProject.id);
      if (!exists) {
        telemetryProjects = [newProject, ...telemetryProjects];
      }
      return NextResponse.json({ success: true, projects: telemetryProjects }, {
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
          lastScan: lastScan || "Just now",
        };
      }
      return project;
    });

    return NextResponse.json({ success: true, updated, projects: telemetryProjects }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
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
