export function convertTypeToProtoEnum(type: string): number {
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

export function convertStatusToProtoEnum(status: string): number {
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

export function dateToTimestamp(date: Date): {
    seconds: number;
    nanos: number;
} {
    const seconds = Math.floor(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    return { seconds, nanos };
}

export const convertTo12HourFormat = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
};
