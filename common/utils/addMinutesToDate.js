function addMinutesToDate({date, minutes}) {
    date.setMinutes(date.getMinutes()+minutes);
    return date;
}

module.exports = {
    addMinutesToDate
};