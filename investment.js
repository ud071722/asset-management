import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBf1jVHLrKXVaiQ4x76F6AWNhvzyhny1Fs",
    authDomain: "juhahome-604c5.firebaseapp.com",
    projectId: "juhahome-604c5",
    storageBucket: "juhahome-604c5.firebasestorage.app",
    messagingSenderId: "174974276585",
    appId: "1:174974276585:web:7417e320c4ed896268f178"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 엑셀 시트에서 정밀 파싱한 기본 데이터셋 (2022.1 ~ 2026.12)
const defaultInvestments = [
    // 2022년
    { month: "2022.1", invest: 70, rate: 0.04, evaluated: null },
    { month: "2", invest: 68, rate: 0.04, evaluated: null },
    { month: "3", invest: 0, rate: 0.04, evaluated: null },
    { month: "4", invest: 25, rate: 0.04, evaluated: null },
    { month: "5", invest: 0, rate: 0.04, evaluated: null },
    { month: "6", invest: 0, rate: 0.04, evaluated: null },
    { month: "7", invest: 50, rate: 0.04, evaluated: null },
    { month: "8", invest: 0, rate: 0.04, evaluated: null },
    { month: "9", invest: 0, rate: 0.04, evaluated: null },
    { month: "10", invest: 0, rate: 0.04, evaluated: null },
    { month: "11", invest: 0, rate: 0.04, evaluated: null },
    { month: "12", invest: 0, rate: 0.04, evaluated: null },
    // 2023년
    { month: "2023.1", invest: 0, rate: 0.04, evaluated: null },
    { month: "2", invest: 0, rate: 0.04, evaluated: null },
    { month: "3", invest: 54, rate: 0.04, evaluated: null },
    { month: "4", invest: 0, rate: 0.04, evaluated: null },
    { month: "5", invest: 0, rate: 0.04, evaluated: null },
    { month: "6", invest: 0, rate: 0.0363225, evaluated: null },
    { month: "7", invest: 68, rate: 0.0363225, evaluated: null },
    { month: "8", invest: 50, rate: 0.0363225, evaluated: 447 },
    { month: "9", invest: 3000, rate: 0.0363225, evaluated: 3325.2899 },
    { month: "10", invest: 320, rate: 0.0363225, evaluated: 3557 },
    { month: "11", invest: 88, rate: 0.0363225, evaluated: 3951 },
    { month: "12", invest: 60, rate: 0.0363225, evaluated: 4220 },
    // 2024년
    { month: "2024.1", invest: 200, rate: 0.0363225, evaluated: 4290 },
    { month: "2", invest: 250, rate: 0.0363225, evaluated: 4760 },
    { month: "3", invest: -924, rate: 0.0363225, evaluated: 4075 },
    { month: "4", invest: -642, rate: 0.0363225, evaluated: 3445 },
    { month: "5", invest: 126, rate: 0.0363225, evaluated: 3630 },
    { month: "6", invest: 50, rate: 0.0363225, evaluated: 3833 },
    { month: "7", invest: 60, rate: 0.0363225, evaluated: 3820 },
    { month: "8", invest: 261, rate: 0.0363225, evaluated: 4104 },
    { month: "9", invest: 327, rate: 0.0363225, evaluated: 4450 },
    { month: "10", invest: 0, rate: 0.0363225, evaluated: 4421.5 },
    { month: "11", invest: 0, rate: 0.0363225, evaluated: 4520 },
    { month: "12", invest: -200, rate: 0.0363225, evaluated: 4370 },
    // 2025년
    { month: "2025.1", invest: 0, rate: 0.0363225, evaluated: 4500 },
    { month: "2", invest: -265, rate: 0.04161125, evaluated: 4225 },
    { month: "3", invest: 300, rate: 0.04161125, evaluated: 4100 },
    { month: "4", invest: 0, rate: 0.04161125, evaluated: 4060 },
    { month: "5", invest: 20, rate: 0.041, evaluated: 4165 },
    { month: "6", invest: -220, rate: 0.041, evaluated: 4255 },
    { month: "7", invest: 48, rate: 0.04, evaluated: 4770 },
    { month: "8", invest: 30, rate: 0.039, evaluated: 4790 },
    { month: "9", invest: -45, rate: 0.038, evaluated: 5100 },
    { month: "10", invest: 115, rate: 0.037, evaluated: 5765 },
    { month: "11", invest: 400, rate: 0.0363225, evaluated: 5985 },
    { month: "12", invest: 115, rate: 0.0363225, evaluated: 6250 },
    // 2026년
    { month: "2026.1", invest: 150, rate: 0.0359744, evaluated: 6960 },
    { month: "2", invest: 180, rate: 0.0359744, evaluated: 7150 },
    { month: "3", invest: 250, rate: 0.0359744, evaluated: 6660 },
    { month: "4", invest: 60, rate: 0.0359744, evaluated: 8680 },
    { month: "5", invest: 162, rate: 0.0359744, evaluated: 10150 },
    { month: "6", invest: 50, rate: 0.0359744, evaluated: null },
    { month: "7", invest: 0, rate: 0.0359744, evaluated: null },
    { month: "8", invest: 0, rate: 0.0359744, evaluated: null },
    { month: "9", invest: 0, rate: 0.0359744, evaluated: null },
    { month: "10", invest: 0, rate: 0.0359744, evaluated: null },
    { month: "11", invest: 0, rate: 0.0359744, evaluated: null },
    { month: "12", invest: 0, rate: 0.0359744, evaluated: null }
];

