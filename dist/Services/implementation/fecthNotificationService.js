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
Object.defineProperty(exports, "__esModule", { value: true });
class FecthNotificationService {
    constructor(fetchNotificationRepo) {
        this._fetchNotificationRepository = fetchNotificationRepo;
    }
    fetchNotifications(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Service fetching notifications for:", email);
                if (!email) {
                    throw new Error("Email is required");
                }
                const response = yield this._fetchNotificationRepository.fetchNotifications(email);
                return response;
            }
            catch (error) {
                console.error("Error in notification service:", error);
                throw error;
            }
        });
    }
}
exports.default = FecthNotificationService;
