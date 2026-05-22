const https = require("https");

function httpsReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const siteId = process.env.NETLIFY_SITE_ID;
  const token  = process.env.NETLIFY_TOKEN;
  if (!siteId || !token) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };

  const key = (event.queryStringParameters && event.queryStringParameters.key) || "data";

  if (event.httpMethod === "GET") {
    try {
      const res = await httpsReq({
        hostname: "api.netlify.com",
        path: `/api/v1/blobs/${siteId}/gtt-marketing/${encodeURIComponent(key)}`,
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.status === 404 || !res.body) return { statusCode: 200, headers, body: "{}" };
      return { statusCode: 200, headers, body: res.body };
    } catch(e) {
      return { statusCode: 200, headers, body: "{}" };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const parsed = JSON.parse(event.body);
      const k = parsed.key || key;
      const v = JSON.stringify(parsed.value);
      await httpsReq({
        hostname: "api.netlify.com",
        path: `/api/v1/blobs/${siteId}/gtt-marketing/${encodeURIComponent(k)}`,
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
          "Content-Length": Buffer.byteLength(v),
        },
      }, v);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};