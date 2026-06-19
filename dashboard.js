import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// 부동산 중개 수수료 계산 함수 (app.js / house.js 동기화)
function getRealtorFee(price) {
    if (price <= 0) return 0;
    let feeRate = 0;
    let feeMax = Infinity;
    if (price < 5000) { feeRate = 0.006; feeMax = 25; }
    else if (price < 20000) { feeRate = 0.005; feeMax = 80; }
    else if (price < 90000) { feeRate = 0.004; }
    else if (price < 120000) { feeRate = 0.005; }
    else if (price < 150000) { feeRate = 0.006; }
    else { feeRate = 0.007; }

    let calculatedFee = price * feeRate;
    if (calculatedFee > feeMax) calculatedFee = feeMax;
    return Math.round(calculatedFee * 1.1 * 0.8);
}

// 안전한 날짜 파싱 유틸리티 (한국어 로컬 날짜 문자열 지원)
function parseSafeDate(dateStr) {
    if (!dateStr) return null;
    let parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
    
    try {
        // "2026. 6. 19. 오전 9:28:13" 형태 처리
        let cleanStr = dateStr.replace(/\./g, '/').replace(/\s+/g, ' ').trim();
        let isPM = cleanStr.includes("오후");
        let isAM = cleanStr.includes("오전");
        cleanStr = cleanStr.replace("오전", "").replace("오후", "").trim();
        
        let parts = cleanStr.split('/');
        if (parts.length >= 3) {
            let year = parseInt(parts[0].trim());
            let month = parseInt(parts[1].trim()) - 1;
            let dayPart = parts[2].trim();
            let day = parseInt(dayPart.split(' ')[0]);
            
            let hours = 0, minutes = 0, seconds = 0;
            let timePart = dayPart.substring(dayPart.indexOf(' ') + 1).trim();
            if (timePart) {
                let timeParts = timePart.split(':');
                hours = parseInt(timeParts[0]) || 0;
                minutes = parseInt(timeParts[1]) || 0;
                seconds = parseInt(timeParts[2]) || 0;
            }
            
            if (isPM && hours < 12) hours += 12;
            if (isAM && hours === 12) hours = 0;
            
            let d = new Date(year, month, day, hours, minutes, seconds);
            if (!isNaN(d.getTime())) return d;
        }
    } catch (e) {
        console.error("Date fallback parsing error:", e);
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    // 3가지 모듈의 로딩 및 화면 업데이트 시작
    loadAllData();
});

async function loadAllData() {
    let latestSavedTimes = [];

    // 1. 주택 구매 시뮬레이터 데이터 로드 및 계산
    try {
        const docSnap = await getDoc(doc(db, "settings", "main"));
        let houseData = docSnap.exists() ? docSnap.data() : JSON.parse(localStorage.getItem('assetManagerData'));
        
        if (houseData) {
            if (houseData.lastSaved) {
                const d = parseSafeDate(houseData.lastSaved);
                if (d) latestSavedTimes.push(d);
            }
            updateHouseWidget(houseData.inputs || houseData);
        } else {
            // 기본값 예시 표시
            updateHouseWidget({
                targetPrice: 160000,
                legalFee: 160,
                movingFee: 200,
                cleaningFee: 90,
                currentHousePrice1: 70000,
                currentHousePrice2: 23000,
                cashInvest: 9500,
                existingLoan: 2938,
                other3Months: 900,
                otherDT: 500,
                otherXM3: 600
            });
        }
    } catch (e) {
        console.error("House data load error:", e);
        // localStorage 백업 로드
        let houseData = JSON.parse(localStorage.getItem('assetManagerData'));
        if (houseData) updateHouseWidget(houseData.inputs || houseData);
    }

    // 2. 투자 성과 및 벤치마크 데이터 로드 및 계산
    try {
        const docSnap = await getDoc(doc(db, "settings", "investment_evaluation"));
        let investData = docSnap.exists() ? docSnap.data() : JSON.parse(localStorage.getItem('investmentData'));
        
        if (investData) {
            if (investData.lastSaved) {
                const d = parseSafeDate(investData.lastSaved);
                if (d) latestSavedTimes.push(d);
            }
            updateInvestmentWidget(investData.investments);
        } else {
            // 로컬 기본 캐시가 없으면 기본값은 investment.js의 기본 배열 형태 모방
            document.getElementById("investEvaluated").textContent = "데이터 없음";
            document.getElementById("investPrincipal").textContent = "- 만원";
            document.getElementById("investOutperform").textContent = "-%";
        }
    } catch (e) {
        console.error("Investment data load error:", e);
        let investData = JSON.parse(localStorage.getItem('investmentData'));
        if (investData) updateInvestmentWidget(investData.investments);
    }

    // 3. 차량 마일리지 데이터 로드 및 계산
    try {
        const docSnap = await getDoc(doc(db, "settings", "mileage_multi"));
        let mileageData = docSnap.exists() ? docSnap.data() : JSON.parse(localStorage.getItem('mileageDataMulti'));
        
        if (mileageData) {
            if (mileageData.lastSaved) {
                const d = parseSafeDate(mileageData.lastSaved);
                if (d) latestSavedTimes.push(d);
            }
            updateMileageWidget(mileageData);
        } else {
            document.getElementById("mileageV1Name").textContent = "차량 1";
            document.getElementById("mileageV1Diff").textContent = "데이터 없음";
            document.getElementById("mileageV2Name").textContent = "차량 2";
            document.getElementById("mileageV2Diff").textContent = "데이터 없음";
            document.getElementById("mileageCheckDate").textContent = "-";
        }
    } catch (e) {
        console.error("Mileage data load error:", e);
        let mileageData = JSON.parse(localStorage.getItem('mileageDataMulti'));
        if (mileageData) updateMileageWidget(mileageData);
    }

    // 최종 클라우드 저장 일시 표시
    if (latestSavedTimes.length > 0) {
        latestSavedTimes.sort((a, b) => b - a); // 최신 시간순 정렬
        document.getElementById('portalLastSaved').textContent = latestSavedTimes[0].toLocaleString('ko-KR');
    } else {
        document.getElementById('portalLastSaved').textContent = "저장된 기록 없음";
    }
}

