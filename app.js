document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('birthDate');

    if (dateInput) {
        dateInput.addEventListener('change', calculateEligibility);
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('max', today);
    }

    if (document.querySelector('.programs-container')) {
        loadResults();
    }
});

function calculateEligibility() {
    const birthDateInput = document.getElementById('birthDate');
    const birthDate = new Date(birthDateInput.value);
    const today = new Date();

    if (!birthDateInput.value) return;

    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;

    const infoBox = document.getElementById('calculated-info');
    const elapsedDaysSpan = document.getElementById('elapsedDays');
    const statusMessage = document.getElementById('statusMessage');
    const submitBtn = document.getElementById('submitBtn');

    infoBox.classList.remove('hidden');

    let displayText = '';
    if (diffMonths > 0) {
        displayText = `${diffMonths}개월 ${remainingDays}일`;
    } else {
        displayText = `${diffDays}일`;
    }
    displayText += ` (총 ${diffDays}일)`;
    elapsedDaysSpan.textContent = displayText;

    const minDays = 100;
    const maxDays = 365;

    if (diffDays < minDays) {
        const remaining = minDays - diffDays;
        statusMessage.textContent = `⚠️ 참여 가능까지 ${remaining}일 남았습니다 (산후 100일부터 가능)`;
        statusMessage.className = 'status-message not-eligible';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>아직 신청 불가</span><span>🔒</span>';
    } else if (diffDays > maxDays) {
        statusMessage.textContent = `⚠️ 참여 가능 기간이 지났습니다 (산후 1년 이내)`;
        statusMessage.className = 'status-message not-eligible';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>신청 기간 만료</span><span>🔒</span>';
    } else {
        const remaining = maxDays - diffDays;
        statusMessage.textContent = `✓ 참여 가능! (남은 기간: 약 ${Math.floor(remaining/30)}개월)`;
        statusMessage.className = 'status-message eligible';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>프로그램 찾기</span><span class="arrow">→</span>';
    }

    window.userStatus = {
        birthDate: birthDateInput.value,
        elapsedDays: diffDays,
        isEligible: diffDays >= minDays && diffDays <= maxDays
    };
}

function findPrograms() {
    if (!window.userStatus || !window.userStatus.isEligible) {
        alert('참여 가능한 상태가 아닙니다.');
        return;
    }

    const params = new URLSearchParams();
    params.set('birthDate', window.userStatus.birthDate);
    params.set('days', window.userStatus.elapsedDays);

    window.location.href = 'results.html?' + params.toString();
}

function loadResults() {
    const params = new URLSearchParams(window.location.search);
    const birthDate = params.get('birthDate');
    const elapsedDays = parseInt(params.get('days'));

    if (!birthDate || !elapsedDays) {
        window.location.href = 'index.html';
        return;
    }

    const diffMonths = Math.floor(elapsedDays / 30);
    const remainingDays = elapsedDays % 30;

    const elapsedBadge = document.querySelector('.elapsed-badge');
    if (elapsedBadge) {
        elapsedBadge.textContent = `출산 후 ${diffMonths}개월 ${remainingDays}일째`;
    }

    const container = document.querySelector('.programs-container');

    let html = '';

    programs.forEach((program, index) => {
        const isAvailable = elapsedDays >= program.minDays && elapsedDays <= program.maxDays;
        html += createProgramCard(program, index + 1, isAvailable, elapsedDays);
    });

    container.innerHTML = html;
}

function createProgramCard(program, number, isAvailable, userDays) {
    const statusClass = isAvailable ? 'available' : 'unavailable';
    const statusTag = isAvailable ? 
        '<span class="status-tag available">✓ 신청 가능</span>' : 
        '<span class="status-tag unavailable">✗ 조건 미충족</span>';

    const timeDisplay = program.schedule.time !== '시간 미정' ? 
        program.schedule.time : '시간 추후공지';

    const partDisplay = program.part ? `<span class="part-badge">${program.part}</span>` : '';

    let actionButton;
    if (isAvailable) {
        actionButton = `
            <a href="${program.link}" target="_blank" class="apply-btn">
                프리패스 신청하러 가기 →
            </a>
            <div class="freepass-info">
                <span class="freepass-icon">👶</span>
                <div class="freepass-text">
                    <div class="freepass-label">임산부 프리패스 정원</div>
                    <div class="freepass-value">정원의 ${program.freePass.ratio} (${program.freePass.count}명)</div>
                </div>
            </div>
        `;
    } else {
        let noticeText = '';
        if (userDays < program.minDays) {
            const remaining = program.minDays - userDays;
            noticeText = `신청 가능까지 ${remaining}일 남았습니다`;
        } else {
            noticeText = `신청 가능 기간이 지났습니다`;
        }

        actionButton = `
            <button class="apply-btn disabled" disabled>
                현재 신청 불가
            </button>
            <div class="unavailable-notice">
                ${noticeText}
            </div>
        `;
    }

    return `
        <div class="program-card ${statusClass}">
            <div class="program-header">
                <span class="program-number">${number}</span>
                ${statusTag}
            </div>

            <h3 class="program-title">
                ${program.name}
                ${partDisplay}
            </h3>
            <p class="program-subtitle">${program.description}</p>

            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">📅 운영기간</div>
                    <div class="detail-value">${program.schedule.period}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">⏰ 시간</div>
                    <div class="detail-value">${timeDisplay}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">📍 요일</div>
                    <div class="detail-value">${program.schedule.days}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">👤 대상</div>
                    <div class="detail-value highlight">${program.target}</div>
                </div>
                <div class="detail-item full-width">
                    <div class="detail-label">📝 신청방법</div>
                    <div class="detail-value">${program.application.method} (${program.application.period})</div>
                </div>
            </div>

            ${actionButton}
        </div>
    `;
}

function goBack() {
    window.location.href = 'index.html';
}