let investments = [];
let selectedStartMonth = "2023.9"; // 기본 분석 시작월 (2023년 9월)
let chartInstance = null; // Chart.js 인스턴스 전역 변수

// 월 비교를 위한 수치값 변환 유틸리티
function parseFullMonthKey(key) {
    if (!key) return 0;
    const [y, m] = key.split(".").map(Number);
    return y * 12 + m;
}

function init() {
    initColumnToggles();
    loadData();

    document.getElementById("startMonthSelect").addEventListener("change", (e) => {
        selectedStartMonth = e.target.value;
        calculateAll();
    });

    document.getElementById("addMonthBtn").addEventListener("click", addNewMonth);
    document.getElementById("deleteMonthBtn").addEventListener("click", deleteRecentMonth);
    document.getElementById("saveInvestBtn").addEventListener("click", saveToFirebase);

    const toggleDetailBtn = document.getElementById("toggleDetailBtn");
    if (toggleDetailBtn) {
        console.log("toggleDetailBtn found! Binding click listener.");
        toggleDetailBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("toggleDetailBtn clicked!");
            const table = document.getElementById("investmentTable");
            console.log("Table element:", table);
            if (table) {
                const isHidden = table.classList.toggle("hide-col-detail");
                console.log("Table has hide-col-detail:", isHidden);
                toggleDetailBtn.textContent = isHidden ? "+" : "-";
            } else {
                console.error("Table element '#investmentTable' NOT found!");
            }
        });
    } else {
        console.error("toggleDetailBtn NOT found in DOM!");
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// 열 숨김/표시 체크박스 초기화
function initColumnToggles() {
    const table = document.getElementById("investmentTable");
    const toggles = document.querySelectorAll(".col-toggle-cb");
    
    toggles.forEach(cb => {
        const colClass = cb.dataset.col;
        const hideClass = `hide-${colClass}`;
        
        // 테이블의 초기 숨김 클래스 존재 여부에 따라 체크박스 상태 자동 동기화
        const isHidden = table.classList.contains(hideClass);
        cb.checked = !isHidden;
        
        cb.addEventListener("change", (e) => {
            if (e.target.checked) {
                // 체크하면 숨김 해제 (클래스 제거)
                table.classList.remove(hideClass);
            } else {
                // 체크 해제하면 숨김 (클래스 추가)
                table.classList.add(hideClass);
            }
        });
    });
}

// 시작월 선택 드롭다운 옵션 채우기
function initStartMonthDropdown() {
    const select = document.getElementById("startMonthSelect");
    select.innerHTML = "";
    
    let currentYear = "";
    investments.forEach(item => {
        let displayMonth = item.month;
        if (item.month.includes(".")) {
            const parts = item.month.split(".");
            currentYear = parts[0];
            displayMonth = `${currentYear}년 ${parts[1]}월`;
        } else {
            displayMonth = `${currentYear}년 ${item.month}월`;
        }
        
        const option = document.createElement("option");
        const key = item.month.includes(".") ? item.month : `${currentYear}.${item.month}`;
        option.value = key;
        option.textContent = displayMonth;
        
        if (key === selectedStartMonth) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });
}

// 엑셀 배열에서 순차적으로 연도를 트랙킹하여 마지막 월과 연도를 찾아내는 헬퍼
function getLastMonthAndYear() {
    let currentYear = 2022;
    let lastMonthNum = 1;
    
    investments.forEach(item => {
        if (item.month.includes(".")) {
            const parts = item.month.split(".");
            currentYear = parseInt(parts[0]);
            lastMonthNum = parseInt(parts[1]);
        } else {
            lastMonthNum = parseInt(item.month);
        }
    });
    
    return { year: currentYear, month: lastMonthNum };
}

// 새로운 월 추가 기능 (2026.12 ➔ 2027.1로 순차적 빌드)
function addNewMonth() {
    const last = getLastMonthAndYear();
    let nextYear = last.year;
    let nextMonth = last.month + 1;
    
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
    }
    
    // 1월은 연도를 명시 ("2027.1"), 그 외에는 월 숫자만 ("2") 표시하여 기존 포맷 준수
    const nextMonthStr = nextMonth === 1 ? `${nextYear}.1` : `${nextMonth}`;
    const lastRate = investments.length > 0 ? investments[investments.length - 1].rate : 0.0359744;
    
    investments.push({
        month: nextMonthStr,
        invest: 0,
        detail: "",
        rate: lastRate,
        evaluated: null
    });
    
    initStartMonthDropdown();
    renderTable();
    calculateAll();
    
    // 시간 역순 정렬이므로 새로운 월은 테이블의 '맨 위'에 추가됨 ➔ 테이블 스크롤 최상단으로 이동
    const sheetBody = document.querySelector(".sheet-body");
    if (sheetBody) {
        sheetBody.scrollTop = 0;
    }
}