// 🏠 주택 구매 시뮬레이터 카드 정보 렌더링
function updateHouseWidget(inputs) {
    const pTarget = parseFloat(inputs.targetPrice) || 0;
    
    // 취득세 계산
    let taxRate = 0;
    if (pTarget <= 60000) taxRate = 1.1; 
    else if (pTarget <= 90000) taxRate = ((pTarget / 10000) * (2 / 3) - 3) * 1.1; 
    else taxRate = 3.3;
    const calculatedTax = Math.round(pTarget * (taxRate / 100));

    // 부대비용 및 합계
    const realtorBuy = getRealtorFee(pTarget);
    const legalFee = parseFloat(inputs.legalFee) || 0;
    const movingFee = parseFloat(inputs.movingFee) || 0;
    const cleaningFee = parseFloat(inputs.cleaningFee) || 0;
    const costsSum = calculatedTax + realtorBuy + legalFee + movingFee + cleaningFee;
    const totalRequired = pTarget + costsSum;

    // 가용 자금 계산
    const pHouse1 = parseFloat(inputs.currentHousePrice1) || 0;
    const pHouse2 = parseFloat(inputs.currentHousePrice2) || 0;
    const pCash = parseFloat(inputs.cashInvest) || 0;
    const pExistingLoan = parseFloat(inputs.existingLoan) || 0;
    const realtorSell = getRealtorFee(pHouse1) + getRealtorFee(pHouse2);

    const baseAssets = pHouse1 + pHouse2 + pCash - pExistingLoan - realtorSell;
    const otherAdjustments = (parseFloat(inputs.other3Months) || 0) + (parseFloat(inputs.otherDT) || 0) + (parseFloat(inputs.otherXM3) || 0);
    const totalAvailable = baseAssets + otherAdjustments;

    const requiredLoan = Math.max(0, totalRequired - totalAvailable);

    // DOM 업데이트
    document.getElementById("houseTargetPrice").textContent = Math.round(pTarget).toLocaleString() + " 만원";
    document.getElementById("houseAvailableAsset").textContent = Math.round(totalAvailable).toLocaleString() + " 만원";
    document.getElementById("houseRequiredLoan").textContent = Math.round(requiredLoan).toLocaleString() + " 만원";
}

