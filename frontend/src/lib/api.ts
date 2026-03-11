const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch(`${API_BASE}/currencies`);
  if (!res.ok) throw new Error("Failed to fetch currencies");
  return res.json();
}

export async function fetchTransactions(currency: string) {
  const res = await fetch(`${API_BASE}/transactions?currency=${encodeURIComponent(currency)}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function updateTransactionStatus(id: number, status: "Approved" | "Pending") {
  const res = await fetch(`${API_BASE}/transactions/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export function getDownloadUrl() {
  return `${API_BASE}/download`;
}