// 최신 월 삭제 기능 (가장 최근에 추가된 상단 월 삭제)
function deleteRecentMonth() {
    if (investments.length <= 1) {
        alert("최소 1개월의 데이터는 유지되어야 합니다.");
        return;
    }
    
    // 마지막 월 정보 가져오기
    const last = getLastMonthAndYear();
    const lastMonthStr = last.month === 1 ? `${last.year}.1` : `${last.year}년 ${last.month}월`;
    
    const isTestMode = new URLSearchParams(window.location.search).has("noconfirm");
    if (!isTestMode && !confirm(`가장 최신 월인 ${lastMonthStr} 데이터를 정말 삭제하시겠습니까?`)) {
        return;
    }
    
    investments.pop();
    
    initStartMonthDropdown();
    renderTable();
    calculateAll();
}

// 데이터 로드
async function loadData() {
    try {
        const docSnap = await getDoc(doc(db, "settings", "investment_evaluation"));
        let data = null;
        if (docSnap.exists()) {
            data = docSnap.data();
        } else {
            const localData = localStorage.getItem("investmentData");
            if (localData) data = JSON.parse(localData);
        }

        if (data && data.investments) {
            investments = data.investments;
            selectedStartMonth = data.selectedStartMonth || "2023.9";
            if (data.lastSaved) {
                document.getElementById("lastSavedTime").textContent = data.lastSaved;
            }
        } else {
            investments = JSON.parse(JSON.stringify(defaultInvestments));
        }

        initStartMonthDropdown();
        renderTable();
        calculateAll();
    } catch (e) {
        console.error("데이터 로드 오류:", e);
        investments = JSON.parse(JSON.stringify(defaultInvestments));
        initStartMonthDropdown();
        renderTable();
        calculateAll();
    }
}

