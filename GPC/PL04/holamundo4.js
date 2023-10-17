/**
 * Escena.js
 * 
 * Seminario GPC#2. Construir una escena básica con transformaciones e
 * importación de modelos.
 * @author <rvivo@upv.es>
 * 
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";

import { OrbitControls } from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js"

// Variables estandar
let renderer, scene, camera;

// Otras globales
let esferaCubo;
let angulo = 0;

// Acciones
init();
loadScene();
render();

function init()
{
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('container').appendChild( renderer.domElement );

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara
    camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,1000);
    camera.position.set(0.5,2,7);
    camera.lookAt(0,1,0);
    
    // Control de camara
    const controls = new OrbitControls(camera, renderer.domElement);    

    // Eventos
    window.addEventListener('resize', updateAspectRatio );
    window.addEventListener('dblclick', animate)
}

function updateAspectRatio()
{
    const ar = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}


function loadScene()
{
    const soldado = new THREE.Object3D()
    // Material sencillo
    const material = new THREE.MeshBasicMaterial({color:'yellow',wireframe:true});

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    scene.add(suelo);

    // Esfera y cubo
    const esfera = new THREE.Mesh( new THREE.SphereGeometry(1,20,20), material );
    const cubo = new THREE.Mesh( new THREE.BoxGeometry(2,2,2), material );
    esfera.position.x = 1;
    cubo.position.x = -1;

    esferaCubo = new THREE.Object3D();
    esferaCubo.add(esfera);
    esferaCubo.add(cubo);
    esferaCubo.position.y = 1.5;

    scene.add(esferaCubo);

    scene.add( new THREE.AxesHelper(3) );
    cubo.add( new THREE.AxesHelper(1) );

    // Modelos importados
    const loader = new THREE.ObjectLoader();
    loader.load('../models/soldado/soldado.json', 
    function (objeto)
    {
        cubo.add(objeto);
        soldado.add(objeto)
        cubo.add(soldado)
        soldado.name = 'soldado'
        soldado.position.y = 1;
    });

    const glloader = new GLTFLoader();
    glloader.load('../models/robota/scene.gltf',
    function(objeto)
    {
        esfera.add(objeto.scene);
        objeto.scene.scale.set(0.5,0.5,0.5);
        objeto.scene.position.y = 1;
        objeto.scene.rotation.y = -Math.PI/2;
        objeto.scene.name = "robot"
        console.log("ROBOT");
        console.log(objeto);
    });


}

function update()
{
    TWEEN.update()
}

function render()
{
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}

/* function animate(event) {
    let x = event.clientX
    let y = event.clienY
    x = (x / window.innerWidth) * 2 - 1
    y = -(y / window.innerHeight) * 2 + 1

    const rayo = new THREE.Raycaster()
    rayo.setFromCamera(new THREE.Vector2(x, y), camera)
    const soldado = scene.getObjectByName('soldado')
    const robot = scene.getObjectByName('robot')
    let intersecciones = rayo.intersectObjects(soldado.children, true)
    if(intersecciones.length > 0) {
        new TWEEN.Tween(soldado.position).
        to({x:[0, 0], y:[3, 1], z:[0, 0]}, 2000).
        interpolation(TWEEN.Interpolation.Bezier).
        easing(TWEEN.Easing.Bounce.Out).
        start()
    }

    intersecciones = rayo.intersectObjects(robot.children, true)

    if(intersecciones.length > 0) {
        new TWEEN.Tween(robot.rotation).
        to({x:[0, 0], y:[Math.PI, -Math.PI/2]}, 5000).
        interpolation(TWEEN.Interpolation.Linear).
        easing(TWEEN.Easing.Exponential.InOut).
        start()
    }
} */


function animate(event){
    // Capturar y normalizar
    let x = event.clientX;
    let y = event.clientY;

    x = ( x / window.innerWidth) * 2 - 1;
    y = -( y / window.innerHeight) * 2 + 1;

    // Rayo e intersecciones
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), camera);

    const soldado = scene.getObjectByName("soldado");
    const robot = scene.getObjectByName("robot");


    let intersecciones = rayo.intersectObjects(
        soldado.children, true); // false para que no sea recursivo
    //console.log(intersecciones)
    if(intersecciones.length > 0){
        new TWEEN.Tween(soldado.position).
        to({x:[0,0], y:[3,1], z:[0,0]}, 2000).
        interpolation(TWEEN.Interpolation.Bezier).
        easing(TWEEN.Easing.Bounce.Out).
        start();
    }

    intersecciones = rayo.intersectObjects(
        robot.children, true); // false para que no sea recursivo
    
    if(intersecciones.length > 0){
        new TWEEN.Tween(robot.rotation).
        to({x:[0,0], y:[Math.PI, -Math.PI/2], z:[0,0]}, 5000).
        interpolation(TWEEN.Interpolation.Linear).
        easing(TWEEN.Easing.Exponential.InOut).
        start();
    }
    

}