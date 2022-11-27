const express = require("express");
const app = express();
const setPayed = require("./Utils/setPayed");
const { spawnSync } = require("child_process");
const PORT = 3000;

module.exports = (ctx) => {
  app.post("/exchange", express.json({ type: "*/*" }), async (req, res) => {
    const { bill } = req.body;

    if (!bill?.billId) return;

    await res.sendStatus(200);

    if (bill?.status?.value === "PAID") return setPayed(bill.billId, ctx);
  });

  const server = app.listen(PORT, () =>
    console.log(`Listening to port ${PORT}...`)
  );

  server.on("error", (err) => {
    console.log("err");

    const child = spawnSync("sudo", ["killall", "-9", "node"]);
    if (child.error) console.log(child.error);
  });
};
