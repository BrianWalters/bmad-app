import { defineMiddleware } from "astro:middleware";
import { sessionManager } from "@/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (!isAdminRoute) {
    const response = await next();
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    return response;
  }

  if (isLoginRoute) {
    const cookieValue = context.cookies.get("session_id")?.value;
    if (cookieValue) {
      const sessionData = sessionManager.validateSession(cookieValue);
      if (sessionData) {
        context.locals.session = sessionData;
      }
    }
    const response = await next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const cookieValue = context.cookies.get("session_id")?.value;
  if (!cookieValue) {
    return context.redirect("/admin/login");
  }

  const sessionData = sessionManager.validateSession(cookieValue);
  if (!sessionData) {
    context.cookies.delete("session_id", { path: "/" });
    return context.redirect("/admin/login");
  }

  context.locals.session = sessionData;
  const response = await next();
  response.headers.set("Cache-Control", "no-store");
  return response;
});
