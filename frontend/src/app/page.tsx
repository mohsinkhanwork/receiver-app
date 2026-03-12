"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal } from "@/store/receiverSlice";
import ReceiverModal from "@/components/ReceiverModal";

// ── Static dashboard transactions ────────────────────────────────────────────
const TRANSACTIONS = [
  { id: 1, date: "Apr 19 2025 | 14:30", requestId: "6A5S1DSA", type: "Send Money", subtype: "International", to: "John Doe",      amount: "AED 12,000.00",         status: "success"      },
  { id: 2, date: "Apr 19 2025 | 14:30", requestId: "6A5S1DSA", type: "Send Money", subtype: "Domestic",      to: "Sarah Johnson", amount: "AED 50,000.00",         status: "failed"       },
  { id: 3, date: "Apr 19 2025 | 14:30", requestId: "6A5S1DSA", type: "Send Money", subtype: "Swift",         to: "Sarah Johnson", amount: "USDT 50,000.00",        status: "failed"       },
  { id: 4, date: "Jun 12 2025 | 20:15", requestId: "6A5S1DSA", type: "Add money",  subtype: "",              to: "↓ You",         amount: "AED 50,000,000.00",     status: "success"      },
  { id: 5, date: "Jun 12 2025 | 20:15", requestId: "6A5S1DSA", type: "Add money",  subtype: "",              to: "↓ You",         amount: "AED 50,000,000.00",     status: "needs action" },
];

const BALANCES = [
  { flag: "🇺🇸", code: "USD", amount: "$14,000" },
  { flag: "🇮🇳", code: "INR", amount: "₹1,191,680" },
  { flag: "🇨🇦", code: "CAD", amount: "$2,878.48" },
];

const STATUS_STYLE: Record<string, string> = {
  success:        "bg-green-100 text-green-700",
  failed:         "bg-red-100 text-red-500",
  "needs action": "bg-blue-50 text-blue-500 border border-blue-200",
};

const NAV = ["Dashboard", "Conversion", "Wallet", "Beneficiaries", "Reports", "Team"];
const NAV_ICONS: Record<string, string> = {
  Dashboard: "▦", Conversion: "⇄", Wallet: "🏛", Beneficiaries: "👥", Reports: "📄", Team: "👤",
};

type TxFilter = "All" | "Add money" | "Send Money" | "Conversion";

export default function Home() {
  const dispatch = useAppDispatch();
  const isOpen   = useAppSelector((s) => s.receiver.isOpen);
  const [filter, setFilter]       = useState<TxFilter>("All");
  const [showMoreBal, setShowMoreBal] = useState(false);

  const filtered = TRANSACTIONS.filter((tx) => {
    if (filter === "All") return true;
    return tx.type === filter;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="text-lg font-black text-gray-900">✦ RemitLand</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <button
              key={item}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-default text-left ${
                item === "Dashboard"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="text-base w-5 text-center">{NAV_ICONS[item]}</span>
              {item}
            </button>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl cursor-default">
            Add Money
          </button>
          <button className="w-full py-2.5 bg-yellow-400 text-gray-900 text-sm font-semibold rounded-xl cursor-default">
            Send Money
          </button>
        </div>

        {/* Bottom nav items */}
        <div className="flex flex-col gap-1 mt-4">
          {["Notifications", "Settings"].map((item) => (
            <button key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 cursor-default text-left">
              <span className="text-base w-5 text-center">{item === "Notifications" ? "🔔" : "⚙"}</span>
              {item}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 mt-4 px-2 pt-4 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">KN</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Kasra Nourani</p>
            <p className="text-xs text-gray-400 truncate">kasra@email.com</p>
          </div>
          <span className="text-gray-300">⋮</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Top row: Account Balance + Quick Conversion */}
        <div className="grid grid-cols-[1fr_280px] gap-5 mb-8">

          {/* Account Balance card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">Account<br />Balance</h2>
              <a href="#" className="text-sm text-blue-500 font-medium underline underline-offset-2">
                Add Money ↗
              </a>
            </div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-400">Overall (in USD)</span>
              <span className="text-2xl font-bold text-gray-900">$30,000</span>
            </div>
            <div className="flex flex-col gap-3">
              {BALANCES.slice(0, showMoreBal ? undefined : 3).map((b) => (
                <div key={b.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{b.flag}</span>
                    <span>{b.code}</span>
                  </div>
                  <span className="text-sm text-gray-500">{b.amount}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMoreBal(!showMoreBal)}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ↗ Show More
            </button>
          </div>

          {/* Quick Conversion card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
            <h3 className="text-base font-bold text-gray-900 mb-4">Quick Conversion</h3>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">Cash</span>
                <span className="flex-1 text-xs text-gray-400">To Pay</span>
                <span className="text-xs font-medium text-gray-700">■ USD ∨</span>
              </div>
              <div className="flex justify-center text-gray-300 text-sm">⇅</div>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">Cash</span>
                <span className="flex-1 text-xs text-gray-400">To Recieve</span>
                <span className="text-xs font-medium text-gray-700">■ EUR ∨</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-gray-500 mb-5">
              <div className="flex justify-between"><span>Rate</span><span className="text-gray-700">1 USD = 0.98 EUR</span></div>
              <div className="flex justify-between"><span>Fee</span><span className="text-gray-700">$0</span></div>
            </div>
            <button className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-default mt-auto">
              Proceed
            </button>
          </div>
        </div>

        {/* Transactions section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Transactions</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-default">
                Export as ∨
              </button>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 cursor-default">⇅</button>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 cursor-default">↗</button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5">
            {(["All", "Add money", "Send Money", "Conversion"] as TxFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border ${
                  filter === f
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f === "All" && <span className="font-bold">All</span>}
                {f === "Add money" && <span>🪙</span>}
                {f === "Send Money" && <span>✉</span>}
                {f === "Conversion" && <span>⇄</span>}
                {f !== "All" && f}
              </button>
            ))}
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Date &amp; Time</th>
                <th className="pb-3 font-medium">Request ID</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">To</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => dispatch(openModal())}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  title="Click to view receiver details"
                >
                  <td className="py-3.5 text-xs text-gray-500 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3.5">
                    <span className="text-xs text-blue-500">{tx.requestId}</span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-700 leading-snug">
                    {tx.type}
                    {tx.subtype && <><br /><span className="text-gray-400">{tx.subtype}</span></>}
                  </td>
                  <td className="py-3.5 text-xs font-medium text-gray-800">{tx.to}</td>
                  <td className="py-3.5 text-xs text-gray-700 whitespace-nowrap">{tx.amount}</td>
                  <td className="py-3.5">
                    {tx.status === "needs action" ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-500 border border-blue-200 w-fit">
                        🔵 needs action
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[tx.status]}`}>
                        {tx.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5">
                    {tx.status === "needs action" ? (
                      <button className="px-3 py-1 rounded-full text-xs font-medium border border-orange-300 text-orange-500 cursor-pointer">
                        Upload receipt ↑
                      </button>
                    ) : (
                      <span className="text-xs text-blue-500 gap-1">
                        View &nbsp;| &nbsp;
                        <span className="text-blue-500">Download File</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Receiver modal — triggered by clicking any transaction row ── */}
      {isOpen && <ReceiverModal />}
    </div>
  );
}

