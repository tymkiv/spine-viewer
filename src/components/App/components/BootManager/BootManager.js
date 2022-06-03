import * as PIXI from "pixi.js";
import "pixi-spine";
import { v4 } from "uuid";

// todo: переписать этот ужас
function getFilesDataTransferItems(dataTransferItems) {
    function traverseFileTreePromise(item, path = "", folder) {
        return new Promise(resolve => {
            if (item.isFile) {
                item.file(file => {
                    file.filepath = path || "" + file.name; //save full path
                    folder.push(file);
                    resolve(file);
                });
            } else if (item.isDirectory) {
                let dirReader = item.createReader();
                dirReader.readEntries(entries => {
                    let entriesPromises = [];
                    const subfolder = [];
                    folder.push({ name: item.name, subfolder });
                    for (let entr of entries)
                        entriesPromises.push(
                            traverseFileTreePromise(entr, path || "" + item.name + "/", subfolder)
                        );
                    resolve(Promise.all(entriesPromises));
                });
            }
        });
    }

    let files = [];
    return new Promise((resolve) => {
        let entriesPromises = [];
        for (let it of dataTransferItems)
            entriesPromises.push(
                traverseFileTreePromise(it.webkitGetAsEntry(), null, files)
            );
        Promise.all(entriesPromises).then(entries => {
            resolve(files);
        });
    });
}

export default class BootManager {
    constructor($store) {
        this.$store = $store;

        this._addListeners();

        this._scenes = [];
    }

    _addListeners() {
        ["dragenter", "dragover", "dragleave", "drop"].forEach(type => {
            this.$store.dispatch("app/addListener", {
                type,
                callback: e => {
                    e.preventDefault();
                    if (e.dataTransfer.items.length) {
                        e.stopPropagation();
                    }
                }
            });
        });

        ["dragenter", "dragover"].forEach(type => {
            this.$store.dispatch("app/addListener", {
                type,
                callback: e => {
                    if (e.dataTransfer.items.length) {
                        this.$store.dispatch("app/setBootOver", true);
                    }
                }
            });
        });

        ["dragleave", "drop"].forEach(type => {
            this.$store.dispatch("app/addListener", {
                type,
                callback: (e) => {
                    if ((e.clientX === 0 && e.clientY === 0) || e.type === "drop") {
                        this.$store.dispatch("app/setBootOver", false);
                    }
                }
            });
        });

        this.$store.dispatch("app/addListener", {
            type: "drop",
            callback: e => {
                if (e.dataTransfer.files.length) {
                    this.handleFiles(e);
                }
            }
        });
    }

    async handleFiles(e) {
        const files = await getFilesDataTransferItems(e.dataTransfer.items);
        let scenes = this._folderReader(files);

        const layersToRemove = [];
        await Promise.all(scenes.map(async({ layers }) => {
            return await Promise.all(layers.map(async(layer) => {
                if (layer.type === "png") {
                    layer.type = "error";
                    layersToRemove.push(layer);
                    alert("Pro Spine Viewer ещё не умеет работать со спрайтами");
                }
                if (layer.type === "atlas") {
                    layer.type = "error";
                    layersToRemove.push(layer);
                    alert(`Был обнаружен atlas с именем ${layer.name}, но json для него отсутствует`);
                }
                if (layer.type === "spine") {

                    // Если всё в порядке
                    if (layer.files.atlas && layer.files.png.length) {
                        layer.spineData = await this._handleSpine(layer.files);
                    } else
                    // Если и атлас и png отсутствуют
                    if (!layer.files.atlas && !layer.files.png.length) {
                        layer.type = "error";
                        layersToRemove.push(layer);
                        alert(`Был обнаружен json с именем ${layer.name}, но atlas и png отсутствуют`);
                    } else
                    // Если только атлас отсутствует
                    if (!layer.files.atlas) {
                        layer.type = "error";
                        layersToRemove.push(layer);
                        alert(`Был обнаружен json с именем ${layer.name}, но atlas отсутствует`);
                    } else
                    // Если только png отсутствует
                    if (!layer.files.png.length) {
                        layer.type = "error";
                        layersToRemove.push(layer);
                        alert(`Был обнаружен json с именем ${layer.name}, но png отсутствует`);
                    }
                }
            }));
        }));

        const rawItems = scenes.filter(({ layers }, index) => {
            scenes[index].items = layers.filter(layer => !layersToRemove.some(l => l === layer));
            delete scenes[index].layers;
            return scenes[index].items.length;
        });

        const resourceMenu = [];
        rawItems.forEach(({ items }) => {
            items.forEach(item => {
                resourceMenu.push({ ...item, id: v4(), type: "item" });
            });
        });

        const layersMenu = rawItems.map(scene => {
            return ({
                ...scene,
                type: "scene",
                id: v4(),
                items: scene.items.map(item => {
                    const probableAnimations = item.spineData.animations.map(animation => ({
                        name: animation.name,
                        duration: animation.duration,
                        id: v4()
                    }));

                    return {
                        ...item,
                        type: "item",
                        id: v4(),
                        items: [],
                        animations: [{ timeStart: 0, pickedAnimation: probableAnimations[0], id: v4() }],
                        probableAnimations,
                        spine: new PIXI.spine.Spine(item.spineData)
                    };
                })
            });
        });

        this.$store.dispatch("layers/loadItems", layersMenu);
        this.$store.dispatch("resources/loadItems", resourceMenu);
        console.log("layersMenu", layersMenu);
        console.log("resourceMenu", resourceMenu);
    }

