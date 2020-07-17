
function timeuntil(el) {
    var x = new Date()
    var day = x.getDay()
    var daysUntilFriday = (12 - day) % 7
    x.setDate(daysUntilFriday + x.getDate())
    x.setHours(17, 0, 0, 0)
    duration = x - new Date()
    if (duration < 0 || day === 0 || day === 6) {
        el.innerHTML = "How about an IPA?"
        return
    }
    dur = new Date(duration)
    el.innerHTML = dur.toISOString().substr(11, 8)
}

function run() {
    clock = document.getElementById("clock");
    function f() {
        return timeuntil(clock)
    }
    setInterval(f, 100)
}