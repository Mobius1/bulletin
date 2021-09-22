/*!
 * Copyright (c) 2021 Karl Saunders (Mobius1)
 * Licensed under GPLv3
 * 
 * Version: 1.1.9
 *
 *  ! Edit it if you want, but don't re-release this without my permission, and never claim it to be yours !
*/

/*!
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const BulletinContainers = {};
const audio = document.createElement("audio");
let MaxQueue = 5
let styled = false;
let pinned = {};


/**
 *
 *
 * @class NotificationContainer
 */
class NotificationContainer {
    /**
     * Creates an instance of NotificationContainer.
     * @param {string} position
     * @memberof NotificationContainer
     */
    constructor(position) {
        this.container = document.getElementById("bulletin_container");
        this.el = document.createElement("div");
        this.el.classList.add("bulletin-notification-container", `notification-container-${position}`);
        this.notifications = [];
        this.offset = 0;
        this.running = false;
        this.spacing = 10;
        this.queue = 0;
        this.maxQueue = MaxQueue;
        this.canAdd = true;
    }

    /**
     *
     *
     * @param {object} notification
     * @memberof NotificationContainer
     */
    addNotification(notification) {

        if (!notification.pin_id) {
            this.queue++;
        }

        this.el.appendChild(notification.el);

        this.notifications.unshift(notification);

        if ( this.queue >= this.maxQueue ) {
            this.canAdd = false;
        }
    }

    /**
     *
     *
     * @param {object} notification
     * @memberof NotificationContainer
     */
    removeNotification(notification) {

        PostData("removed", {
            id: notification.id
        });

        this.el.removeChild(notification.el);

        const index = this.notifications.indexOf(notification);

        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        this.queue--;

        if (this.queue == 0) {
            this.canAdd = true;
        }
    }

    /**
     *
     *
     * @memberof NotificationContainer
     */
    add() {
        if (!this.container.contains(this.el)) {
            this.container.appendChild(this.el);
        }
    }

    /**
     *
     *
     * @memberof NotificationContainer
     */
    remove() {
        this.container.removeChild(this.el);
    }

    /**
     *
     *
     * @return {boolean} 
     * @memberof NotificationContainer
     */
    empty() {
        return this.el.children.length < 1;
    }
}

/**
 *
 *
 * @class Notification
 */
class Notification {
    constructor(cfg, id, message, interval, position, progress = false, theme = "default", exitAnim = "fadeOut", flash = false, pin_id = false, title, subject, icon) {
        this.cfg = cfg
        this.id = id;
        this.message = message;
        this.interval = interval;
        this.position = position;
        this.title = title;
        this.subject = subject;
        this.message = message;
        this.icon = icon;
        this.progress = progress;
        this.offset = 0;
        this.theme = theme;
        this.exitAnim = exitAnim;
        this.flash = flash;
        this.count = 1;

        if ( pin_id ) {
            this.pin_id = pin_id;
            pinned[pin_id] = this;
        }

        this.el = document.createElement("div");
        this.el.classList.add("bulletin-notification");
        this.el.classList.toggle("flash", this.flash);
        this.el.classList.toggle("pinned", this.pin_id != undefined);
        this.el.classList.add(this.theme);      

        this.init();
    }

    /**
     *
     *
     * @memberof Notification
     */
    show() {
        this.bottom = this.position.toLowerCase().includes("bottom");

        if (this.position in BulletinContainers) {
            this.container = BulletinContainers[this.position];
        } else {
            this.container = new NotificationContainer(this.position);
            BulletinContainers[this.position] = this.container;
        }

        if (!this.container.running && this.container.canAdd) {

            if (this.cfg.SoundFile && audio.paused) {
                audio.setAttribute("src", `audio/${this.cfg.SoundFile}`);
                audio.volume        = this.cfg.SoundVolume;
                audio.currentTime   = 0;
                audio.play();
            }

            this.container.add();

            this.container.addNotification(this);

            this.el.classList.add("active");

            if (this.bottom) {
                this.el.style.bottom = `${this.container.offset}px`;
            } else {
                this.el.style.top = `${this.container.offset}px`;
            }

            if (this.progress) {
                this.el.classList.add("progress");
                this.barEl.style.animationDuration = `${this.interval}ms`;
            }

            const r = this.el.getBoundingClientRect();

            for (const n of this.container.notifications) {
                if (n != this) {
                    if (this.bottom) {
                        n.moveUp(r.height, true);
                    } else {
                        n.moveDown(r.height, true);
                    }
                }
            }

            if ( !this.pin_id ) {
                this.hide();
            }
        } else {
            setTimeout(() => {
                this.show();
            }, 250);
        }
    }

