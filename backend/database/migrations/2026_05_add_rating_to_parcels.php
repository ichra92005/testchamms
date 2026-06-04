<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->tinyInteger('rating')->nullable()->after('failure_reason');
            $table->text('rating_comment')->nullable()->after('rating');
            $table->timestamp('confirmed_at')->nullable()->after('rating_comment');
        });
    }

    public function down(): void
    {
        Schema::table('parcels', function (Blueprint $table) {
            $table->dropColumn(['rating', 'rating_comment', 'confirmed_at']);
        });
    }
};
