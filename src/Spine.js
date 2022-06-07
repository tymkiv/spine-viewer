// import { globalTicker, dispatcher } from "instances";
import * as PIXI from "pixi.js";
// import "pixi-spine";
import "pixi-spine_v3.8";
import gsap from "gsap";

const isObject = a => {
    return a && {}.toString.call(a) === "[object Object]";
};
const isFunction = a => {
    return a && {}.toString.call(a) === "[object Function]";
};

class Spine extends PIXI.spine.Spine {
    constructor(spineData) {
        super(spineData);
        this.autoUpdate = false;
        this.update(0);

        // custom autoplay mode
        this._currentChain = [];
        this._tickerSubscriber = null;
        this._speed = 1;
        // this._pauseSubscriber = null;
        this._prevPerformance = performance.now();
    }

    get animations() {
        return this.spineData.animations.reduce((acc, item) => {
            acc[item.name] = item.duration;
            return acc;
        }, {});
    }

    setAnimation(name, loop = false) {
        this.state.clearTracks();
        this.skeleton.setToSetupPose();
        this.state.setAnimation(0, name, loop);
        this.autoUpdate = false;
        return this;
    }

    hackBySlotName(slotName, displayObject, removeChildren = false) {
        const slotIndex = this.skeleton.findSlotIndex(slotName);
        const slot = this.skeleton.slots[slotIndex];

        if (slot.currentSprite) {
            slot.currentSprite.texture = void (0);
            removeChildren && slot.currentSprite.removeChildren();
            slot.currentSprite.addChild(displayObject);
        } else if (slot.currentMesh) {
            if (displayObject instanceof PIXI.Texture) {
                this.hackTextureBySlotName(slotName, displayObject);
            } else {
                console.warn("Only Texture must be added when the current slot is Mesh");
            }
        }
    }

    fixMaskPolygon(parent = this) {
        parent.children.forEach(p => {
            if (p.mask) {
                if (p.mask instanceof PIXI.Graphics) {
                    let graphics = p.mask;
                    [...graphics.graphicsData].forEach(data => {
                        if (data.shape instanceof PIXI.Polygon) {
                            graphics.drawPolygon(data.shape.points);
                        }
                    });
                }
            }
            if (p.children && p.children.length > 0) {
                this.fixMaskPolygon(p);
            }
        });
    }

    get time() {
        const track = this.state.tracks[0];
        return track && track.trackTime || 0;
    }

    set time(value) {
        const track = this.state.tracks[0];
        if (track) {
            track.trackTime = value;
            this.update(1 / 60);
        }
    }

    get textures() {
        const result = [];
        deeper(this);

        function deeper(child) {
            if (child instanceof PIXI.spine.SpineSprite || child instanceof PIXI.spine.SpineMesh) {
                result.push(child._texture);
            } else if (child.children) {
                child.children.forEach(ch => {
                    deeper(ch);
                });
            }
        }
        return result;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////// AUTOPLAY MODE ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    setMix(animationFrom, animationTo, duration) {
        this.stateData.setMix(animationFrom, animationTo, duration);
    }

    addAnimation(data) {
        if (typeof data === "string") {
            this._currentChain.push({ name: data });
        } else if (isObject(data)) {
            const item = this._getAnimationItem(data);
            item && this._currentChain.push(item);
        } else {
            console.warn("data argument must be object or string");
        }

        return this;
    }

    start(time) {
        this.reset();
        this.resume();

        // this._pauseSubscriber = dispatcher.app.subscribe(event => {
        //     if (!event.paused) {
        //         this._prevPerformance = performance.now();
        //     }
        // });

        let last = {
            track: null,
            loop: false
        };

        this._currentChain.forEach((item, index, arr) => {
            const { name, loop, delay = 0, speed = 1, onStart, onEvent, onComplete, onEnd } = item;
            let trackEntry;
            let isListen = false;
            const listeners = {};

            if (index === 0) {
                trackEntry = this.state.setAnimation(0, name, loop);
                // отработка onStart первого элемента цепочки (т.к. он уже не сработает в подписке)
                onStart && onStart();
                if (speed !== 1) {
                    this._speed = speed;
                }
            } else {
                trackEntry = this.state.addAnimation(0, name, loop, delay);
            }

            if (onStart || speed !== 1) {
                isListen = true;
                listeners.start = track => {
                    if (track === trackEntry) {
                        onStart && onStart();
                        this._speed = speed;
                    }
                };
            }

            if (onEvent || speed !== 1) {
                isListen = true;
                listeners.event = (track, event) => {
                    if (track === trackEntry) {
                        onEvent && onEvent(event.data.name);
                        this._speed = speed;
                    }
                };
            }

            if (onComplete || speed !== 1) {
                isListen = true;
                listeners.complete = track => {
                    if (track === trackEntry) {
                        this._speed = 1;
                        onComplete && onComplete();
                    }
                };
            }

            if (onEnd) {
                isListen = true;
                listeners.end = track => (track === trackEntry) && onEnd();
            }

            if (isListen) {
                this.state.addListener(listeners);
            }

            if (index === arr.length - 1) {
                last.track = trackEntry;
                last.loop = loop;
            }
        });

        //  если цепочка не зациклена, то ловим конец последней анимации и отписываемся
        if (!last.loop) {
            this.state.addListener({
                complete: track => (track === last.track) && this.reset()
            });
        }

        // подписываемся на тикер и обновляем спайн вручную
        this._tickerSubscriber = this._subscribeTicker();

        // очищаем настройки анимационной цепочки
        this._currentChain.length = 0;

        if (time !== undefined) {
            this.time = time;
        }

        return this;
    }