    /**
     *
     *
     * @memberof Notification
     */
    hide() {
        const r = this.el.getBoundingClientRect();

        this.timeout = setTimeout(() => {
            this.el.classList.remove("active");
            this.el.classList.add("hiding");
            this.hiding = true;
            
            if ( this.exitAnim ) {
                this.el.style.animationName = this.exitAnim;
            }

            setTimeout(() => {
                const index = this.container.notifications.indexOf(this);

                for (var i = this.container.notifications.length - 1; i > index; i--) {
                    const n = this.container.notifications[i];

                    if (this.bottom) {
                        n.moveDown(r.height);
                    } else {
                        n.moveUp(r.height);
                    }
                }

                setTimeout(() => {
                    this.container.removeNotification(this);
                }, 100);
            }, this.cfg.AnimationTime);
        }, this.interval);
    }

    /**
     *
     *
     * @memberof Notification
     */
    unpin() {
        const r = this.el.getBoundingClientRect();

        this.el.classList.remove("active");
        this.el.classList.add("hiding");
        this.hiding = true;
        
        if ( this.exitAnim ) {
            this.el.style.animationName = this.exitAnim;
        }

        setTimeout(() => {
            const index = this.container.notifications.indexOf(this);

            for (var i = this.container.notifications.length - 1; i > index; i--) {
                const n = this.container.notifications[i];

                if (this.bottom) {
                    n.moveDown(r.height);
                } else {
                    n.moveUp(r.height);
                }
            }

            setTimeout(() => {
                this.container.removeNotification(this);

                delete pinned[this.pin_id];
            }, 100);
        }, this.cfg.AnimationTime);
    }

    /**
     *
     *
     * @memberof Notification
     */
    stack() {
        clearTimeout(this.timeout);

        const r = this.el.getBoundingClientRect();

        this.el.classList.remove("progress");
        void this.el.offsetWidth;
        this.el.classList.add("progress");

        this.count += 1;

        if ( this.cfg.ShowStackedCount ) {
            this.el.classList.add("stacked");
            this.el.dataset.count = this.count;
        }

        this.hide();
    }

    /**
     *
     *
     * @param {float} h
     * @param {boolean} [run=false]
     * @memberof Notification
     */
    moveUp(h, run = false) {
        const offset = h + this.container.spacing;

        if (this.bottom) {
            this.offset += offset;
        } else {
            this.offset -= offset;
        }
        this.el.style.transition = `transform 250ms ease 0ms`;
        this.el.style.transform = `translate3d(0px, ${-offset}px, 0px)`;

        this.container.running = run;

        setTimeout(() => {
            if (run) {
                this.container.running = false;
            }
            this.el.style.transition = ``;
            this.el.style.transform = ``;
            if (this.bottom) {
                this.el.style.bottom = `${this.container.offset + this.offset}px`;
            } else {
                this.el.style.top = `${this.container.offset + this.offset}px`;
            }
        }, 250);
    }

    /**
     *
     *
     * @param {float} h
     * @param {boolean} [run=false]
     * @memberof Notification
     */
    moveDown(h, run = false) {
        const offset = h + this.container.spacing;

        if (this.bottom) {
            this.offset -= offset;
        } else {
            this.offset += offset;
        }
        this.el.style.transition = `transform 250ms ease 0ms`;
        this.el.style.transform = `translate3d(0px, ${offset}px, 0px)`;

        this.container.running = run;

        setTimeout(() => {
            if (run) {
                this.container.running = false;
            }
            this.el.style.transition = ``;
            this.el.style.transform = ``;

            if (this.bottom) {
                this.el.style.bottom = `${this.container.offset + this.offset}px`;
            } else {
                this.el.style.top = `${this.container.offset + this.offset}px`;
            }
        }, 250);
    }

    /**
     *
     *
     * @param {string} message
     * @return {string} 
     * @memberof Notification
     */
    parseMessage(message) {
        const regexColor = /~([^h])~([^~]+)/g;	
        const regexBold = /~([h])~([^~]+)/g;	
        const regexStop = /~s~/g;	
        const regexLine = /\n/g;	
    
        message = message.replace(regexColor, "<span class='$1'>$2</span>").replace(regexBold, "<span class='$1'>$2</span>").replace(regexStop, "").replace(regexLine, "<br />");
			
        return message;
    }

