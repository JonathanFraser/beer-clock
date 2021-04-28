
class CountDownClock extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        var g = document.createElement('div');
        g.setAttribute("id", "countdown");
        this._shadowRoot.appendChild(g);
        this.clock = this._shadowRoot.getElementById("countdown");
        var sethour = this.getAttribute("hour");

    }

    static get observedAttributes() {
        return [ 'hour' ];
    }

    attributeChangedCallback(name, oldValue, newValue) { }

    connectedCallback() {

        if (!this.hasAttribute('hour')) {
            this.setAttribute('hour', 17);
        }
        this.timerIndex = setInterval(this.timeuntil.bind(this), 400);
    }

    disconnectedCallback() {
        if (this.timerIndex) {
            clearInterval(this.timerIndex);
        }
    }

    timeuntil() {
        var x = new Date();
        var day = x.getDay();
        var daysUntilFriday = (12 - day) % 7;
        x.setDate(daysUntilFriday + x.getDate());
        var tgt = +this.getAttribute('hour');
        x.setHours(tgt, 0, 0, 0);
        var duration = x - new Date();
        if (duration < 0 || day === 0 || day === 6) {
            this.clock.innerHTML = "<img src='https://yellowdogbeer.com/yellowpress/wp-content/uploads/2019/11/HIGH-5-RENDER_72DPI.png'></img>";
            return;
        }
        var dur = new Date(duration);
        this.clock.innerHTML = dur.toISOString().substr(11, 8);
    }
}

window.customElements.define('count-down', CountDownClock);
