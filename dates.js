Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
};

Date.prototype.daysFrom = function(date) {
    return Math.floor((this - date) / (1000*60*60*24));
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
    this.setTime(this.getTime() + this.getTimezoneOffset()*60*1000);
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

Date.epoch = function () {
  return Date.getWithOffsetForTimezone('1970-01-01');
};

Date.getWithDaysFromEpoch = function (days) {
  return Date.epoch().addDays(Number(days));
};