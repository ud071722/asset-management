import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// 초기 Seed 데이터 (Monthly.xlsm 분석 결과 기반)
const defaultBudgetData = {
    incomeYg: 4800000,
    incomeSd: 4800000,
    items: [
        // 생활비 (living)
        { category: "living", name: "식비", note: "1만원/일 = 20만 + @", card: 350000, cash: 0, yg: 350000, sd: 600000, amount: 950000 },
        { category: "living", name: "핸드폰", note: "핸드폰(분할), 할인포함, 주하 3만", card: 50000, cash: 0, yg: 50000, sd: 30000, amount: 80000 },
        { category: "living", name: "관리비", note: "35~50만", card: 400000, cash: 0, yg: 400000, sd: 0, amount: 400000 },
        { category: "living", name: "구독", note: "인터넷(2만), OTT(0.5만), 쿠팡(0.8), AI(1.5)", card: 50000, cash: 0, yg: 50000, sd: 0, amount: 50000 },
        { category: "living", name: "교통", note: "교통6 + 주유비15 +하이패스(7)+주차1, 교통4 + 주차12 + 택시4x3", card: 290000, cash: 0, yg: 290000, sd: 280000, amount: 570000 },
        { category: "living", name: "모임회비", note: "나3만, 소땡 9만", card: 0, cash: 30000, yg: 30000, sd: 90000, amount: 120000 },
        { category: "living", name: "세금", note: "마이빌(35만)+위브(105만)+월세(80) = 220만원, 평균 18만/월", card: 180000, cash: 0, yg: 180000, sd: 40000, amount: 220000 },
        { category: "living", name: "경조사", note: "20만 x 8회 +100, 평균 20만", card: 0, cash: 100000, yg: 100000, sd: 100000, amount: 200000 },
        { category: "living", name: "기타생활비", note: "", card: 800000, cash: 300000, yg: 1100000, sd: 500000, amount: 1600000 },

        // 저축/투자 (saving)
        { category: "saving", name: "여분저축", note: "", card: 0, cash: 2300000, yg: 2300000, sd: 0, amount: 2300000 },
        { category: "saving", name: "투자", note: "", card: 0, cash: 0, yg: 0, sd: 2100000, amount: 2100000 },
        { category: "saving", name: "비상금", note: "", card: 0, cash: 0, yg: 0, sd: 0, amount: 0 },
        { category: "saving", name: "저축보험", note: "", card: 0, cash: 0, yg: 0, sd: 0, amount: 0 },
        { category: "saving", name: "청약", note: "", card: 0, cash: 0, yg: 0, sd: 0, amount: 0 },
        { category: "saving", name: "연금보험", note: "", card: 0, cash: 0, yg: 0, sd: 0, amount: 0 },
        { category: "saving", name: "기타", note: "", card: 0, cash: 0, yg: 0, sd: 0, amount: 0 },

        // 보장성보험 (insurance)
        { category: "insurance", name: "영기", note: "", card: 0, cash: 71510, yg: 71510, sd: 0, amount: 71510 },
        { category: "insurance", name: "소땡", note: "", card: 0, cash: 0, yg: 0, sd: 60000, amount: 60000 },
        { category: "insurance", name: "김정님", note: "", card: 0, cash: 116490, yg: 116490, sd: 0, amount: 116490 },
        { category: "insurance", name: "주하", note: "", card: 0, cash: 0, yg: 0, sd: 57000, amount: 57000 },

        // 부채 (debt)
        { category: "debt", name: "종합", note: "원리금(18)-월세(105)-출자금이자세후(23)", card: 0, cash: -1100000, yg: -1100000, sd: 0, amount: -1100000 },

        // 기타/육아 (etc)
        { category: "etc", name: "어머님", note: "", card: 0, cash: 0, yg: 0, sd: 500000, amount: 500000 },
        { category: "etc", name: "돌봄", note: "", card: 0, cash: 0, yg: 0, sd: 0, amount: 0 },
        { category: "etc", name: "영어", note: "패트릭:32만+1만(교재), 와이즈리더(15+1만/월)", card: 10000, cash: 160000, yg: 170000, sd: 320000, amount: 490000 },
        { category: "etc", name: "학원비", note: "수영(17만), 수학(30+1), 방과후(2만), 야마하(17), 논술(13)", card: 0, cash: 670000, yg: 670000, sd: 130000, amount: 800000 }
    ]
};

