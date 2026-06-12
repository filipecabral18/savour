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

export async function checkAvailability(establishmentId: string, date: string, guests: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/availability`, apiUrl);
    url.searchParams.append('date', date);
    url.searchParams.append('guests', guests.toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      available: false,
      error: error.message || 'Failed to check availability',
    };
  }
}

export async function createReservation(
  establishmentId: string,
  date: string,
  guests: number,
  name: string,
  contact: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/reservations`, apiUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, guests, name, contact }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to confirm reservation',
    };
  }
}

export async function getAlternativeSlots(
  establishmentId: string,
  date: string,
  guests: number,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/alternative-slots`, apiUrl);
    url.searchParams.append('date', date);
    url.searchParams.append('guests', guests.toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return [];
  }
}

export async function addToWaitlist(
  establishmentId: string,
  guests: number,
  name: string,
  contact: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/waitlist`, apiUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guests, name, contact }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to enter waitlist',
    };
  }
}

export async function getWaitlistStatus(
  establishmentId: string,
  entryId: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/waitlist/${entryId}`, apiUrl);
    const res = await fetch(url.toString(), { cache: 'no-store' });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to fetch waitlist status',
    };
  }
}

export async function removeFromWaitlist(
  establishmentId: string,
  entryId: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/waitlist/${entryId}`, apiUrl);
    const res = await fetch(url.toString(), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to leave waitlist',
    };
  }
}

export async function getReservations(
  establishmentId: string,
  date: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/reservations`, apiUrl);
    url.searchParams.append('date', date);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return [];
  }
}

export async function updateReservationStatus(
  establishmentId: string,
  reservationId: string,
  status: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/reservations/${reservationId}/status`, apiUrl);
    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to update reservation status',
    };
  }
}

export async function getWaitlist(
  establishmentId: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/waitlist`, apiUrl);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return [];
  }
}

export async function checkInWaitlist(
  establishmentId: string,
  entryId: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/waitlist/${entryId}/check-in`, apiUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to check in waitlist entry',
    };
  }
}

export async function callNextInWaitlist(
  establishmentId: string,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = new URL(`/v1/establishments/${establishmentId}/waitlist/call-next`, apiUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    return {
      error: error.message || 'Failed to call next entry in waitlist',
    };
  }
}

