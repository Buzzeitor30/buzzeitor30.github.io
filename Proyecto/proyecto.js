import * as THREE from "../lib/three.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import { GLTFLoader } from "../lib/GLTFLoader.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js"

//Variables estándar
let renderer, scene, camera;
//Variables para el raton
let pointer = new THREE.Vector2()
let raycaster = new THREE.Raycaster()
//Entorno
let ventana = new THREE.Object3D()
let habitacion;
//Iluminacion
let spotLightHelper;
let pointLightRed;
let pointLightBlue;
let ambientLight;
let focalLamp;
let focalLamp2;
let focalPrincipal;
let focalPrincipal2;
let focalPrincipal3;
//Objetivos
let dianas = []
let arma;
let gui;
//Texturas
let textures_path = "images/textures/"
//Materiales
let material_suelo
let material_pilar_ventana
let material_base_ventana
let paredes = []
//Parámetros del juego
let radius_diana = 50;
let n_dianas = 3;
let tiempo_ani = 5 * 1000;
let animacion = false;
let tiempo_juego = 10 * 1000;
//Puntuaiones
let current_score = 0
let max_score = 0
//Acciones
init()
setupGUI()
loadScene()
render()

function init() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementById('container').appendChild(renderer.domElement)
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    //Instanciar el nodo raíz
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1, 1, 1)
    
    //Instanciar la cámara perspectiva
    camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 10, 2000)
    camera.position.set(0, 275, -900)
    camera.lookAt(0, 400, 750)
    //Eventos
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("click", onPointerClick)
}

function loadScene() {
    //Materiales 
    cargarTexturas()
    cargarIluminacion()
    //Geometrias
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 100, 100), material_suelo)
    suelo.rotateX(-Math.PI/2)
    //Ventana
    cargarArmas()
    crearHabitacion()
    crearVentana()
    crearLamparas()
        
    

    scene.add(habitacion)
    scene.add(ventana)
    scene.add(arma)
    //scene.add(suelo)
    
}

function render() {
    requestAnimationFrame(render)
    TWEEN.update()
    renderer.render(scene, camera)
}

function cargarIluminacion() {
    ambientLight = new THREE.AmbientLight("white",0.25);
    scene.add(ambientLight)

    focalLamp = new THREE.SpotLight(0xffffff, 0.5, 0, Math.PI/6)
    focalLamp.position.set(750, 300, -400)
    focalLamp.target.position.set(750,350,-400)
    focalLamp.castShadow = true
    scene.add(focalLamp)
    scene.add(focalLamp.target)

    focalLamp2 = new THREE.SpotLight(0xffffff, 0.5, 0, Math.PI/6)
    focalLamp2.position.set(-750, 300, -400)
    focalLamp2.target.position.set(-750,350,-400)
    focalLamp2.castShadow = true
    scene.add(focalLamp2)
    scene.add(focalLamp2.target)

    focalPrincipal = new THREE.SpotLight(0xffffff, 0.5, 0, Math.PI/5)
    focalPrincipal.castShadow = true
    focalPrincipal.shadow.camera.far = 2000
    focalPrincipal.position.set(500, 300, -800)
    focalPrincipal.target.position.set(0, 0, 500)
    scene.add(focalPrincipal)
    scene.add(focalPrincipal.target)

    focalPrincipal2 = new THREE.SpotLight(0xffffff, 0.5, 0, Math.PI/5)
    focalPrincipal2.castShadow = true
    focalPrincipal2.shadow.camera.far = 2000
    focalPrincipal2.position.set(-500, 300, -800)
    focalPrincipal2.target.position.set(0, 0, 500)
    scene.add(focalPrincipal2)
    scene.add(focalPrincipal2.target)

    pointLightRed = new THREE.PointLight( "red", 0.3);
    pointLightBlue = new THREE.PointLight("blue",0.3)
    pointLightRed.castShadow = true
    pointLightBlue.castShadow = true
    pointLightRed.position.set(750, 300, -400);
    pointLightBlue.position.set(-750, 300, -400);
    scene.add(pointLightRed);
    scene.add(pointLightBlue)
}    
 


