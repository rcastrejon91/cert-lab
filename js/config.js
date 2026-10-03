/* Site configuration (safe to commit — contains NO secrets).
   After deploying the Worker (see DEPLOY.md), set proxyUrl to its URL + "/v1", e.g.
   "https://certlab-ai-proxy.<your-subdomain>.workers.dev/v1". While it is empty or still
   contains "YOUR-", the built-in AI is treated as "not deployed" and the rest of the site works normally. */
window.CERTLAB_CONFIG = {
  proxyUrl: "https://certlab-ai-proxy.YOUR-SUBDOMAIN.workers.dev/v1",
  defaultTutor: "lyra"
};
