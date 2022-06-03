import * as PIXI from "pixi.js";
import "pixi-spine";
import { v4 } from "uuid";

function createSpineData(json, atlas, png) {
    const rawSkeletonData = JSON.parse(json.result.data);
    const rawAtlasData = atlas.result.data;
    const spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (line, callback) => {
        const img = new Image();
        img.src = png.find(data => data.name === line).result.data;
        PIXI.utils.BaseTextureCache[line] = new PIXI.BaseTexture(img); // Добавляем картинку в хеш
        callback(PIXI.BaseTexture.fromImage(line));
    });

    const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
    const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);

    return spineJsonParser.readSkeletonData(rawSkeletonData);
}

function traverseFileTree(item, path = "", folder) {
    return new Promise(resolve => {
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
            reader.readAsDataURL(file);
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
    const sceneName = files.subFolder ? files.name : "Scene";
    files = files.subFolder ? files.subFolder : files;

    const jsonFiles = files.filter(file => file.extension === "json");
    let atlasFiles = files.filter(file => file.extension === "atlas");
    let pngFiles = files.filter(file => file.extension === "png");

    const spines = jsonFiles
        .map(jsonFile => {
            if (jsonFile.result.status === "error") {
                alert(jsonFile.result.data);
                return;
            }

            const atlasFile = atlasFiles.find(({ clearName }) => clearName === jsonFile.clearName);
            if (!atlasFile) {
                alert(`Атлас для спайна ${jsonFile.name} не найден`);
                return;
            }
            if (atlasFile.result.status === "error") {
                alert(atlasFile.result.data);
                return;
            }

            const pngFilesForSpineNames = atlasFile.result.data.match(/.*\.png/g);
            const pngFilesForSpine = pngFilesForSpineNames
                .map(name => pngFiles.find((pngFile) => pngFile.name === name))
                .filter(file => file !== undefined);

            if (pngFilesForSpineNames.length !== pngFilesForSpine.length) {
                const errorFilesNames = pngFilesForSpineNames
                    .filter(name => !pngFilesForSpine.some(pngFile => pngFile.name === name));
                alert(`Не найдено "${errorFilesNames}" для спайна ${jsonFile.name}`);
                return;
            }

            const errorPng = pngFilesForSpine.find(({ result }) => result.status === "error");
            if (errorPng) {
                alert(errorPng.result.data);
                return;
            }

            // Очистка
            atlasFiles = atlasFiles.filter(af => af !== atlasFile);
            pngFiles = pngFiles.filter(pf => !pngFilesForSpine.some(pngFile => pngFile === pf));

            const item = {
                type: "item",
                name: jsonFile.name,
                id: v4(),
                spineData: createSpineData(jsonFile, atlasFile, pngFilesForSpine)
            };

            const probableAnimations = item.spineData.animations.map(animation => ({
                name: animation.name,
                duration: animation.duration,
                id: v4()
            }));

            item.spine = new PIXI.spine.Spine(item.spineData);
            item.probableAnimations = probableAnimations;
            item.animations = [{ timeStart: 0, pickedAnimation: probableAnimations[0], id: v4() }];

            return item;
        })
        .filter(spine => spine !== undefined);

    const sprites = pngFiles
        .map(pngFile => {
            if (pngFile.result.status === "error") {
                return;
            }

            const img = new Image();
            img.src = pngFile.result.data;
            PIXI.utils.BaseTextureCache[pngFile.name] = new PIXI.BaseTexture(img);

            const item = {
                type: "item",
                name: pngFile.name,
                id: v4(),
                texture: PIXI.Texture.from(PIXI.BaseTexture.fromImage(pngFile.name))
            };

            item.sprite = new PIXI.Sprite(item.texture);

            return item;
        })
        .filter(sprite => sprite !== undefined);

    const layers = [...spines, ...sprites];

    const items = [];
    if (layers.length) {
        items.push({
            type: "scene",
            name: sceneName,
            id: v4(),
            items: layers
        });
    }

    files.forEach(file => {
        if (file.subFolder) {
            items.push(...prepareItemsForLayersMenu(file));
        }
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