// 📈 투자 성과 및 벤치마크 카드 정보 렌더링
function updateInvestmentWidget(investments) {
    if (!investments || investments.length === 0) return;

    let simplePrincipal = 0;
    let benchmarkPrincipal = 0;
    let benchmarkValue = 0;
    let interestHistory = [];
    let currentYear = "2022";

    const evaluatedList = [];

    investments.forEach((row, i) => {
        if (row.month.includes(".")) {
            currentYear = row.month.split(".")[0];
        }
        const isJanuary = row.month.includes(".") && row.month.endsWith(".1");
        const monthNum = row.month.includes(".") ? parseInt(row.month.split(".")[1]) : parseInt(row.month);
        
        // 1. 단순누적원금
        simplePrincipal += parseFloat(row.invest) || 0;

        // 2. 가상 예적금 원금
        if (i === 0) {
            benchmarkPrincipal = parseFloat(row.invest) || 0;
        } else {
            if (isJanuary) {
                const last12Interest = interestHistory.slice(-12);
                const interestSum = last12Interest.reduce((a, b) => a + b, 0);
                benchmarkPrincipal = (parseFloat(row.invest) || 0) + benchmarkPrincipal + interestSum;
            } else {
                benchmarkPrincipal = (parseFloat(row.invest) || 0) + benchmarkPrincipal;
            }
        }

        // 3. 당월 이자 계산
        let interest = 0;
        const monthKey = row.month.includes(".") ? row.month : `${currentYear}.${row.month}`;
        const rate = parseFloat(row.rate) || 0;
        
        if (monthKey === "2024.9") {
            interest = (benchmarkPrincipal - 260/2 - 40*23/30) * rate / 12;
        } else if (monthKey === "2024.10") {
            interest = (benchmarkPrincipal + 27.8*17/30) * rate / 12;
        } else if (monthKey === "2024.12") {
            interest = (benchmarkPrincipal - 300*15/31) * rate / 12;
        } else {
            interest = benchmarkPrincipal * rate / 12;
        }
        interestHistory.push(interest);

        // 4. 가상 예적금 가치
        if (i === 0) {
            benchmarkValue = simplePrincipal + interest;
        } else {
            if (isJanuary) {
                benchmarkValue = benchmarkPrincipal;
            } else {
                benchmarkValue = benchmarkValue + (parseFloat(row.invest) || 0) + interest;
            }
        }

        // 평가금액이 입력된 최종 행 수집
        if (row.evaluated !== null && row.evaluated !== undefined && row.evaluated !== "") {
            evaluatedList.push({
                index: i,
                evaluated: parseFloat(row.evaluated),
                principal: simplePrincipal,
                benchmarkVal: benchmarkValue
            });
        }
    });

    if (evaluatedList.length > 0) {
        // 가장 최근의 평가액 데이터 가져오기
        const latest = evaluatedList[evaluatedList.length - 1];
        const evaluated = latest.evaluated;
        const principal = latest.principal;
        const benchmarkVal = latest.benchmarkVal;
        
        const outperformance = (evaluated / benchmarkVal) - 1;
        const outperformancePercentage = (outperformance * 100).toFixed(2);

        document.getElementById("investEvaluated").textContent = Math.round(evaluated).toLocaleString() + " 만원";
        document.getElementById("investPrincipal").textContent = Math.round(principal).toLocaleString() + " 만원";
        
        const outSpan = document.getElementById("investOutperform");
        outSpan.textContent = (outperformance >= 0 ? "+" : "") + outperformancePercentage + "%";
        outSpan.className = outperformance >= 0 ? "pos-value" : "neg-value";
    } else {
        document.getElementById("investEvaluated").textContent = "평가액 없음";
        document.getElementById("investPrincipal").textContent = Math.round(simplePrincipal).toLocaleString() + " 만원";
        document.getElementById("investOutperform").textContent = "-%";
    }
}

// 🚗 차량 마일리지 카드 정보 렌더링
function updateMileageWidget(mileageData) {
    if (!mileageData || !mileageData.vehicles || mileageData.vehicles.length === 0) return;

    // 최종 체크일 가져오기
    const mDate = parseSafeDate(mileageData.lastSaved);
    document.getElementById("mileageCheckDate").textContent = mDate ? `${mDate.getFullYear()}. ${mDate.getMonth() + 1}. ${mDate.getDate()}.` : "-";

    const v1 = mileageData.vehicles[0];
    const v2 = mileageData.vehicles[1];

    if (v1) {
        document.getElementById("mileageV1Name").textContent = v1.name || "차량 1";
        const v1Diff = calculateVehicleDiff(v1);
        const diffSpan = document.getElementById("mileageV1Diff");
        diffSpan.textContent = (v1Diff >= 0 ? "+" : "") + Math.floor(v1Diff).toLocaleString() + " km";
        diffSpan.className = v1Diff >= 0 ? "diff-pos" : "diff-neg";
    }

    if (v2) {
        document.getElementById("mileageV2Name").textContent = v2.name || "차량 2";
        const v2Diff = calculateVehicleDiff(v2);
        const diffSpan = document.getElementById("mileageV2Diff");
        diffSpan.textContent = (v2Diff >= 0 ? "+" : "") + Math.floor(v2Diff).toLocaleString() + " km";
        diffSpan.className = v2Diff >= 0 ? "diff-pos" : "diff-neg";
    }
}

// 개별 차량의 기준대비 마일리지 차이 계산 (mileage.js 연동)
function calculateVehicleDiff(v) {
    const startDate = new Date(v.startDate);
    const checkDate = new Date(v.checkDate);
    const startKm = parseFloat(v.startKm) || 0;
    const annualStandard = parseFloat(v.annualStandard) || 12000;
    const currentKm = parseFloat(v.currentKm) || 0;

    if (isNaN(startDate.getTime()) || isNaN(checkDate.getTime())) return 0;

    const diffTime = checkDate - startDate;
    const elapsedDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    
    const targetMileage = (annualStandard / 365) * elapsedDays;
    const currentMileage = currentKm - startKm;
    
    return currentMileage - targetMileage;
}
