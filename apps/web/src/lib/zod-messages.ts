import { z } from "zod";

/** Plain-English form errors instead of zod's defaults ("String must contain at least 1 character(s)"). */
z.setErrorMap((issue, ctx) => {
  if (issue.code === "too_small" && issue.type === "string") return { message: Number(issue.minimum) <= 1 ? "This field is required" : `Please enter at least ${issue.minimum} characters` };
  if (issue.code === "too_big" && issue.type === "string") return { message: `Please keep this under ${issue.maximum} characters` };
  if (issue.code === "invalid_string" && issue.validation === "email") return { message: "Please enter a valid email address" };
  if (issue.code === "invalid_type" && (issue.received === "undefined" || issue.received === "null")) return { message: "This field is required" };
  return { message: ctx.defaultError };
});
