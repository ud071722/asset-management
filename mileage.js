import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
    const vehicleColumns = document.querySelectorAll('.vehicle-column');
    const getToday = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Load initial data
    loadFromFirebase();

    // Event Listeners for live calculation
    vehicleColumns.forEach(column => {
        const inputs = column.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => calculate(column));
        });

        // Individual Save Button
        const saveBtn = column.querySelector('.individual-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                // Update ONLY this vehicle's date to today on save
                const today = getToday();
                column.querySelector('.checkDate').value = today;
                calculate(column);

                if (await saveToFirebase()) {
                    const originalText = saveBtn.textContent;
                    saveBtn.textContent = '완료';
                    saveBtn.style.background = '#059669';
                    setTimeout(() => {
                        saveBtn.textContent = originalText;
                        saveBtn.style.background = '';
                    }, 2000);
                } else {
                    alert('저장에 실패했습니다.');
                }
            });
        }
    });

    function calculate(column) {
        const startDate = new Date(column.querySelector('.startDate').value);
        const checkDate = new Date(column.querySelector('.checkDate').value);
        const startKm = parseFloat(column.querySelector('.startKm').value) || 0;
        const annualStandard = parseFloat(column.querySelector('.annualStandard').value) || 12000;
        const currentKm = parseFloat(column.querySelector('.currentKm').value) || 0;

        if (isNaN(startDate.getTime()) || isNaN(checkDate.getTime())) return;

        const diffTime = checkDate - startDate;
        const elapsedDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        const remainingDays = Math.max(0, 365 - elapsedDays);

        column.querySelector('.resDaysInfo').textContent = `${remainingDays} 일`;

        const targetMileage = (annualStandard / 365) * elapsedDays;
        const currentMileage = currentKm - startKm;
        const currentDiff = currentMileage - targetMileage;

        column.querySelector('.resTargetMileage').textContent = `${Math.floor(targetMileage).toLocaleString()} km`;
        column.querySelector('.resCurrentMileage').textContent = `${Math.floor(currentMileage).toLocaleString()} km`;
        
        const resCurrentDiff = column.querySelector('.resCurrentDiff');
        resCurrentDiff.textContent = `${(currentDiff > 0 ? '+' : '')}${Math.floor(currentDiff).toLocaleString()} km`;
        resCurrentDiff.className = 'resCurrentDiff ' + (currentDiff > 0 ? 'diff-pos' : 'diff-neg');

        const expectedAnnualKm = (currentMileage / elapsedDays) * 365;
        const expectedAnnualDiff = expectedAnnualKm - annualStandard;

        column.querySelector('.resExpectedAnnualKm').textContent = `${Math.floor(expectedAnnualKm).toLocaleString()} km`;
        const resExpectedAnnualDiff = column.querySelector('.resExpectedAnnualDiff');
        resExpectedAnnualDiff.textContent = `${(expectedAnnualDiff > 0 ? '+' : '')}${Math.floor(expectedAnnualDiff).toLocaleString()} km`;
        resExpectedAnnualDiff.className = 'resExpectedAnnualDiff ' + (expectedAnnualDiff > 0 ? 'diff-pos' : 'diff-neg');
    }

    async function saveToFirebase() {
        const vehiclesData = [];
        vehicleColumns.forEach(column => {
            vehiclesData.push({
                name: column.querySelector('.vehicle-name-input').value,
                startDate: column.querySelector('.startDate').value,
                startKm: column.querySelector('.startKm').value,
                annualStandard: column.querySelector('.annualStandard').value,
                checkDate: column.querySelector('.checkDate').value,
                currentKm: column.querySelector('.currentKm').value
            });
        });

        const data = {
            vehicles: vehiclesData,
            lastSaved: new Date().toLocaleString('ko-KR')
        };

        try {
            await setDoc(doc(db, "settings", "mileage_multi"), data);
            document.getElementById('lastSavedTime').textContent = data.lastSaved;
            localStorage.setItem('mileageDataMulti', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Save error:", e);
            return false;
        }
    }

    async function loadFromFirebase() {
        try {
            const docSnap = await getDoc(doc(db, "settings", "mileage_multi"));
            let data = docSnap.exists() ? docSnap.data() : JSON.parse(localStorage.getItem('mileageDataMulti'));

            if (data && data.vehicles) {
                data.vehicles.forEach((vData, index) => {
                    const column = vehicleColumns[index];
                    if (column) {
                        column.querySelector('.vehicle-name-input').value = vData.name || `차량 ${index + 1}`;
                        column.querySelector('.startDate').value = vData.startDate || '';
                        column.querySelector('.startKm').value = vData.startKm || '';
                        column.querySelector('.annualStandard').value = vData.annualStandard || 12000;
                        column.querySelector('.checkDate').value = vData.checkDate || getToday();
                        column.querySelector('.currentKm').value = vData.currentKm || '';
                        calculate(column);
                    }
                });
                if (data.lastSaved) document.getElementById('lastSavedTime').textContent = data.lastSaved;
            } else {
                const today = getToday();
                const yearStart = new Date();
                yearStart.setMonth(0, 1);
                const yearStartStr = yearStart.toISOString().split('T')[0];

                vehicleColumns.forEach(column => {
                    column.querySelector('.startDate').value = yearStartStr;
                    column.querySelector('.checkDate').value = today;
                    calculate(column);
                });
            }
        } catch (e) {
            console.error("Load error:", e);
        }
    }
});