// 테이블 DOM 생성 (최신 데이터가 최상단에 보이도록 시간 역순(Reverse) 렌더링)
function renderTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    // 엑셀에서 정방향(시간순)으로 누적 연도를 기록해 두는 매핑 배열 생성
    const rowYears = [];
    let currentYear = "2022";
    investments.forEach(row => {
        if (row.month.includes(".")) {
            currentYear = row.month.split(".")[0];
        }
        rowYears.push(currentYear);
    });

    // 최신 월부터 거꾸로 돌면서 렌더링
    for (let i = investments.length - 1; i >= 0; i--) {
        const row = investments[i];
        const rowYear = rowYears[i];
        const monthDisplay = row.month.includes(".") ? row.month : `${rowYear}.${row.month}`;

        const tr = document.createElement("tr");
        tr.dataset.index = i;

        tr.innerHTML = `
            <td class="month-col">${monthDisplay}</td>
            <td><input type="number" class="input-invest" value="${row.invest}" step="10"></td>
            <td class="col-detail"><input type="text" class="input-detail" value="${row.detail !== undefined && row.detail !== null ? row.detail : ''}" placeholder="-"></td>
            <td class="calculated-col td-simple-principal">0</td>
            <td class="benchmark-col col-d td-benchmark-principal">0</td>
            <td class="benchmark-col col-e td-benchmark-value">0</td>
            <td class="benchmark-col col-f td-benchmark-interest">0</td>
            <td class="col-g"><input type="number" class="input-rate" value="${(row.rate * 100).toFixed(4)}" step="0.01">%</td>
            <td><input type="number" class="input-evaluated" value="${row.evaluated !== null ? row.evaluated : ''}" step="10" placeholder="-"></td>
            <td class="calculated-col td-diff">-</td>
            <td class="calculated-col col-j td-roi">-</td>
            <td class="calculated-col col-k td-outperform">-</td>
            <td class="calculated-col td-annualized">-</td>
        `;

        tbody.appendChild(tr);
    }

    // 실시간 수정 이벤트 리스너 바인딩
    tbody.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", (e) => {
            const tr = e.target.closest("tr");
            const index = parseInt(tr.dataset.index);
            const row = investments[index];

            if (e.target.classList.contains("input-invest")) {
                row.invest = parseFloat(e.target.value) || 0;
            } else if (e.target.classList.contains("input-detail")) {
                row.detail = e.target.value;
            } else if (e.target.classList.contains("input-rate")) {
                row.rate = (parseFloat(e.target.value) || 0) / 100;
                
                // 엑셀처럼 수정한 금리값을 아래행에 자동 계승 (금리 자동 채우기)
                for (let i = index + 1; i < investments.length; i++) {
                    if (investments[i].rate === defaultInvestments[i].rate || i === index + 1) {
                        investments[i].rate = row.rate;
                    } else {
                        break;
                    }
                }
                
                // 금리가 자동 변경되었으므로 즉시 반영하기 위해 테이블만 신속 렌더링
                const currentScroll = document.querySelector(".sheet-body").scrollTop;
                renderTable();
                document.querySelector(".sheet-body").scrollTop = currentScroll;
                
            } else if (e.target.classList.contains("input-evaluated")) {
                row.evaluated = e.target.value === "" ? null : parseFloat(e.target.value);
            }

            calculateAll();
        });
    });
}

