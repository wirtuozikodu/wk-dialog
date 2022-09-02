"use strict";

window.wkDialogs = window.wkDialogs || {};

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


    // child elements

    this.modal = document.querySelector(
        '.wk-dialog-modal[data-dialog="' + this.el_id + '"]'
    );
    this.popup = document.querySelector(
        '.wk-dialog-popup[data-dialog="' + this.el_id + '"]'
    );


    // event bus

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

    this.getValue = () => {
        return this.value;
    }
    this.setValue = (v) => {
        if(v !== true && v !== false) return;

        this.value = v;

        if(this.value == true) {
            this.eventBus.emit('open', {
                dialog: this
            });

            document.body.appendChild(document.getElementById(this.el_id));
            this.el.style.zIndex = getMaxZIndex() + 1;
            wkDialogs.activeDialogs.push(this.el_id);

            if(this.hide_modal) {
                this.modal.classList.add('wk-dialog-modal--invisible');
            } else {
                this.modal.classList.remove('wk-dialog-modal--invisible');
            }

            this.el.style.display = 'block';
            setTimeout(() => {
                this.modal.style.opacity = '1';
                this.popup.style.transform = 'scale(1)';
            }, 50);

            return;
        } else {
            this.eventBus.emit('close', {
                dialog: this
            });

            let closingIndex = wkDialogs.activeDialogs.indexOf(this.el_id);
            if(closingIndex !== -1) {
                wkDialogs.activeDialogs.splice(closingIndex, 1);
            }

            this.modal.style.opacity = '0';
            this.popup.style.transform = 'scale(.95)';
            setTimeout(() => {
                this.el.style.display = 'none';
            }, 250);

            return;
        }
    }

    this.getMaxWidth = () => {
        return this.popup.style.maxWidth;
    }
    this.setMaxWidth = (v) => {
        if(!isNaN(v)) {
            this.popup.style.maxWidth = v + 'px';
            return;
        } else {
            this.popup.style.maxWidth = v;
            return;
        }
    }

    this.getPersistent = () => {
        return this.is_persistent;
    }
    this.setPersistent = (v) => {
        if(v !== true && v !== false) return;

        this.is_persistent = v;
        return;
    }

    this.getHideModal = () => {
        return this.hide_modal;
    }
    this.setHideModal = (v) => {
        if(v !== true && v !== false) return;

        this.hide_modal = v;
        return;
    }

    this.getNoClickAnimation = () => {
        return this.no_click_animation;
    }
    this.setNoClickAnimation = (v) => {
        if(v !== true && v !== false) return;

        this.no_click_animation = v;

        if(this.no_click_animation === true) this.popup.classList.add('wk-dialog-popup--no-shake');
        if(this.no_click_animation === false) this.popup.classList.remove('wk-dialog-popup--no-shake');

        return;
    }


    // internal methods

    this.softClose = () => {
        if(this.is_persistent) {
            this.eventBus.emit('closeAttempt', {
                dialog: this
            });

            this.popup.style.animation = 'shakePopup .2s ease';
            setTimeout(() => {
                this.popup.style.animation = 'none';
                return;
            }, 200)
        } else {
            this.setValue(false);
            return;
        }
    }


    // mounting
    if(this.value == true) {
        return this.setValue(true);
    }

}

window.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function(e) {;
        if(e.target.dataset.openDialog && wkDialogs[e.target.dataset.openDialog]) {
            wkDialogs[e.target.dataset.openDialog].setValue(true);
            return;
        } else if(e.target.dataset.closeDialog && wkDialogs[e.target.dataset.closeDialog]) {
            wkDialogs[e.target.dataset.closeDialog].setValue(false);
            return;
        } else if(e.target.classList.contains('wk-dialog-modal')) {
            wkDialogs[e.target.dataset.dialog].softClose();
            return;
        }
    })
    
    document.addEventListener('keydown', function(e){
        if(e.key !== "Escape") return;
        if(window.wkDialogs.activeDialogs.length === 0) return;
        
        window.wkDialogs[wkDialogs.activeDialogs[wkDialogs.activeDialogs.length - 1]].softClose();
    
        return;
    });
})



function getMaxZIndex() {
    return Math.max(
        ...Array.from(document.querySelectorAll('body *'), el =>
            parseFloat(window.getComputedStyle(el).zIndex),
        ).filter(zIndex => !Number.isNaN(zIndex)),
        0,
    );
}