import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: implement processRecurringRules() in lib/db/queries/recurring.ts
  // const result = await processRecurringRules()

  return NextResponse.json({ processed: 0 })
}
