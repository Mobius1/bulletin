/*!
 * Copyright (c) 2021 Karl Saunders (Mobius1)
 * Licensed under GPLv3
 * 
 * Version: 1.1.4
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


class NotificationContainer {
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

    addNotification(notification) {
        this.queue++;
        this.el.appendChild(notification.el);

        this.notifications.unshift(notification);

        if ( this.queue >= this.maxQueue ) {
            this.canAdd = false;
        }
    }

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

    add() {
        if (!this.container.contains(this.el)) {
            this.container.appendChild(this.el);
        }
    }

    remove() {
        this.container.removeChild(this.el);
    }

    empty() {
        return this.el.children.length < 1;
    }
}

class Notification {
    show(stack) {
        this.bottom = this.position.includes("bottom");

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

            this.hide();
        } else {
            setTimeout(() => {
                this.show();
            }, 250);
        }
    }

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

    parseMessage(message, count = 4) {
        const regexColor = /~([^h])~([^~]+)/g;	
        const regexBold = /~([h])~([^~]+)/g;	
        const regexStop = /~s~/g;	
        const regexLine = /\n/g;	
    
        message = message.replace(regexColor, "<span class='$1'>$2</span>");
        message = message.replace(regexBold, "<span class='$1'>$2</span>");
        message = message.replace(regexStop, "");
        message = message.replace(regexLine, "<br />");
			
        return message;
    }
}

class StandardNotification extends Notification {
    constructor(cfg, id, message, interval, position, progress = false, theme = "default", exitAnim = "fadeOut", flash = false) {

        super();

        this.cfg = cfg;
        this.id = id;
        this.message = message;
        this.interval = interval;
        this.position = position;
        this.message = message;
        this.progress = progress;
        this.offset = 0;
        this.theme = theme;
        this.exitAnim = exitAnim;
        this.flash = flash;
        this.count = 1;

        this.init();
    }

    init() {
        this.el = document.createElement("div");
        this.el.classList.add("bulletin-notification");
        this.el.classList.toggle("flash", this.flash);

        this.message = this.parseMessage(this.message);
        this.el.innerHTML = this.message;

        if ( this.theme ) {
            this.el.classList.add(this.theme);
        }        

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

class AdvancedNotification extends Notification {
    constructor(cfg, id, message, title, subject, icon, interval, position, progress = false, theme = "default", exitAnim = "fadeOut", flash = false) {

        super();

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

        this.init();
    }

    init() {

        this.title = this.parseMessage(this.title);
        this.subject = this.parseMessage(this.subject);
        this.message = this.parseMessage(this.message);

        this.el = document.createElement("div");
        this.el.classList.add("bulletin-notification");
        this.el.classList.toggle("flash", this.flash);

        if ( this.theme ) {
            this.el.classList.add(this.theme);
        }

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

const onData = function(e) {
    const data = e.data;
    if (data.type) {

        if ( !styled ) {
            const css = `
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
                animation: flash 400ms linear infinite;
                animation-iteration-count: ${data.config.FlashCount};
              }            
            
            .bulletin-notification.hiding {
                opacity: 1;
                animation: ${data.config.AnimationOut} ${data.config.AnimationTime}ms ease 0ms forwards;
            }`;

            document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

            styled = true
        }

        MaxQueue = data.config.Queue;

        if (data.type == "standard") {
            if ( data.duplicate && data.config.Stacking ) {
                stackDuplicate(data)
            } else {
                new StandardNotification(data.config, data.id, data.message, data.timeout, data.position, data.progress, data.theme, data.exitAnim, data.flash).show();
            }
        } else if (data.type == "advanced") {
            if ( data.duplicate && data.config.Stacking ) {
                stackDuplicate(data)
            } else {          
                new AdvancedNotification(data.config, data.id, data.message, data.title, data.subject, data.icon, data.timeout, data.position, data.progress, data.theme, data.exitAnim, data.flash).show();
            }
        }
    }
};

function stackDuplicate(data) {
    for ( const position in BulletinContainers ) {
        for ( const notification of BulletinContainers[position].notifications ) {
            if ( notification.id == data.id ) {
                if ( notification.hiding ) {
                    if (data.type == "standard") {
                        new StandardNotification(data.config, data.id, data.message, data.timeout, data.position, data.progress, data.theme, data.flash).show();
                    } else if (data.type == "advanced") {
                        new AdvancedNotification(data.config, data.id, data.message, data.title, data.subject, data.icon, data.timeout, data.position, data.progress, data.theme, data.flash).show();
                    }
                } else {
                    notification.stack();
                }

                break;
            }
        }
    }
}

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