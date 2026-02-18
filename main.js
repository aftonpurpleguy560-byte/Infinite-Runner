import * as THREE from 'three';

// --- 1. SAHNE VE AYARLAR ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Siyah arka plan
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('game-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- 2. SPRITE KARAKTER (SEN) ---
const textureLoader = new THREE.TextureLoader();
const spriteMap = textureLoader.load('sprite.png');
spriteMap.magFilter = THREE.NearestFilter; // Pixel art görüntüsü için
spriteMap.repeat.set(0.5, 0.5); // 2x2'lik bir sprite sheet varsayıyoruz

const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
const player = new THREE.Sprite(spriteMaterial);
player.scale.set(1.5, 1.5, 1);
player.position.set(0, 0.75, 0);
scene.add(player);

// --- 3. YOL VE IŞIK ---
const roadGeo = new THREE.PlaneGeometry(10, 2000);
const roadMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
scene.add(road);

const light = new THREE.PointLight(0x8A2BE2, 10, 50); // Mor ışık
light.position.set(0, 5, 2);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

camera.position.set(0, 4, 8);
camera.lookAt(0, 0, 0);

// --- 4. OYUN MANTIĞI VE KONTROLLER ---
let targetX = 0;
let score = 0;
const obstacles = [];

window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft" && targetX > -4) {
        targetX -= 2;
        spriteMap.offset.set(0, 0.5); // Sola bakış karesi
    }
    if (e.key === "ArrowRight" && targetX < 4) {
        targetX += 2;
        spriteMap.offset.set(0.5, 0.5); // Sağa bakış karesi
    }
});

// Engel Oluşturma (Kırmızı Küpler)
function createObstacle() {
    const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obs = new THREE.Mesh(geo, mat);
    obs.position.set((Math.floor(Math.random() * 5) - 2) * 2, 0.75, -100);
    scene.add(obs);
    obstacles.push(obs);
}

setInterval(createObstacle, 1500); // Her 1.5 saniyede bir engel

// --- 5. BİLDİRİM SİSTEMİ (PWA) ---
if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission();
}

function sendSpamNotification() {
    if (Notification.permission === "granted") {
        new Notification("Purpleguy © 2026", {
            body: "Tablet gücü kritik seviyede! Oyuna gel Efe!",
            icon: "sprite.png"
        });
    }
}
// Günde 5 bildirim simülasyonu (Test için süreyi kısa tutabilirsin)
setInterval(sendSpamNotification, 1000 * 60 * 60 * 4.8); 

// --- 6. ANA DÖNGÜ ---
function animate() {
    requestAnimationFrame(animate);

    // Oyuncu yumuşak hareket
    player.position.x += (targetX - player.position.x) * 0.15;
    
    // Engelleri hareket ettir ve çarpışma kontrolü
    obstacles.forEach((obs, index) => {
        obs.position.z += 0.5; // Engel hızı
        
        // Çarpışma Testi
        if (Math.abs(obs.position.z - player.position.z) < 1 && 
            Math.abs(obs.position.x - player.position.x) < 1) {
            score = 0; // Basitçe skoru sıfırla (Geliştirilebilir)
            obs.position.z = 100; // Engeli uzağa at
        }

        // Ekrandan çıkanları temizle
        if (obs.position.z > 10) {
            scene.remove(obs);
            obstacles.splice(index, 1);
            score++;
            document.getElementById('ui').innerText = `Skor: ${score}`;
        }
    });

    renderer.render(scene, camera);
}

animate();

// Ekran boyutunu güncelle
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

