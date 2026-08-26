import fs from "node:fs";
import path from "node:path";

function createTemporaryPath(filePath: string) {
  const token = `${process.pid}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  return path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${token}.tmp`
  );
}

export function writeFileAtomicSync(
  filePath: string,
  data: string | Uint8Array,
  encoding: BufferEncoding = "utf8"
) {
  const temporaryPath = createTemporaryPath(filePath);
  let descriptor: number | undefined;

  try {
    descriptor = fs.openSync(temporaryPath, "w");

    if (typeof data === "string") {
      fs.writeFileSync(descriptor, data, { encoding });
    } else {
      fs.writeFileSync(descriptor, data);
    }

    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
    }

    try {
      fs.unlinkSync(temporaryPath);
    } catch {
      // The temporary file may already have been renamed or removed.
    }

    throw error;
  }
}

export async function writeFileAtomic(
  filePath: string,
  data: string | Uint8Array,
  encoding: BufferEncoding = "utf8"
) {
  const temporaryPath = createTemporaryPath(filePath);
  let handle: fs.promises.FileHandle | undefined;

  try {
    handle = await fs.promises.open(temporaryPath, "w");

    if (typeof data === "string") {
      await handle.writeFile(data, { encoding });
    } else {
      await handle.writeFile(data);
    }

    await handle.sync();
    await handle.close();
    handle = undefined;
    await fs.promises.rename(temporaryPath, filePath);
  } catch (error) {
    if (handle) {
      await handle.close().catch(() => undefined);
    }

    await fs.promises.rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
}
