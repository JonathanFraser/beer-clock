const SUNDAY = 0;
const FRIDAY = 5;
const SATURDAY = 6;

// Beer time runs from Friday at DEFAULT_HOUR until the end of Sunday.
// Everything outside that window counts down to the next Friday, in the
// viewer's own local time.
const DEFAULT_HOUR = 17;
const TICK_MS = 250;

class CountDownClock extends HTMLElement {

    static get observedAttributes() {
        return ['hour'];
    }

    constructor() {
        super();
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-variant-numeric: tabular-nums;
                    font-feature-settings: "tnum" 1;
                }
                #countdown {
                    line-height: 1;
                    white-space: nowrap;
                }
                #countdown.beer-time {
                    font-size: 0.85em;
                }
                .glass {
                    display: block;
                    font-size: 2.4em;
                    line-height: 1.2;
                }
            </style>
            <div id="countdown" role="timer"></div>`;
        this.clock = root.getElementById('countdown');
        this.timerIndex = null;
        this.lastRendered = null;
    }

    connectedCallback() {
        if (!this.hasAttribute('hour')) {
            this.setAttribute('hour', DEFAULT_HOUR);
        }
        this.startTicking();
    }

    disconnectedCallback() {
        this.stopTicking();
    }

    attributeChangedCallback() {
        // Re-render immediately so an `hour` change is not held back by the tick.
        if (this.isConnected) {
            this.timeuntil();
        }
    }

    startTicking() {
        this.stopTicking();
        this.timeuntil();
        this.timerIndex = setInterval(this.timeuntil.bind(this), TICK_MS);
    }

    stopTicking() {
        if (this.timerIndex) {
            clearInterval(this.timerIndex);
            this.timerIndex = null;
        }
    }

    /** The configured hour, clamped to a real hour of the day. */
    get hour() {
        const raw = Number.parseInt(this.getAttribute('hour'), 10);
        if (!Number.isInteger(raw) || raw < 0 || raw > 23) {
            return DEFAULT_HOUR;
        }
        return raw;
    }

    /** The upcoming Friday at the target hour, in local time. */
    nextBeerTime(now) {
        const target = new Date(now);
        const daysUntilFriday = (FRIDAY - now.getDay() + 7) % 7;
        target.setDate(target.getDate() + daysUntilFriday);
        target.setHours(this.hour, 0, 0, 0);
        return target;
    }

    /** True from Friday at `hour` through to midnight at the end of Sunday. */
    isBeerTime(now) {
        switch (now.getDay()) {
            case FRIDAY:
                return now.getHours() >= this.hour;
            case SATURDAY:
            case SUNDAY:
                return true;
            default:
                return false;
        }
    }

    timeuntil() {
        const now = new Date();

        if (this.isBeerTime(now)) {
            this.render('<span class="glass">&#127866;</span>Beer time', true);
            return;
        }
        this.render(formatDuration(this.nextBeerTime(now) - now), false);
    }

    render(html, isBeerTime) {
        if (html === this.lastRendered) {
            return;
        }
        this.lastRendered = html;
        this.clock.innerHTML = html;
        this.clock.classList.toggle('beer-time', isBeerTime);
        this.clock.setAttribute('aria-label', isBeerTime
            ? 'It is beer time'
            : `${this.clock.textContent} until beer time`);
    }
}

/**
 * Whole days are kept out front rather than folded into the hours field, so a
 * Monday reads "4d 09:12:34" instead of a misleading "09:12:34".
 */
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / 86400);

    const clock = [hours, minutes, seconds]
        .map((n) => String(n).padStart(2, '0'))
        .join(':');

    return days > 0 ? `${days}d ${clock}` : clock;
}

window.customElements.define('count-down', CountDownClock);
