// --- 1. KHO BÀI TẬP & CÁC CỬA (QUESTS) ---
const QUESTS = [
    {
        id: "bridgeQuest",
        title: "Cửa 1: Khôi Phục Cầu Nối (Binary Search)",
        desc: "Bạn gặp một chiếc cầu bị gãy. Viết hàm <code>binarySearch(int arr[], int n, int target)</code> để kích hoạt cầu.",
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
}`,
        verifySolution: (code) => code.includes("while") && (code.includes("right") || code.includes("left")) && code.includes("mid"),
        onSuccess: () => {
            // Mở đường Cửa 1
            window.bridgeRepaired = true;
            if (bridgeGraphic) {
                bridgeGraphic.clear();
                bridgeGraphic.fillStyle(0x38bdf8, 1); // Cầu sáng xanh
                bridgeGraphic.fillRect(300, 280, 150, 40);
            }
        }
    },
    {
        id: "gateQuest",
        title: "Cửa 2: Cánh Cổng Ma Thuật (Dynamic Programming)",
        desc: "Cánh cổng thần kỳ đang khóa! Hãy viết hàm <code>long long getEnergy(int n)</code> tính số Fibonacci thứ n bằng **Quy hoạch động** để mở cổng.",
        defaultCode: `#include <iostream>
using namespace std;

long long getEnergy(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    long long prev2 = 0, prev1 = 1, current = 0;
    for (int i = 2; i <= n; i++) {
        current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return current;
}`,
        verifySolution: (code) => code.includes("for") && (code.includes("prev") || code.includes("dp") || code.includes("+")),
        onSuccess: () => {
            // Mở cổng Cửa 2
            window.gateOpened = true;
            if (gateGraphic) {
                gateGraphic.clear();
                gateGraphic.fillStyle(0x10b981, 1); // Cổng xanh lá
                gateGraphic.fillRect(650, 250, 30, 100);
            }
        }
    }
];

let currentQuestIndex = 0;
let editor;
let game;
let player;
let bridgeGraphic;
let gateGraphic;
let quest1Triggered = false;
let quest2Triggered = false;

// Khởi tạo trạng thái ban đầu
window.bridgeRepaired = false;
window.gateOpened = false;

// --- 2. MONACO EDITOR ---
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-container'), {
        value: QUESTS[0].defaultCode,
        language: 'cpp',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });
});

// --- 3. PHASER GAME ---
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
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    // Vẽ Vực Thẫm
    let chasm = this.add.graphics();
    chasm.fillStyle(0x0f172a, 1);
    chasm.fillRect(300, 0, 150, window.innerHeight);

    // Vẽ Cầu
    bridgeGraphic = this.add.graphics();
    bridgeGraphic.fillStyle(0x38bdf8, 0.3);
    bridgeGraphic.fillRect(300, 280, 150, 40);

    // Vẽ Cánh Cổng (Cửa 2)
    gateGraphic = this.add.graphics();
    gateGraphic.fillStyle(0xef4444, 1);
    gateGraphic.fillRect(650, 250, 30, 100);

    // Tạo Nhân vật
    player = this.physics.add.sprite(80, 300, 'player');
    player.setCollideWorldBounds(true);

    // Vùng Kích Hoạt Cửa 1
    let zone1 = this.add.zone(260, 300, 40, 100);
    this.physics.world.enable(zone1);
    zone1.body.setAllowGravity(false);
    zone1.body.moves = false;

    this.physics.add.overlap(player, zone1, () => {
        if (!quest1Triggered) {
            quest1Triggered = true;
            loadQuest(0);
        }
    });

    // Vùng Kích Hoạt Cửa 2
    let zone2 = this.add.zone(600, 300, 40, 100);
    this.physics.world.enable(zone2);
    zone2.body.setAllowGravity(false);
    zone2.body.moves = false;

    this.physics.add.overlap(player, zone2, () => {
        if (!quest2Triggered && window.bridgeRepaired) {
            quest2Triggered = true;
            loadQuest(1);
        }
    });

    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (!this.cursors) return;
    player.setVelocity(0);

    if (this.cursors.left.isDown) {
        player.setVelocityX(-180);
    } else if (this.cursors.right.isDown) {
        // Chặn Cửa 1 nếu chưa sửa xong cầu
        if (player.x > 270 && player.x < 450 && !window.bridgeRepaired) {
            player.setVelocityX(0);
        } 
        // Chặn Cửa 2 nếu chưa mở xong cổng
        else if (player.x > 610 && !window.gateOpened) {
            player.setVelocityX(0);
        } else {
            player.setVelocityX(180);
        }
    }

    if (this.cursors.up.isDown) player.setVelocityY(-180);
    else if (this.cursors.down.isDown) player.setVelocityY(180);
}

// --- 4. HÀM CHUYỂN BÀI ---
function loadQuest(index) {
    currentQuestIndex = index;
    const q = QUESTS[index];
    document.getElementById("quest-title").innerText = q.title;
    document.getElementById("quest-desc").innerHTML = q.desc;
    if (editor) {
        editor.setValue(q.defaultCode);
    }
    logConsole(`⚠ Kích hoạt: ${q.title}. Hãy nộp bài để mở đường!`);
}

// --- 5. HÀM NỘP BÀI ---
function submitCode() {
    const currentQuest = QUESTS[currentQuestIndex];
    const userCode = editor.getValue();
    const consoleEl = document.getElementById("console-output");

    consoleEl.innerHTML = "> Đang kiểm tra code C++...";

    setTimeout(() => {
        const isPassed = currentQuest.verifySolution(userCode);

        if (isPassed) {
            currentQuest.onSuccess();
            consoleEl.innerHTML = `<span style="color:#34d399">> PASSED! Thành công!<br>> Cầu/Cổng đã được mở. Nhấn phím MŨI TÊN PHẢI (➡️) để đi tiếp!</span>`;
        } else {
            consoleEl.innerHTML = `<span style="color:#f87171">> WRONG ANSWER!<br>> Thuật toán chưa chính xác. Hãy kiểm tra lại code.</span>`;
        }
    }, 500);
}

function logConsole(msg) {
    document.getElementById("console-output").innerText = "> " + msg;
}
