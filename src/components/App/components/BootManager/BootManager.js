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
                    subfolder = [];
                    folder.push({ name: item.name, subfolder: subfolder });
                    for (let entr of entries)
                        entriesPromises.push(
                            traverseFileTreePromise(entr, path || ""  + item.name + "/", subfolder)
                        );
                    resolve(Promise.all(entriesPromises));
                });
            }
        });
    }

    let files = [];
    return new Promise((resolve, reject) => {
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
                    if (e.dataTransfer.files.length) {
                        e.stopPropagation();
                    }
                }
            });
        });

        ["dragenter", "dragover"].forEach(type => {
            // this.$store.dispatch("app/addListener", { type, callback: () => this._bootSpace.classList.add(styles["highlight"]) });
        });

        ["dragleave", "drop"].forEach(type => {
            // this.$store.dispatch("app/addListener", { type, callback: () => this._bootSpace.classList.remove(styles["highlight"]) });
        });

        this.$store.dispatch("app/addListener", {
            type: "drop",
            callback: e => {
                console.log("drop");
                if (e.dataTransfer.files.length) {
                    this.handleFiles(e);
                }
            }
        });
        // this._input.addEventListener("change", e => this.handleFiles(e.target.files));
    }

    _folderReader(folder) {
        let layers = [];
        console.log(folder);


        if (folder.subfolder) {
            folder = folder.subfolder;
        }
        folder.forEach(file => {
            if (file.subfolder) {
                this._folderReader(file);
                return;
            }

            const myRegexp = /(.*)\.(.*)$/g;
            const match = myRegexp.exec(file.name);

            const name = match[1];
            const extension = match[2];

            console.log("name", name);
            console.log("extension", extension);

            switch (extension) {
                case "json": {

                    const regexp = new RegExp(`${name}\\d{0,1}`);

                    // Все layer у кого такое же название, или такое же название + цифра
                    const pngLayersWithSameName = layers.filter(layer => layer.type === "png" && layer.name.match(regexp)?.[0]);
                    const atlasLayerWithSameName = layers.find(layer => layer.type === "atlas" && layer.name === name);

                    console.log("pngLayersWithSameName", pngLayersWithSameName);
                    console.log("atlasLayerWithSameName", atlasLayerWithSameName);

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
                    console.log("layers", JSON.stringify(layers));
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
                    console.log("jsonLayer", jsonLayer);
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

                    console.log("layers", JSON.stringify(layers));
                    break;
                }
            }
        });

        this._scenes.push(layers);
    }

    handleFiles(e) {
        const files = e.dataTransfer.files;

        getFilesDataTransferItems(e.dataTransfer.items).then(files => {
            // files.forEach(fileOrFolder => {
            //
            // });
            console.log(files);
            this._folderReader(files);

            console.log(this._scenes);
        })
        console.dir(e.dataTransfer);
        console.dir(e.dataTransfer.items);
        console.log("drop");
        console.log(files);
        return;
        const jsonExist = [...files].some(file => file.name.includes(".json"));
        const pngExist = [...files].some(file => file.name.includes(".png"));
        const atlasExist = [...files].some(file => file.name.includes(".atlas"));

        if (!pngExist) {
            alert("Предупреждение об отсутствии png");
            this._resetInput();
            return;
        }

        if (pngExist && ((!jsonExist && atlasExist) || (jsonExist && !atlasExist))) {
            alert("Предупреждение об отсутствии atlas или json");
            this._resetInput();
            return;
        }

        // if(storage["boot-window-2"].some(resource => [...files].some(file => file.name === resource.name))) {
        //     alert("Предупреждение, такой ресурс уже существует");
        //     this._resetInput();
        //     return;
        // }

        if (pngExist && !jsonExist && !atlasExist) {
            alert("Вы хотите загрузить спрайт. SuperSpine пока не готов для работы со спрайтами. Все разработчики SuperSpine (Владимир Тымкив tymkiv.vr@gmail.com) работают над этим.");
            this._resetInput();
            return;
        }

        if (pngExist && jsonExist && atlasExist) {
            this._handleSpine(files);
        }
    }

    async _handleSpine(files) {
        const resultList = {
            json: {},
            atlas: {},
            png: [],
            error: null
        };

        await Promise.all([...files].map(async file => {
            const reader = new FileReader();
            const fileType = file.name.includes(".json")
                ? "json"
                : file.name.includes(".atlas")
                    ? "atlas"
                    : file.name.includes(".png")
                        ? "png"
                        : "error";
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
            } catch {
                resultList.error = true;
                return;
            }

            Array.isArray(resultList[fileType])
                ? resultList[fileType].push({ result, name: file.name })
                : resultList[fileType] = { result, name: file.name };
        }));

        if (resultList.error) {
            alert("Произошла какая-то ошибка...");
            this._resetInput();
            return;
        }

        console.log(resultList);

        // const rawSkeletonData = JSON.parse(resultList.json.result);
        // const rawAtlasData = resultList.atlas.result;
        // const spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (line, callback) => {
        //     const img = new Image();
        //     img.src = resultList.png.find(data => data.name === line).result;
        //     PIXI.utils.BaseTextureCache[line] = new PIXI.BaseTexture(img); // Добавляем картинку в хеш
        //     callback(PIXI.BaseTexture.fromImage(line));
        // });
        //
        // const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
        // const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);
        //
        // const spineData = spineJsonParser.readSkeletonData(rawSkeletonData);
        //
        // const resource = {
        //     spineData,
        //     name: resultList.json.name,
        //     id: resultList.json.name
        // };
        //
        // storage.set("boot-window-2", [...storage["boot-window-2"], resource]);

        this._resetInput();
    }

    _resetInput() {
        // this._input.files = null;
        // this._input.value = "";
    }
}