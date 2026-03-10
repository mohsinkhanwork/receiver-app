<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'currency',
        'to_name',
        'amount',
        'status',
        'queued',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'queued' => 'boolean',
        ];
    }
}
