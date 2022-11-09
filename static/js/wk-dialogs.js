"use strict";

window.wkDialogs = window.wkDialogs || {};

// array of active dialogs (to close them in order)
window.wkDialogs.activeDialogs = [];

// event bus
class WkDialogsEventBus {
    constructor() {
        this._events = {};
    }

    on = (event_name, handler) => {
        this.registerEvent(event_name, handler, "on");
    };
    once = (event_name, handler) => {
        this.registerEvent(event_name, handler, "once");
    };

    registerEvent = (event_name, handler, t) => {
        if (this._events[event_name] == undefined) this._events[event_name] = [];
        this._events[event_name].push({
            t: t,
            f: handler
        });
    };

    off = (event_name, handler) => {
        if (this._events[event_name] == undefined) return;
        var ix = -1;
        var hts = handler.toString();
        for (var i = 0; i < this._events[event_name].length; i++) {
            if (hts == this._events[event_name][i].f.toString()) {
                ix = i;
                break;
            }
        }
        if (ix !== -1) this._events[event_name].splice(ix, 1);
    };

    emit = (event_name, payload) => {
        if (this._events[event_name] == undefined) return;
        var todel = [];
        for (var i = 0; i < this._events[event_name].length; i++) {
            this._events[event_name][i].f(payload);
            if (this._events[event_name][i].t == "once") {
                todel.push(i);
            }
        }
        for (var i = todel.length - 1; i >= 0; i--) {
            this._events[event_name].splice(todel[i], 1);
        }
    };
}

// universal class - WkDialog
class WkDialog extends WkDialogsEventBus {
    constructor(opts) {
        super();

        // ELEMENTS
        this._el = opts.el;
        this._el_id = opts.el_id;
        this._modal_el = document.querySelector('.wk-dialog-modal[data-dialog="' + this._el_id + '"]');
        this._window_el = document.querySelector('.wk-dialog-window[data-dialog="' + this._el_id + '"]');

        // STATE/CONFIG VARIABLES
        this._value = opts.value && opts.value == true ? true : false;
        this._is_persistent = opts.is_persistent && opts.is_persistent == true ? true : false;
        this._hide_modal = opts.hide_modal && opts.hide_modal == true ? true : false;
        this._no_click_animation = opts.no_click_animation && opts.no_click_animation == true ? true : false;
        this._allow_body_scroll = opts.allow_body_scroll && opts.allow_body_scroll == true ? true : false;

        if (this._value === true) {
            this.value = true;
        }
    }

    // GETTERS
    get el() {
        return this._el;
    }
    get el_id() {
        return this._el_id;
    }
    get modal_el() {
        return this._modal_el;
    }
    get window_el() {
        return this._window_el;
    }
    get value() {
        return this._value;
    }
    get is_persistent() {
        return this._is_persistent;
    }
    get hide_modal() {
        return this._hide_modal;
    }
    get no_click_animation() {
        return this._no_click_animation;
    }
    get allow_body_scroll() {
        return this._allow_body_scroll;
    }
    get max_width() {
        return this._window_el.style.maxWidth;
    }