    update(options) {
        if ( this.type == 'advanced' ) {
            if ( options.hasOwnProperty('title') ) {
                this.title = this.parseMessage(options.title);
            }

            if ( options.hasOwnProperty('subject') ) {
                this.subject = this.parseMessage(options.subject);
            }

            if ( options.hasOwnProperty('message') ) {
                this.message = this.parseMessage(options.message);
            }

            if ( options.hasOwnProperty('icon') ) {
                this.iconEl.innerHTML = `<img src="images/${options.icon}" />`;
            }

            this.titleEl.innerHTML = this.title;
            this.subjectEl.innerHTML = this.subject;
            this.messageEl.innerHTML = this.message;
        } else if ( this.type == 'standard' ) {
            if ( options.hasOwnProperty('message') ) {
                this.message = this.parseMessage(options.message);
            }

            this.el.innerHTML = this.message;  
        }

        if ( options.hasOwnProperty('theme') ) {
            this.el.classList.remove(this.theme);

            this.theme = options.theme;
            this.el.classList.add(this.theme);
        }

        if ( options.hasOwnProperty('flash') && options.flash == true ) {
            this.el.classList.remove("flash");

            setTimeout(() => {
                this.el.classList.add("flash");
            }, 1);
        }

        this.rearrange(this.el.getBoundingClientRect().height);
    }

    rearrange(h) {
        let posY = 0;

        for (const n of this.container.notifications) {
            const rn = n.el.getBoundingClientRect();
            const offset = (rn.height - h);

            n.offset -= offset;

            if ( this.bottom ) {
                n.el.style.bottom = `${posY}px`;
            } else {
                n.el.style.top = `${posY}px`;
            }

            posY += rn.height + this.container.spacing;
        }
    }
}

/**
 *
 *
 * @class StandardNotification
 * @extends {Notification}
 */
class StandardNotification extends Notification {
    /**
     * Creates an instance of StandardNotification.
     * @param {object} cfg
     * @param {string} id
     * @param {string} message
     * @param {integer} interval
     * @param {string} position
     * @param {boolean} [progress=false]
     * @param {string} [theme="default"]
     * @param {string} [exitAnim="fadeOut"]
     * @param {boolean} [flash=false]
     * @param {boolean} [pin_id=false]
     * @memberof StandardNotification
     */
    constructor(cfg, id, message, interval, position, progress = false, theme = "default", exitAnim = "fadeOut", flash = false, pin_id = false) {
        super(cfg, id, message, interval, position, progress, theme, exitAnim, flash, pin_id);
    }

    /**
     *
     *
     * @memberof StandardNotification
     */
    init() {
        this.type = 'standard';
        this.message = this.parseMessage(this.message);
        this.el.innerHTML = this.message;     
        
        if (this.progress) {
            this.el.classList.add("with-progress");
            this.progressEl = document.createElement("div");
            this.progressEl.classList.add("notification-progress");

            this.barEl = document.createElement("div");
            this.barEl.classList.add("notification-bar");

            this.progressEl.appendChild(this.barEl);

            this.el.appendChild(this.progressEl);
        }  
    }
}

/**
 *
 *
 * @class AdvancedNotification
 * @extends {Notification}
 */
class AdvancedNotification extends Notification {
    /**
     * Creates an instance of AdvancedNotification.
     * @param {object} cfg
     * @param {string} id
     * @param {string} message
     * @param {string} title
     * @param {string} subject
     * @param {string} icon
     * @param {integer} interval
     * @param {string} position
     * @param {boolean} [progress=false]
     * @param {string} [theme="default"]
     * @param {string} [exitAnim="fadeOut"]
     * @param {boolean} [flash=false]
     * @param {boolean} [pin_id=false]
     * @memberof AdvancedNotification
     */
    constructor(cfg, id, message, title, subject, icon, interval, position, progress = false, theme = "default", exitAnim = "fadeOut", flash = false, pin_id = false) {
        super(cfg, id, message, interval, position, progress, theme, exitAnim, flash, pin_id, title, subject, icon);
    }

