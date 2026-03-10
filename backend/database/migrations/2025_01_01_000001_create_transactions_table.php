<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('currency', 3); // USD, EUR, GBP
            $table->string('to_name');
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['Approved', 'Pending'])->default('Pending');
            $table->boolean('queued')->default(false);
            $table->timestamps();

            $table->index('currency');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
