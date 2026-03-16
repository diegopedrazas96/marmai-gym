"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.DayOfWeek = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["TEACHER"] = "TEACHER";
})(Role || (exports.Role = Role = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["OVERDUE"] = "OVERDUE";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=enums.js.map