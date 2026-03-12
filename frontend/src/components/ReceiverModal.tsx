"use client";

import { useEffect, useState } from "react";
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
  type Currency,
} from "@/lib/api";
import { getEcho } from "@/lib/echo";

// ── Static mock receiver profile ─────────────────────────────────────────────
const RECEIVER = { name: "John Bonham", type: "Individual", email: "john@email.com" };

function downloadTransactionReport(tx: Transaction, info: typeof ACCOUNT_INFO[string]) {
  const lines = [
    "TRANSACTION REPORT",
    "==================",
    "",
    `Date & Time   : ${formatDate(tx.created_at)}`,
    `Request ID    : ${fakeRequestId(tx.id)}`,
    `Status        : ${tx.status}`,
    "",
    "RECEIVER DETAILS",
    "----------------",
    `Name          : ${RECEIVER.name}`,
    `Type          : ${RECEIVER.type}`,
    `Email         : ${RECEIVER.email}`,
    "",
    "BANK DETAILS",
    "------------",
    `Bank          : ${info.bank}`,
    `Branch        : ${info.branch}`,
    `Account No    : ${info.account}`,
    `SWIFT/BIC     : ${info.swift}`,
    `Country       : ${info.country}`,
    "",
    "TRANSFER DETAILS",
    "----------------",
    `To            : ${tx.to_name}`,
    `Amount        : ${tx.currency} ${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    `Type          : Send Money / International`,
    "",
    `Generated on  : ${new Date().toLocaleString()}`,
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `transaction-${fakeRequestId(tx.id)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Per-currency bank / account details ──────────────────────────────────────
const ACCOUNT_INFO: Record<string, {
  flag: string; account: string; country: string;
  bank: string; branch: string; swift: string;
}> = {
  USD: { flag: "🇺🇸", account: "1982631287368", country: "United States",  bank: "Bank of America",  branch: "Main Street Branch",  swift: "BOFAUS3N" },
  EUR: { flag: "🇪🇺", account: "2847361928374", country: "Germany",         bank: "Deutsche Bank",    branch: "Frankfurt Central",   swift: "DEUTDEDB" },
  GBP: { flag: "🇬🇧", account: "9283746192837", country: "United Kingdom",  bank: "Barclays Bank",    branch: "London Main Branch",  swift: "BARCGB22" },
};

const STATUS_STYLE: Record<string, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending:  "bg-yellow-100 text-yellow-800",
};

const CURRENCY_BG: Record<string, string> = {
  USD: "bg-blue-50",
  EUR: "bg-purple-50",
  GBP: "bg-red-50",
};

const PAGE_SIZE = 4;

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) +
    " | " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}

function fakeRequestId(id: number) {
  return (id * 1234567).toString(36).toUpperCase().padStart(8, "0").slice(-8);
}

function getPages(current: number, total: number): (number | "...")[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const near = new Set(
    [1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total)
  );
  const result: (number | "...")[] = [];
  let prev = 0;
  Array.from(near)
    .sort((a, b) => a - b)
    .forEach((p) => {
      if (p - prev > 1) result.push("...");
      result.push(p);
      prev = p;
    });
  return result;
}

