
function timeuntil(el) {
    var x = new Date()
    var daysUntilFriday = (12 - x.getDay()) % 7
    x.setDate(daysUntilFriday + x.getDate())
    x.setHours(17, 0, 0, 0)
    duration = x - new Date()
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