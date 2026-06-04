<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code')->unique();
            $table->string('receiver_name');
            $table->string('receiver_phone');
            $table->string('destination');
            $table->string('pickup_location')->nullable();
            $table->text('description')->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('status')->default('pending');
            $table->string('payment_method')->default('cash');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('delivery_man_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parcels');
    }
};