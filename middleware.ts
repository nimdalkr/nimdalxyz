import { NextResponse, type NextRequest } from "next/server";

const BLOG_HOST = "blog.nimdal.xyz";
const MAIN_HOSTS = new Set(["nimdal.xyz", "www.nimdal.xyz"]);

const BLOG_ROOT_FILES = new Set(["/rss.xml", "/sitemap.xml", "/robots.txt"]);

function cleanHost(host: string | null) {
  return (host ?? "").split(":")[0].toLowerCase();
}

function cleanBlogPath(pathname: string) {
  if (pathname === "/blog") {
    return "/";
  }

  if (pathname.startsWith("/blog/")) {
    return pathname.slice("/blog".length);
  }

  return pathname;
}

function isBlogPath(pathname: string) {
  return (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/posts/") ||
    pathname.startsWith("/tags/") ||
    BLOG_ROOT_FILES.has(pathname)
  );
}

function isMainDomainBlogPath(pathname: string) {
  return (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/posts/") ||
    pathname.startsWith("/tags/") ||
    pathname === "/rss.xml"
  );
}

export function middleware(request: NextRequest) {
  const host = cleanHost(request.headers.get("host"));
  const { pathname } = request.nextUrl;

  if (pathname === "/" && request.nextUrl.searchParams.has("project")) {
    const project = request.nextUrl.searchParams.get("project") ?? "";
    const requestedRoom = request.nextUrl.searchParams.get("room") ?? "signal";
    const room = ["signal", "build", "proof", "next"].includes(requestedRoom)
      ? requestedRoom
      : "signal";

    if (/^[a-z0-9-]+$/.test(project)) {
      const url = request.nextUrl.clone();
      url.pathname = `/projects/${project}/${room}`;
      url.search = "";
      return NextResponse.redirect(url, 308);
    }
  }

  if (host === BLOG_HOST) {
    if (pathname === "/blog" || pathname.startsWith("/blog/")) {
      const url = request.nextUrl.clone();
      url.pathname = cleanBlogPath(pathname);
      return NextResponse.redirect(url, 308);
    }

    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/blog";
      return NextResponse.rewrite(url);
    }

    if (isBlogPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = `/blog${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (MAIN_HOSTS.has(host) && isMainDomainBlogPath(pathname)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = BLOG_HOST;
    url.pathname = cleanBlogPath(pathname);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico).*)"]
};
