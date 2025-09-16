"use strict";
// notification.interfaces.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["TYPE_UNSPECIFIED"] = 0] = "TYPE_UNSPECIFIED";
    NotificationType[NotificationType["INFO"] = 1] = "INFO";
    NotificationType[NotificationType["APPROVAL"] = 2] = "APPROVAL";
    NotificationType[NotificationType["PAYMENT"] = 3] = "PAYMENT";
    NotificationType[NotificationType["ALERT"] = 4] = "ALERT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus[PaymentStatus["STATUS_UNSPECIFIED"] = 0] = "STATUS_UNSPECIFIED";
    PaymentStatus[PaymentStatus["PENDING"] = 1] = "PENDING";
    PaymentStatus[PaymentStatus["COMPLETED"] = 2] = "COMPLETED";
    PaymentStatus[PaymentStatus["FAILED"] = 3] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
