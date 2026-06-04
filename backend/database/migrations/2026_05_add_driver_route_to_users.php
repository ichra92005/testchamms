<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('driver_type')->nullable()->after('role'); // 'intra' | 'inter'
            $table->string('wilaya')->nullable()->after('driver_type');       // for intra drivers
            $table->string('route_from')->nullable()->after('wilaya');        // for inter drivers
            $table->string('route_to')->nullable()->after('route_from');      // for inter drivers
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['driver_type', 'wilaya', 'route_from', 'route_to']);
        });
    }
};
