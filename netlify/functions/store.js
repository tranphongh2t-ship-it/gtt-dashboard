exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode:200, headers, body:"" };
  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_TOKEN;
  if (!siteId || !token) return { statusCode:500, headers, body: JSON.stringify({error:"Missing env", siteId:!!siteId, token:!!token}) };
  return { statusCode:200, headers, body: JSON.stringify({ok:true, siteId, hasToken:!!token}) };
};