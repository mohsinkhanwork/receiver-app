<?php

namespace Database\Seeders;

use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            // USD transactions (some visible, some queued)
            ['currency' => 'USD', 'to_name' => 'Alice Johnson',   'amount' => 1500.00, 'status' => 'Approved', 'queued' => false],
            ['currency' => 'USD', 'to_name' => 'Bob Williams',    'amount' => 2300.50, 'status' => 'Pending',  'queued' => false],
            ['currency' => 'USD', 'to_name' => 'Charlie Brown',   'amount' => 890.00,  'status' => 'Approved', 'queued' => false],
            ['currency' => 'USD', 'to_name' => 'Diana Prince',    'amount' => 4200.75, 'status' => 'Pending',  'queued' => false],
            ['currency' => 'USD', 'to_name' => 'Edward Norton',   'amount' => 670.00,  'status' => 'Approved', 'queued' => true],
            ['currency' => 'USD', 'to_name' => 'Fiona Apple',     'amount' => 3100.00, 'status' => 'Pending',  'queued' => true],

            // EUR transactions
            ['currency' => 'EUR', 'to_name' => 'Hans Mueller',    'amount' => 1200.00, 'status' => 'Approved', 'queued' => false],
            ['currency' => 'EUR', 'to_name' => 'Sophie Dubois',   'amount' => 3400.25, 'status' => 'Pending',  'queued' => false],
            ['currency' => 'EUR', 'to_name' => 'Marco Rossi',     'amount' => 780.50,  'status' => 'Approved', 'queued' => false],
            ['currency' => 'EUR', 'to_name' => 'Elena Petrova',   'amount' => 5600.00, 'status' => 'Pending',  'queued' => true],

            // GBP transactions
            ['currency' => 'GBP', 'to_name' => 'James Smith',     'amount' => 2100.00, 'status' => 'Approved', 'queued' => false],
            ['currency' => 'GBP', 'to_name' => 'Emma Watson',     'amount' => 950.75,  'status' => 'Pending',  'queued' => false],
            ['currency' => 'GBP', 'to_name' => 'Oliver Twist',    'amount' => 4800.00, 'status' => 'Approved', 'queued' => false],
            ['currency' => 'GBP', 'to_name' => 'Charlotte Bronte','amount' => 1350.00, 'status' => 'Pending',  'queued' => true],
        ];

        foreach ($data as $row) {
            Transaction::create($row);
        }
    }
}
