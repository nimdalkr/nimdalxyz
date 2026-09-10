import { NextResponse, type NextRequest } from "next/server";

import {
  blogDefaultLocale,
  canonicalSurfaceHeader,
  defaultLocale,
  isLocale
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const BLOG_HOST = new URL(siteConfig.blogUrl).hostname;
const EDITOR_PATH = /^\/(?:keystatic|api\/keystatic)(?:\/|$)/;
const WRITE_PATH = /^\/write(?:\/|$)/;
const AUTH_PATH = /^\/api\/auth(?:\/|$)/;

const BLOG_ROOT_FILES = new Map([
  ["/robots.txt", "/blog/robots.txt"],
  ["/sitemap.xml", "/blog/sitemap.xml"]
]);

function requestHost(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? request.headers.get("host") ?? request.nextUrl.hostname;

  return host.trim().split(":")[0].toLowerCase();
}

function isBlogHost(request: NextRequest) {
  const host = requestHost(request);

  return (
    host === BLOG_HOST ||
    (process.env.NODE_ENV !== "production" && host === "blog.localhost")
  );
}

function redirect(
  request: NextRequest,
  pathname: string,
  options: {
    hash?: string;
    host?: string;
    preserveSearch?: boolean;
  } = {}
) {
  const url = request.nextUrl.clone();

  url.pathname = pathname;
  url.hash = options.hash ?? "";

  if (!options.preserveSearch) {
    url.search = "";
  }

  if (options.host) {
    url.protocol = "https:";
    url.hostname = options.host;
    url.port = "";
  }

  return NextResponse.redirect(url, 308);
}

function blogSurfaceHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(canonicalSurfaceHeader, "blog");
  return headers;
}

function mainSurfaceHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete(canonicalSurfaceHeader);
  return headers;
}

function unlocalizedBlogPath(pathname: string) {
  const match = pathname.match(/^\/(posts|tags)(\/.*)?$/);

  if (match) {
    return `/${blogDefaultLocale}/${match[1]}${match[2] ?? ""}`;
  }

  if (pathname === "/rss.xml") {
    return `/${blogDefaultLocale}/rss.xml`;
  }

  return null;
}

function localizedBlogPath(pathname: string) {
  const match = pathname.match(/^\/(ko|en)\/(posts|tags)(\/.*)?$/);

  if (match) {
    return `/${match[1]}/${match[2]}${match[3] ?? ""}`;
  }

  const feedMatch = pathname.match(/^\/(ko|en)\/rss\.xml$/);
  return feedMatch ? `/${feedMatch[1]}/rss.xml` : null;
}

function prefixedLegacyBlogPath(pathname: string) {
  if (pathname === "/blog") {
    return `/${blogDefaultLocale}`;
  }

  const match = pathname.match(/^\/blog\/(posts|tags)(\/.*)?$/);
  if (match) {
    return `/${blogDefaultLocale}/${match[1]}${match[2] ?? ""}`;
  }

  if (pathname === "/blog/rss.xml") {
    return `/${blogDefaultLocale}/rss.xml`;
  }

  return null;
}

function handleBlogHost(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The custom editor and its Google callback share the BLOG origin. Detailed
  // authorization is re-checked in the page, actions, and route handlers.
  if (WRITE_PATH.test(pathname) || AUTH_PATH.test(pathname)) {
    return NextResponse.next({
      request: { headers: blogSurfaceHeaders(request) }
    });
  }

  // The retired Keystatic surface stays unavailable on the public BLOG host.
  if (EDITOR_PATH.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const isInternalBlogHub =
    request.headers.get(canonicalSurfaceHeader) === "blog" &&
    /^\/(ko|en)\/blog\/?$/.test(pathname);

  if (isInternalBlogHub) {
    return NextResponse.next({
      request: { headers: blogSurfaceHeaders(request) }
    });
  }

  const internalRootFile = BLOG_ROOT_FILES.get(pathname);

  if (internalRootFile) {
    const url = request.nextUrl.clone();
    url.pathname = internalRootFile;
    return NextResponse.rewrite(url, {
      request: { headers: blogSurfaceHeaders(request) }
    });
  }

  const oldBlogPath = unlocalizedBlogPath(pathname) ?? prefixedLegacyBlogPath(pathname);
  if (oldBlogPath) {
    return redirect(request, oldBlogPath, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (pathname === "/") {
    return redirect(request, `/${blogDefaultLocale}`, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  const rootMatch = pathname.match(/^\/(ko|en)\/?$/);
  if (rootMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/${rootMatch[1]}/blog`;
    return NextResponse.rewrite(url, {
      request: { headers: blogSurfaceHeaders(request) }
    });
  }

  const duplicateHubMatch = pathname.match(/^\/(ko|en)\/blog\/?$/);
  if (duplicateHubMatch) {
    return redirect(request, `/${duplicateHubMatch[1]}`, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  return NextResponse.next({
    request: { headers: blogSurfaceHeaders(request) }
  });
}

function handleMainHost(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep local Google OAuth on the exact localhost origin registered with
  // Google while production uses the BLOG subdomain as its sole auth origin.
  if (
    process.env.NODE_ENV !== "production" &&
    (WRITE_PATH.test(pathname) || AUTH_PATH.test(pathname))
  ) {
    return NextResponse.next({
      request: { headers: blogSurfaceHeaders(request) }
    });
  }

  if (process.env.NODE_ENV === "production" && EDITOR_PATH.test(pathname)) {
    if (pathname.startsWith("/api/keystatic")) {
      return redirect(request, pathname, {
        host: BLOG_HOST,
        preserveSearch: true
      });
    }

    return redirect(request, "/write", {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (AUTH_PATH.test(pathname)) {
    return redirect(request, pathname, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (WRITE_PATH.test(pathname)) {
    return redirect(request, pathname, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (pathname === "/admin" || pathname === "/admin/blog") {
    return redirect(request, "/keystatic", { preserveSearch: true });
  }

  const oldBlogPath = unlocalizedBlogPath(pathname);

  if (oldBlogPath) {
    return redirect(request, oldBlogPath, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  const canonicalBlogPath = localizedBlogPath(pathname);
  if (canonicalBlogPath) {
    return redirect(request, canonicalBlogPath, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  const localizedBlogHub = pathname.match(/^\/(ko|en)\/blog\/?$/);
  if (localizedBlogHub) {
    return redirect(request, `/${localizedBlogHub[1]}`, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (pathname === "/blog") {
    return redirect(request, `/${blogDefaultLocale}`, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  const legacyBlogPath = prefixedLegacyBlogPath(pathname);
  if (legacyBlogPath) {
    return redirect(request, legacyBlogPath, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (pathname === "/") {
    return redirect(request, `/${defaultLocale}`, { preserveSearch: true });
  }

  return NextResponse.next({
    request: { headers: mainSurfaceHeaders(request) }
  });
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

  const rootLocale = pathname === "/" ? defaultLocale : pathname.replace(/^\//, "").replace(/\/$/, "");
  if (isLocale(rootLocale) && request.nextUrl.searchParams.has("project")) {
    return redirect(request, `/${rootLocale}`);
  }

  return isBlogHost(request)
    ? handleBlogHost(request)
    : handleMainHost(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico|favicon.png|apple-touch-icon.png).*)"]
};
