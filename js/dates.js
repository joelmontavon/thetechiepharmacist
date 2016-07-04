Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
};

Date.prototype.daysFrom = function(date) {
    return Math.floor((Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()) - Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) / (1000*60*60*24));
};

Date.prototype.yearsFrom = function(date) {
    var years = date.getFullYear() - this.getFullYear();
    var m = date.getMonth() - this.getMonth();
    if (m < 0 || (m === 0 && date.getDate() < this.getDate())) {
        years--;
    }
    return years;
};

Date.prototype.offsetForTimezone = function() {
    this.setTime(this.getTime() + this.stdTimezoneOffset()*60*1000);
    return this;
};

Date.prototype.getDaysFromEpoch = function() {
    return this.daysFrom(Date.epoch());
};

Date.getWithOffsetForTimezone = function (val) {
  var date = val ? new Date(val) : new Date();
  date.offsetForTimezone();
  return date;
};

Date.prototype.toStdString = function () {
  var year = this.getFullYear();
  var month = this.getMonth() + 1;
  if (month < 10) month = '0' + month;
  var day = this.getDate();
  if (day < 10) day = '0' + day;
  return year + '-' + month + '-' + day;
};

Date.epoch = function () {
  return Date.getWithOffsetForTimezone('1970-01-01');
};

Date.getWithDaysFromEpoch = function (days) {
  return Date.epoch().addDays(Number(days));
};