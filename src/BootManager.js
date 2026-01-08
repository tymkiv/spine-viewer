import { v4 } from "uuid";
import * as PIXI from "pixi.js";
import "pixi.js-legacy";
import { TextureAtlas } from "@pixi-spine/base";
import * as spine37 from "@pixi-spine/runtime-3.7";
import * as spine38 from "@pixi-spine/runtime-3.8";
import * as spine41 from "@pixi-spine/runtime-4.1";

window.PIXI = PIXI;

function versionFromJson(obj) {
    return String(obj?.skeleton?.spine || "");
}


function versionFromSkel(arrayBuffer) {
    // перші байти містять ASCII-версію (типу "4.1.17")
    const bytes = new Uint8Array(arrayBuffer).slice(0, 64);
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
        const c = bytes[i];
        s += (c >= 32 && c < 127) ? String.fromCharCode(c) : " ";
    }
    const m = s.match(/(\d+\.\d+(?:\.\d+)?)/);
    return m ? m[1] : "";
}

function chooseRuntime(versionStr, preferRuntime = "auto") {
    if (preferRuntime === "3.7") return spine37;
    if (preferRuntime === "3.8") return spine38;
    if (preferRuntime === "4.1") return spine41;

    if (versionStr.startsWith("4.")) return spine41;
    if (versionStr.startsWith("3.7")) return spine37;
    if (versionStr.startsWith("3.8")) return spine38;

    // дефолт — 3.8
    return spine38;
}

export function createSpineData(skelOrJson, atlas, pngPages, preferRuntime = "auto") {
    // --- визначаємо, що саме прийшло: JSON-текст чи ArrayBuffer .skel
    let isBinary = false;
    let jsonObj = null;
    let binBuf = null;

    if (typeof skelOrJson === "string") {
        // якщо рядок і схожий на JSON
        const t = skelOrJson.trim();
        if (t.startsWith("{") || t.startsWith("[")) {
            jsonObj = JSON.parse(skelOrJson);
        } else {
            throw new Error("String skeleton data must be JSON. For .skel pass ArrayBuffer.");
        }
    } else {
        const data = skelOrJson?.result?.data ?? skelOrJson?.data;
        if (data instanceof ArrayBuffer) { isBinary = true; binBuf = data; }
        else if (typeof data === "string") { jsonObj = JSON.parse(data); }
        else { throw new Error("Unknown skeleton data format"); }
    }

    // --- версія з JSON або з SKEL
    const versionStr = isBinary ? versionFromSkel(binBuf) : versionFromJson(jsonObj);
    const R = chooseRuntime(versionStr, preferRuntime);

    // --- створюємо TextureAtlas (спільний для всіх версій)
    const rawAtlasText = typeof atlas === "string" ? atlas : atlas.result.data;
    const atlasObj = new TextureAtlas(rawAtlasText, (pageName, done) => {
        const page = pngPages.find(p => p.name === pageName);
        if (!page) throw new Error(`Не знайдено сторінку атласу "${pageName}"`);

        const src = (page.result && page.result.data) || page.data || page.url;
        const baseTex = PIXI.BaseTexture.from(src);
        baseTex.mipmap = PIXI.MIPMAP_MODES.OFF;
        // baseTex.alphaMode = PIXI.ALPHA_MODES.PMA;
        // baseTex.alphaMode = PIXI.ALPHA_MODES.PREMULTIPLIED_ALPHA;
        done(baseTex);
    });

    // --- парсимо скелет (JSON або SKEL)
    const attachmentLoader = new R.AtlasAttachmentLoader(atlasObj);
    let skeletonData;

    if (isBinary) {
        const bin = new R.SkeletonBinary(attachmentLoader);
        skeletonData = bin.readSkeletonData(new Uint8Array(binBuf));
    } else {
        const jsonParser = new R.SkeletonJson(attachmentLoader);
        skeletonData = jsonParser.readSkeletonData(jsonObj);
    }

    // Покладемо посилання на використаний рантайм (ти його далі читаєш як .R)
    skeletonData.R = R;
    skeletonData.__spineVersion = versionStr;
    return skeletonData;
}

export function createSpineDisplay(skelOrJson, atlas, pngPages, preferRuntime = "auto") {
    const data = createSpineData(skelOrJson, atlas, pngPages, preferRuntime);
    return new data.R.Spine(data);
}

