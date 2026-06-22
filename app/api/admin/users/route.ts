import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const snap = await getDocs(collection(db, 'users'))
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { uid, ...updates } = await request.json()
    if (!uid) return NextResponse.json({ error: 'UID obrigatório' }, { status: 400 })

    await updateDoc(doc(db, 'users', uid), updates)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