    /**
     *
     *
     * @memberof AdvancedNotification
     */
    init() {

        this.type = 'advanced';
        this.title = this.parseMessage(this.title);
        this.subject = this.parseMessage(this.subject);
        this.message = this.parseMessage(this.message);

        this.headerEl = document.createElement("div");
        this.headerEl.classList.add("notification-header");

        this.iconEl = document.createElement("div");
        this.iconEl.classList.add("notification-icon");

        this.titleEl = document.createElement("div");
        this.titleEl.classList.add("notification-title");

        this.subjectEl = document.createElement("div");
        this.subjectEl.classList.add("notification-subject");

        this.messageEl = document.createElement("div");
        this.messageEl.classList.add("notification-message");

        this.iconEl.innerHTML = `<img src="images/${this.icon}" />`;
        this.titleEl.innerHTML = this.title;
        this.subjectEl.innerHTML = this.subject;
        this.messageEl.innerHTML = this.message;

        this.headerEl.appendChild(this.iconEl);
        this.headerEl.appendChild(this.titleEl);
        this.headerEl.appendChild(this.subjectEl);
        this.el.appendChild(this.headerEl);
        this.el.appendChild(this.messageEl);

        if (this.progress) {
            this.el.classList.add("with-progress");
            this.progressEl = document.createElement("div");
            this.progressEl.classList.add("notification-progress");

            this.barEl = document.createElement("div");
            this.barEl.classList.add("notification-bar");

            this.progressEl.appendChild(this.barEl);

            this.el.appendChild(this.progressEl);
        }  
    }
}

/**
 *
 *
 * @param {Event} e
 */
const onData = function(e) {
    const data = e.data;
    if (data.type) {

        if ( !styled ) {
            let css = `
            .animate__animated {
                -webkit-animation-duration: ${data.config.AnimationTime};
                animation-duration: ${data.config.AnimationTime};
            }

            .bulletin-notification.active {
                opacity: 0;
                animation: fadeIn ${data.config.AnimationTime}ms ease 0ms forwards;
            }

            .bulletin-notification.active.flash {
                opacity: 1;
                animation-name: ${data.config.FlashType};
            }            
            
            .bulletin-notification.hiding {
                opacity: 1;
                animation: ${data.config.AnimationOut} ${data.config.AnimationTime}ms ease 0ms forwards;
            }`;

            if ( data.config.FlashType == "flash" ) {
                css += `
                    .bulletin-notification.active.flash {
                        animation-iteration-count: ${data.config.FlashCount};
                    }                  
                `;
            }

            document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

            styled = true
        }

        if (data.type == "standard") {
            MaxQueue = data.config.Queue;

            if ( data.duplicate && data.config.Stacking ) {
                stackDuplicate(data)
            } else {
                new StandardNotification(data.config, data.id, data.message, data.timeout, data.position, data.progress, data.theme, data.exitAnim, data.flash, data.pin_id).show();
            }
        } else if (data.type == "advanced") {
            MaxQueue = data.config.Queue;

            if ( data.duplicate && data.config.Stacking ) {
                stackDuplicate(data)
            } else {          
                new AdvancedNotification(data.config, data.id, data.message, data.title, data.subject, data.icon, data.timeout, data.position, data.progress, data.theme, data.exitAnim, data.flash, data.pin_id).show();
            }
        } else if (data.type == "unpin") {
            if ( Array.isArray(data.pin_id) ) { // array of pin ids
                for ( const item of data.pin_id ) {
                    if ( pinned.hasOwnProperty(item) ) {
                        pinned[item].unpin();
                    }
                }
            } else if ( typeof(data.pin_id) == 'string' ) {  // unpin single
                if ( pinned.hasOwnProperty(data.pin_id) ) {
                    pinned[data.pin_id].unpin();
                }
            } else {
                for ( let id in pinned ) { // unpin all
                    pinned[id].unpin();
                }
            }
        } else if (data.type == "update_pinned") {
            if ( pinned.hasOwnProperty(data.pin_id) ) {
                pinned[data.pin_id].update(data.options)
            }
        }
    }
};

/**
 *
 *
 * @param {table} data
 */
function stackDuplicate(data) {
    for ( const position in BulletinContainers ) {
        for ( const notification of BulletinContainers[position].notifications ) {
            if ( notification.id == data.id ) {
                if ( notification.hiding ) {
                    if (data.type == "standard") {
                        new StandardNotification(data.config, data.id, data.message, data.timeout, data.position, data.progress, data.theme, data.flash, data.pin_id).show();
                    } else if (data.type == "advanced") {
                        new AdvancedNotification(data.config, data.id, data.message, data.title, data.subject, data.icon, data.timeout, data.position, data.progress, data.theme, data.flash, data.pin_id).show();
                    }
                } else {
                    notification.stack();
                }

                break;
            }
        }
    }
}

/**
 *
 *
 * @param {string} [type=""]
 * @param {*} [data={}]
 */
function PostData(type = "", data = {}) {
    fetch(`https://${GetParentResourceName()}/nui_${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data)
    }).then(resp => resp.json()).then(resp => resp).catch(error => console.log('BULLETIN FETCH ERROR! ' + error.message));    
}

window.onload = function(e) {
    window.addEventListener('message', onData);
};