// 전체 복리 수식 및 수익률 실시간 연산 (내부 메모리는 정방향 계산 후 DOM에 인덱싱 바인딩)
function calculateAll() {
    let simplePrincipal = 0;      // 단순원금 (C)
    let benchmarkPrincipal = 0;   // 가상 예적금 원금 (D)
    let benchmarkValue = 0;       // 가상 예적금 가치 (E)
    let interestHistory = [];     // 월별 이자 기록

    let currentYear = "";
    
    // 본격 투자시작월(selectedStartMonth)의 연도/월 파싱
    const [startYearStr, startMonthStr] = selectedStartMonth.split(".");
    const startYear = parseInt(startYearStr);
    const startMonth = parseInt(startMonthStr);

    // 테이블 행 DOM 탐색을 위해 tbody의 children 참조
    const tbody = document.getElementById("tableBody");
    const domRows = {};
    
    // DOM의 tr요소들을 dataset.index 키값으로 해시 맵핑하여 역순 탐색 성능 보장
    Array.from(tbody.children).forEach(tr => {
        domRows[parseInt(tr.dataset.index)] = tr;
    });

    investments.forEach((row, i) => {
        const tr = domRows[i];
        if (!tr) return; // 렌더링되지 않은 행은 건너뜀
        
        // 월별 연도 트랙킹
        if (row.month.includes(".")) {
            currentYear = row.month.split(".")[0];
        }
        const isJanuary = row.month.includes(".") && row.month.endsWith(".1");
        const monthNum = row.month.includes(".") ? parseInt(row.month.split(".")[1]) : parseInt(row.month);
        row._fullMonthKey = `${currentYear}.${monthNum}`; // 차트용 데이터 저장

        // 1. 단순누적원금 (C열)
        simplePrincipal += row.invest;
        row._simplePrincipal = simplePrincipal; // 차트용 데이터 저장
        tr.querySelector(".td-simple-principal").textContent = Math.round(simplePrincipal).toLocaleString();

        // 2. 가상 예적금 원금 D열 (1월에는 직전 12개월 발생 이자를 원금에 재투자/자본화)
        if (i === 0) {
            benchmarkPrincipal = row.invest;
        } else {
            if (isJanuary) {
                const last12Interest = interestHistory.slice(-12);
                const interestSum = last12Interest.reduce((a, b) => a + b, 0);
                benchmarkPrincipal = row.invest + benchmarkPrincipal + interestSum;
            } else {
                benchmarkPrincipal = row.invest + benchmarkPrincipal;
            }
        }
        tr.querySelector(".td-benchmark-principal").textContent = Math.round(benchmarkPrincipal).toLocaleString();

        // 3. 당월 이자 계산 (F열)
        let interest = 0;
        const monthKey = row.month.includes(".") ? row.month : `${currentYear}.${row.month}`;
        
        if (monthKey === "2024.9") {
            interest = (benchmarkPrincipal - 260/2 - 40*23/30) * row.rate / 12;
        } else if (monthKey === "2024.10") {
            interest = (benchmarkPrincipal + 27.8*17/30) * row.rate / 12;
        } else if (monthKey === "2024.12") {
            interest = (benchmarkPrincipal - 300*15/31) * row.rate / 12;
        } else {
            interest = benchmarkPrincipal * row.rate / 12;
        }
        
        interestHistory.push(interest);
        tr.querySelector(".td-benchmark-interest").textContent = interest.toFixed(2);

        // 4. 가상 예적금 가치 E열 (수익계산용 누적액)
        if (i === 0) {
            benchmarkValue = simplePrincipal + interest;
        } else {
            if (isJanuary) {
                benchmarkValue = benchmarkPrincipal;
            } else {
                benchmarkValue = benchmarkValue + row.invest + interest;
            }
        }
        row._benchmarkValue = benchmarkValue; // 차트용 데이터 저장
        tr.querySelector(".td-benchmark-value").textContent = Math.round(benchmarkValue).toLocaleString();

        // 5. 수익률 및 성과 지표 계산
        const diffTd = tr.querySelector(".td-diff");
        const roiTd = tr.querySelector(".td-roi");
        const outperformTd = tr.querySelector(".td-outperform");
        const annualizedTd = tr.querySelector(".td-annualized");

        if (row.evaluated !== null) {
            const diff = row.evaluated - benchmarkValue;
            row._diff = diff; // 차트용 데이터 저장
            diffTd.textContent = `${diff > 0 ? "+" : ""}${Math.round(diff).toLocaleString()}`;
            diffTd.className = `calculated-col td-diff ${diff >= 0 ? "pos-value" : "neg-value"}`;

            const roi = (row.evaluated / simplePrincipal) - 1;
            roiTd.textContent = `${roi > 0 ? "+" : ""}${(roi * 100).toFixed(2)}%`;
            roiTd.className = `calculated-col col-j td-roi ${roi >= 0 ? "pos-value" : "neg-value"}`;

            const outperform = (row.evaluated / benchmarkValue) - 1;
            outperformTd.textContent = `${outperform > 0 ? "+" : ""}${(outperform * 100).toFixed(2)}%`;
            outperformTd.className = `calculated-col col-k td-outperform highlight-yellow ${outperform >= 0 ? "pos-value" : "neg-value"}`;

            const currYearNum = parseInt(currentYear);
            const currMonthNum = monthNum;
            const elapsedMonths = (currYearNum - startYear) * 12 + (currMonthNum - startMonth) + 1;

            if (elapsedMonths > 0) {
                const annualized = outperform / (elapsedMonths / 12);
                annualizedTd.textContent = `${annualized > 0 ? "+" : ""}${(annualized * 100).toFixed(2)}%`;
                annualizedTd.className = `calculated-col td-annualized ${annualized >= 0 ? "pos-value" : "neg-value"}`;
            } else {
                annualizedTd.textContent = "-";
                annualizedTd.className = "calculated-col td-annualized";
            }
        } else {
            row._diff = null; // 차트용 데이터 저장
            diffTd.textContent = "-";
            diffTd.className = "calculated-col td-diff";
            roiTd.textContent = "-";
            roiTd.className = "calculated-col col-j td-roi";
            outperformTd.textContent = "-";
            outperformTd.className = "calculated-col col-k td-outperform";
            annualizedTd.textContent = "-";
            annualizedTd.className = "calculated-col td-annualized";
        }
    });

    // 6. 상단 요약 대시보드 카드 실시간 값 업데이트
    updateTopDashboard(simplePrincipal, benchmarkValue, domRows);

    // 7. 실시간 차트 업데이트 연동
    updateChart();
}

