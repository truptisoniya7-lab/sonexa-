import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import { verifyGoogleToken, findUserByEmail, createGoogleUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  await initDB();
  const { credential } = await request.json();
  if (!credential) {
    return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
  }
  try {
    const payload = await verifyGoogleToken(credential);
    const { email, name, sub: googleId, picture: profilePicture } = payload!;
    let user = await findUserByEmail(email!);
    if (!user) {
      user = await createGoogleUser(email!, name!, googleId!, profilePicture!);
    }
    const token = generateToken(user);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, profile_picture: user.profile_picture, provider: user.provider } });
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
  }
}