// 천 단위 쉼표 포맷팅 헬퍼 함수 (0은 '-'로 포맷팅)
function formatNumber(num) {
    if (num === 0) return '-';
    if (num === null || num === undefined || isNaN(num)) return '';
    const isNegative = num < 0;
    const cleanNum = Math.abs(num);
    return (isNegative ? '-' : '') + Math.round(cleanNum).toLocaleString('ko-KR');
}

function parseNumber(str) {
    if (str === null || str === undefined) return 0;
    const trimmed = str.toString().trim();
    if (trimmed === '' || trimmed === '-') return 0;
    const cleaned = trimmed.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
}

function handleNumericInput(e) {
    const input = e.target;
    let cursorPosition = input.selectionStart;
    let originalLength = input.value.length;

    let rawVal = parseNumber(input.value);
    if (input.value === '-' || input.value === '') return;

    input.value = formatNumber(rawVal);

    // 커서 튕김 보정
    let newLength = input.value.length;
    cursorPosition = cursorPosition + (newLength - originalLength);
    input.setSelectionRange(cursorPosition, cursorPosition);
}

// 포커스/블러 시 '-' 처리 헬퍼
function bindFocusBlurFormat(input, onCalculate) {
    input.addEventListener('focus', () => {
        if (input.value === '-') {
            input.value = '';
        }
    });
    input.addEventListener('blur', () => {
        const val = parseNumber(input.value);
        input.value = formatNumber(val);
        if (onCalculate) onCalculate();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveBtn');
    const lastSavedTime = document.getElementById('lastSavedTime');
    const budgetMonthSelect = document.getElementById('budgetMonthSelect');
    const btnNewMonth = document.getElementById('btnNewMonth');
    const btnDeleteMonth = document.getElementById('btnDeleteMonth');
    const excelBudgetTbody = document.getElementById('excelBudgetTbody');
    const categoryPieChart = document.getElementById('categoryPieChart');
    const categoryChartLegend = document.getElementById('categoryChartLegend');
    const itemRatioChart = document.getElementById('itemRatioChart');

    // 카테고리 키 맵
    const categories = ['living', 'saving', 'insurance', 'debt', 'etc'];
    const categoryChartColors = {
        living: '#2563eb',
        saving: '#16a34a',
        insurance: '#f59e0b',
        debt: '#ef4444',
        etc: '#7c3aed'
    };

    function getCategoryName(cat) {
        const names = {
            'living': '생활비',
            'saving': '저축/투자',
            'insurance': '보장성보험',
            'debt': '부채',
            'etc': '기타(주하)'
        };
        return names[cat] || cat;
    }

    function formatNumber(num) {
        if (num === undefined || num === null || isNaN(num)) return '0';
        return Number(num).toLocaleString('ko-KR');
    }

    function parseNumber(str) {
        if (!str) return 0;
        const clean = str.toString().replace(/,/g, '');
        const val = Number(clean);
        return isNaN(val) ? 0 : val;
    }

    function handleNumericInput(e) {
        const input = e.target;
        const selectionStart = input.selectionStart;
        const oldLength = input.value.length;

        let clean = input.value.replace(/[^0-9-]/g, '');
        if (clean === '-') {
            input.value = '-';
            return;
        }
        const val = parseNumber(clean);
        input.value = formatNumber(val);

        const newLength = input.value.length;
        const diff = newLength - oldLength;
        input.setSelectionRange(selectionStart + diff, selectionStart + diff);
    }

    function updateLastSavedTime(savedAt) {
        if (lastSavedTime) {
            lastSavedTime.textContent = savedAt || "저장 전";
        }
    }

    function cloneDefaultBudgetData() {
        return JSON.parse(JSON.stringify(defaultBudgetData));
    }

    function getCurrentMonthId() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    }

    async function readMonthData(monthId) {
        if (!monthId) return null;

        try {
            const docSnap = await getDoc(doc(db, "monthly_budgets", monthId));
            const firestoreData = docSnap.exists() ? docSnap.data() : null;
            if (firestoreData && !firestoreData.isDeleted) {
                return firestoreData;
            }
        } catch (e) {
            console.warn("Firebase month data read failed:", e);
        }

        try {
            const cached = localStorage.getItem(`budgetDataFlow_${monthId}`);
            if (!cached) return null;

            const localData = JSON.parse(cached);
            return localData && !localData.isDeleted ? localData : null;
        } catch (e) {
            console.warn("Local month data read failed:", e);
            return null;
        }
    }

    async function setActiveBudgetFlow(monthId, data) {
        const activeData = data || await readMonthData(monthId) || cloneDefaultBudgetData();
        bindDataToUI(activeData);
        await setDoc(doc(db, "settings", "budget_flow"), activeData);
        localStorage.setItem(`budgetDataFlow_${monthId}`, JSON.stringify(activeData));
        localStorage.setItem('budgetDataFlow', JSON.stringify(activeData));
        updateLastSavedTime(activeData.lastSaved);
    }

    async function deleteMonthDocument(monthId) {
        try {
            await deleteDoc(doc(db, "monthly_budgets", monthId));
        } catch (deleteError) {
            console.warn("Hard delete failed. Falling back to soft delete:", deleteError);
            await setDoc(doc(db, "monthly_budgets", monthId), { isDeleted: true }, { merge: true });
        }
    }

    if (btnNewMonth) {
        btnNewMonth.addEventListener('click', () => {
            const copiedData = collectCurrentData();
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const baseMonth = `${year}-${month}`;
            let seq = 1;
            let formattedMonth = '';
            let exists = true;
            while (exists) {
                const seqStr = String(seq).padStart(2, '0');
                formattedMonth = `${baseMonth}-${seqStr}`;
                exists = Array.from(budgetMonthSelect.options).some(o => o.value === formattedMonth);
                if (exists) seq++;
            }
            const option = document.createElement('option');
            option.value = formattedMonth;
            option.textContent = formatMonthText(formattedMonth);
            budgetMonthSelect.insertBefore(option, budgetMonthSelect.options[0]);
            budgetMonthSelect.value = formattedMonth;
            bindDataToUI(copiedData);
            updateLastSavedTime(null);
        });
    }

    if (btnDeleteMonth) {
        btnDeleteMonth.addEventListener('click', async () => {
            const selectedMonth = budgetMonthSelect.value;
            if (!selectedMonth) {
                alert("삭제할 월이 없습니다.");
                return;
            }

            const monthText = formatMonthText(selectedMonth);
            if (!confirm(`정말로 [ ${monthText} ] 데이터를 영구 삭제하시겠습니까?`)) return;

            const originalText = btnDeleteMonth.textContent;
            btnDeleteMonth.disabled = true;
            btnDeleteMonth.textContent = "삭제 중...";

            try {
                await deleteMonthDocument(selectedMonth);
                localStorage.removeItem(`budgetDataFlow_${selectedMonth}`);

                for (let i = 0; i < budgetMonthSelect.options.length; i++) {
                    if (budgetMonthSelect.options[i].value === selectedMonth) {
                        budgetMonthSelect.options[i].remove();
                        break;
                    }
                }

                if (budgetMonthSelect.options.length > 0) {
                    const nextActiveMonth = budgetMonthSelect.options[0].value;
                    budgetMonthSelect.value = nextActiveMonth;
                    await setActiveBudgetFlow(nextActiveMonth);
                } else {
                    const currentMonthId = getCurrentMonthId();
                    const opt = document.createElement('option');
                    opt.value = currentMonthId;
                    opt.textContent = formatMonthText(currentMonthId);
                    budgetMonthSelect.appendChild(opt);
                    budgetMonthSelect.value = currentMonthId;

                    const defaultDataCopy = cloneDefaultBudgetData();
                    bindDataToUI(defaultDataCopy);
                    await setDoc(doc(db, "monthly_budgets", currentMonthId), defaultDataCopy);
                    await setDoc(doc(db, "settings", "budget_flow"), defaultDataCopy);
                    localStorage.setItem(`budgetDataFlow_${currentMonthId}`, JSON.stringify(defaultDataCopy));
                    localStorage.setItem('budgetDataFlow', JSON.stringify(defaultDataCopy));
                }

                alert(`${monthText} 데이터가 삭제되었습니다.`);
            } catch (e) {
                console.error("Delete error:", e);
                alert("\uC0AD\uC81C \uCC28\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: " + e.message);
            } finally {
                btnDeleteMonth.disabled = false;
                btnDeleteMonth.textContent = originalText;
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const selectedMonth = budgetMonthSelect.value;
            if (!selectedMonth) {
                alert("저장할 월이 없습니다.");
                return;
            }

            const originalText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.textContent = "저장 중...";

            try {
                const saved = await saveToFirebase(selectedMonth);
                if (saved) {
                    alert(`${formatMonthText(selectedMonth)} 데이터가 저장되었습니다.`);
                }
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }
        });
    }

    if (budgetMonthSelect) {
        budgetMonthSelect.addEventListener('change', () => {
            loadMonthData(budgetMonthSelect.value);
        });
    }

    function formatMonthText(val) {
        if (!val) return '';
        const parts = val.replace('.', '-').split('-');
        return parts.length === 3 ? `${parts[0]}년 ${parseInt(parts[1])}월 -${parts[2]}` : val;
    }

    function collectCurrentData() {
        const incomeYgEl = document.getElementById('incomeYg');
        const incomeSdEl = document.getElementById('incomeSd');
        const data = {
            incomeYg: incomeYgEl ? parseNumber(incomeYgEl.value) : 4800000,
            incomeSd: incomeSdEl ? parseNumber(incomeSdEl.value) : 4800000,
            items: []
        };
        document.querySelectorAll('#excelBudgetTbody tr.budget-row').forEach(row => {
            const cat = row.getAttribute('data-category');
            const name = row.querySelector('.item-name').value.trim();
            if (!name) return;
            data.items.push({
                category: cat,
                name: name,
                note: row.querySelector('.item-note').value,
                yg: parseNumber(row.querySelector('.item-yg').value),
                sd: parseNumber(row.querySelector('.item-sd').value),
                amount: parseNumber(row.querySelector('.item-amount').value)
            });
        });
        return data;
    }

    async function saveToFirebase(monthId) {
        let activeMonth = monthId || budgetMonthSelect.value;
        if (!activeMonth) {
            const today = new Date();
            activeMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        }
        const data = collectCurrentData();
        const now = new Date();
        data.lastSaved = now.toLocaleString('ko-KR');
        try {
            await setDoc(doc(db, "monthly_budgets", activeMonth), data);
            await setDoc(doc(db, "settings", "budget_flow"), data);
            localStorage.setItem(`budgetDataFlow_${activeMonth}`, JSON.stringify(data));
            localStorage.setItem('budgetDataFlow', JSON.stringify(data));
            updateLastSavedTime(data.lastSaved);
            return true;
        } catch (e) {
            console.error("Save error:", e);
            alert("\uC800\uC7A5 \uC5D0\uB7EC: " + e.message);
            return false;
        }
    }

    async function loadAllMonths() {
        let months = [];
        const deletedMonths = new Set();
        try {
            const querySnapshot = await getDocs(collection(db, "monthly_budgets"));
            querySnapshot.forEach((d) => {
                const docData = d.data();
                if (docData && docData.isDeleted) {
                    deletedMonths.add(d.id);
                    return;
                }
                if (docData) months.push(d.id);
            });
        } catch (e) {
            console.error("Error loading list from firebase:", e);
        }

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('budgetDataFlow_')) {
                    const monthId = key.replace('budgetDataFlow_', '');
                    const cache = JSON.parse(localStorage.getItem(key));
                    if (cache && !cache.isDeleted && !deletedMonths.has(monthId) && !months.includes(monthId)) {
                        months.push(monthId);
                    }
                }
            }
        } catch (localErr) {
            console.error("Error loading from localStorage:", localErr);
        }

        months.sort((a, b) => b.localeCompare(a));

        if (months.length === 0) {
            months.push(getCurrentMonthId());
        }

        budgetMonthSelect.innerHTML = '';
        months.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = formatMonthText(m);
            budgetMonthSelect.appendChild(opt);
        });

        if (months.length > 0) {
            budgetMonthSelect.value = months[0];
            await loadMonthData(months[0]);
        }
    }

    async function loadMonthData(monthId) {
        try {
            let data = await readMonthData(monthId);
            if (!data) data = cloneDefaultBudgetData();
            localStorage.setItem(`budgetDataFlow_${monthId}`, JSON.stringify(data));
            bindDataToUI(data);
            updateLastSavedTime(data.lastSaved);
        } catch (e) {
            console.error("Load error:", e);
        }
    }

    function initializeNewMonth(monthId) {
        bindDataToUI(cloneDefaultBudgetData());
        updateLastSavedTime(null);
    }

    function bindDataToUI(data) {
        excelBudgetTbody.innerHTML = '';
        const categorizedItems = {};
        categories.forEach(cat => categorizedItems[cat] = []);
        if (data.items) data.items.forEach(item => { if (categorizedItems[item.category]) categorizedItems[item.category].push(item); });
        categories.forEach(cat => { if (categorizedItems[cat].length === 0) categorizedItems[cat].push({ name: '', note: '', yg: 0, sd: 0, amount: 0 }); });

        let totalRowsCount = 0;
        categories.forEach(cat => totalRowsCount += categorizedItems[cat].length + 1);
        const incomeRowspan = totalRowsCount + 1;
        let isFirstRow = true;

        categories.forEach(cat => {
            const itemsList = categorizedItems[cat];
            let isFirstRowOfCategory = true;
            itemsList.forEach((item) => {
                const tr = document.createElement('tr');
                tr.className = 'budget-row';
                tr.setAttribute('data-category', cat);
                let html = '';
                if (isFirstRow) {
                    html += `
                        <td rowspan="${incomeRowspan}" class="cell-income-group">
                            <div class="income-sticky-wrapper">
                                <strong id="summaryTotalIncome" style="font-size: 1.05rem; color: #1e3a8a;">0</strong>
                            </div>
                        </td>
                        <td rowspan="${incomeRowspan}" class="cell-income-group">
                            <div class="income-sticky-wrapper">
                                <input type="text" id="incomeYg" value="${formatNumber(data.incomeYg)}">
                            </div>
                        </td>
                        <td rowspan="${incomeRowspan}" class="cell-income-group">
                            <div class="income-sticky-wrapper">
                                <input type="text" id="incomeSd" value="${formatNumber(data.incomeSd)}">
                            </div>
                        </td>
                    `;
                    isFirstRow = false;
                }
                if (isFirstRowOfCategory) {
                    html += `
                        <td rowspan="${itemsList.length + 1}" class="cell-category">
                            <div class="category-wrapper">
                                <span style="font-weight: 700;">${getCategoryName(cat)}</span>
                                <button class="btn-add-inline" data-cat="${cat}">+ \uCD94\uAC00</button>
                            </div>
                        </td>
                    `;
                    isFirstRowOfCategory = false;
                }
                html += `
                    <td><input type="text" class="item-name" value="${item.name}"></td>
                    <td class="cell-yg-share"><input type="text" class="item-yg" value="${formatNumber(item.yg)}"></td>
                    <td class="cell-sd-share"><input type="text" class="item-sd" value="${formatNumber(item.sd)}"></td>
                    <td class="cell-amount"><input type="text" class="item-amount" value="${formatNumber(item.amount)}" readonly></td>
                    <td class="cell-ratio"></td>
                    <td><input type="text" class="item-note" value="${item.note}"></td>
                    <td class="cell-delete-action" style="text-align: center;">
                        <button class="btn-delete-row">\u274C</button>
                    </td>
                `;
                tr.innerHTML = html;
                excelBudgetTbody.appendChild(tr);

                const ygInput = tr.querySelector('.item-yg');
                const sdInput = tr.querySelector('.item-sd');
                const amtInput = tr.querySelector('.item-amount');

                [ygInput, sdInput].forEach(inp => {
                    inp.addEventListener('input', (e) => {
                        handleNumericInput(e);
                        const ygVal = parseNumber(ygInput.value);
                        const sdVal = parseNumber(sdInput.value);
                        amtInput.value = formatNumber(ygVal + sdVal);
                        calculateAll();
                    });
                });

                tr.querySelector('.btn-delete-row').addEventListener('click', () => {
                    tr.remove();
                    bindDataToUI(collectCurrentData());
                });
            });

            const subTr = document.createElement('tr');
            subTr.className = `subtotal-row`;
            subTr.setAttribute('data-category', cat);
            subTr.innerHTML = `
                <td style="text-align: center;">\uC18C\uACC4</td>
                <td class="sub-yg" style="text-align: right;">0</td>
                <td class="sub-sd" style="text-align: right;">0</td>
                <td class="sub-total" style="text-align: right;">0</td>
                <td class="sub-ratio" style="text-align: right;">0.00%</td>
                <td></td>
                <td></td>
            `;
            excelBudgetTbody.appendChild(subTr);
        });

        const grandTr = document.createElement('tr');
        grandTr.className = 'grand-total-row';
        grandTr.innerHTML = `
            <td colspan="2" style="text-align: center;">\uD569\uACC4</td>
            <td id="grandYg" style="text-align: right;">0</td>
            <td id="grandSd" style="text-align: right;">0</td>
            <td id="grandTotal" style="text-align: right;">0</td>
            <td id="grandBalanceText" style="text-align: right; color: #1e3a8a;">0</td>
            <td></td>
            <td></td>
        `;
        excelBudgetTbody.appendChild(grandTr);

        document.querySelectorAll('.btn-add-inline').forEach(btn => btn.addEventListener('click', (e) => {
            const collected = collectCurrentData();
            collected.items.push({ category: e.target.getAttribute('data-cat'), name: '', note: '', yg: 0, sd: 0, amount: 0 });
            bindDataToUI(collected);
        }));

        const incomeYgEl = document.getElementById('incomeYg');
        const incomeSdEl = document.getElementById('incomeSd');
        if (incomeYgEl && incomeSdEl) {
            incomeYgEl.addEventListener('input', calculateAll);
            incomeSdEl.addEventListener('input', calculateAll);
        }
        calculateAll();
    }

    function getChartItemName(name) {
        if (name === '여분저축' || name === '투자') return '총저축';
        return name;
    }

    function buildGroupedItemSummaries(itemSummaries) {
        const grouped = new Map();
        itemSummaries.forEach(item => {
            if (item.amount <= 0) return;
            const groupedName = (item.category === 'insurance' || item.category === 'etc') ? getCategoryName(item.category) : getChartItemName(item.name);
            const key = `${item.category}::${groupedName}`;
            const existing = grouped.get(key) || { category: item.category, name: groupedName, amount: 0 };
            existing.amount += item.amount;
            grouped.set(key, existing);
        });
        return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
    }

    function updateBudgetCharts(categorySummaries, itemSummaries, totalAmount) {
        if (!categoryPieChart || !categoryChartLegend || !itemRatioChart) return;

        const positiveCategories = categorySummaries.filter(item => item.total > 0);
        const positiveTotal = positiveCategories.reduce((sum, item) => sum + item.total, 0);

        if (positiveTotal <= 0) {
            categoryPieChart.style.background = "#e2e8f0";
            categoryChartLegend.innerHTML = "<div class=\"item-ratio-empty\">표시할 지출 데이터가 없습니다.</div>";
            itemRatioChart.innerHTML = "<div class=\"item-ratio-empty\">표시할 지출 데이터가 없습니다.</div>";
            return;
        }

        let currentPercent = 0;
        const pieStops = [];
        const pieLabels = [];
        const smallPieLegend = [];
        positiveCategories.forEach(item => {
            const percent = item.total / positiveTotal * 100;
            const start = currentPercent;
            currentPercent += percent;
            pieStops.push(`${categoryChartColors[item.category]} ${start.toFixed(2)}% ${currentPercent.toFixed(2)}%`);
            if (percent >= 3) {
                const mid = (start + currentPercent) / 2;
                const angle = (mid / 100 * 360 - 90) * Math.PI / 180;
                const radius = 34;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                pieLabels.push(`
                    <span class="pie-label" style="left:${x.toFixed(2)}%; top:${y.toFixed(2)}%; border-color:${categoryChartColors[item.category]};">
                        ${getCategoryName(item.category)}<strong>${percent.toFixed(1)}%</strong>
                    </span>
                `);
            } else {
                smallPieLegend.push(`
                    <div class="chart-legend-item">
                        <span class="chart-color-dot" style="background:${categoryChartColors[item.category]}"></span>
                        <span class="chart-label">${getCategoryName(item.category)}</span>
                        <span class="chart-value">${percent.toFixed(1)}%</span>
                    </div>
                `);
            }
        });
        categoryPieChart.style.background = `conic-gradient(${pieStops.join(", ")})`;
        categoryChartLegend.innerHTML = pieLabels.join("") + (smallPieLegend.length ? `<div class="small-pie-legend">${smallPieLegend.join("")}</div>` : "");

        const positiveItems = buildGroupedItemSummaries(itemSummaries);

        if (positiveItems.length === 0) {
            itemRatioChart.innerHTML = "<div class=\"item-ratio-empty\">표시할 지출 데이터가 없습니다.</div>";
            return;
        }

        const maxItemAmount = Math.max(...positiveItems.map(item => item.amount));
        itemRatioChart.innerHTML = positiveItems.map(item => {
            const percent = totalAmount > 0 ? item.amount / totalAmount * 100 : 0;
            const gaugePercent = maxItemAmount > 0 ? item.amount / maxItemAmount * 100 : 0;
            return `
                <div class="item-ratio-row" title="${getCategoryName(item.category)} - ${item.name}: ${formatNumber(item.amount)}">
                    <div class="item-ratio-meta">
                        <span class="chart-label">${item.name}</span>
                        <span class="chart-value">${percent.toFixed(1)}%</span>
                    </div>
                    <span class="item-ratio-bar-track">
                        <span class="item-ratio-bar" style="width:${Math.max(gaugePercent, 1).toFixed(2)}%; background:${categoryChartColors[item.category]}"></span>
                    </span>
                </div>
            `;
        }).join("");
    }

    function calculateAll() {
        const incomeYgEl = document.getElementById('incomeYg');
        const incomeSdEl = document.getElementById('incomeSd');
        if (!incomeYgEl || !incomeSdEl) return;

        const ygInc = parseNumber(incomeYgEl.value);
        const sdInc = parseNumber(incomeSdEl.value);
        const totalInc = ygInc + sdInc;

        const summaryTotalIncome = document.getElementById('summaryTotalIncome');
        if (summaryTotalIncome) {
            summaryTotalIncome.textContent = formatNumber(totalInc);
        }

        let grandYgVal = 0;
        let grandSdVal = 0;
        let grandTotalVal = 0;
        const categorySummaries = [];
        const itemSummaries = [];

        categories.forEach(cat => {
            let catYg = 0;
            let catSd = 0;
            let catTotal = 0;

            const rows = document.querySelectorAll(`#excelBudgetTbody tr.budget-row[data-category="${cat}"]`);
            rows.forEach(row => {
                const ygVal = parseNumber(row.querySelector('.item-yg').value);
                const sdVal = parseNumber(row.querySelector('.item-sd').value);
                const amtVal = ygVal + sdVal;
                const itemName = row.querySelector('.item-name').value.trim() || '미입력';

                row.querySelector('.item-amount').value = formatNumber(amtVal);

                catYg += ygVal;
                catSd += sdVal;
                catTotal += amtVal;
                itemSummaries.push({ category: cat, name: itemName, amount: amtVal });
            });

            const subRow = document.querySelector(`#excelBudgetTbody tr.subtotal-row[data-category="${cat}"]`);
            if (subRow) {
                subRow.querySelector('.sub-yg').textContent = formatNumber(catYg);
                subRow.querySelector('.sub-sd').textContent = formatNumber(catSd);
                subRow.querySelector('.sub-total').textContent = formatNumber(catTotal);

                const ratio = totalInc > 0 ? (catTotal / totalInc * 100) : 0;
                subRow.querySelector('.sub-ratio').textContent = ratio.toFixed(2) + '%';
            }

            grandYgVal += catYg;
            grandSdVal += catSd;
            grandTotalVal += catTotal;
            categorySummaries.push({ category: cat, total: catTotal });
        });

        const grandYgEl = document.getElementById('grandYg');
        const grandSdEl = document.getElementById('grandSd');
        const grandTotalEl = document.getElementById('grandTotal');
        const grandBalanceText = document.getElementById('grandBalanceText');

        if (grandYgEl) grandYgEl.textContent = formatNumber(grandYgVal);
        if (grandSdEl) grandSdEl.textContent = formatNumber(grandSdVal);
        if (grandTotalEl) grandTotalEl.textContent = formatNumber(grandTotalVal);

        const balance = totalInc - grandTotalVal;
        if (grandBalanceText) {
            grandBalanceText.textContent = formatNumber(balance);
        }
        updateBudgetCharts(categorySummaries, itemSummaries, grandTotalVal);
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    loadAllMonths();
});
