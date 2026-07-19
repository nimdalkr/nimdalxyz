import { NextResponse, type NextRequest } from "next/server";

import {
  canonicalSurfaceHeader,
  defaultLocale,
  isLocale,
  isProjectSection,
  normalizeProjectSlug,
  projectCanonicalPath,
  type Locale,
  type ProjectSection
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const BLOG_HOST = new URL(siteConfig.blogUrl).hostname;
const MAIN_HOST = new URL(siteConfig.mainUrl).hostname;

const BLOG_ROOT_FILES = new Map([
  ["/robots.txt", "/blog/robots.txt"],
  ["/sitemap.xml", "/blog/sitemap.xml"]
]);

function requestHost(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? request.headers.get("host") ?? request.nextUrl.hostname;

  return host.trim().split(":")[0].toLowerCase();
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

function mainHostFor(request: NextRequest) {
  return requestHost(request) === BLOG_HOST ? MAIN_HOST : undefined;
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

function localizedLegacyProject(pathname: string): {
  locale: Locale;
  slug: string;
  section?: ProjectSection;
} | null {
  const segments = pathname.split("/").filter(Boolean);
  let locale: Locale = defaultLocale;

  if (isLocale(segments[0] ?? "")) {
    locale = segments.shift() as Locale;
  }

  if (segments[0] !== "projects" || !/^[a-z0-9-]+$/.test(segments[1] ?? "")) {
    return null;
  }

  if (segments.length === 2) {
    return { locale, slug: segments[1] };
  }

  if (segments.length === 3 && isProjectSection(segments[2] ?? "")) {
    return {
      locale,
      slug: segments[1],
      section: segments[2] as ProjectSection
    };
  }

  return null;
}

function queryProjectRedirect(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const normalizedPathname = pathname === "/" ? pathname : pathname.replace(/\/$/, "");
  const rootLocale = normalizedPathname === "/" ? defaultLocale : normalizedPathname.slice(1);

  if (!isLocale(rootLocale) || !searchParams.has("project")) {
    return null;
  }

  const project = searchParams.get("project") ?? "";
  if (!/^[a-z0-9-]+$/.test(project)) {
    return null;
  }

  const requestedSection = searchParams.get("room") ?? "signal";
  const section = isProjectSection(requestedSection) ? requestedSection : "signal";

  return redirect(request, projectCanonicalPath(rootLocale, project), {
    hash: section,
    host: mainHostFor(request)
  });
}

function legacyProjectRedirect(request: NextRequest) {
  const legacyProject = localizedLegacyProject(request.nextUrl.pathname);
  if (!legacyProject) {
    return null;
  }

  const { locale, slug, section } = legacyProject;
  const canonicalPath = projectCanonicalPath(locale, slug);
  const isCanonicalPath = request.nextUrl.pathname.replace(/\/$/, "") === canonicalPath;
  const isBlogHost = requestHost(request) === BLOG_HOST;

  if (isCanonicalPath && slug === normalizeProjectSlug(slug) && !section && !isBlogHost) {
    return null;
  }

  return redirect(request, canonicalPath, {
    hash: section,
    host: mainHostFor(request)
  });
}

function unlocalizedBlogPath(pathname: string) {
  const match = pathname.match(/^\/(posts|tags)(\/.*)?$/);

  if (match) {
    return `/${defaultLocale}/${match[1]}${match[2] ?? ""}`;
  }

  if (pathname === "/rss.xml") {
    return `/${defaultLocale}/rss.xml`;
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
    return `/${defaultLocale}`;
  }

  const match = pathname.match(/^\/blog\/(posts|tags)(\/.*)?$/);
  if (match) {
    return `/${defaultLocale}/${match[1]}${match[2] ?? ""}`;
  }

  if (pathname === "/blog/rss.xml") {
    return `/${defaultLocale}/rss.xml`;
  }

  return null;
}

function handleBlogHost(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
    return redirect(request, oldBlogPath, { preserveSearch: true });
  }

  if (pathname === "/") {
    return redirect(request, `/${defaultLocale}`, { preserveSearch: true });
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
    return redirect(request, `/${duplicateHubMatch[1]}`, { preserveSearch: true });
  }

  return NextResponse.next({
    request: { headers: blogSurfaceHeaders(request) }
  });
}

function handleMainHost(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
    return redirect(request, `/${defaultLocale}`, {
      host: BLOG_HOST,
      preserveSearch: true
    });
  }

  if (pathname === "/portfolio") {
    return redirect(request, `/${defaultLocale}/portfolio`, { preserveSearch: true });
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
  const projectFromQuery = queryProjectRedirect(request);
  if (projectFromQuery) {
    return projectFromQuery;
  }

  const projectFromPath = legacyProjectRedirect(request);
  if (projectFromPath) {
    return projectFromPath;
  }

  return requestHost(request) === BLOG_HOST
    ? handleBlogHost(request)
    : handleMainHost(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico|favicon.png|apple-touch-icon.png).*)"]
};
