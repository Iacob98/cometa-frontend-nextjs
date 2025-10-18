import { NextResponse } from 'next/server';

// Predefined skills for fiber optic construction workers (in German)
const PREDEFINED_SKILLS = [
  "Glasfaser-Kabelinstallation",
  "Glasfaser-Spleißen",
  "Kabelzug",
  "Grabenaushub & Ausgrabung",
  "Unterirdischer Bau",
  "Oberirdischer Bau",
  "OSP-Installation (Außenanlage)",
  "Glasfaser-Prüfung (OTDR)",
  "Kabelortung",
  "Verkehrskontrolle",
  "Betreten von engen Räumen",
  "Bedienung schwerer Geräte",
  "Horizontalbohrung",
  "Schächte & Handschächte",
  "Mastinstallation",
  "Leerrohrlegen",
  "Schmelzspleißen",
  "Mechanisches Spleißen",
  "Kabelwartung",
  "Netzwerkdokumentation",
  "Sicherheitskonformität",
  "Erste Hilfe/HLW",
  "Deutsch",
  "Russisch",
  "Englisch",
  "Projektmanagement",
  "Teamführung"
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