import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

// The BLOG was retired, but its domain still points at this deployment.
const RETIRED_BLOG_HOST = "blog.nimdal.xyz";

function requestHost(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? request.headers.get("host") ?? request.nextUrl.hostname;

  return host.trim().split(":")[0].toLowerCase();
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();

  url.pathname = pathname;
  url.hash = "";
  url.search = "";

  return NextResponse.redirect(url, 308);
}

export function proxy(request: NextRequest) {
  // Retired standalone pages are unavailable on every deployment hostname.
  let pathname: string;
  try {
    pathname = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  if (/^\/(?:ko\/|en\/)?(?:about|portfolio|protfolio|lab|projects)(?:\/|\.|$)/i.test(pathname)) {
    return new NextResponse("Not found", {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store"
      }
    });
  }

  // Old BLOG links land on the profile home, in the language they asked for.
  if (requestHost(request) === RETIRED_BLOG_HOST) {
    const locale = /^\/en(?:\/|$)/.test(pathname) ? "en" : "ko";
    return NextResponse.redirect(new URL(`/${locale}`, siteConfig.mainUrl), 308);
  }

  const rootLocale = pathname === "/" ? defaultLocale : pathname.replace(/^\//, "").replace(/\/$/, "");
  if (isLocale(rootLocale) && request.nextUrl.searchParams.has("project")) {
    return redirect(request, `/${rootLocale}`);
  }

  if (pathname === "/") {
    return redirect(request, `/${defaultLocale}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico|favicon.png|apple-touch-icon.png).*)"]
};
