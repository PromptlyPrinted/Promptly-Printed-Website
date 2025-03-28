"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var _2025_03_26_updateTshirtDetails_js_1 = require("./2025_03_26_updateTshirtDetails.js");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var categories, _i, categories_1, categoryName, categoryMap, categoryIdMap, _a, _b, _c, sku, details, categoryId, product, additionalImages, _d, additionalImages_1, img;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    categories = [
                        "Men's T-shirts",
                        "Women's T-shirts",
                        "Baby Clothing",
                        "Kids' T-shirts",
                        "Kids' Sweatshirts"
                    ];
                    _i = 0, categories_1 = categories;
                    _e.label = 1;
                case 1:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 4];
                    categoryName = categories_1[_i];
                    return [4 /*yield*/, prisma.category.upsert({
                            where: { name: categoryName },
                            update: {},
                            create: {
                                name: categoryName,
                                description: "Category for ".concat(categoryName)
                            }
                        })];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, prisma.category.findMany()];
                case 5:
                    categoryMap = _e.sent();
                    categoryIdMap = new Map(categoryMap.map(function (cat) { return [cat.name, cat.id]; }));
                    _a = 0, _b = Object.entries(_2025_03_26_updateTshirtDetails_js_1.tshirtDetails);
                    _e.label = 6;
                case 6:
                    if (!(_a < _b.length)) return [3 /*break*/, 15];
                    _c = _b[_a], sku = _c[0], details = _c[1];
                    categoryId = categoryIdMap.get(details.category);
                    if (!categoryId) {
                        console.error("Category not found for ".concat(details.category));
                        return [3 /*break*/, 14];
                    }
                    return [4 /*yield*/, prisma.product.upsert({
                            where: {
                                sku_countryCode: {
                                    sku: sku,
                                    countryCode: 'US' // Default to US for now
                                }
                            },
                            update: {
                                name: details.name,
                                description: details.shortDescription,
                                price: details.pricing[0].amount, // Use USD price as base
                                customerPrice: details.pricing[0].amount,
                                currency: details.pricing[0].currency,
                                categoryId: categoryId,
                                productType: details.productType,
                                brand: details.brand.name,
                                color: details.colorOptions.map(function (opt) { return opt.name; }),
                                countryCode: 'US',
                                gender: details.category.includes("Men's") ? 'M' :
                                    details.category.includes("Women's") ? 'F' : 'U',
                                height: details.dimensions.height,
                                width: details.dimensions.width,
                                units: details.dimensions.units,
                                size: details.size,
                                shippingCost: 0, // Will be calculated based on shipping zones
                                taxAmount: 0, // Will be calculated based on region
                                totalCost: details.pricing[0].amount,
                                edge: 'standard', // Default value
                                style: 'casual', // Default value
                                prodigiAttributes: {
                                    features: details.features,
                                    materials: details.materials,
                                    ecoProperties: details.ecoProperties,
                                    careInstructions: details.careInstructions,
                                    manufacturingLocation: details.manufacturingLocation
                                },
                                prodigiDescription: details.shortDescription,
                                prodigiVariants: {
                                    colorOptions: details.colorOptions,
                                    shippingZones: details.shippingZones,
                                    customsDutyInfo: details.customsDutyInfo,
                                    restrictions: details.restrictions
                                }
                            },
                            create: {
                                name: details.name,
                                sku: sku,
                                description: details.shortDescription,
                                price: details.pricing[0].amount,
                                customerPrice: details.pricing[0].amount,
                                currency: details.pricing[0].currency,
                                categoryId: categoryId,
                                productType: details.productType,
                                brand: details.brand.name,
                                color: details.colorOptions.map(function (opt) { return opt.name; }),
                                countryCode: 'US',
                                gender: details.category.includes("Men's") ? 'M' :
                                    details.category.includes("Women's") ? 'F' : 'U',
                                height: details.dimensions.height,
                                width: details.dimensions.width,
                                units: details.dimensions.units,
                                size: details.size,
                                shippingCost: 0,
                                taxAmount: 0,
                                totalCost: details.pricing[0].amount,
                                edge: 'standard', // Default value
                                style: 'casual', // Default value
                                prodigiAttributes: {
                                    features: details.features,
                                    materials: details.materials,
                                    ecoProperties: details.ecoProperties,
                                    careInstructions: details.careInstructions,
                                    manufacturingLocation: details.manufacturingLocation
                                },
                                prodigiDescription: details.shortDescription,
                                prodigiVariants: {
                                    colorOptions: details.colorOptions,
                                    shippingZones: details.shippingZones,
                                    customsDutyInfo: details.customsDutyInfo,
                                    restrictions: details.restrictions
                                }
                            }
                        })];
                case 7:
                    product = _e.sent();
                    if (!details.imageUrls.base) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.image.create({
                            data: {
                                url: details.imageUrls.base,
                                productId: product.id
                            }
                        })];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9:
                    additionalImages = [
                        { url: details.imageUrls.front, type: 'front' },
                        { url: details.imageUrls.back, type: 'back' },
                        { url: details.imageUrls.closeup, type: 'closeup' },
                        { url: details.imageUrls.lifestyle, type: 'lifestyle' }
                    ].filter(function (img) {
                        return typeof img.url === 'string';
                    });
                    _d = 0, additionalImages_1 = additionalImages;
                    _e.label = 10;
                case 10:
                    if (!(_d < additionalImages_1.length)) return [3 /*break*/, 13];
                    img = additionalImages_1[_d];
                    return [4 /*yield*/, prisma.image.create({
                            data: {
                                url: img.url,
                                productId: product.id
                            }
                        })];
                case 11:
                    _e.sent();
                    _e.label = 12;
                case 12:
                    _d++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log("Created/Updated product: ".concat(sku));
                    _e.label = 14;
                case 14:
                    _a++;
                    return [3 /*break*/, 6];
                case 15: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