    _folderReader(folder) {
        const scenes = [];
        let layers = [];
        let sceneName;

        if (folder.subfolder) {
            sceneName = folder.name;
            folder = folder.subfolder;
        }

        folder.forEach(file => {
            if (file.subfolder) {
                scenes.push(...this._folderReader(file));
                return;
            }

            const myRegexp = /(.*)\.(.*)$/g;
            const match = myRegexp.exec(file.name);

            const name = match[1];
            const extension = match[2];

            switch (extension) {
                case "json": {

                    const regexp = new RegExp(`${name}\\d{0,1}`);

                    // Все layer у кого такое же название, или такое же название + цифра
                    const pngLayersWithSameName = layers.filter(layer => layer.type === "png" && layer.name.match(regexp)?.[0]);
                    const atlasLayerWithSameName = layers.find(layer => layer.type === "atlas" && layer.name === name);

                    const spine = {
                        type: "spine",
                        name,
                        files: {}
                    };

                    spine.files.png = pngLayersWithSameName?.map(layer => layer.file) || [];
                    spine.files.atlas = atlasLayerWithSameName?.file;
                    spine.files.json = file;

                    // Удаляю из layers png
                    if (pngLayersWithSameName) {
                        layers = layers.filter(layer => !pngLayersWithSameName.some(l => l === layer));
                    }

                    // Удаляю из layers atlas
                    if (atlasLayerWithSameName) {
                        layers = layers.filter(layer => layer !== atlasLayerWithSameName);
                    }

                    layers.push(spine);
                    break;
                }
                case "png":
                case "atlas": {
                    // Найти spine
                    const jsonLayer = layers.find(layer => {
                        if (layer.type !== "spine") {
                            return;
                        }
                        const regexp = new RegExp(`${layer.name}\\d{0,1}`);
                        return name.match(regexp)?.[0];
                    });

                    if (jsonLayer) {
                        Array.isArray(jsonLayer.files[extension])
                            ? jsonLayer.files[extension].push(file)
                            : jsonLayer.files[extension] = file;
                    } else {
                        layers.push({
                            type: extension,
                            name,
                            file
                        });
                    }

                    break;
                }
            }
        });

        if (layers.length) {
            scenes.push({ name: sceneName || `Scene ${scenes.length}`, layers });
        }

        return scenes;
    }

    async _handleSpine(files) {
        const resultList = {
            json: {},
            atlas: {},
            png: [],
            error: null
        };

        await Promise.all(Object.entries(files).map(async([fileType, files]) => {
            files = Array.isArray(files) ? files : [files];
            await Promise.all(files.map(async(file) => {
                const reader = new FileReader();

                let result;

                switch (fileType) {
                    case "json":
                    case "atlas":
                        reader.readAsText(file);
                        break;
                    case "png":
                        reader.readAsDataURL(file);
                        break;
                    default:
                        resultList.error = true;
                        return;
                }

                try {
                    const event = await new Promise((resolve, reject) => {
                        reader.addEventListener("load", resolve);
                        reader.addEventListener("error", reject);
                    });

                    result = event.target.result;
                    if (fileType === "atlas") {
                        console.log(result);

                        console.log(result.match(/.*\.png/g));
                    }
                } catch {
                    resultList.error = true;
                    return;
                }

                Array.isArray(resultList[fileType])
                    ? resultList[fileType].push({ result, name: file.name })
                    : resultList[fileType] = { result, name: file.name };
            }));
        }));

        if (resultList.error) {
            alert(`Произошла ошибка при чтении спайна ${files.json.name}`);
            this._resetInput();
            return;
        }

        const rawSkeletonData = JSON.parse(resultList.json.result);
        const rawAtlasData = resultList.atlas.result;
        const spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (line, callback) => {
            const img = new Image();
            img.src = resultList.png.find(data => data.name === line).result;
            PIXI.utils.BaseTextureCache[line] = new PIXI.BaseTexture(img); // Добавляем картинку в хеш
            callback(PIXI.BaseTexture.fromImage(line));
        });

        const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
        const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);

        return spineJsonParser.readSkeletonData(rawSkeletonData);
    }

    _resetInput() {
        // this._input.files = null;
        // this._input.value = "";
    }
}