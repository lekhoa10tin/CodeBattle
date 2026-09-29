// --- 1. KHO BÀI TẬP & MÔ PHỎNG TEST CASE ---
const QUESTS = {
    bridgeQuest: {
        title: "Cửa 1: Khôi Phục Cầu Nối (Binary Search)",
        desc: "Viết thuật toán Tìm kiếm nhị phân bằng C++. Trả về vị trí của target trong mảng.",
        defaultCode: `#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
`,
        // Mô phỏng chấm bài Client-side (Đủ để test UI/Game Logic)
        verifySolution: (code) => {
            return code.includes("while") && (code.includes("right") || code.includes("left")) && code.includes("mid");
        }
    }
};

let editor;
let game;
let player;
let bridgeGraphic;
let questTriggered = false;

// --- 2. KHỞI TẠO MONACO EDITOR ---
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-container'), {
        value: QUESTS.bridgeQuest.defaultCode,
        language: 'cpp',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });
});

// --- 3. KHỞI TẠO PHASER GAME ---
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth - 450,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

game = new Phaser.Game(config);

function preload() {
    // Tạo graphic tạm thời cho Nhân vật & Bản đồ
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    const scene = this;

    // Vẽ Vực Thẫm
    let chasm = this.add.graphics();
    chasm.fillStyle(0x0f172a, 1);
    chasm.fillRect(350, 0, 100, window.innerHeight);

    // Vẽ Cầu (Ban đầu bị ẩn/gãy)
    bridgeGraphic = this.add.graphics();
    bridgeGraphic.fillStyle(0x38bdf8, 0.3); // Hiện mờ đại diện cho cầu hỏng
    bridgeGraphic.fillRect(350, 280, 100, 40);

    // Tạo Nhân vật
    player = this.physics.add.sprite(100, 300, 'player');
    player.setCollideWorldBounds(true);

    // Tạo Vùng Trigger tại bờ vực
    let questZone = this.add.zone(320, 300, 50, 100);
    this.physics.world.enable(questZone);
    questZone.body.setAllowGravity(false);
    questZone.body.moves = false;

    // Xử lý khi Nhân vật đi tới bờ vực
    this.physics.add.overlap(player, questZone, () => {
        if (!questTriggered) {
            questTriggered = true;
            logConsole("⚠ Bạn đã đến bờ vực! Hãy giải bài toán trong Editor để kích hoạt Cầu Năng Lượng.");
        }
    });

    // Bàn phím điều khiển
    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (!this.cursors) return;

    player.setVelocity(0);

    if (this.cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
        // Rào chắn không cho qua vực nếu chưa giải xong bài toán
        if (player.x > 310 && !window.bridgeRepaired) {
            player.setVelocityX(0);
        } else {
            player.setVelocityX(160);
        }
    }

    if (this.cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
        player.setVelocityY(160);
    }
}

// --- 4. LOGIC XỬ LÝ NỘP BÀI ---
function submitCode() {
    const userCode = editor.getValue();
    const consoleEl = document.getElementById("console-output");

    consoleEl.innerHTML = "> Đang chấm bài (Compiling C++)...";

    setTimeout(() => {
        const isPassed = QUESTS.bridgeQuest.verifySolution(userCode);

        if (isPassed) {
            consoleEl.innerHTML = `<span style="color:#34d399">> PASSED! Testcase 1: SUCCESS (0.01s)<br>> Cầu Năng Lượng Đã Được Kích Hoạt!</span>`;
            
            // Kích hoạt sửa cầu trong Game
            window.bridgeRepaired = true;
            bridgeGraphic.clear();
            bridgeGraphic.fillStyle(0x38bdf8, 1); // Cầu hiện sáng
            bridgeGraphic.fillRect(350, 280, 100, 40);
        } else {
            consoleEl.innerHTML = `<span style="color:#f87171">> WRONG ANSWER / COMPILE ERROR<br>> Thuật toán chưa tối ưu hoặc thiếu điều kiện dừng.</span>`;
        }
    }, 1000);
}

function logConsole(msg) {
    document.getElementById("console-output").innerText = "> " + msg;
}