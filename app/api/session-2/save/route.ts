import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type ParticipantRow = Record<string, string | number>;
type LongRow = Record<string, string | number>;
type SealReadingRow = Record<string, string | number>;

type ResultsStore = {
  participantRows: ParticipantRow[];
  longRows: LongRow[];
  sealReadingRows: SealReadingRow[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const participantRow: ParticipantRow = body.participantRow;
    const longRows: LongRow[] = body.longRows;
    const sealReadingRows: SealReadingRow[] = body.sealReadingRows;

    if (!participantRow) {
      return NextResponse.json(
        { error: "No participant row received." },
        { status: 400 }
      );
    }

    if (!longRows || !Array.isArray(longRows) || longRows.length === 0) {
      return NextResponse.json(
        { error: "No long-format rows received." },
        { status: 400 }
      );
    }

    if (!sealReadingRows || !Array.isArray(sealReadingRows)) {
      return NextResponse.json(
        { error: "No seal-reading rows received." },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), "data");
    const jsonPath = path.join(dataDir, "session-2-results.json");
    const excelPath = path.join(dataDir, "session-2-results.xlsx");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let store: ResultsStore = {
      participantRows: [],
      longRows: [],
      sealReadingRows: [],
    };

    if (fs.existsSync(jsonPath)) {
      const rawJson = fs.readFileSync(jsonPath, "utf8");

      if (rawJson.trim()) {
        store = JSON.parse(rawJson);
      }
    }

    store.participantRows.push(participantRow);
    store.longRows.push(...longRows);
    store.sealReadingRows.push(...sealReadingRows);

    fs.writeFileSync(jsonPath, JSON.stringify(store, null, 2), "utf8");

    const workbook = XLSX.utils.book_new();

    const participantWorksheet = XLSX.utils.json_to_sheet(store.participantRows);
    const longWorksheet = XLSX.utils.json_to_sheet(store.longRows);
    const sealReadingWorksheet = XLSX.utils.json_to_sheet(store.sealReadingRows);

    XLSX.utils.book_append_sheet(
      workbook,
      participantWorksheet,
      "Participant Data"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      longWorksheet,
      "Long Format"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      sealReadingWorksheet,
      "Seal Readings"
    );

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    fs.writeFileSync(excelPath, excelBuffer);

    return NextResponse.json({
      success: true,
      message: "Session 2 participant saved.",
      participantRows: store.participantRows.length,
      longRows: store.longRows.length,
      sealReadingRows: store.sealReadingRows.length,
      excelPath: "data/session-2-results.xlsx",
      jsonPath: "data/session-2-results.json",
    });
  } catch (error) {
    console.error("Failed to save Session 2 data:", error);

    return NextResponse.json(
      {
        error: "Failed to save Session 2 data.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
