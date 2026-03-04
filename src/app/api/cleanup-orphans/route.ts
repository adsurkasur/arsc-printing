import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Check if Supabase is properly configured
function isSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

// POST or GET /api/cleanup-orphans
export async function POST(request: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ message: 'Demo mode: skipped cleanup' });
    }

    // Optional: check for cron authorization header if running via Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // We allow this to run via manual trigger or cron secret. 
        // If you want strict enforcement, return 401 here.
    }

    try {
        const supabase = await createClient();

        // 1. Get all active order file paths
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('file_path, payment_proof_path');

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        const activePaths = new Set(
            orders.flatMap((o) => [o.file_path, o.payment_proof_path]).filter(Boolean)
        );

        // 2. List all files in 'documents' bucket
        const { data: files, error: listError } = await supabase.storage
            .from('documents')
            .list('', { limit: 1000 }); // Can add pagination if bucket gets too large

        if (listError) {
            console.error('Error listing files:', listError);
            return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
        }

        // 3. Find files older than 30 minutes that aren't attached to any order
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const filesToDelete = files
            .filter((file) => {
                if (file.name.startsWith('.')) return false; // Ignore .emptyFolderPlaceholder etc
                if (!file.created_at) return false;

                const fileCreatedAt = new Date(file.created_at);
                const isOldEnough = fileCreatedAt < thirtyMinsAgo;
                const isNotLinked = !activePaths.has(file.name);

                return isOldEnough && isNotLinked;
            })
            .map((file) => file.name);

        // 4. Delete the files
        if (filesToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
                .from('documents')
                .remove(filesToDelete);

            if (deleteError) {
                console.error('Error deleting files:', deleteError);
                return NextResponse.json({ error: 'Failed to delete files' }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Deleted ${filesToDelete.length} orphaned files.`,
            deletedCount: filesToDelete.length,
            deletedFiles: filesToDelete,
        });
    } catch (error) {
        console.error('Cleanup orphans error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Allow GET for easy cron-job integration if needed
export async function GET(request: NextRequest) {
    return POST(request);
}
