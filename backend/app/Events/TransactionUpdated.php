<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when an existing transaction's status is toggled (Approved ↔ Pending).
 * Broadcasts immediately (ShouldBroadcastNow) so there is no queue delay.
 */
class TransactionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Transaction $transaction) {}

    /**
     * Broadcast on a public channel specific to the currency.
     * e.g. "transactions.USD", "transactions.EUR"
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("transactions.{$this->transaction->currency}"),
        ];
    }

    /** Custom event name — frontend listens with '.transaction.updated' */
    public function broadcastAs(): string
    {
        return 'transaction.updated';
    }

    /** Only send the fields the frontend needs */
    public function broadcastWith(): array
    {
        return $this->transaction->toArray();
    }
}
