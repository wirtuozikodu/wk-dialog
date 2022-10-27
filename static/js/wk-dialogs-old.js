"use strict";

window.wkDialogs = window.wkDialogs || {};

    // array of active dialogs (to close them in order)
window.wkDialogs.activeDialogs = [];


// event bus

function WkDialogsEventBus() {
    this._events = {};

    this.on = (event_name, handler) => {
        this.registerEvent(event_name, handler, "on");
    };
    this.once = (event_name, handler) => {
        this.registerEvent(event_name, handler, "once");
    };

    this.registerEvent = (event_name, handler, t) => {
        if (this._events[event_name] == undefined) this._events[event_name] = [];
        this._events[event_name].push({
            t: t,
            f: handler
        });
    };

    this.off = (event_name, handler) => {
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

    this.emit = (event_name, payload) => {
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

function WkDialog(opts) {


    // setup

    this.el = opts.el;
    this.el_id = opts.el_id;
    this.value = ( opts.value && opts.value == true ? true : false );
    this.is_persistent = ( opts.is_persistent && opts.is_persistent == true ? true : false );
    this.hide_modal = ( opts.hide_modal && opts.hide_modal == true ? true : false );
    this.no_click_animation = ( opts.no_click_animation && opts.no_click_animation == true ? true : false );
    this.allow_body_scroll = ( opts.allow_body_scroll && opts.allow_body_scroll == true ? true : false );


    // children

    this.modal = document.querySelector(
        '.wk-dialog-modal[data-dialog="' + this.el_id + '"]'
    );
    this.window = document.querySelector(
        '.wk-dialog-window[data-dialog="' + this.el_id + '"]'
    );


    // events

    this.eventBus = new WkDialogsEventBus();

    this.on = (event_name, handler) => {
        return this.eventBus.on(event_name, handler);
    };
    this.once = (event_name, handler) => {
        return this.eventBus.once(event_name, handler);
    };
    this.off = (event_name, handler) => {
        return this.eventBus.off(event_name, handler);
    };


    // external methods

        // open/close
    this.getValue = () => {
        return this.value;
    }
    this.setValue = (v, triggerNode) => {
        if(v !== true && v !== false) return;

        this.value = v;

        if(this.value == true) {
            this.eventBus.emit('open', {
                dialog: this,
                triggerNode: (triggerNode ? triggerNode : null)
            });

            if(!this.allow_body_scroll) {
                this.preventBodyScroll();
            }
            this.setOnTop();

            if(this.hide_modal) {
                this.modal.classList.add('wk-dialog-modal--invisible');
            } else {
                this.modal.classList.remove('wk-dialog-modal--invisible');
            }

            this.el.style.display = 'block';
            setTimeout(() => {
                this.modal.style.opacity = '1';
                this.window.style.transform = 'scale(1)';
            }, 50);

            return;
        } else {
            this.eventBus.emit('close', {
                dialog: this,
                triggerNode: (triggerNode ? triggerNode : null)
            });

            this.allowBodyScroll();
            this.setOnBottom();

            this.modal.style.opacity = '0';
            this.window.style.transform = 'scale(.95)';
            setTimeout(() => {
                this.el.style.display = 'none';
                this.el.style.zIndex = '0';
            }, 250);

            return;
        }
    }

        // CSS dialog max-width
    this.getMaxWidth = () => {
        return this.window.style.maxWidth;
    }
    this.setMaxWidth = (v) => {
        if(!isNaN(v)) {
            this.window.style.maxWidth = v + 'px';
            return;
        } else {
            this.window.style.maxWidth = v;
            return;
        }
    }

        // persistent state for this.cancel()
    this.getPersistent = () => {
        return this.is_persistent;
    }
    this.setPersistent = (v) => {
        if(v !== true && v !== false) return;

        this.is_persistent = v;
        return;
    }

        // modal visibility
    this.getHideModal = () => {
        return this.hide_modal;
    }
    this.setHideModal = (v) => {
        if(v !== true && v !== false) return;

        this.hide_modal = v;
        return;
    }

        // cancel animation visibility
    this.getNoClickAnimation = () => {
        return this.no_click_animation;
    }
    this.setNoClickAnimation = (v) => {
        if(v !== true && v !== false) return;

        this.no_click_animation = v;

        if(this.no_click_animation === true) this.window.classList.add('wk-dialog-window--no-shake');
        if(this.no_click_animation === false) this.window.classList.remove('wk-dialog-window--no-shake');

        return;
    }

        // state of scroll blocking feature
    this.getAllowBodyScroll = () => {
        return this.allow_body_scroll;
    }
    this.setAllowBodyScroll = (v) => {
        if(v !== true && v !== false) return;

        this.allow_body_scroll = v;

        if(this.value === true) {
            if(this.allow_body_scroll === true) this.allowBodyScroll();
            if(this.allow_body_scroll === false) this.preventBodyScroll();
        }

        return;
    }


    // internal methods

        // cancel ("soft close")
    this.cancel = () => {
        if(this.is_persistent) {
            this.eventBus.emit('cancel', {
                dialog: this
            });

            this.window.style.animation = 'shakeWindow .2s ease';
            setTimeout(() => {
                this.window.style.animation = 'none';
                return;
            }, 200)
        } else {
            this.setValue(false);
            return;
        }
    }

    this.preventBodyScroll = () => {
        document.body.style.overflowY = 'hidden';
        return;
    }
    this.allowBodyScroll = () => {
        if(wkDialogs.activeDialogs.length > 1) return;

        document.body.style.overflowY = 'auto';
        return;
    }

    this.setOnTop = () => {
        document.body.appendChild(document.getElementById(this.el_id));
        this.el.style.zIndex = getMaxZIndex() + 1;
        wkDialogs.activeDialogs.push(this.el_id);

        return;
    }
    this.setOnBottom = () => {
        let closingIndex = wkDialogs.activeDialogs.indexOf(this.el_id);
        if(closingIndex !== -1) {
            wkDialogs.activeDialogs.splice(closingIndex, 1);
        }

        return;
    }


    // mounting 

        // opening if initial value=true
    if(this.value == true) {
        return this.setValue(true);
    }

}

    // global event listeners for core functions
window.addEventListener('DOMContentLoaded', () => {

        // binded DOM elements
    document.body.addEventListener('click', function(e) {;
            // elements opening dialog
        if(e.target.dataset.openDialog && wkDialogs[e.target.dataset.openDialog]) {
                // opening the dialog
            wkDialogs[e.target.dataset.openDialog].setValue(true, e.target);
            return;
        }
            // elements closing dialog
        else if(e.target.dataset.closeDialog && wkDialogs[e.target.dataset.closeDialog]) {
                // closing the dialog
            wkDialogs[e.target.dataset.closeDialog].setValue(false, e.target);
            return;
        }
            // cancel feature
        else if(e.target.classList.contains('wk-dialog-modal')) {
                // cancel attempt
            wkDialogs[e.target.dataset.dialog].cancel();
            return;
        }
    })
    
        // global ESC function triggering cancel() method
    document.addEventListener('keydown', function(e){
        if(e.key !== "Escape") return;
        if(window.wkDialogs.activeDialogs.length === 0) return;
        
        window.wkDialogs[wkDialogs.activeDialogs[wkDialogs.activeDialogs.length - 1]].cancel();
    
        return;
    });
})


    // getting the highest z-index of element (body by default)
function getMaxZIndex(element) {
    let children_array = (element ? element.querySelectorAll('*') : document.querySelectorAll('body *'));

    return Math.max(
        ...Array.from(children_array, el =>
            parseFloat(window.getComputedStyle(el).zIndex),
        ).filter(zIndex => !Number.isNaN(zIndex)),
        0,
    );
}