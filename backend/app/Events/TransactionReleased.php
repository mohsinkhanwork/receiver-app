<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a queued transaction is released and becomes visible.
 */
class TransactionReleased implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Transaction $transaction) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("transactions.{$this->transaction->currency}"),
        ];
    }

    /** Frontend listens with '.transaction.released' */
    public function broadcastAs(): string
    {
        return 'transaction.released';
    }

    public function broadcastWith(): array
    {
        return $this->transaction->toArray();
    }
}
