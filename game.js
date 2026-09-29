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
            // Sửa cầu
            bridgeGraphic.clear();
            bridgeGraphic.fillStyle(0x38bdf8, 1);
            bridgeGraphic.fillRect(350, 280, 100, 40);
            window.bridgeRepaired = true;
        }
    },
    {
        id: "gateQuest",
        title: "Cửa 2: Cánh Cổng Ma Thuật (Dynamic Programming)",
        desc: "Cánh cổng thần kỳ khóa kín! Hãy viết hàm <code>long long getEnergy(int n)</code> tính số Fibonacci thứ n bằng **Quy hoạch động** để giải mã cổng.",
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
        verifySolution: (code) => code.includes("for") && (code.includes("dp") || code.includes("prev") || code.includes("+")),
        onSuccess: () => {
            // Mở cổng thần kỳ
            gateGraphic.clear();
            gateGraphic.fillStyle(0x10b981, 1); // Cổng đổi sang màu xanh lá báo hiệu mở
            gateGraphic.fillRect(650, 250, 30, 100);
            window.gateOpened = true;
        }
    }
];

let currentQuestIndex = 0;
let editor;
let game;
let player;
let bridgeGraphic;
let gateGraphic;
let questZone1Triggered = false;
let questZone2Triggered = false;

// --- 2. KHỞI TẠO MONACO EDITOR ---
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
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    // Vẽ Vực Thẫm (Cửa 1)
    let chasm = this.add.graphics();
    chasm.fillStyle(0x0f172a, 1);
    chasm.fillRect(350, 0, 100, window.innerHeight);

    // Vẽ Cầu (Cửa 1)
    bridgeGraphic = this.add.graphics();
    bridgeGraphic.fillStyle(0x38bdf8, 0.3);
    bridgeGraphic.fillRect(350, 280, 100, 40);

    // Vẽ Cánh Cổng (Cửa 2)
    gateGraphic = this.add.graphics();
    gateGraphic.fillStyle(0xef4444, 1); // Cổng đỏ đang khóa
    gateGraphic.fillRect(650, 250, 30, 100);

    // Tạo Nhân vật
    player = this.physics.add.sprite(100, 300, 'player');
    player.setCollideWorldBounds(true);

    // Trigger Cửa 1 (Cầu gãy)
    let zone1 = this.add.zone(320, 300, 50, 100);
    this.physics.world.enable(zone1);
    zone1.body.setAllowGravity(false);
    zone1.body.moves = false;

    this.physics.add.overlap(player, zone1, () => {
        if (!questZone1Triggered) {
            questZone1Triggered = true;
            loadQuest(0);
        }
    });

    // Trigger Cửa 2 (Cánh cổng)
    let zone2 = this.add.zone(620, 300, 50, 100);
    this.physics.world.enable(zone2);
    zone2.body.setAllowGravity(false);
    zone2.body.moves = false;

    this.physics.add.overlap(player, zone2, () => {
        if (!questZone2Triggered && window.bridgeRepaired) {
            questZone2Triggered = true;
            loadQuest(1); // Chuyển sang Cửa 2
        }
    });

    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (!this.cursors) return;
    player.setVelocity(0);

    if (this.cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
        // Chặn lại nếu chưa sửa cầu
        if (player.x > 310 && player.x < 450 && !window.bridgeRepaired) {
            player.setVelocityX(0);
        } 
        // Chặn lại nếu chưa mở cổng cửa 2
        else if (player.x > 610 && !window.gateOpened) {
            player.setVelocityX(0);
        } else {
            player.setVelocityX(160);
        }
    }

    if (this.cursors.up.isDown) player.setVelocityY(-160);
    else if (this.cursors.down.isDown) player.setVelocityY(160);
}

// --- 4. HÀM CHUYỂN BÀI / CỬA ---
function loadQuest(index) {
    currentQuestIndex = index;
    const q = QUESTS[index];
    document.getElementById("quest-title").innerText = q.title;
    document.getElementById("quest-desc").innerHTML = q.desc;
    if (editor) {
        editor.setValue(q.defaultCode);
    }
    logConsole(`⚠ Bạn đã kích hoạt ${q.title}. Hãy viết code và bấm Nộp Bài!`);
}

// --- 5. LOGIC NỘP BÀI ---
function submitCode() {
    const currentQuest = QUESTS[currentQuestIndex];
    const userCode = editor.getValue();
    const consoleEl = document.getElementById("console-output");

    consoleEl.innerHTML = "> Đang chấm bài (Compiling C++)...";

    setTimeout(() => {
        const isPassed = currentQuest.verifySolution(userCode);

        if (isPassed) {
            consoleEl.innerHTML = `<span style="color:#34d399">> PASSED! Testcase: SUCCESS (0.01s)<br>> Hoàn thành ${currentQuest.title}! Hãy tiếp tục di chuyển.</span>`;
            currentQuest.onSuccess();
        } else {
            consoleEl.innerHTML = `<span style="color:#f87171">> WRONG ANSWER / COMPILE ERROR<br>> Thuật toán chưa đúng hoặc thiếu logic.</span>`;
        }
    }, 800);
}

function logConsole(msg) {
    document.getElementById("console-output").innerText = "> " + msg;
}
