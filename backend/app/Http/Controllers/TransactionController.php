<?php

namespace App\Http\Controllers;

use App\Events\TransactionReleased;
use App\Events\TransactionUpdated;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TransactionController extends Controller
{
    /**
     * Return available currencies.
     */
    public function currencies(): JsonResponse
    {
        $currencies = Cache::remember('currencies', 3600, function () {
            return [
                ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$'],
                ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€'],
                ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£'],
            ];
        });

        return response()->json($currencies);
    }

    /**
     * List transactions filtered by currency.
     * Also releases queued transactions to simulate real-time queue processing.
     */
    public function index(Request $request): JsonResponse
    {
        $currency = $request->query('currency', 'USD');

        $queued = Transaction::where('currency', $currency)
            ->where('queued', true)
            ->inRandomOrder()
            ->first();

        if ($queued) {
            $queued->update(['queued' => false]);
            $queued->refresh();
            // Broadcast new transaction to all clients on this currency channel
            TransactionReleased::dispatch($queued);
        }

        $transactions = Transaction::where('currency', $currency)
            ->where('queued', false)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($transactions);
    }

    /**
     * Toggle transaction status between Approved and Pending.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Approved,Pending',
        ]);

        $transaction->update(['status' => $validated['status']]);
        $transaction->refresh();

        TransactionUpdated::dispatch($transaction);

        return response()->json($transaction);
    }

    /**
     * Download a sample document file.
     */
    public function download()
    {
        $path = storage_path('app/sample.txt');

        if (!file_exists($path)) {
            file_put_contents($path, "Sample Receivers Transaction Report\n\nThis is a sample download file.\nGenerated for demonstration purposes.\n");
        }

        return response()->download($path, 'transaction-report.txt');
    }
}
