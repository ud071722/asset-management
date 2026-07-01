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

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[type="number"]');

    // Element references
    const targetPrice = document.getElementById('targetPrice');
    const tax = document.getElementById('tax');
    const realtorBuy = document.getElementById('realtorBuy');
    const legalFee = document.getElementById('legalFee');
    const movingFee = document.getElementById('movingFee');
    const cleaningFee = document.getElementById('cleaningFee');
    const totalCostsSum = document.getElementById('totalCostsSum');

    const currentHousePrice1 = document.getElementById('currentHousePrice1');
    const currentHousePrice2 = document.getElementById('currentHousePrice2');
    const cashInvest = document.getElementById('cashInvest');
    const existingLoan = document.getElementById('existingLoan');
    const realtorSell = document.getElementById('realtorSell');

    const other3Months = document.getElementById('other3Months');
    const otherDT = document.getElementById('otherDT');
    const otherXM3 = document.getElementById('otherXM3');
    const totalCurrentSum = document.getElementById('totalCurrentSum');

    const resTotalRequired = document.getElementById('resTotalRequired');
    const resTotalAvailable = document.getElementById('resTotalAvailable');
    const resRequiredLoan = document.getElementById('resRequiredLoan');

    const loanInterestRate = document.getElementById('loanInterestRate');
    const loanTerm = document.getElementById('loanTerm');

    const contributionAmount = document.getElementById('contributionAmount');
    const contributionMonthlyInterest = document.getElementById('contributionMonthlyInterest');

    const resYearlyInterest = document.getElementById('resYearlyInterest');
    const resContributionYearly = document.getElementById('resContributionYearly');
    const resTotalMonthlyInterest = document.getElementById('resTotalMonthlyInterest');
    const resMonthlyPayment = document.getElementById('resMonthlyPayment');

    const refList = document.getElementById('refList');
    const addRefBtn = document.getElementById('addRefBtn');
    const removeRefBtn = document.getElementById('removeRefBtn');
    const moveUpBtn = document.getElementById('moveUpBtn');
    const moveDownBtn = document.getElementById('moveDownBtn');
    const saveBtn = document.getElementById('saveBtn');

    function formatCurrency(num) {
        return Math.round(num).toLocaleString('ko-KR') + ' 만원';
    }

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

    function calculate() {
        const pTarget = parseFloat(targetPrice.value) || 0;
        let taxRate = 0;
        if (pTarget <= 60000) taxRate = 1.1; 
        else if (pTarget <= 90000) taxRate = ((pTarget / 10000) * (2 / 3) - 3) * 1.1; 
        else taxRate = 3.3;
        
        const calculatedTax = Math.round(pTarget * (taxRate / 100));
        tax.value = calculatedTax;

        const finalRealtorFee = getRealtorFee(pTarget);
        realtorBuy.value = finalRealtorFee;

        const costsSum = calculatedTax + finalRealtorFee + (parseFloat(legalFee.value) || 0) + (parseFloat(movingFee.value) || 0) + (parseFloat(cleaningFee.value) || 0);
        const totalRequired = pTarget + costsSum;
        totalCostsSum.textContent = formatCurrency(costsSum);

        const pHouse1 = parseFloat(currentHousePrice1.value) || 0;
        const pHouse2 = parseFloat(currentHousePrice2.value) || 0;
        const pCash = parseFloat(cashInvest.value) || 0;
        const pExistingLoan = parseFloat(existingLoan.value) || 0;
        const pRealtorSell = getRealtorFee(pHouse1) + getRealtorFee(pHouse2);
        realtorSell.value = pRealtorSell;

        const baseAssets = pHouse1 + pHouse2 + pCash - pExistingLoan - pRealtorSell;
        const otherAdjustments = (parseFloat(other3Months.value) || 0) + (parseFloat(otherDT.value) || 0) + (parseFloat(otherXM3.value) || 0);
        const totalAvailable = baseAssets + otherAdjustments;
        totalCurrentSum.textContent = formatCurrency(totalAvailable);

        resTotalRequired.textContent = formatCurrency(totalRequired);
        resTotalAvailable.textContent = formatCurrency(totalAvailable);

        let requiredLoan = Math.max(0, totalRequired - totalAvailable);
        resRequiredLoan.textContent = formatCurrency(requiredLoan);

        const rate = parseFloat(loanInterestRate.value) || 0;
        const years = parseFloat(loanTerm.value) || 0;
        const pContribMonthlyInt = parseFloat(contributionMonthlyInterest.value) || 0;

        let generalYearlyInterest = 0;
        let amortizedMonthlyPayment = 0;

        if (requiredLoan > 0 && rate > 0 && years > 0) {
            const monthlyRate = rate / 100 / 12;
            const numPayments = years * 12;
            generalYearlyInterest = requiredLoan * (rate / 100);
            amortizedMonthlyPayment = requiredLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        }

        const totalYearlyInterest = generalYearlyInterest + (pContribMonthlyInt * 12);
        resYearlyInterest.textContent = formatCurrency(generalYearlyInterest);
        resContributionYearly.textContent = formatCurrency(pContribMonthlyInt * 12);
        resTotalMonthlyInterest.textContent = formatCurrency(totalYearlyInterest / 12);
        resMonthlyPayment.textContent = formatCurrency(amortizedMonthlyPayment + pContribMonthlyInt);
    }

    async function saveToFirebase() {
        const data = { inputs: {}, refs: [] };
        inputs.forEach(input => { if (input.id) data.inputs[input.id] = input.value; });

        document.querySelectorAll('.ref-row').forEach(row => {
            data.refs.push({
                name: row.querySelector('.ref-name').value,
                price: row.querySelector('.ref-price').value,
                note: row.querySelector('.ref-note').value,
                is15b: row.querySelector('.ref-15b').checked,
                isAvailable: row.querySelector('.ref-status').checked
            });
        });

        const now = new Date();
        data.lastSaved = now.toLocaleString('ko-KR');
        data.updatedAt = Date.now();

        try {
            // 로컬에 먼저 저장하여 인터넷/Firestore 연결 상태와 상관없이 데이터 보존
            localStorage.setItem('assetManagerData', JSON.stringify(data));
            document.getElementById('lastSavedTime').textContent = data.lastSaved;

            await setDoc(doc(db, "settings", "main"), data);
            return true;
        } catch (e) {
            console.error("Save error:", e);
            return false;
        }
    }

    async function loadFromFirebase() {
        try {
            const docSnap = await getDoc(doc(db, "settings", "main"));
            let data = docSnap.exists() ? docSnap.data() : JSON.parse(localStorage.getItem('assetManagerData'));

            if (data) {
                const inputsData = data.inputs || data; // Handle old format
                inputs.forEach(input => { if (input.id && inputsData[input.id] !== undefined) input.value = inputsData[input.id]; });
                
                if (data.refs) {
                    refList.innerHTML = '';
                    data.refs.forEach(ref => addReferenceRow(ref.name, ref.price, ref.note, ref.is15b, ref.isAvailable));
                }
                if (data.lastSaved) document.getElementById('lastSavedTime').textContent = data.lastSaved;
                calculate();
            }
        } catch (e) { console.error("Load error:", e); }
    }

    function selectRow(row) {
        document.querySelectorAll('.ref-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
    }

    function addReferenceRow(name = '', price = '', note = '', is15b = false, isAvailable = false) {
        const newRow = document.createElement('div');
        newRow.className = 'ref-row';
        newRow.innerHTML = `
            <input type="text" placeholder="아파트명" class="ref-input ref-name" value="${name}">
            <div class="input-wrapper">
                <input type="number" placeholder="시세" class="ref-price" step="1000" value="${price}">
                <span class="unit">만원</span>
            </div>
            <input type="text" placeholder="비고" class="ref-input ref-note" value="${note}">
            <label class="ref-check" title="15억 이상 여부">
                <input type="checkbox" class="ref-15b" ${is15b ? 'checked' : ''}>
                <span>15억</span>
            </label>
            <label class="status-toggle" title="구매 가능 여부">
                <input type="checkbox" class="ref-status" ${isAvailable ? 'checked' : ''}>
                <span class="status-slider"></span>
                <span class="status-text">가능</span>
            </label>
        `;
        newRow.addEventListener('click', (e) => { e.stopPropagation(); selectRow(newRow); });
        newRow.querySelectorAll('input').forEach(input => input.addEventListener('focus', () => selectRow(newRow)));
        refList.appendChild(newRow);
    }

    // Sidebar Action Listeners
    if (addRefBtn) addRefBtn.addEventListener('click', () => addReferenceRow());
    
    if (removeRefBtn) {
        removeRefBtn.addEventListener('click', () => {
            const selected = document.querySelector('.ref-row.selected');
            if (selected) {
                if (confirm('선택한 항목을 삭제하시겠습니까?')) {
                    selected.remove();
                    calculate();
                }
            } else {
                alert('삭제할 항목을 먼저 클릭해서 선택해 주세요.');
            }
        });
    }

    if (moveUpBtn) moveUpBtn.addEventListener('click', () => {
        const selected = document.querySelector('.ref-row.selected');
        if (selected && selected.previousElementSibling) selected.parentNode.insertBefore(selected, selected.previousElementSibling);
    });

    if (moveDownBtn) moveDownBtn.addEventListener('click', () => {
        const selected = document.querySelector('.ref-row.selected');
        if (selected && selected.nextElementSibling) selected.parentNode.insertBefore(selected.nextElementSibling, selected);
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (await saveToFirebase()) {
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '클라우드 저장 완료!';
                saveBtn.style.background = '#059669';
                setTimeout(() => { saveBtn.textContent = originalText; saveBtn.style.background = ''; }, 2000);
            } else { alert('저장에 실패했습니다.'); }
        });
    }

    inputs.forEach(input => input.addEventListener('input', calculate));
    loadFromFirebase();
});