function traverseFileTree(item, path = "", folder) {
    return new Promise(resolve => {
        if (!item) return resolve();
        if (item.isFile) {
            item.file(async file => {
                file = await readFile(file);
                folder.push(file);
                resolve();
            });
        } else if (item.isDirectory) {
            let dirReader = item.createReader();
            dirReader.readEntries(async entries => {
                const subFolder = [];
                folder.push({ name: item.name, subFolder });
                await Promise.all(
                    Object
                        .values(entries)
                        .map(entry => traverseFileTree(entry, path || "" + item.name + "/", subFolder))
                );

                resolve();
            });
        }
    });
}

async function readFile(file) {
    const myRegexp = /(.*)\.(.*)$/g;
    const match = myRegexp.exec(file.name);
    file.clearName = match[1];
    file.extension = match[2];

    const reader = new FileReader();

    switch (file.extension) {
        case "json":
        case "atlas":
            reader.readAsText(file);
            break;
        case "png":
        case "jpg":
        case "jpeg":
        case "webp":
            reader.readAsDataURL(file);
            break;
        case "skel":
            reader.readAsArrayBuffer(file);
            break;
        default:
            file.result = { status: "error", data: `File "${file.name}" is not supported` };
            return file;
    }

    try {
        const event = await new Promise((resolve, reject) => {
            reader.addEventListener("load", resolve);
            reader.addEventListener("error", reject);
        });
        file.result = { status: "ok", data: event.target.result };
        return file;
    } catch {
        file.result = { status: "error", data: `Error on reading file "${file.name}"` };
        return file;
    }
}

// Для drag and drop
export async function itemsReader(dataTransferItems) {
    const files = [];
    await Promise.all(Object.values(dataTransferItems).map(item => {
        if (item.webkitGetAsEntry) {
            return traverseFileTree(item.webkitGetAsEntry(), null, files);
        } else if (item.getAsEntry) {
            return traverseFileTree(item.getAsEntry(), null, files);
        } else {
            alert("Не могу прочитать dataTransferItems. webkitGetAsEntry и getAsEntry не работают");
        }
    }));

    return files;
}

// Для input type file
export async function fileReader(rawFiles) {
    const files = [];
    await Promise.all(([...rawFiles]).map(async rawFile => {

        const paths = rawFile.webkitRelativePath.split("/");

        let acc = files;

        for (let i = 0; i < paths.length - 1; i++) {
            let folder;
            if (Array.isArray(acc)) {
                folder = acc.find(folder => folder.name === paths[i]);
            } else {
                folder = acc.subFolder.find(folder => folder.name === paths[i]);
            }

            if (folder) {
                acc = folder;
            } else {
                if (Array.isArray(acc)) {
                    acc.push({ name: paths[i], subFolder: [] });
                    acc = acc[acc.length - 1];
                } else {
                    acc.subFolder.push({ name: paths[i], subFolder: [] });
                    acc = acc.subFolder[acc.subFolder.length - 1];
                }
            }
        }

        await readFile(rawFile);

        if (Array.isArray(acc)) {
            acc.push(rawFile);
        } else {
            acc.subFolder.push(rawFile);
        }
    }));

    return files;
}