// 상단 대시보드 스냅샷 업데이트 (정확한 맵 탐색 반영)
function updateTopDashboard(latestPrincipal, latestBenchmarkValue, domRows) {
    let latestEvaluated = 0;
    let matchingPrincipal = latestPrincipal;
    let matchingBenchmark = latestBenchmarkValue;
    
    // 가장 최근의 H 평가액 행 탐색
    for (let i = investments.length - 1; i >= 0; i--) {
        if (investments[i].evaluated !== null) {
            latestEvaluated = investments[i].evaluated;
            
            const tr = domRows[i];
            if (tr) {
                const rawPrincipal = tr.querySelector(".td-simple-principal").textContent.replace(/,/g, "");
                const rawBenchmark = tr.querySelector(".td-benchmark-value").textContent.replace(/,/g, "");
                matchingPrincipal = parseFloat(rawPrincipal) || latestPrincipal;
                matchingBenchmark = parseFloat(rawBenchmark) || latestBenchmarkValue;
            }
            break;
        }
    }

    if (latestEvaluated > 0) {
        document.getElementById("topEvaluated").textContent = `${Math.round(latestEvaluated).toLocaleString()} 만원`;
        document.getElementById("topPrincipal").textContent = `${Math.round(matchingPrincipal).toLocaleString()} 만원`;
        document.getElementById("topBenchmark").textContent = `${Math.round(matchingBenchmark).toLocaleString()} 만원`;
        
        const totalRoi = (latestEvaluated / matchingPrincipal) - 1;
        const roiSpan = document.getElementById("topRoi");
        roiSpan.textContent = `${totalRoi > 0 ? "+" : ""}${(totalRoi * 100).toFixed(2)}%`;
        roiSpan.className = `metric-value ${totalRoi >= 0 ? "pos-value" : "neg-value"}`;
        
        const totalOutperform = (latestEvaluated / matchingBenchmark) - 1;
        const outSpan = document.getElementById("topOutperformance");
        outSpan.textContent = `${totalOutperform > 0 ? "+" : ""}${(totalOutperform * 100).toFixed(2)}%`;
        outSpan.className = `metric-value ${totalOutperform >= 0 ? "pos-value" : "neg-value"}`;
    } else {
        document.getElementById("topEvaluated").textContent = "- 만원";
        document.getElementById("topPrincipal").textContent = `${Math.round(latestPrincipal).toLocaleString()} 만원`;
        document.getElementById("topBenchmark").textContent = `${Math.round(latestBenchmarkValue).toLocaleString()} 만원`;
        document.getElementById("topRoi").textContent = "-%";
        document.getElementById("topRoi").className = "metric-value";
        document.getElementById("topOutperformance").textContent = "-%";
        document.getElementById("topOutperformance").className = "metric-value";
    }
}

