<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->string('sender_name')->nullable()->after('tracking_code');
            $table->string('sender_phone')->nullable()->after('sender_name');
            $table->string('origin_wilaya')->nullable()->after('sender_phone');
            $table->string('destination_wilaya')->nullable()->after('origin_wilaya');
            $table->string('delivery_address')->nullable()->after('destination_wilaya');
            $table->string('delivery_type')->default('intra')->after('delivery_address');
            // delivery_type: 'intra' = same wilaya, 'inter' = different wilaya
        });
    }

    public function down(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->dropColumn([
                'sender_name', 'sender_phone', 'origin_wilaya',
                'destination_wilaya', 'delivery_address', 'delivery_type',
            ]);
        });
    }
};
