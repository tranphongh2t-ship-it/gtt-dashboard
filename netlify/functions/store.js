const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const store = getStore("gtt-marketing");
  const key = event.queryStringParameters?.key || "data";

  if (event.httpMethod === "GET") {
    try {
      const val = await store.get(key);
      return { statusCode: 200, headers, body: val || "{}" };
    } catch {
      return { statusCode: 200, headers, body: "{}" };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
      await store.set(body.key || key, JSON.stringify(body.value));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