function cargarTexturas() {
    let text_loader = new THREE.TextureLoader()
    let cb_loader = new THREE.CubeTextureLoader()
    let entorno = [textures_path+"red_bricks_04_diff_2k.jpg", textures_path+"red_bricks_04_diff_2k.jpg",
    textures_path+"red_bricks_04_diff_2k.jpg", textures_path+"plank_flooring_diff_2k.jpg",
    textures_path+"dark_brick_wall_diff_2k.jpg", textures_path+"dark_brick_wall_diff_2k.jpg"]
    //Suelo
    const text_suelo = text_loader.load(textures_path+"plank_flooring_diff_2k.jpg")
    text_suelo.minFilter = THREE.NearestFilter
    const text_suelo_nor = text_loader.load(textures_path+"plank_flooring_nor_gl_2k.jpg")
    text_suelo_nor.minFilter = THREE.NearestFilter
    material_suelo = new THREE.MeshStandardMaterial({map:text_suelo, normalMap:text_suelo_nor})

    //Ventana
    const text_pilar = text_loader.load(textures_path+"Marble021_1K-PNG_Color.png")
    text_suelo_nor.minFilter = THREE.NearestFilter
    material_pilar_ventana = new THREE.MeshPhongMaterial({map:text_pilar,  envMap:cb_loader.load(entorno)})

    //Base
    const text_base = text_loader.load(textures_path+"factory_wall_diff_2k.jpg")
    text_base.wrapS = text_base.wrapT = THREE.RepeatWrapping
    text_base.repeat.set(10, 1)
    material_base_ventana = new THREE.MeshPhongMaterial({map:text_base, shininess:5})


    //Habitacion
    const text_paredes = text_loader.load(textures_path+"red_bricks_04_diff_2k.jpg")
    paredes.push(
        new THREE.MeshStandardMaterial({map:text_paredes, side: THREE.BackSide})
    )
    paredes.push(
        new THREE.MeshStandardMaterial({map:text_paredes, side: THREE.BackSide})
    )
    paredes.push(
        new THREE.MeshStandardMaterial({map:text_paredes, side: THREE.BackSide})
    )
    paredes.push(
        new THREE.MeshStandardMaterial({map:text_suelo, side: THREE.BackSide})
    )
    paredes.push(
        new THREE.MeshStandardMaterial({map:text_paredes, side: THREE.BackSide})
    )
    paredes.push(
        new THREE.MeshStandardMaterial({map:text_paredes, side: THREE.BackSide})
    )
}

function cargarArmas() {
    const glloader = new GLTFLoader()

    glloader.load('../models/ak-47/scene.gltf',
    function(objeto)
    {
        objeto.scene.scale.set(100,100,100);
        objeto.scene.position.y = 250;
        objeto.scene.rotation.y = -Math.PI*0.25;
        objeto.scene.position.z = -875
        objeto.scene.name = 'AK-47';
        objeto.scene.traverse(ob=>{if(ob.isObject3D) ob.castShadow=true;});
        arma = objeto.scene
        scene.add(arma)
        window.addEventListener("keydown", animarArma)
    });
}

function setupGUI() {
    let effectController = {
        radius: 50,
        tiempo_ani: 5,
        n_dianas:3,
        animacion: false,
        tiempo_juego: 10,
        play: () => {jugar()}
    }
    gui = new GUI().title("Opciones del juego")

    gui.add(effectController, "radius", 20, 100, 5).name("Radio de las dianas").listen().onChange(rad => {radius_diana=rad})
    gui.add(effectController, "tiempo_ani", 0, 10, 0.5).name("Duración de la animación (s)").listen().onChange(t => {tiempo_ani=t*1000})
    gui.add(effectController, "tiempo_juego", 10, 60, 5).name("Duracion del juego(s)").onChange(t => {tiempo_juego=t*1000})
    gui.add(effectController, "animacion").name("Animacion").listen().onChange(ani => {animacion=ani})
    gui.add(effectController, "n_dianas", 1, 5, 1).name("Numero de dianas").listen().onChange(n_di => {n_dianas=n_di})
    gui.add(effectController, "play").name("Play")
    
}

