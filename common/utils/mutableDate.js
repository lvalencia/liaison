const MutableDate = {
    addMinutes(minutes) {
        this.date.setMinutes(this.date.getMinutes()+minutes);
        return this.date;
    },
    getSecondsSinceLinuxEpoch(){
        return Math.round(this.date.getTime() / 1000);
    }
};

Object.freeze(MutableDate);

module.exports = {
    MutableDate
};

