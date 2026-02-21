import { type NextRequest, NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/lib/http/api-responses';
import { searchAll, searchLetters, searchUsers } from '@/server/search/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q') ?? '';
  const type = searchParams.get('type'); // "all", "letters", "users"

  try {
    if (type === 'users') {
      const users = await searchUsers({ q });
      return NextResponse.json(users, { status: 200 });
    } else if (type === 'letters') {
      const letters = await searchLetters({ q });
      return NextResponse.json(letters, { status: 200 });
    }

    const combinedResults = await searchAll({ q });
    return NextResponse.json(combinedResults, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