function crearVentana() {

    //Inicializar dimensiones
    let [base_width, base_height, base_depth] = [1500, 100, 150]
    let [pilar_radius, pilar_height] =[base_depth/2 - 5, 300]
    let pilares_pos_x = base_width / 2 - pilar_radius
    //Base
    const bases = new THREE.Object3D()
    bases.castShadow = true
    bases.receiveShadow = true
    const base = new THREE.Mesh(new THREE.BoxGeometry(base_width, base_height, base_depth, 100, 100, 75), material_base_ventana)
    base.castShadow = true
    base.receiveShadow = true
    base.position.y = base_height / 2
    const techo = base.clone()
    techo.position.y += 2 * techo.position.y + pilar_height
    bases.add(base)
    bases.add(techo)

    //Pilares
    const pilares = new THREE.Object3D()
    pilares.castShadow = true
    pilares.receiveShadow = true
    const pilar_left = new THREE.Mesh(new THREE.CylinderGeometry(pilar_radius, pilar_radius, pilar_height, 150), material_pilar_ventana)
    pilar_left.castShadow = true
    pilar_left.castShadow = true
    pilar_left.position.x = pilares_pos_x
    const pilar_right = pilar_left.clone()
    pilar_right.castShadow = true
    pilar_right.castShadow = true
    pilar_right.position.x = -pilares_pos_x

    pilares.add(pilar_left)
    pilares.add(pilar_right)
    pilares.position.y = pilar_height / 2 + base_height
    //Añadir a la ventana del campo de tiro
    ventana.position.y = 10
    ventana.position.z = -300
    ventana.castShadow = true
    ventana.add(bases)
    ventana.add(pilares)
}

function crearHabitacion() {
    habitacion = new THREE.Mesh(new THREE.BoxGeometry(1500, 600, 1600), paredes)
    habitacion.receiveShadow = true
    habitacion.position.y = 300
}

function crearLamparas() {
    const cono = new THREE.ConeGeometry( 50, 50, 50, 50,true,0, Math.PI); 
    cono.openEnded = true
    const materialI = new THREE.MeshStandardMaterial( {color: "red", transparent:true, opacity:0.8, roughness:0.3, metalness:0.1} );
    const materialD = new THREE.MeshStandardMaterial( {color: "blue", transparent:true, opacity:0.8, roughness:0.3, metalness:0.1} );
    const lamparaI = new THREE.Mesh(cono, materialI);
    const lamparaD = new THREE.Mesh(cono, materialD);
    lamparaI.rotation.z = -Math.PI
    lamparaD.rotation.z = Math.PI
    lamparaD.rotation.y = Math.PI
    lamparaI.position.set(770,300,-400)
    lamparaD.position.set(-770,300,-400)


    scene.add(lamparaI);
    scene.add(lamparaD)
}

function crearDiana(diana_name, radio_diana) {
    const material_anillo_exterior = new  THREE.MeshLambertMaterial({color:'red', side: THREE.DoubleSide})
    const material_anillo_medio = new THREE.MeshLambertMaterial({color:'black', side: THREE.DoubleSide})
    const material_anillo_interior = new THREE.MeshLambertMaterial({color:'yellow', side: THREE.DoubleSide})

    let anillo_exterior = new THREE.Mesh(new THREE.RingGeometry(0.5*radio_diana,radio_diana, 100),material_anillo_exterior)
    anillo_exterior.receiveShadow = true
    anillo_exterior.castShadow = true
    anillo_exterior.name = "Exterior"
    let anillo_medio = new THREE.Mesh(new THREE.RingGeometry(0.1*radio_diana,0.5*radio_diana, 100),material_anillo_medio)
    anillo_medio.receiveShadow = true
    anillo_medio.castShadow = true
    anillo_medio.name = "Medio"
    let anillo_centro = new THREE.Mesh(new THREE.RingGeometry(0,radio_diana*0.1, 100),material_anillo_interior)
    anillo_centro.castShadow = true
    anillo_centro.receiveShadow = true
    anillo_centro.name = "Centro"

    let diana = new THREE.Object3D()
    diana.castShadow = true
    diana.receiveShadow = true
    diana.name=diana_name
    diana.add(anillo_exterior, anillo_medio,anillo_centro)
    scene.add(diana)
    dianas.push(diana)
    diana.position.y = 150
    setRandomPositionDiana(diana)
}

