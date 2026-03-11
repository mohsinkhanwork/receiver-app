"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal } from "@/store/receiverSlice";
import ReceiverModal from "@/components/ReceiverModal";

export default function Home() {
  const dispatch = useAppDispatch();
  const isOpen   = useAppSelector((s) => s.receiver.isOpen);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={() => dispatch(openModal())}
        className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
      >
        View Receiver
      </button>

      {isOpen && <ReceiverModal />}
    </div>
  );
}
