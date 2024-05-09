const fs = require("fs").promises;

const main = async () => {
  const repoOwner = process.argv[2];
  const data = await fs.readFile("package.json", "utf8");
  const obj = JSON.parse(data);
  obj["homepage"] = `https://${repoOwner}.github.io/authsentry`;
  const json = JSON.stringify(obj);
  await fs.writeFile("package.json", json, "utf8");
};

main();
