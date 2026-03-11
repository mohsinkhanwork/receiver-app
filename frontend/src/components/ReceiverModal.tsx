"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, setSelectedCurrency, setSearch } from "@/store/receiverSlice";
import {
  setTransactions,
  addTransaction,
  patchTransactionStatus,
  type Transaction,
} from "@/store/transactionSlice";
import {
  fetchCurrencies,
  fetchTransactions,
  updateTransactionStatus,
  getDownloadUrl,
  type Currency,
} from "@/lib/api";
import { getEcho } from "@/lib/echo";

const CURRENCY_COLORS: Record<string, string> = {
  USD: "bg-blue-600",
  EUR: "bg-green-600",
  GBP: "bg-purple-600",
};

export default function ReceiverModal() {
  // ── Redux state ────────────────────────────────────────────────────────────
  const dispatch         = useAppDispatch();
  const selectedCurrency = useAppSelector((s) => s.receiver.selectedCurrency);
  const search           = useAppSelector((s) => s.receiver.search);
  const transactions     = useAppSelector((s) => s.transactions.items);

  // ── Local UI state (doesn't need to survive modal close) ──────────────────
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // ── Fetch currencies once on mount ────────────────────────────────────────
  useEffect(() => {
    fetchCurrencies().then(setCurrencies).catch(console.error);
  }, []);

  // ── Fetch transactions when selected currency changes ─────────────────────
  const loadTransactions = useCallback(() => {
    fetchTransactions(selectedCurrency)
      .then((data) => dispatch(setTransactions(data)))
      .catch(console.error);
  }, [selectedCurrency, dispatch]);

  useEffect(() => {
    let cancelled = false;
    fetchTransactions(selectedCurrency)
      .then((data) => { if (!cancelled) dispatch(setTransactions(data)); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [selectedCurrency, loadTransactions, dispatch]);

  // ── Laravel Echo / Reverb WebSocket ───────────────────────────────────────
  // Replaces polling: updates arrive instantly over a persistent WebSocket connection.
  useEffect(() => {
    let alive = true;

    getEcho().then((echo) => {
      if (!echo || !alive) return;

      const channel = echo.channel(`transactions.${selectedCurrency}`);

      // Backend fired TransactionReleased event — a queued item became visible
      channel.listen(".transaction.released", (data: Transaction) => {
        dispatch(addTransaction(data));
      });

      // Backend fired TransactionUpdated event — someone toggled a status
      channel.listen(".transaction.updated", (data: Transaction) => {
        dispatch(patchTransactionStatus({ id: data.id, status: data.status }));
      });
    });

    return () => {
      alive = false;
      getEcho().then((echo) => {
        echo?.leaveChannel(`transactions.${selectedCurrency}`);
      });
    };
  }, [selectedCurrency, dispatch]);

  // ── Status toggle — optimistic update + backend persist ───────────────────
  const handleStatusToggle = async (tx: Transaction) => {
    const newStatus = tx.status === "Approved" ? "Pending" : "Approved";
    // Update Redux immediately so the UI feels instant
    dispatch(patchTransactionStatus({ id: tx.id, status: newStatus }));
    try {
      await updateTransactionStatus(tx.id, newStatus);
      // Backend also broadcasts the change → other open tabs update via socket
    } catch (err) {
      // Roll back if the API call fails
      dispatch(patchTransactionStatus({ id: tx.id, status: tx.status }));
      console.error("Failed to update status", err);
    }
  };

  // ── Client-side search — filters "To" and "Status" fields ─────────────────
  const filtered = transactions.filter((tx) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return tx.to_name.toLowerCase().includes(q) || tx.status.toLowerCase().includes(q);
  });

  const symbol = currencies.find((c) => c.code === selectedCurrency)?.symbol || "$";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Receiver Transactions</h2>
          <button
            onClick={() => dispatch(closeModal())}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Currency tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {currencies.map((cur) => (
            <button
              key={cur.code}
              onClick={() => dispatch(setSelectedCurrency(cur.code))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                selectedCurrency === cur.code
                  ? `${CURRENCY_COLORS[cur.code] || "bg-blue-600"} text-white`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cur.code}
            </button>
          ))}
        </div>

        {/* Search + Download */}
        <div className="flex flex-col sm:flex-row gap-2 px-6 py-3">
          <input
            type="text"
            placeholder="Search by name or status…"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <a
            href={getDownloadUrl()}
            download
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition text-center"
          >
            Download
          </a>
        </div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No transactions found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 font-medium">To</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">{tx.to_name}</td>
                    <td className="py-3">
                      {symbol}
                      {Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleStatusToggle(tx)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          tx.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {tx.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
