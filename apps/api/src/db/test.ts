import { db } from './index';
import { sql } from 'drizzle-orm';

async function test() {
    try {
        const result = await db.execute(sql`SELECT 1`);
        console.log("DB test successful:", result);
        process.exit(0);
    } catch (e) {
        console.error("DB test failed:", e);
        process.exit(1);
    }
}
test();
