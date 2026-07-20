import { makeRouteHandler } from "@keystatic/next/route-handler";

import keystaticConfig from "@/keystatic.config";
import { isKeystaticAdminEnabled } from "@/lib/keystatic";

const notFound = () => new Response(null, { status: 404 });

export const { GET, POST } = isKeystaticAdminEnabled
  ? makeRouteHandler({ config: keystaticConfig })
  : { GET: notFound, POST: notFound };