// Firebase 클라우드 백업 저장
async function saveToFirebase() {
    const saveBtn = document.getElementById("saveInvestBtn");
    const originalText = saveBtn.textContent;

    const data = {
        investments: investments,
        selectedStartMonth: selectedStartMonth,
        lastSaved: new Date().toLocaleString("ko-KR")
    };

    try {
        await setDoc(doc(db, "settings", "investment_evaluation"), data);
        document.getElementById("lastSavedTime").textContent = data.lastSaved;
        localStorage.setItem("investmentData", JSON.stringify(data));

        saveBtn.textContent = "완료";
        saveBtn.style.background = "#059669";
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = "";
        }, 2000);
    } catch (e) {
        console.error("Firebase 저장 오류:", e);
        alert("클라우드 저장에 실패했습니다. 로컬 저장을 확인해주세요.");
    }
}

// 실시간 성과 지표 선 차트 렌더링 함수 (Chart.js)
function updateChart() {
    const ctx = document.getElementById("performanceChart");
    if (!ctx) return;

    // 기점월의 수치값 계산
    const startVal = parseFullMonthKey(selectedStartMonth);

    // 기점월 이후의 데이터만 필터링 (시간 정방향 상태 유지)
    const chartData = investments.filter(row => {
        return row._fullMonthKey && parseFullMonthKey(row._fullMonthKey) >= startVal;
    });

    const labels = chartData.map(row => {
        const [y, m] = row._fullMonthKey.split(".");
        return `${y.substring(2)}.${m}`;
    });

    const simplePrincipalData = chartData.map(row => Math.round(row._simplePrincipal));
    const evaluatedData = chartData.map(row => row.evaluated !== null ? Math.round(row.evaluated) : null);
    const diffData = chartData.map(row => row._diff !== null ? Math.round(row._diff) : null);

    // 이전 차트 인스턴스 소멸 처리 (잔상 버그 방지)
    if (chartInstance) {
        chartInstance.destroy();
    }

    // 신규 Chart.js 객체 빌드
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '단순 투자원금 (C)',
                    data: simplePrincipalData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    borderWidth: 2,
                    tension: 0.15,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: '실제 평가금액 (H)',
                    data: evaluatedData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderWidth: 3,
                    tension: 0.15,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: '예적금 대비 차이 (I)',
                    data: diffData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.15,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif",
                            weight: '500'
                        },
                        color: '#64748b'
                    }
                },
                tooltip: {
                    padding: 10,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    titleFont: {
                        size: 12,
                        weight: '700',
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString() + ' 만원';
                            } else {
                                label += '-';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 10,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 10,
                            family: "'Inter', sans-serif"
                        },
                        callback: function(value) {
                            return value.toLocaleString() + ' 만원';
                        }
                    }
                }
            }
        }
    });
}