    // SETTERS
    set value(v) {
        if (v !== true) v !== false;

        if (v === true && this._value !== true) {
            this.emit("open:before", {
                dialog: this
            });

            this._value = true;

            this.emit("open", {
                dialog: this
            });

            if (!this._allow_body_scroll) {
                this.preventBodyScroll();
            }

            if (this._hide_modal) {
                this._modal_el.classList.add("wk-dialog-modal--invisible");
            } else {
                this._modal_el.classList.remove("wk-dialog-modal--invisible");
            }

            this.setOnTop();
            this._el.style.display = "block";
            setTimeout(() => {
                this._modal_el.style.opacity = "1";
                this._window_el.style.transform = "scale(1)";
            }, 50);

            this.emit("open:after", {
                dialog: this
            });
        } else if (this._value !== false) {
            this.emit("close:before", {
                dialog: this
            });

            this._value = false;

            this.emit("close", {
                dialog: this
            });

            this.allowBodyScroll();

            this.setOnBottom();
            this._modal_el.style.opacity = "0";
            this._window_el.style.transform = "scale(.95)";
            setTimeout(() => {
                this._el.style.display = "none";
                this._el.style.zIndex = "0";
            }, 250);

            this.emit("close:after", {
                dialog: this
            });
        }
    }
    set is_persistent(v) {
        if (v !== true && v !== false) return;

        this._is_persistent = v;
    }
    set hide_modal(v) {
        if (v !== true && v !== false) return;

        this._hide_modal = v;
    }
    set no_click_animation(v) {
        if (v !== true && v !== false) return;

        this._no_click_animation = v;

        if (this._no_click_animation === true) this._window_el.classList.add("wk-dialog-window--no-shake");
        if (this._no_click_animation === false) this._window_el.classList.remove("wk-dialog-window--no-shake");
    }
    set allow_body_scroll(v) {
        if (v !== true && v !== false) return;

        this._allow_body_scroll = v;

        if (this.value === true) {
            if (this._allow_body_scroll === true) this.allowBodyScroll();
            if (this._allow_body_scroll === false) this.preventBodyScroll();
        }
    }
    set max_width(v) {
        if (!isNaN(v)) {
            this._window_el.style.maxWidth = v + "px";
        } else {
            this._window_el.style.maxWidth = v;
        }
    }

    // METHODS

    // cancel ("soft close")
    cancel() {
        if (this.is_persistent) {
            this.emit("cancel", {
                dialog: this
            });

            this._window_el.style.animation = "shakeWindow .2s ease";
            setTimeout(() => {
                this._window_el.style.animation = "none";
                return;
            }, 200);
        } else {
            this.value = false;
            return;
        }
    }

    preventBodyScroll() {
        document.body.style.overflowY = "hidden";
        return;
    }
    allowBodyScroll() {
        if (wkDialogs.activeDialogs.length > 1) return;

        document.body.style.overflowY = "auto";
        return;
    }

    setOnTop() {
        document.body.appendChild(document.getElementById(this._el_id));
        this._el.style.zIndex = getMaxZIndex() + 1;
        wkDialogs.activeDialogs.push(this._el_id);

        return;
    }
    setOnBottom() {
        let closingIndex = wkDialogs.activeDialogs.indexOf(this._el_id);
        if (closingIndex !== -1) {
            wkDialogs.activeDialogs.splice(closingIndex, 1);
        }

        return;
    }
}

// global event listeners for core functions
window.addEventListener("DOMContentLoaded", () => {
    // binded DOM elements
    document.body.addEventListener("click", function (e) {
        // elements opening dialog
        if (e.target.dataset.openDialog && wkDialogs[e.target.dataset.openDialog]) {
            // opening the dialog
            wkDialogs[e.target.dataset.openDialog].value = true;
            return;
        }
        // elements closing dialog
        else if (e.target.dataset.closeDialog && wkDialogs[e.target.dataset.closeDialog]) {
            // closing the dialog
            wkDialogs[e.target.dataset.closeDialog].value = false;
            return;
        }
        // cancel feature
        else if (e.target.classList.contains("wk-dialog-modal")) {
            // cancel attempt
            wkDialogs[e.target.dataset.dialog].cancel();
            return;
        }
    });

    // global ESC function triggering cancel() method
    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        if (window.wkDialogs.activeDialogs.length === 0) return;

        window.wkDialogs[wkDialogs.activeDialogs[wkDialogs.activeDialogs.length - 1]].cancel();

        return;
    });
});

// getting the highest z-index of element (body by default)
function getMaxZIndex(element) {
    let children_array = element ? element.querySelectorAll("*") : document.querySelectorAll("body *");

    return Math.max(
        ...Array.from(children_array, el => parseFloat(window.getComputedStyle(el).zIndex)).filter(zIndex => !Number.isNaN(zIndex)),
        0
    );
}
