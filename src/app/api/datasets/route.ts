import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const files = fs.readdirSync(dataDir);
    const datasets = files.filter(file => file.endsWith('.json'));
    return NextResponse.json(datasets);
  } catch (error) {
    console.error('Error reading datasets:', error);
    return NextResponse.json([], { status: 500 });
  }
} 