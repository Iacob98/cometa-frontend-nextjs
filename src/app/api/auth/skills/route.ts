import { NextResponse } from 'next/server';

// Predefined skills for fiber optic construction workers
const PREDEFINED_SKILLS = [
  "Fiber Optic Cable Installation",
  "Fiber Optic Splicing",
  "Cable Pulling",
  "Trenching & Excavation",
  "Underground Construction",
  "Aerial Construction",
  "OSP (Outside Plant) Installation",
  "Fiber Optic Testing (OTDR)",
  "Cable Locating",
  "Traffic Control",
  "Confined Space Entry",
  "Heavy Equipment Operation",
  "Directional Drilling",
  "Manholes & Handholes",
  "Pole Installation",
  "Conduit Installation",
  "Fusion Splicing",
  "Mechanical Splicing",
  "Cable Maintenance",
  "Network Documentation",
  "Safety Compliance",
  "First Aid/CPR",
  "German Language",
  "Russian Language",
  "English Language",
  "Project Management",
  "Team Leadership"
];

export async function GET() {
  try {
    return NextResponse.json({
      predefined_skills: PREDEFINED_SKILLS,
      message: "Available predefined skills for fiber optic construction"
    });
  } catch (error) {
    console.error('Skills API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}