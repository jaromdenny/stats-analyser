export async function getAvailableDatasets(): Promise<string[]> {
  try {
    const response = await fetch('/api/datasets');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
} 