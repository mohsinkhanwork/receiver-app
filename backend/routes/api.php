<?php

use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/currencies', [TransactionController::class, 'currencies']);
Route::get('/transactions', [TransactionController::class, 'index']);
Route::patch('/transactions/{id}/status', [TransactionController::class, 'updateStatus']);
Route::get('/download', [TransactionController::class, 'download']);
