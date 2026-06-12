export async function getBackendStatus() {
  // Use public env var on client side, or fallback
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      status: 'OFFLINE',
      database: 'Unknown',
      error: error.message || 'Failed to fetch'
    };
  }
}
