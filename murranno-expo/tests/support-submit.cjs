const fs = require("node:fs");
const assert = require("node:assert/strict");
const path = require("node:path");
const ts = require("typescript");
(async () => {
  const file = path.join(__dirname, "../pages/ContactSupport.tsx");
  const source = fs.readFileSync(file, "utf8");
  const tree = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let handler;
  function visit(n) {
    if (ts.isVariableDeclaration(n) && n.name.getText(tree) === "handleSubmit")
      handler = n.initializer.getText(tree);
    ts.forEachChild(n, visit);
  }
  visit(tree);
  assert.ok(handler);
  const js = ts.transpile(
    "const handler = " + handler + "; return handler();",
    { target: ts.ScriptTarget.ES2022 },
  );
  const form = {
    name: "Test User",
    email: "test@example.test",
    category: "Technical Bug",
    subject: "Test request",
    message: "Synthetic request only.",
  };
  for (const failure of [true, false]) {
    const notices = [];
    let cleared = false;
    let busy;
    const supabase = {
      auth: { getUser: async () => ({ data: { user: { id: "test-user" } } }) },
      from: () => ({
        insert: async () => ({
          error: failure ? new Error("Simulated database outage") : null,
        }),
      }),
    };
    await new Function(
      "supabase",
      "notify",
      "form",
      "setSubmitting",
      "setForm",
      js,
    )(
      supabase,
      (...args) => notices.push(args),
      form,
      (v) => {
        busy = v;
      },
      () => {
        cleared = true;
      },
    );
    assert.equal(cleared, !failure);
    assert.equal(
      notices.some((a) => a[0] === "Request submitted"),
      !failure,
    );
    assert.equal(busy, false);
    assert.equal(
      notices.some((a) => a[0] === "Request not sent"),
      failure,
    );
  }
  console.log(
    "PASS support saves and clears on success; failed submission preserves form, shows failure, and releases loading state. No remote writes.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