function playAudio() {
    //Audio
    let audio = new Audio('./headshot.mp3')
    audio.volume = 0.25
    audio.play()
}

function onPointerMove(event) {
    //Registrar donde se mueve el raton, funcion extraida de  https://threejs.org/docs/?q=rayc#api/en/core/Raycaster
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


}

function onPointerClick(event) {
    let headshot = "Centro"
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(dianas, true)
    if(intersects.length > 0) {
        let anillo = intersects[0].object
        let diana = anillo.parent
        switch(anillo.name) {
            case headshot:
                playAudio();
                current_score += 5
                break;
            case "Medio":
                current_score +=3
                break;
            case "Exterior":
                current_score +=1
                break;  
        }
        actualizar_score(current_score)
        if(animacion) {
            detenerAnimacion(diana)
            setRandomPositionDiana(diana)
            animarDiana(diana)
        } else {
            setRandomPositionDiana(diana)
        }

    }
}

function actualizar_score(score) {
    document.getElementById("score").textContent = score
}

function setRandomPositionDiana(diana) {
    let max_x = 750 - radius_diana
    let [x, y, z] = [getRandomInt(-max_x, max_x), getRandomInt(250, 450), getRandomInt(-250, 740)]
    diana.position.set(x, y, z)
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function detenerAnimacion(diana) {
    diana.tween.stop()
}

function animarDiana(diana) {
    let max_x = 750 - radius_diana
    let [x, y, z] = [getRandomInt(-max_x, max_x), getRandomInt(250, 450), getRandomInt(-250, 740)]
    diana.tween = new TWEEN.Tween(diana.position).
    to({x:x, y:y, z:z}, tiempo_ani).
    interpolation(TWEEN.Interpolation.Linear).
    easing(TWEEN.Easing.Cubic.InOut).
    onComplete(() => {animarDiana(diana)}).
    start();
}

function animarArma(event) {
    if (event.which == 70)
        new TWEEN.Tween(arma.rotation).
        to({y:[-Math.PI/5, -Math.PI, -Math.PI*0.44]}, 5000).
        easing(TWEEN.Easing.Quadratic.Out).
        chain(
            new TWEEN.Tween(arma.rotation).
            to({z:[Math.PI/2,0]}, 3000).
            easing(TWEEN.Easing.Quadratic.Out)
        ).
        start()
}

function jugar() {
    current_score = 0
    actualizar_score(current_score)
    gui.controllers.forEach(c => {c.disable()})
    limpiarMemoria()
    for(let i=0; i < n_dianas; i++) {
        crearDiana('Diana${i}', radius_diana)
    }
    
    if(animacion)
        dianas.forEach(animarDiana)

    setTimeout(() =>  {
        limpiarMemoria()
        gui.controllers.forEach(c => {c.enable()})
    }, tiempo_juego)
    
    let contador = document.getElementById('contador')
    contador.textContent = tiempo_juego / 1000
    let tiempo_restante = tiempo_juego / 1000
    let act = setInterval(() =>
    {
        tiempo_restante -= 1
        contador.textContent = tiempo_restante
        if(tiempo_restante <= 0)
            clearInterval(act)
    }, 1000)

    gui.show()
}

function limpiarMemoria() {
    let i;
    TWEEN.removeAll()
    for(i = 0; i < dianas.length; i++) {
        scene.remove(dianas[i])
        dianas[i].children.forEach((anillo) => {anillo.geometry.dispose();anillo.material.dispose()})
        dianas[i].clear()
    }
    dianas = []
}
