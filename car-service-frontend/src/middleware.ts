import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Намагаємося дістати токен з кук (серверна перевірка)
  const token = request.cookies.get("car_service_token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Визначаємо роути авторизації (куди можна заходити БЕЗ токена)
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  // 3. СЦЕНАРІЙ А: Користувач НЕ залогінений і намагається зайти на головну "/" або інші закриті сторінки
  if (!token && !isAuthPage) {
    // Сервер миттєво розвертає його на сторінку входу
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. СЦЕНАРІЙ Б: Користувач ВЖЕ залогінений, але знову відкриває сторінку логіну чи реєстрації
  if (token && isAuthPage) {
    // Не пускаємо його туди і повертаємо назад на головну "/"
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Якщо все добре (токен є, або користувач йде на /login будучи неавторизованим) — пускаємо далі
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};