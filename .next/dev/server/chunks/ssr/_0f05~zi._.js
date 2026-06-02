module.exports = [
"[project]/components/ProductCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
"use client";
;
;
function ProductCard({ option, onSelect, onSealClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "product-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "product-image-box meat-seal-display",
                children: [
                    option.cutImageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        src: option.cutImageUrl,
                        alt: `${option.title} meat cut`,
                        width: 360,
                        height: 260,
                        className: "cut-image"
                    }, void 0, false, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 22,
                        columnNumber: 11
                    }, this) : option.imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        src: option.imageUrl,
                        alt: option.title,
                        width: 360,
                        height: 260,
                        className: "cut-image"
                    }, void 0, false, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Meat image placeholder"
                    }, void 0, false, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    option.sealImageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "seal-click-button",
                        onClick: (event)=>{
                            event.stopPropagation();
                            if (onSealClick) onSealClick();
                        },
                        "aria-label": `Read description for ${option.title} seal`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            src: option.sealImageUrl,
                            alt: `${option.title} seal`,
                            width: 110,
                            height: 110,
                            className: "seal-overlay-image"
                        }, void 0, false, {
                            fileName: "[project]/components/ProductCard.tsx",
                            lineNumber: 51,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ProductCard.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "product-info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        children: option.title
                    }, void 0, false, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    option.subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: option.subtitle
                    }, void 0, false, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 65,
                        columnNumber: 29
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "option-meta",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Cut: ",
                                    option.cutId
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ProductCard.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Seal: ",
                                    option.sealId
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ProductCard.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    typeof option.price === "number" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: [
                            "R$ ",
                            option.price.toFixed(2).replace(".", ","),
                            " / kg"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ProductCard.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ProductCard.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onSelect,
                className: "select-button",
                children: "Select this option"
            }, void 0, false, {
                fileName: "[project]/components/ProductCard.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ProductCard.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/ConfirmModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
    if (!open) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-backdrop",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "modal-card",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    children: title
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmModal.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: message
                }, void 0, false, {
                    fileName: "[project]/components/ConfirmModal.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-actions",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onCancel,
                            className: "secondary-button",
                            children: "No, go back"
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmModal.tsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onConfirm,
                            className: "primary-button",
                            children: "Yes, confirm"
                        }, void 0, false, {
                            fileName: "[project]/components/ConfirmModal.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ConfirmModal.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ConfirmModal.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ConfirmModal.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/RankingScreen.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RankingScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProductCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProductCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ConfirmModal.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function RankingScreen({ options, sessionNumber, onRankingComplete, onSealClick }) {
    const [availableOptions, setAvailableOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(options);
    const [selectedRanking, setSelectedRanking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [pendingOption, setPendingOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const currentRank = selectedRanking.length + 1;
    function handleSelect(option) {
        setPendingOption(option);
    }
    function handleConfirmChoice() {
        if (!pendingOption) return;
        const nextRanking = [
            ...selectedRanking,
            pendingOption
        ];
        const nextAvailableOptions = availableOptions.filter((option)=>option.id !== pendingOption.id);
        setSelectedRanking(nextRanking);
        setAvailableOptions(nextAvailableOptions);
        setPendingOption(null);
        if (nextRanking.length === options.length) {
            onRankingComplete(nextRanking);
        }
    }
    function handleCancelChoice() {
        setPendingOption(null);
    }
    function handleClearSelections() {
        setAvailableOptions(options);
        setSelectedRanking([]);
        setPendingOption(null);
    }
    function removeFromCart(optionId) {
        const removedOption = selectedRanking.find((option)=>option.id === optionId);
        if (!removedOption) return;
        const remainingRanking = selectedRanking.filter((option)=>option.id !== optionId);
        setSelectedRanking(remainingRanking);
        setAvailableOptions([
            ...availableOptions,
            removedOption
        ]);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ranking-area",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "ranking-toolbar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Session ",
                                    sessionNumber
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 90,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: [
                                    "Choose rank #",
                                    currentRank
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Select the beef option you would buy next. Confirmed choices disappear from the screen."
                            }, void 0, false, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RankingScreen.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleClearSelections,
                        children: "Clear selections"
                    }, void 0, false, {
                        fileName: "[project]/components/RankingScreen.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RankingScreen.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ranking-layout",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "product-grid",
                        children: availableOptions.map((option, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProductCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                option: option,
                                displayedPosition: index + 1,
                                onSelect: ()=>handleSelect(option),
                                onSealClick: onSealClick ? ()=>onSealClick(option.sealId) : undefined
                            }, option.id, false, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/RankingScreen.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "selection-cart",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cart-header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Preference order"
                                            }, void 0, false, {
                                                fileName: "[project]/components/RankingScreen.tsx",
                                                lineNumber: 118,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: "Selected choices"
                                            }, void 0, false, {
                                                fileName: "[project]/components/RankingScreen.tsx",
                                                lineNumber: 119,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RankingScreen.tsx",
                                        lineNumber: 117,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            selectedRanking.length,
                                            "/",
                                            options.length
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/RankingScreen.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this),
                            selectedRanking.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty-cart",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "No choices yet"
                                    }, void 0, false, {
                                        fileName: "[project]/components/RankingScreen.tsx",
                                        lineNumber: 129,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "The participant’s ranking will appear here after each confirmed selection."
                                    }, void 0, false, {
                                        fileName: "[project]/components/RankingScreen.tsx",
                                        lineNumber: 130,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 128,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                className: "cart-list",
                                children: selectedRanking.map((option, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "cart-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "cart-rank",
                                                children: [
                                                    "#",
                                                    index + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/RankingScreen.tsx",
                                                lineNumber: 138,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "cart-item-info",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: option.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/RankingScreen.tsx",
                                                        lineNumber: 141,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "Cut: ",
                                                            option.cutId,
                                                            " | Seal: ",
                                                            option.sealId
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/RankingScreen.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/RankingScreen.tsx",
                                                lineNumber: 140,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>removeFromCart(option.id),
                                                "aria-label": `Remove ${option.title}`,
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/components/RankingScreen.tsx",
                                                lineNumber: 147,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, option.id, true, {
                                        fileName: "[project]/components/RankingScreen.tsx",
                                        lineNumber: 137,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/RankingScreen.tsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/RankingScreen.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RankingScreen.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ConfirmModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: Boolean(pendingOption),
                title: "Confirm purchase intention",
                message: pendingOption ? `Do you confirm that you would buy "${pendingOption.title}" as choice #${currentRank}?` : "",
                onConfirm: handleConfirmChoice,
                onCancel: handleCancelChoice
            }, void 0, false, {
                fileName: "[project]/components/RankingScreen.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/RankingScreen.tsx",
        lineNumber: 87,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/DemographicsForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DemographicsForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function DemographicsForm({ onSubmit }) {
    const [gender, setGender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [ageGroup, setAgeGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [educationLevel, setEducationLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [incomeGroup, setIncomeGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const isComplete = gender && ageGroup && educationLevel && incomeGroup;
    function handleSubmit(event) {
        event.preventDefault();
        if (!isComplete) {
            alert("Please answer all demographic questions before continuing.");
            return;
        }
        onSubmit({
            gender,
            ageGroup,
            educationLevel,
            incomeGroup
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "demographics-form",
        onSubmit: handleSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "form-intro",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "badge",
                        children: "Demographic questionnaire"
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Participant Profile"
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Please answer the following questions. These categories follow the study protocol for balanced participant selection."
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DemographicsForm.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                        children: "Gender"
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "radio",
                                name: "gender",
                                value: "Male",
                                checked: gender === "Male",
                                onChange: (event)=>setGender(event.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/DemographicsForm.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            "Male"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "radio",
                                name: "gender",
                                value: "Female",
                                checked: gender === "Female",
                                onChange: (event)=>setGender(event.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/DemographicsForm.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            "Female"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "radio",
                                name: "gender",
                                value: "Prefer not to inform",
                                checked: gender === "Prefer not to inform",
                                onChange: (event)=>setGender(event.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/DemographicsForm.tsx",
                                lineNumber: 77,
                                columnNumber: 11
                            }, this),
                            "Prefer not to inform"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DemographicsForm.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                        children: "Age"
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    [
                        "18–24 years old",
                        "25–34 years old",
                        "35–44 years old",
                        "45–59 years old",
                        "60 years or older"
                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "radio",
                                    name: "ageGroup",
                                    value: item,
                                    checked: ageGroup === item,
                                    onChange: (event)=>setAgeGroup(event.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/components/DemographicsForm.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                item
                            ]
                        }, item, true, {
                            fileName: "[project]/components/DemographicsForm.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/DemographicsForm.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                        children: "Educational level"
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    [
                        "No schooling or incomplete elementary education",
                        "Completed elementary or incomplete high school",
                        "Completed high school or incomplete higher education",
                        "Completed higher education",
                        "Postgraduate specialization, master’s, or doctoral degree"
                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "radio",
                                    name: "educationLevel",
                                    value: item,
                                    checked: educationLevel === item,
                                    onChange: (event)=>setEducationLevel(event.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/components/DemographicsForm.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this),
                                item
                            ]
                        }, item, true, {
                            fileName: "[project]/components/DemographicsForm.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/DemographicsForm.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                        children: "Economic profile — minimum wage in Brazil: R$ 1,621"
                    }, void 0, false, {
                        fileName: "[project]/components/DemographicsForm.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    [
                        "Up to 1 minimum wage — up to R$ 1,621",
                        "From 1 to 2 minimum wages — R$ 1,621 to R$ 3,242",
                        "From 2 to 5 minimum wages — R$ 3,242 to R$ 8,105",
                        "From 5 to 10 minimum wages — R$ 8,105 to R$ 16,210",
                        "More than 10 minimum wages — above R$ 16,210"
                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "radio",
                                    name: "incomeGroup",
                                    value: item,
                                    checked: incomeGroup === item,
                                    onChange: (event)=>setIncomeGroup(event.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/components/DemographicsForm.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this),
                                item
                            ]
                        }, item, true, {
                            fileName: "[project]/components/DemographicsForm.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/DemographicsForm.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                className: isComplete ? "purchase-button" : "purchase-button disabled",
                children: "Save questionnaire"
            }, void 0, false, {
                fileName: "[project]/components/DemographicsForm.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DemographicsForm.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/randomization.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRandomizationSeed",
    ()=>createRandomizationSeed,
    "seededShuffle",
    ()=>seededShuffle
]);
function seededShuffle(items, seed) {
    let hash = 0;
    for(let i = 0; i < seed.length; i++){
        hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
    }
    const result = [
        ...items
    ];
    for(let i = result.length - 1; i > 0; i--){
        hash = Math.imul(48271, hash) % 2147483647;
        const j = Math.abs(hash) % (i + 1);
        [result[i], result[j]] = [
            result[j],
            result[i]
        ];
    }
    return result;
}
function createRandomizationSeed(participantId, sessionNumber) {
    return `${participantId}-session-${sessionNumber}`;
}
}),
"[project]/lib/locationStudyConfig.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCutFolderForLocation",
    ()=>getCutFolderForLocation,
    "getFallbackTopSealsForLocation",
    ()=>getFallbackTopSealsForLocation,
    "getRankingOptionsForLocation",
    ()=>getRankingOptionsForLocation,
    "getSealColorForLocation",
    ()=>getSealColorForLocation,
    "getSealsForLocation",
    ()=>getSealsForLocation,
    "isUfbaLocation",
    ()=>isUfbaLocation
]);
function normalizeLocation(location) {
    return location.trim().toUpperCase();
}
function isUfbaLocation(location) {
    return normalizeLocation(location) === "UFBA";
}
function getSealColorForLocation(location) {
    return isUfbaLocation(location) ? "green" : "red";
}
function getCutFolderForLocation(location) {
    return isUfbaLocation(location) ? "ufba" : "pucpr";
}
function getFallbackTopSealsForLocation(location) {
    if (isUfbaLocation(location)) {
        return [
            "green-1",
            "green-2",
            "green-3"
        ];
    }
    return [
        "red-1",
        "red-2",
        "red-3"
    ];
}
function getSealsForLocation(location) {
    if (isUfbaLocation(location)) {
        return [
            {
                id: "green-1",
                name: "Green Seal 1",
                color: "green",
                imageUrl: "/images/seals/green/1.png",
                description: "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha."
            },
            {
                id: "green-2",
                name: "Green Seal 2",
                color: "green",
                imageUrl: "/images/seals/green/2.png",
                description: "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha."
            },
            {
                id: "green-3",
                name: "Green Seal 3",
                color: "green",
                imageUrl: "/images/seals/green/3.png",
                description: "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha."
            },
            {
                id: "green-4",
                name: "Green Seal 4",
                color: "green",
                imageUrl: "/images/seals/green/4.png",
                description: "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha."
            },
            {
                id: "green-5",
                name: "Green Seal 5",
                color: "green",
                imageUrl: "/images/seals/green/5.png",
                description: "This green label is part of the UFBA representative seal set for whole vacuum-packed picanha."
            }
        ];
    }
    return [
        {
            id: "red-1",
            name: "Red Seal 1",
            color: "red",
            imageUrl: "/images/seals/red/1.png",
            description: "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray."
        },
        {
            id: "red-2",
            name: "Red Seal 2",
            color: "red",
            imageUrl: "/images/seals/red/2.png",
            description: "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray."
        },
        {
            id: "red-3",
            name: "Red Seal 3",
            color: "red",
            imageUrl: "/images/seals/red/3.png",
            description: "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray."
        },
        {
            id: "red-4",
            name: "Red Seal 4",
            color: "red",
            imageUrl: "/images/seals/red/4.png",
            description: "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray."
        },
        {
            id: "red-5",
            name: "Red Seal 5",
            color: "red",
            imageUrl: "/images/seals/red/5.png",
            description: "This red label is part of the PUCPR representative seal set for sliced picanha in a black tray."
        }
    ];
}
function getRankingOptionsForLocation(location, sessionNumber) {
    const isUfba = isUfbaLocation(location);
    const seals = getSealsForLocation(location);
    const cutFolder = getCutFolderForLocation(location);
    return seals.map((seal, index)=>{
        const optionNumber = index + 1;
        return {
            id: `session-${sessionNumber}-option-${optionNumber}`,
            cutId: `${cutFolder}-cut-${optionNumber}`,
            sealId: seal.id,
            title: `Beef Option ${optionNumber} - ${seal.name}`,
            subtitle: isUfba ? "Whole vacuum-packed picanha with green seal" : "Sliced picanha in black tray with red seal",
            cutImageUrl: `/images/cuts/${cutFolder}/${optionNumber}.png`,
            sealImageUrl: seal.imageUrl,
            sealColor: seal.color
        };
    });
}
}),
"[project]/app/session-3/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SessionThreePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RankingScreen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/RankingScreen.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DemographicsForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DemographicsForm.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$randomization$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/randomization.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/locationStudyConfig.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const BASE_PRICE = 80;
const SESSION_1_WEIGHT = 1 / 3;
const SESSION_2_WEIGHT = 2 / 3;
const priceLevels = {
    low: {
        priceIncreasePercent: 5,
        price: BASE_PRICE * 1.05
    },
    medium: {
        priceIncreasePercent: 10,
        price: BASE_PRICE * 1.1
    },
    high: {
        priceIncreasePercent: 20,
        price: BASE_PRICE * 1.2
    }
};
const priceRotations = [
    [
        priceLevels.high,
        priceLevels.medium,
        priceLevels.low
    ],
    [
        priceLevels.low,
        priceLevels.high,
        priceLevels.medium
    ],
    [
        priceLevels.medium,
        priceLevels.low,
        priceLevels.high
    ]
];
function getPreviousRankings() {
    const sessionOneRaw = localStorage.getItem("session-1-ranking");
    const sessionTwoRaw = localStorage.getItem("session-2-ranking");
    const sessionOneRows = sessionOneRaw ? JSON.parse(sessionOneRaw) : [];
    const sessionTwoRows = sessionTwoRaw ? JSON.parse(sessionTwoRaw) : [];
    return {
        sessionOneRows: Array.isArray(sessionOneRows) ? sessionOneRows : [],
        sessionTwoRows: Array.isArray(sessionTwoRows) ? sessionTwoRows : []
    };
}
function getTopThreeSealsFromPreviousChoices(location) {
    const fallbackTopSeals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFallbackTopSealsForLocation"])(location);
    try {
        const { sessionOneRows, sessionTwoRows } = getPreviousRankings();
        if (sessionOneRows.length === 0 && sessionTwoRows.length === 0) {
            return fallbackTopSeals;
        }
        const validSealIds = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSealsForLocation"])(location).map((seal)=>seal.id));
        const scores = new Map();
        function addWeightedScores(rows, sessionWeight) {
            for (const row of rows){
                const sealId = row.seal_id;
                if (!sealId) continue;
                if (!validSealIds.has(sealId)) continue;
                const selectedRank = Number(row.selected_rank || 99);
                const baseScore = Math.max(0, 6 - selectedRank);
                const weightedScore = baseScore * sessionWeight;
                scores.set(sealId, (scores.get(sealId) || 0) + weightedScore);
            }
        }
        addWeightedScores(sessionOneRows, SESSION_1_WEIGHT);
        addWeightedScores(sessionTwoRows, SESSION_2_WEIGHT);
        const topSealIds = Array.from(scores.entries()).sort((a, b)=>b[1] - a[1]).map(([sealId])=>sealId).slice(0, 3);
        if (topSealIds.length >= 3) {
            return topSealIds;
        }
        const missingFallbacks = fallbackTopSeals.filter((sealId)=>!topSealIds.includes(sealId));
        return [
            ...topSealIds,
            ...missingFallbacks
        ].slice(0, 3);
    } catch  {
        return fallbackTopSeals;
    }
}
function formatBrazilianCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
}
function SessionThreePage() {
    const [participantId, setParticipantId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [participantLocation, setParticipantLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("intro");
    const [currentRoundIndex, setCurrentRoundIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentRoundRanking, setCurrentRoundRanking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [allRoundRankings, setAllRoundRankings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeSeal, setActiveSeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [topThreeSealIds, setTopThreeSealIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const fallbackTopSeals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFallbackTopSealsForLocation"])(participantLocation || "PUCPR");
    }, [
        participantLocation
    ]);
    const sealDefinitions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSealsForLocation"])(participantLocation || "PUCPR").map((seal)=>({
                sealId: seal.id,
                sealName: seal.name,
                sealColor: seal.color,
                sealImageUrl: seal.imageUrl,
                description: seal.description
            }));
    }, [
        participantLocation
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadParticipantAndTopSeals() {
            const id = localStorage.getItem("participantId") || "DEMO-PARTICIPANT";
            const location = localStorage.getItem("participantLocation") || "PUCPR";
            setParticipantId(id);
            setParticipantLocation(location);
            const locationFallbackTopSeals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFallbackTopSealsForLocation"])(location);
            try {
                const response = await fetch(`/api/session-3/top-seals?participantId=${encodeURIComponent(id)}`);
                if (!response.ok) {
                    setTopThreeSealIds(getTopThreeSealsFromPreviousChoices(location));
                    return;
                }
                const data = await response.json();
                const validSealIds = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locationStudyConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSealsForLocation"])(location).map((seal)=>seal.id));
                if (Array.isArray(data.topSealIds) && data.topSealIds.length >= 3) {
                    const filteredTopSealIds = data.topSealIds.filter((sealId)=>validSealIds.has(sealId)).slice(0, 3);
                    if (filteredTopSealIds.length >= 3) {
                        setTopThreeSealIds(filteredTopSealIds);
                        return;
                    }
                }
                setTopThreeSealIds(getTopThreeSealsFromPreviousChoices(location));
            } catch  {
                setTopThreeSealIds(locationFallbackTopSeals);
            }
        }
        loadParticipantAndTopSeals();
    }, []);
    const randomizationSeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return participantId ? `${participantId}-session-3` : "demo-session-3";
    }, [
        participantId
    ]);
    const sessionThreeOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const selectedSeals = topThreeSealIds.map((sealId)=>sealDefinitions.find((seal)=>seal.sealId === sealId)).filter(Boolean);
        const currentPriceRotation = priceRotations[currentRoundIndex] || priceRotations[0];
        const pricedOptions = selectedSeals.map((seal, index)=>{
            const priceLevel = currentPriceRotation[index] || priceLevels.low;
            return {
                id: `session-3-round-${currentRoundIndex + 1}-${seal.sealId}-${priceLevel.priceIncreasePercent}`,
                cutId: `price-cut-${index + 1}`,
                sealId: seal.sealId,
                title: `${seal.sealName} - ${formatBrazilianCurrency(priceLevel.price)}/kg`,
                subtitle: `Round ${currentRoundIndex + 1} of 3 | Base price ${formatBrazilianCurrency(BASE_PRICE)}/kg + ${priceLevel.priceIncreasePercent}%`,
                cutImageUrl: `/images/cuts/${participantLocation === "UFBA" ? "ufba" : "pucpr"}/${index + 1}.png`,
                sealImageUrl: seal.sealImageUrl,
                sealColor: seal.sealColor,
                price: priceLevel.price,
                priceIncreasePercent: priceLevel.priceIncreasePercent
            };
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$randomization$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seededShuffle"])(pricedOptions, `${randomizationSeed}-round-${currentRoundIndex + 1}`);
    }, [
        topThreeSealIds,
        sealDefinitions,
        randomizationSeed,
        currentRoundIndex,
        participantLocation
    ]);
    function getSealById(sealId) {
        return sealDefinitions.find((seal)=>seal.sealId === sealId) || null;
    }
    function handleRankingComplete(ranking) {
        setCurrentRoundRanking(ranking);
        setStep("round-confirmation");
    }
    function handleRoundConfirmationYes() {
        const updatedAllRoundRankings = [
            ...allRoundRankings,
            currentRoundRanking
        ];
        setAllRoundRankings(updatedAllRoundRankings);
        setCurrentRoundRanking([]);
        if (currentRoundIndex < 2) {
            setCurrentRoundIndex(currentRoundIndex + 1);
            setStep("ranking");
        } else {
            setStep("demographics");
        }
    }
    function handleRoundConfirmationNo() {
        setCurrentRoundRanking([]);
        setStep("ranking");
    }
    async function saveSessionThree(demographics) {
        const timestamp = new Date().toISOString();
        function getRoundOption(roundIndex, rankIndex) {
            return allRoundRankings[roundIndex]?.[rankIndex];
        }
        const longRows = allRoundRankings.flatMap((roundRanking, roundIndex)=>roundRanking.map((option, rankIndex)=>({
                    participant_id: participantId,
                    location: participantLocation,
                    session_number: 3,
                    session_3_round: roundIndex + 1,
                    method: "3 seals x 3 rotating prices price experiment",
                    base_price_brl: BASE_PRICE,
                    session_1_weight: SESSION_1_WEIGHT,
                    session_2_weight: SESSION_2_WEIGHT,
                    randomization_seed: randomizationSeed,
                    round_randomization_seed: `${randomizationSeed}-round-${roundIndex + 1}`,
                    selected_rank: rankIndex + 1,
                    option_id: option.id,
                    cut_id: option.cutId || "",
                    seal_id: option.sealId || "",
                    title: option.title,
                    subtitle: option.subtitle || "",
                    cut_image_url: option.cutImageUrl || "",
                    seal_image_url: option.sealImageUrl || "",
                    seal_color: option.sealColor || "",
                    price_brl: option.price || "",
                    price_increase_percent: option.priceIncreasePercent || "",
                    top_three_seals_used: topThreeSealIds.join(", "),
                    gender: demographics.gender,
                    age_group: demographics.ageGroup,
                    education_level: demographics.educationLevel,
                    income_group: demographics.incomeGroup,
                    timestamp
                })));
        const participantRow = {
            participant_id: participantId,
            location: participantLocation,
            session_number: 3,
            method: "3 seals x 3 rotating prices price experiment",
            base_price_brl: BASE_PRICE,
            session_1_weight: SESSION_1_WEIGHT,
            session_2_weight: SESSION_2_WEIGHT,
            randomization_seed: randomizationSeed,
            top_seal_1: topThreeSealIds[0] || "",
            top_seal_2: topThreeSealIds[1] || "",
            top_seal_3: topThreeSealIds[2] || "",
            gender: demographics.gender,
            age_group: demographics.ageGroup,
            education_level: demographics.educationLevel,
            income_group: demographics.incomeGroup,
            round_1_rank_1_option_id: getRoundOption(0, 0)?.id || "",
            round_1_rank_1_cut_id: getRoundOption(0, 0)?.cutId || "",
            round_1_rank_1_seal_id: getRoundOption(0, 0)?.sealId || "",
            round_1_rank_1_title: getRoundOption(0, 0)?.title || "",
            round_1_rank_1_price_brl: getRoundOption(0, 0)?.price || "",
            round_1_rank_1_price_increase_percent: getRoundOption(0, 0)?.priceIncreasePercent || "",
            round_1_rank_2_option_id: getRoundOption(0, 1)?.id || "",
            round_1_rank_2_cut_id: getRoundOption(0, 1)?.cutId || "",
            round_1_rank_2_seal_id: getRoundOption(0, 1)?.sealId || "",
            round_1_rank_2_title: getRoundOption(0, 1)?.title || "",
            round_1_rank_2_price_brl: getRoundOption(0, 1)?.price || "",
            round_1_rank_2_price_increase_percent: getRoundOption(0, 1)?.priceIncreasePercent || "",
            round_1_rank_3_option_id: getRoundOption(0, 2)?.id || "",
            round_1_rank_3_cut_id: getRoundOption(0, 2)?.cutId || "",
            round_1_rank_3_seal_id: getRoundOption(0, 2)?.sealId || "",
            round_1_rank_3_title: getRoundOption(0, 2)?.title || "",
            round_1_rank_3_price_brl: getRoundOption(0, 2)?.price || "",
            round_1_rank_3_price_increase_percent: getRoundOption(0, 2)?.priceIncreasePercent || "",
            round_2_rank_1_option_id: getRoundOption(1, 0)?.id || "",
            round_2_rank_1_cut_id: getRoundOption(1, 0)?.cutId || "",
            round_2_rank_1_seal_id: getRoundOption(1, 0)?.sealId || "",
            round_2_rank_1_title: getRoundOption(1, 0)?.title || "",
            round_2_rank_1_price_brl: getRoundOption(1, 0)?.price || "",
            round_2_rank_1_price_increase_percent: getRoundOption(1, 0)?.priceIncreasePercent || "",
            round_2_rank_2_option_id: getRoundOption(1, 1)?.id || "",
            round_2_rank_2_cut_id: getRoundOption(1, 1)?.cutId || "",
            round_2_rank_2_seal_id: getRoundOption(1, 1)?.sealId || "",
            round_2_rank_2_title: getRoundOption(1, 1)?.title || "",
            round_2_rank_2_price_brl: getRoundOption(1, 1)?.price || "",
            round_2_rank_2_price_increase_percent: getRoundOption(1, 1)?.priceIncreasePercent || "",
            round_2_rank_3_option_id: getRoundOption(1, 2)?.id || "",
            round_2_rank_3_cut_id: getRoundOption(1, 2)?.cutId || "",
            round_2_rank_3_seal_id: getRoundOption(1, 2)?.sealId || "",
            round_2_rank_3_title: getRoundOption(1, 2)?.title || "",
            round_2_rank_3_price_brl: getRoundOption(1, 2)?.price || "",
            round_2_rank_3_price_increase_percent: getRoundOption(1, 2)?.priceIncreasePercent || "",
            round_3_rank_1_option_id: getRoundOption(2, 0)?.id || "",
            round_3_rank_1_cut_id: getRoundOption(2, 0)?.cutId || "",
            round_3_rank_1_seal_id: getRoundOption(2, 0)?.sealId || "",
            round_3_rank_1_title: getRoundOption(2, 0)?.title || "",
            round_3_rank_1_price_brl: getRoundOption(2, 0)?.price || "",
            round_3_rank_1_price_increase_percent: getRoundOption(2, 0)?.priceIncreasePercent || "",
            round_3_rank_2_option_id: getRoundOption(2, 1)?.id || "",
            round_3_rank_2_cut_id: getRoundOption(2, 1)?.cutId || "",
            round_3_rank_2_seal_id: getRoundOption(2, 1)?.sealId || "",
            round_3_rank_2_title: getRoundOption(2, 1)?.title || "",
            round_3_rank_2_price_brl: getRoundOption(2, 1)?.price || "",
            round_3_rank_2_price_increase_percent: getRoundOption(2, 1)?.priceIncreasePercent || "",
            round_3_rank_3_option_id: getRoundOption(2, 2)?.id || "",
            round_3_rank_3_cut_id: getRoundOption(2, 2)?.cutId || "",
            round_3_rank_3_seal_id: getRoundOption(2, 2)?.sealId || "",
            round_3_rank_3_title: getRoundOption(2, 2)?.title || "",
            round_3_rank_3_price_brl: getRoundOption(2, 2)?.price || "",
            round_3_rank_3_price_increase_percent: getRoundOption(2, 2)?.priceIncreasePercent || "",
            timestamp
        };
        const response = await fetch("/api/session-3/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                participantRow,
                longRows
            })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(()=>null);
            console.error("Session 3 save failed:", errorData);
            alert("Could not save Session 3 questionnaire. Please try again.");
            return;
        }
        localStorage.setItem("session-3-ranking", JSON.stringify(longRows));
        localStorage.setItem("session-3-demographics", JSON.stringify(demographics));
        const fullSurveyResponse = await fetch("/api/full-survey/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                participantId,
                location: participantLocation,
                demographics
            })
        });
        if (!fullSurveyResponse.ok) {
            const errorData = await fullSurveyResponse.json().catch(()=>null);
            console.error("Full survey save failed:", errorData);
            alert("Session 3 was saved, but the combined full-survey file could not be created.");
            return;
        }
        setStep("completed");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "study-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "study-shell",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/",
                        className: "back-link",
                        children: "← Back to sessions"
                    }, void 0, false, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 446,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "study-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "badge",
                                children: "Session 3"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 451,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "Price Experiment"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 452,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "This session presents the participant’s three highest-scoring seals from Session 1 and Session 2. Session 1 has weight 1/3 and Session 2 has weight 2/3. The same three seals are shown across three price rounds, and the price levels rotate in each round."
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 454,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "participant-strip",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Participant ID"
                                    }, void 0, false, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 462,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: participantId || "Loading..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 463,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 461,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "participant-strip",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Location"
                                    }, void 0, false, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 467,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: participantLocation || "Loading..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 468,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 466,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 450,
                        columnNumber: 9
                    }, this),
                    step === "intro" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "complete-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "badge",
                                children: "Individualized design"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 474,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Top three seals selected for this participant"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 475,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "The app searches the saved Session 1 and Session 2 records for this participant ID, then selects the three highest-scoring seals using a weighted sum. Session 1 counts as 1/3 and Session 2 counts as 2/3."
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 477,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "price-summary-grid",
                                children: (topThreeSealIds.length > 0 ? topThreeSealIds : fallbackTopSeals).map((sealId, index)=>{
                                    const seal = getSealById(sealId);
                                    const priceLevel = priceRotations[0][index];
                                    if (!seal || !priceLevel) return null;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "price-summary-card",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: seal.sealImageUrl,
                                                alt: seal.sealName
                                            }, void 0, false, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 493,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: seal.sealName
                                            }, void 0, false, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 494,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    "Round 1: ",
                                                    priceLevel.priceIncreasePercent,
                                                    "% increase"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 495,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    formatBrazilianCurrency(priceLevel.price),
                                                    "/kg"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 496,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, seal.sealId, true, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 492,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 483,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "primary-button full-width-button",
                                onClick: ()=>{
                                    setCurrentRoundIndex(0);
                                    setCurrentRoundRanking([]);
                                    setAllRoundRankings([]);
                                    if (topThreeSealIds.length === 0) {
                                        setTopThreeSealIds(fallbackTopSeals);
                                    }
                                    setStep("ranking");
                                },
                                children: "Start price ranking"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 503,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 473,
                        columnNumber: 11
                    }, this),
                    step === "ranking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "session-two-ranking-note",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "description-reminder",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            "Round ",
                                            currentRoundIndex + 1,
                                            " of 3:"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 526,
                                        columnNumber: 15
                                    }, this),
                                    " Participants may click the seal image to view its description again. The same three top seals are shown in each round, but the price levels rotate across rounds."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 525,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RankingScreen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                options: sessionThreeOptions,
                                sessionNumber: 3,
                                onRankingComplete: handleRankingComplete,
                                onSealClick: (sealId)=>{
                                    const seal = getSealById(sealId);
                                    if (seal) setActiveSeal(seal);
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 532,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 524,
                        columnNumber: 11
                    }, this),
                    step === "round-confirmation" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "complete-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "badge",
                                children: [
                                    "Round ",
                                    currentRoundIndex + 1,
                                    " of 3 confirmation"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 546,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Confirm your price ranking"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 547,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Please review your order of preference for Round",
                                    " ",
                                    currentRoundIndex + 1,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 548,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                className: "final-ranking-list",
                                children: currentRoundRanking.map((option, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    "#",
                                                    index + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 556,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: option.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 557,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                children: [
                                                    "Cut: ",
                                                    option.cutId,
                                                    " | Seal: ",
                                                    option.sealId,
                                                    " | Price:",
                                                    " ",
                                                    typeof option.price === "number" ? `${formatBrazilianCurrency(option.price)}/kg` : ""
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/session-3/page.tsx",
                                                lineNumber: 558,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, option.id, true, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 555,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 553,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "final-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "secondary-button",
                                        onClick: handleRoundConfirmationNo,
                                        children: "No, redo this round"
                                    }, void 0, false, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 569,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "primary-button",
                                        onClick: handleRoundConfirmationYes,
                                        children: currentRoundIndex < 2 ? "Yes, continue to next price round" : "Yes, continue to questionnaire"
                                    }, void 0, false, {
                                        fileName: "[project]/app/session-3/page.tsx",
                                        lineNumber: 577,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 568,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 545,
                        columnNumber: 11
                    }, this),
                    step === "demographics" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "complete-card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DemographicsForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            onSubmit: saveSessionThree
                        }, void 0, false, {
                            fileName: "[project]/app/session-3/page.tsx",
                            lineNumber: 592,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 591,
                        columnNumber: 11
                    }, this),
                    step === "completed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "complete-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "badge",
                                children: "Completed"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 598,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Survey Complete"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 599,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Session 3 has been saved. All three price rounds were saved under the same participant ID. The combined full-survey Excel file has also been updated."
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 600,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/",
                                className: "primary-link-button",
                                children: "Finish and Return to Home"
                            }, void 0, false, {
                                fileName: "[project]/app/session-3/page.tsx",
                                lineNumber: 606,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/session-3/page.tsx",
                        lineNumber: 597,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/session-3/page.tsx",
                lineNumber: 445,
                columnNumber: 7
            }, this),
            activeSeal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-backdrop",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "modal-card seal-modal-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: activeSeal.sealImageUrl,
                            alt: activeSeal.sealName
                        }, void 0, false, {
                            fileName: "[project]/app/session-3/page.tsx",
                            lineNumber: 616,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: activeSeal.sealName
                        }, void 0, false, {
                            fileName: "[project]/app/session-3/page.tsx",
                            lineNumber: 618,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: activeSeal.description
                        }, void 0, false, {
                            fileName: "[project]/app/session-3/page.tsx",
                            lineNumber: 619,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "primary-button",
                            onClick: ()=>setActiveSeal(null),
                            children: "I have read this description"
                        }, void 0, false, {
                            fileName: "[project]/app/session-3/page.tsx",
                            lineNumber: 621,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/session-3/page.tsx",
                    lineNumber: 615,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/session-3/page.tsx",
                lineNumber: 614,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/session-3/page.tsx",
        lineNumber: 444,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_0f05~zi._.js.map