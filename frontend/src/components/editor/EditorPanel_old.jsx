import React from 'react';
import {FreeCamera, 
        Vector3,
        HemisphericLight,
        MeshBuilder,
        StandardMaterial,
        Color3,
        Camera} from '@babylonjs/core';
import SceneComponent from './SceneComponent';
import "./EditorPanel.css";

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
var sphere;
var delta = 0;



const CANVASHEIGHT = 768;
const CANVASWIDTH = 768;

var FIELDSIZE = 16;
var LAYERSAMOUNT = 5;

var PAINTMODE = 1;
var MATERIALSLIST = [];
var CURRENTLAYER = 0;

var player = null;
var exit = null;

var topDownCamera = null;
var arcCamera = null;
var light = null;
var skybox = null;


const materialButton = document.querySelector("#Material")
const layerButton = document.querySelector("#Layer")

var WINCONDITION = false;

var EXAMPLEMAP = [];
EXAMPLEMAP = [[["2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2"],["2",0,0,0,0,0,0,0,0,0,0,0,0,0,0,"2"],["2",0,0,0,0,0,0,0,0,0,0,0,0,0,0,"2"],["2","2","2","2","1","1","1","1","1","1","1","2",0,0,0,"2"],["3","2","2","2","1","1","1","1","1","1","1","2",0,0,0,"2"],["3","3","2","2","1","1","1","1","1","1","1","2",0,0,0,"2"],["3","3","3","2","1","1","1","1","1","1","1","2",0,0,0,"2"],["3","3","3","2","2","2","1","1","1","1","1","2",0,0,0,"2"],["3","3","3","3","2","2","1","1","1","1","1","2",0,0,0,"2"],["3","3","3","3","2","2","2","1","1","1","2","2","2",0,0,"2"],["3","3","3","3","3","3","2","2","2","2","2","3","2",0,0,"2"],["3","3","3","3","3","3","3","3","3","3","3","3","2","2",0,"2"],["3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2"],["3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2"],["3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2"],["3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2"]],[["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],[0,0,0,"1","1","1","1","1","1","1","1","1","1","1","1","1"],[0,0,0,0,"1","1","1","1","1","1","1","1","1","1","1","1"],[0,0,0,0,"1","1","1","1","1","1","1","1","1","1","1","1"],[0,0,0,0,"1","1","1","1","1","1","1",0,"1","1","1","1"],[0,0,0,0,0,0,"1","1","1","1","1",0,"1","1","1","1"],[0,0,0,0,0,0,"1","1","1","1","1",0,"1","1","1","1"],[0,0,0,0,0,0,0,"1","1","1",0,0,0,"1","1","1"],[0,0,0,0,0,0,0,0,0,0,"4",0,0,"1","1","1"],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,"1","1"],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"1"],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"5"],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]]
var MAPDATA = new Array(LAYERSAMOUNT)
for (let i = 0; i < LAYERSAMOUNT; i++){
    MAPDATA[i] = new Array(FIELDSIZE);
    for (let j = 0; j < FIELDSIZE; j++){
        MAPDATA[i][j] = new Array(FIELDSIZE).fill(0);
    }
}

const reloadParams = function(){
    PAINTMODE = Number(materialButton.value);
    CURRENTLAYER = Number(layerButton.value);
}

const initializeMaterials = function(scene){
    //Eraser material
    MATERIALSLIST = [null];

    //Green material
    let material = new StandardMaterial(scene)
    material.alpha = 1;
    material.diffuseColor = new Color3.Green;
    MATERIALSLIST.push(material);

    //Red material
    material = new StandardMaterial(scene)
    material.alpha = 1;
    material.diffuseColor = new Color3.Yellow;
    MATERIALSLIST.push(material);

    //Blue material
    material = new StandardMaterial(scene)
    material.alpha = 1;
    material.diffuseColor = new Color3.Blue;
    MATERIALSLIST.push(material);

    //Point of exit
    MATERIALSLIST.push(null);

    //Player starting point
    MATERIALSLIST.push(null);

    return MATERIALSLIST;
}

const setupCameraOrthographic = function(scene, topDownCamera = null){
    if (topDownCamera == null){
        topDownCamera = new FreeCamera("camera1", new BABYLON.Vector3(FIELDSIZE/2, 40, FIELDSIZE/2), scene);
    }
    topDownCamera.setTarget(new Vector3(FIELDSIZE/2, 0.0, FIELDSIZE/2));
    topDownCamera.rotation.y = 0;
    topDownCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    topDownCamera.orthoTop = FIELDSIZE/2;
    topDownCamera.orthoBottom = -FIELDSIZE/2;
    topDownCamera.orthoRight = FIELDSIZE/2;
    topDownCamera.orthoLeft = -FIELDSIZE/2;
    
    return topDownCamera;
}

const setupCameraArc = function(scene, arcCamera = null){
    if (arcCamera == null){
        arcCamera = new ArcRotateCamera("camera2", -2, 1.4, 20, new BABYLON.Vector3(FIELDSIZE/2, 0.0, FIELDSIZE/2), scene);
    }
    return arcCamera;
}

const setupLight = function(scene){
    let light = new HemisphericLight("light", new BABYLON.Vector3(0.35, 1, -0.55), scene);

    light.intensity = 1;
    light.specular = new Color3(0,0,0);

    return light;
}

const lightChangeMode = function(light){
    if (light.intensity == 1){
        light.intensity = 0.9;
        light.specular = new Color3(1.0, 0.9, 0.8);
    } else {
        light.intensity = 1;
        light.specular = new Color3(0,0,0);
    }
}

const setupSkybox = function(scene){
    let skybox = MeshBuilder.CreateBox("skybox", {size:1000.0}, scene);
    let skyboxMaterial = new StandardMaterial("skybox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0,0,0);
    skyboxMaterial.specularColor = new Color3(0,0,0);
    skybox.material = skyboxMaterial;

    return skybox;
}

const switchCameras = function(camera1, camera2, scene){
    if (scene.activeCamera == camera1){
        scene.activeCamera = camera2;
        camera2.attachControl(scene)
    } else {
        scene.activeCamera = camera1;
        camera2.detachControl(scene)
    }
}

const createTile = function(posX, posY, height, materialNumber, scene){
    if (MAPDATA[height][posY][posX] == materialNumber){
        return null;
    }
    if (materialNumber == 0){
        MAPDATA[height][posY][posX] = materialNumber;
        scene.removeMesh(scene.getMeshByName("tileX"+posX+"Y"+posY+"level"+height))
        return null;
    } else {
        if (MAPDATA[height][posY][posX] != materialNumber){
            createTile(posX, posY, height, 0, scene);
        }
        if (materialNumber == 4){
            for (let i = 0; i < LAYERSAMOUNT; i++){
                for (let j = 0; j < FIELDSIZE; j++){
                    for (let k = 0; k < FIELDSIZE; k++){
                        if (MAPDATA[i][j][k] == materialNumber){
                            MAPDATA[i][j][k] = 0;
                        }
                    }
                }
            }
            MAPDATA[height][posY][posX] = materialNumber;
            return initializeExit(posX, FIELDSIZE - posY, height, scene);
        }
        if (materialNumber == 5){
            for (let i = 0; i < LAYERSAMOUNT; i++){
                for (let j = 0; j < FIELDSIZE; j++){
                    for (let k = 0; k < FIELDSIZE; k++){
                        if (MAPDATA[i][j][k] == materialNumber){
                            MAPDATA[i][j][k] = 0;
                        }
                    }
                }
            }
            MAPDATA[height][posY][posX] = materialNumber;
            return initializePlayer(posX, FIELDSIZE - posY, height, scene);
        }
        MAPDATA[height][posY][posX] = materialNumber;
        let tile = MeshBuilder.CreateBox("tileX"+posX+"Y"+posY+"level"+height, {size:1}, scene)
        tile.position.x = posX+0.5;
        tile.position.z = FIELDSIZE - posY-0.5;
        tile.position.y = height;

        tile.material = MATERIALSLIST[materialNumber];
        return tile;
    }

}

const initializePlayer = function(startX, startY, startHeight, scene){
    if (player == null){
        player = MeshBuilder.CreateSphere("player", {diameter: 1, segments: 32}, scene);
    }
    player.position.y = startHeight;
    player.position.x = startX + 0.5;
    player.position.z = startY - 0.5;

    player.destination = {position:{x:startX+0.5, y:startHeight, z:startY-0.5}};
    
    return player;
}

const initializeExit = function(startX, startY, startHeight, scene){
    if (exit == null){
        exit = MeshBuilder.CreateBox("exit", {size: 0.6, segments: 32}, scene);
    }

    let material = new StandardMaterial(scene);
    material.alpha = 0.7;
    material.diffuseColor = new Color3.Red;
    exit.material = material;

    exit.position.y = startHeight;
    exit.position.x = startX + 0.5;
    exit.position.z = startY - 0.5;
    
    return exit;
}

const moveTarget = function(target, horizontalDistance, verticalDistance){
    target.position.x += horizontalDistance;
    target.position.z += verticalDistance;
}

const stepForward = function(){
    player.movePOV(1, 0, 0);
    if (player.position.x == exit.position.x & player.position.y == exit.position.y & player.position.z == exit.position.z){
        WINCONDITION = true;
    }
}

const turnRight = function(){
    player.rotatePOV(0, Math.PI/2, 0);
}

const turnLeft = function(){
    player.rotatePOV(0, -Math.PI/2, 0);
}



const onSceneReady = (scene) => {
    topDownCamera = setupCameraOrthographic(scene);
    arcCamera = setupCameraArc(scene);
    light = setupLight(scene);
    skybox = setupSkybox(scene);
    initializeMaterials(scene);
}

const onRender = (scene) => {
    //player.position.y += Math.sin(delta*0.05)*0.01;
    if (exit){
        exit.rotation.y = delta * 0.006;
        exit.rotation.x = delta * 0.007;
        exit.rotation.z = delta * 0.008;
    }

    if (WINCONDITION){
        document.querySelector(".completion-popup").classList.remove("hidden");
    }
    delta += 1;
};

canvas.addEventListener("click", function(event){
    let x = event.x;
    let y = event.y;
    x = Math.floor(x/(CANVASHEIGHT/FIELDSIZE))
    y = Math.floor(y/(CANVASHEIGHT/FIELDSIZE))
    if (scene.activeCamera == topDownCamera){
        if (event.altKey){
            createTile(x,y, CURRENTLAYER, 0, scene);
        } else {
            createTile(x,y, CURRENTLAYER, PAINTMODE, scene);
            
        }
    }
})
canvas.addEventListener("keydown", function(event){
    if (event.key == " "){
        switchCameras(topDownCamera, arcCamera, scene);
        lightChangeMode(light);
    }

})

const exportMap = function(){
    let jsonString = JSON.stringify(MAPDATA);
    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    download(jsonString, 'exampleMap.json', 'text/plain');
    console.log(jsonString);
}
const importMap = function(map){
    for (let i = 0; i < LAYERSAMOUNT; i++){
        for (let j = 0; j < FIELDSIZE; j++){
            for (let k = 0; k < FIELDSIZE; k++){
                createTile(k,j,i,map[i][j][k], scene);
            }
        }
    }
}

export default () => (
  <div>
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
);
