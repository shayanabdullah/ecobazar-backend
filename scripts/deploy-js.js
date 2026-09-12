import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const jsBranchFolder = path.resolve(
  process.cwd(),
  "../Ecobazar-backend-javascript"
);

console.log("Building TypeScript...");

execSync("npm run build", {
  stdio: "inherit",
});

console.log("Build completed.");

console.log("Copying compiled JavaScript...");

const sourceDist = path.resolve("dist");

const targetDist = path.join(
  jsBranchFolder,
  "Ecobazar_Backend_JS"
);

if (fs.existsSync(targetDist)) {
  fs.rmSync(targetDist, {
    recursive: true,
    force: true,
  });
}

fs.cpSync(sourceDist, targetDist, {
  recursive: true,
});

console.log("JavaScript files copied.");
console.log("Committing JS branch...");

execSync("git add -A", {
  cwd: jsBranchFolder,
  stdio: "inherit",
});

const hasChanges = execSync("git status --porcelain", {
  cwd: jsBranchFolder,
}).toString().trim();

if (hasChanges) {
  console.log("Changes detected. Creating commit...");

  execSync(
    'git commit -m "build: update compiled JavaScript"',
    {
      cwd: jsBranchFolder,
      stdio: "inherit",
    }
  );

  console.log("Pushing JS branch...");

  execSync(
    "git push origin Ecobazar-backend_javascript",
    {
      cwd: jsBranchFolder,
      stdio: "inherit",
    }
  );

  console.log("JS branch updated successfully.");
} else {
  console.log("No changes detected. JS branch is already up to date.");
}

console.log("Pushing JS branch...");

execSync(
  "git push origin Ecobazar-backend_javascript",
  {
    cwd: jsBranchFolder,
    stdio: "inherit",
  }
);

console.log("Done! JS branch updated.");