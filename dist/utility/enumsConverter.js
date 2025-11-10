"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTo12HourFormat = void 0;
exports.convertTypeToProtoEnum = convertTypeToProtoEnum;
exports.convertStatusToProtoEnum = convertStatusToProtoEnum;
exports.dateToTimestamp = dateToTimestamp;
function convertTypeToProtoEnum(type) {
    switch (type) {
        case 'INFO':
            return 1;
        case 'APPROVAL':
            return 2;
        case 'PAYMENT':
            return 3;
        case 'ALERT':
            return 4;
        default:
            return 0;
    }
}
function convertStatusToProtoEnum(status) {
    switch (status) {
        case 'PENDING':
            return 1;
        case 'COMPLETED':
            return 2;
        case 'FAILED':
            return 3;
        default:
            return 0;
    }
}
function dateToTimestamp(date) {
    const seconds = Math.floor(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    return { seconds, nanos };
}
const convertTo12HourFormat = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
};
exports.convertTo12HourFormat = convertTo12HourFormat;
