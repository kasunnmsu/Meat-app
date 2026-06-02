module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/app/api/session-3/top-seals/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const runtime = "nodejs";
const fallbackTopSeals = [
    "red-1",
    "red-2",
    "green-1"
];
function readLongRows(fileName) {
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "data", fileName);
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(filePath)) {
        return [];
    }
    try {
        const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, "utf8");
        if (!raw.trim()) {
            return [];
        }
        const store = JSON.parse(raw);
        return Array.isArray(store.longRows) ? store.longRows : [];
    } catch  {
        return [];
    }
}
function calculateTopThreeSeals(rows, participantId) {
    const participantRows = rows.filter((row)=>row.participant_id === participantId && row.seal_id);
    if (participantRows.length === 0) {
        return fallbackTopSeals;
    }
    const scores = new Map();
    for (const row of participantRows){
        const sealId = String(row.seal_id);
        const rank = Number(row.selected_rank || 99);
        /*
      Rank 1 = 5 points
      Rank 2 = 4 points
      Rank 3 = 3 points
      Rank 4 = 2 points
      Rank 5 = 1 point
    */ const score = Math.max(0, 6 - rank);
        scores.set(sealId, (scores.get(sealId) || 0) + score);
    }
    const topSealIds = Array.from(scores.entries()).sort((a, b)=>b[1] - a[1]).map(([sealId])=>sealId).slice(0, 3);
    if (topSealIds.length >= 3) {
        return topSealIds;
    }
    const missingFallbacks = fallbackTopSeals.filter((sealId)=>!topSealIds.includes(sealId));
    return [
        ...topSealIds,
        ...missingFallbacks
    ].slice(0, 3);
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");
    if (!participantId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "participantId is required."
        }, {
            status: 400
        });
    }
    const sessionOneRows = readLongRows("session-1-results.json");
    const sessionTwoRows = readLongRows("session-2-results.json");
    const combinedRows = [
        ...sessionOneRows,
        ...sessionTwoRows
    ];
    const topSealIds = calculateTopThreeSeals(combinedRows, participantId);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        participantId,
        topSealIds,
        source: "data/session-1-results.json and data/session-2-results.json",
        rowsFoundForParticipant: combinedRows.filter((row)=>row.participant_id === participantId).length
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0jsvsc.._.js.map