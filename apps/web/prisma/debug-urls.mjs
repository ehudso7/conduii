function safeParse(name) {
  const raw = process.env[name];
  if (!raw) {
    console.log(`${name}: MISSING`);
    return;
  }

  try {
    const u = new URL(raw);
    console.log(`${name}: OK`);
    console.log({
      protocol: u.protocol,
      username: u.username || "(empty)",
      hasPassword: Boolean(u.password && u.password.length > 0),
      host: u.host,
      pathname: u.pathname,
      search: u.search,
    });
  } catch (e) {
    console.log(`${name}: INVALID_URL`);
    console.log(String(e));
  }
}

safeParse("POSTGRES_PRISMA_URL");
safeParse("DIRECT_URL");