export function prepareItemsForLayersMenu(files) {
    const sceneName = files.subFolder ? files.name : null;
    files = files.subFolder ? files.subFolder : files;

    const jsonFiles = files.filter(f => f.extension === "json");
    const skelFiles = files.filter(f => f.extension === "skel");
    let atlasFiles = files.filter(f => f.extension === "atlas");
    let pngFiles = files.filter(f => ["png", "jpg", "jpeg", "webp"].includes(f.extension));

    const skeletonFiles = [...jsonFiles, ...skelFiles];

    const spines = skeletonFiles
        .map(skeletonFile => {
            if (skeletonFile.result.status === "error") {
                alert(skeletonFile.result.data);
                return;
            }

            const atlasFile = atlasFiles.find(({ clearName }) => clearName === skeletonFile.clearName);
            if (!atlasFile) { alert(`Атлас для спайна ${skeletonFile.name} не знайдено`); return; }
            if (atlasFile.result.status === "error") { alert(atlasFile.result.data); return; }

            // const pngFilesForSpineNames = [...atlasFile.result.data.matchAll(/^[^\s].+\.(?:png|jpe?g|webp)/gmi)]
            const pngFilesForSpineNames = [...atlasFile.result.data.matchAll(/^[^\s].*\.(?:png|jpe?g|webp)$/gmi)]
                .map(m => m[0]);

            // const pngFilesForSpineNames = atlasFile.result.data.match(/.*\.png/g) || [];
            const pngFilesForSpine = pngFilesForSpineNames
                .map(name => pngFiles.find((pngFile) => pngFile.name === name))
                .filter(Boolean);

            if (pngFilesForSpineNames.length !== pngFilesForSpine.length) {
                const errorFilesNames = pngFilesForSpineNames
                    .filter(name => !pngFilesForSpine.some(pngFile => pngFile.name === name));
                alert(`Не знайдено "${errorFilesNames}" для спайна ${skeletonFile.name}`);
                return;
            }
            const errorPng = pngFilesForSpine.find(({ result }) => result.status === "error");
            if (errorPng) { alert(errorPng.result.data); return; }

            // очистка наборів, що вже використали
            atlasFiles = atlasFiles.filter(af => af !== atlasFile);
            pngFiles = pngFiles.filter(pf => !pngFilesForSpine.some(pngFile => pngFile === pf));

            const item = {
                type: "item",
                name: skeletonFile.name,
                id: v4(),
                spineData: createSpineData(skeletonFile, atlasFile, pngFilesForSpine)
            };

            const probableAnimations = item.spineData.animations.map(animation => {
                const EventTimeline = item.spineData.R.EventTimeline;
                const events = animation.timelines
                    .find(tl => tl instanceof EventTimeline)
                    ?.events.map(ev => ({ start: ev.time, name: ev.data.name, id: v4() })) || [];
                return { events, name: animation.name, duration: animation.duration, id: v4() };
            }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

            item.spine = new item.spineData.R.Spine(item.spineData);

            const skins = item.spineData.skins.map(({ name }) => name);
            if (!item.spine.skeleton.skin || !skins.includes(!item.spine.skeleton.skin.name)) {
                item.spine.skeleton.setSkin(null);
                if (skins.length === 0) {
                    item.spine.skeleton.setSkinByName("default");
                } else {
                    item.spine.skeleton.setSkin(item.spineData.skins[0]);
                }
            }

            item.probableAnimations = probableAnimations;
            item.animations = [{ timeStart: 0, pickedAnimation: probableAnimations[0], id: v4() }];

            item.rawPositionX = 0;
            item.rawPositionY = 0;
            item.positionX = 0;
            item.positionY = 0;
            item.displayObject = item.spine;

            return item;
        })
        .filter(Boolean);

    // ... решта (PNG-спрайти) без змін
    const sprites = pngFiles
        .map(pngFile => {
            if (pngFile.result.status === "error") return;

            const img = new Image();
            img.src = pngFile.result.data;
            PIXI.utils.BaseTextureCache[pngFile.name] = new PIXI.BaseTexture(img);

            const item = {
                type: "item",
                name: pngFile.name,
                id: v4(),
                texture: PIXI.Texture.from(PIXI.BaseTexture.from(pngFile.name))
            };

            item.sprite = new PIXI.Sprite(item.texture);
            item.sprite.anchor.set(0.5);
            item.rawPositionX = 0;
            item.rawPositionY = 0;
            item.positionX = 0;
            item.positionY = 0;
            item.displayObject = item.sprite;

            return item;
        })
        .filter(Boolean);

    const layers = [...spines, ...sprites];
    const items = [];
    if (layers.length) {
        items.push({
            type: "scene",
            name: sceneName || layers[0].name,
            id: v4(),
            items: layers
        });
    }

    files.forEach(file => {
        if (file.subFolder) items.push(...prepareItemsForLayersMenu(file));
    });

    return items;
}

export function prepareItemsForResourceMenu(layersItems) {
    return layersItems.reduce((resourceItems, { items }) => {
        return [
            ...resourceItems,
            ...items.map(item => {
                const resourceItem = { ...item, id: v4() };
                delete resourceItem?.spine;
                delete resourceItem?.probableAnimations;
                delete resourceItem?.animations;
                delete resourceItem?.sprite;
                return resourceItem;
            })
        ];
    }, []);
}