export default function ReceiverModal() {
  const dispatch         = useAppDispatch();
  const selectedCurrency = useAppSelector((s) => s.receiver.selectedCurrency);
  const search           = useAppSelector((s) => s.receiver.search);
  const transactions     = useAppSelector((s) => s.transactions.items);

  const [currencies,  setCurrencies]  = useState<Currency[]>([]);
  const [showMore,    setShowMore]    = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const [actionOnly,  setActionOnly]  = useState(false);
  const [page,        setPage]        = useState(1);

  // Fetch currencies once
  useEffect(() => {
    fetchCurrencies().then(setCurrencies).catch(console.error);
  }, []);

  // Fetch transactions whenever the active currency tab changes
  useEffect(() => {
    let cancelled = false;
    fetchTransactions(selectedCurrency)
      .then((data) => {
        if (!cancelled) {
          dispatch(setTransactions(data));
          setPage(1);
        }
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [selectedCurrency, dispatch]);

  // WebSocket — real-time updates from Laravel Reverb
  useEffect(() => {
    let alive = true;
    getEcho().then((echo) => {
      if (!echo || !alive) return;
      const ch = echo.channel(`transactions.${selectedCurrency}`);
      ch.listen(".transaction.released", (d: Transaction) => dispatch(addTransaction(d)));
      ch.listen(".transaction.updated",  (d: Transaction) => dispatch(patchTransactionStatus({ id: d.id, status: d.status })));
    });
    return () => {
      alive = false;
      getEcho().then((echo) => echo?.leaveChannel(`transactions.${selectedCurrency}`));
    };
  }, [selectedCurrency, dispatch]);

  const handleToggle = async (tx: Transaction) => {
    const next = tx.status === "Approved" ? "Pending" : "Approved";
    dispatch(patchTransactionStatus({ id: tx.id, status: next }));
    try {
      await updateTransactionStatus(tx.id, next);
    } catch {
      dispatch(patchTransactionStatus({ id: tx.id, status: tx.status }));
    }
  };

  const info = ACCOUNT_INFO[selectedCurrency] ?? ACCOUNT_INFO.USD;

  const filtered = transactions.filter((tx) => {
    if (actionOnly && tx.status !== "Pending") return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return tx.to_name.toLowerCase().includes(q) || tx.status.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`${CURRENCY_BG[selectedCurrency] ?? "bg-white"} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden transition-colors duration-300`}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-7 pt-6 pb-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{RECEIVER.name}</h2>
              <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                {RECEIVER.type}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{RECEIVER.email}</p>
          </div>
          <button
            onClick={() => dispatch(closeModal())}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Account / Currency tabs ── */}
        <div className="flex gap-3 px-7 pb-4 flex-wrap">
          {currencies.map((c) => {
            const acc    = ACCOUNT_INFO[c.code];
            const active = selectedCurrency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => { dispatch(setSelectedCurrency(c.code)); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition cursor-pointer ${
                  active
                    ? "border-yellow-400 bg-white shadow-sm"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-400"
                }`}
              >
                <span>{acc?.flag}</span>
                <span className={active ? "text-gray-800" : ""}>{acc?.account}</span>
                <span className={`ml-1 text-xs ${active ? "text-gray-500" : ""}`}>{c.code}</span>
              </button>
            );
          })}
        </div>

        {/* ── Receiver details grid ── */}
        <div className="px-7 pb-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-gray-400">🌐 Country/Countries</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{info.country}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">🏦 Bank name</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{info.bank}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">🏢 Branch name</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{info.branch}</p>
            </div>
            {showMore && (
              <div>
                <p className="text-xs text-gray-400">💱 Swift/BIC code</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{info.swift}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowMore(!showMore)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {showMore ? "Show Less ∧" : "Show More ∨"}
          </button>
        </div>

        {/* ── Scrollable transactions area ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Transactions header row */}
          <div className="flex items-center justify-between px-7 pt-4 pb-1">
            <h3 className="font-bold text-gray-800">
              Transactions With {RECEIVER.name.split(" ")[0]}
            </h3>
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) dispatch(setSearch("")); }}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition cursor-pointer"
              aria-label="Toggle search"
            >
              🔍
            </button>
          </div>

          {showSearch && (
            <div className="px-7 pb-2">
              <input
                autoFocus
                type="text"
                placeholder="Search by name or status…"
                value={search}
                onChange={(e) => { dispatch(setSearch(e.target.value)); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          )}

          {/* Only Action Needed toggle */}
          <div className="flex items-center justify-end gap-2 px-7 py-2">
            <span className="text-xs text-gray-500">Only Action Needed</span>
            <button
              role="switch"
              aria-checked={actionOnly}
              onClick={() => { setActionOnly(!actionOnly); setPage(1); }}
              className={`relative inline-flex w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                actionOnly ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                actionOnly ? "translate-x-4" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          {/* Table */}
          <div className="px-7 pb-2 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400">
                  <th className="pb-2 font-medium text-left w-8">#</th>
                  <th className="pb-2 font-medium text-left">Date & Time</th>
                  <th className="pb-2 font-medium text-left">Request ID</th>
                  <th className="pb-2 font-medium text-left">Type</th>
                  <th className="pb-2 font-medium text-left">To</th>
                  <th className="pb-2 font-medium text-left">Amount</th>
                  <th className="pb-2 font-medium text-left">Status</th>
                  <th className="pb-2 font-medium text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-8">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  paged.map((tx, i) => (
                    <tr
                      key={tx.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50/60 ${
                        tx.status === "Pending" ? "bg-orange-50/30" : ""
                      }`}
                    >
                      <td className="py-3 text-gray-400 text-xs">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="py-3">
                        <span className="text-blue-500 underline cursor-pointer text-xs">
                          {fakeRequestId(tx.id)}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-600 leading-snug">
                        Send Money<br />
                        <span className="text-gray-400">International</span>
                      </td>
                      <td className="py-3 text-xs font-medium text-gray-800">{tx.to_name}</td>
                      <td className="py-3 text-xs whitespace-nowrap">
                        <span className="text-gray-400 mr-0.5">{tx.currency}</span>
                        <span className="font-semibold text-gray-800">
                          {Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggle(tx)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            STATUS_STYLE[tx.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tx.status === "Approved" ? "Success" : tx.status}
                        </button>
                      </td>
                      <td className="py-3">
                        {tx.status === "Pending" ? (
                          <span className="text-xs text-teal-600 cursor-pointer hover:underline leading-snug">
                            Track Your Payment<br />(Amendment)
                          </span>
                        ) : (
                          <button
                            onClick={() => downloadTransactionReport(tx, info)}
                            className="text-xs text-teal-600 hover:underline cursor-pointer"
                          >
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
              >
                ‹
              </button>
              {getPages(page, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span key={`e-${idx}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition cursor-pointer ${
                      p === page ? "bg-gray-800 text-white font-medium" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
              >
                ›
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