    reset() {
        if (this._onReset) {
            this._onReset();
            this._onReset = undefined;
        }

        // this._pauseSubscriber && this._pauseSubscriber.unsubscribe();

        this._speed = 1;
        this._tickerSubscriber && this._tickerSubscriber.unsubscribe();
        this._tickerSubscriber = null;
        [...this.state.listeners].forEach(listener => this.state.removeListener(listener));
    }

    complete() {
        this.time = this._getTimeToComplete();
    }

    pause() {
        this.state.timeScale = 0;
        return this;
    }

    resume() {
        this.state.timeScale = 1;
        return this;
    }

    getCurrentTail() {
        let result;
        const currentTrackEntry = this.state.getCurrent(0);
        const completed = currentTrackEntry?.isComplete();
        const loop = currentTrackEntry?.loop;

        if (currentTrackEntry && (!completed || loop)) {
            const name = currentTrackEntry.animation.name;
            const duration = this.animations[name];
            const time = duration === 0 ? 0 : (this.time % this.animations[name]);
            result = { name, time };
        }

        return result;
    }

    _getTimeToComplete() {
        const calc = (track, totalTime = 0) => {
            let time = totalTime + track.animation.duration;
            return track.next ? calc(track.next, time) : time;
        };

        return calc(this.state.getCurrent(0));
    }

    _subscribeTicker() {
        this._prevPerformance = performance.now();

        const fn = () => {
            let tickTime = performance.now() - this._prevPerformance;
            this._prevPerformance = performance.now();
            this.update(this._speed * 1 * tickTime / 1000);
        };
        gsap.ticker.add(fn);
        return ({
            unsubscribe() {
                gsap.ticker.remove(fn);
            }
        });
        // return globalTicker.stream$.subscribe();
    }

    _getAnimationItem(data) {
        const { name, loop, delay, speed, onStart, onComplete, onEvent, onEnd } = data;
        const item = {};

        if (!name || (typeof name !== "string")) {
            console.warn("Spine animation name must be string type");
            return false;
        }

        if (loop !== void (0) && (typeof loop !== "boolean")) {
            console.warn("Spine animation loop must be boolean type");
            return false;
        }

        if (delay !== void (0) && (typeof delay !== "number")) {
            console.warn("Spine animation delay must be number type");
            return false;
        }

        if (speed !== void (0) && (typeof speed !== "number")) {
            console.warn("Spine animation speed must be number type");
            return false;
        }

        if (onStart !== void (0) && !(isFunction(onStart))) {
            console.warn("Spine animation onStart must be function");
            return false;
        }

        if (onEvent !== void (0) && !(isFunction(onEvent))) {
            console.warn("Spine animation onEvent must be function");
            return false;
        }

        if (onEnd !== void (0) && !(isFunction(onEnd))) {
            console.warn("Spine animation onEnd must be function");
            return false;
        }

        if (onComplete !== void (0) && !(isFunction(onComplete))) {
            console.warn("Spine animation onComplete must be function");
            return false;
        }

        if (name !== void (0)) {
            item.name = name;
        }

        if (loop !== void (0)) {
            item.loop = loop;
        }

        if (delay !== void (0)) {
            item.delay = delay;
        }

        if (speed !== void (0)) {
            item.speed = speed;
        }

        if (onStart !== void (0)) {
            item.onStart = onStart;
        }

        if (onEvent !== void (0)) {
            item.onEvent = onEvent;
        }

        if (onComplete !== void (0)) {
            item.onComplete = onComplete;
        }

        if (onEnd !== void (0)) {
            item.onEnd = onEnd;
        }

        return item;
    }

    get active() {
        return !!this._tickerSubscriber;
    }

    onReset(func) {
        this._onReset = func;
    }
}

export default Spine;