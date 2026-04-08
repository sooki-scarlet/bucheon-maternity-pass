document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('birthDate');

    if (dateInput) {
        dateInput.addEventListener('change', calculateAndShowPrograms);
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('max', today);
    }

    const modal = document.getElementById('detail-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
});

function calculateAndShowPrograms() {
    const birthDateInput = document.getElementById('birthDate');
    const birthDate = new Date(birthDateInput.value);
    const today = new Date();

    if (!birthDateInput.value) return;

    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const statusDiv = document.getElementById('calculated-info');
    const statusMessage = document.getElementById('statusMessage');
    const buttonsDiv = document.getElementById('program-buttons');
    const buttonsContainer = document.getElementById('buttonsContainer');

    statusDiv.classList.remove('hidden');

    const minDays = 100;
    const maxDays = 365;

    let isEligible = false;

    if (diffDays < minDays) {
        const remaining = minDays - diffDays;
        statusMessage.textContent = `⚠️ ${remaining}일 후 신청 가능 (산후 100일부터)`;
        statusMessage.className = 'status-message not-eligible';
    } else if (diffDays > maxDays) {
        statusMessage.textContent = `⚠️ 신청 기간이 지났습니다 (산후 1년 이내)`;
        statusMessage.className = 'status-message not-eligible';
    } else {
        statusMessage.textContent = `✓ 참여 가능합니다`;
        statusMessage.className = 'status-message eligible';
        isEligible = true;
    }

    buttonsDiv.classList.remove('hidden');
    buttonsContainer.innerHTML = '';

    programs.forEach((program, index) => {
        const canApply = isEligible && diffDays >= program.minDays && diffDays <= program.maxDays;
        const btn = createProgramButton(program, index + 1, canApply, diffDays);
        buttonsContainer.appendChild(btn);
    });

    window.userStatus = {
        birthDate: birthDateInput.value,
        elapsedDays: diffDays,
        isEligible: isEligible
    };
}

function createProgramButton(program, number, canApply, userDays) {
    const btn = document.createElement('button');
    btn.className = `program-btn ${canApply ? 'available' : 'not-available'}`;
    btn.onclick = () => showDetail(program, number, canApply, userDays);

    const timeDisplay = program.schedule.time !== '시간 미정' ? 
        program.schedule.time : '시간 미정';

    btn.innerHTML = `
        <div class="btn-header">
            <span class="btn-number">${number}</span>
            <span class="btn-status ${canApply ? 'available' : 'not-available'}">
                ${canApply ? '신청 가능' : '조건 미충족'}
            </span>
        </div>
        <div class="btn-title">${program.name}</div>
        <div class="btn-meta">
            <span>📅 ${program.schedule.days}</span>
            <span>⏰ ${timeDisplay}</span>
        </div>
    `;

    return btn;
}

function showDetail(program, number, canApply, userDays) {
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');

    const timeDisplay = program.schedule.time !== '시간 미정' ? 
        program.schedule.time : '시간 추후공지';

    let actionSection;
    if (canApply) {
        actionSection = `
            <div class="freepass-box">
                <div class="freepass-label">임산부 프리패스 정원</div>
                <div class="freepass-value">정원의 ${program.freePass.ratio} (${program.freePass.count}명)</div>
            </div>
            <a href="${program.link}" target="_blank" class="apply-btn">
                프리패스 신청하러 가기 →
            </a>
        `;
    } else {
        let noticeText = '';
        if (userDays < program.minDays) {
            const remaining = program.minDays - userDays;
            noticeText = `신청 가능까지 ${remaining}일 남았습니다`;
        } else {
            noticeText = `신청 가능 기간이 지났습니다`;
        }

        actionSection = `
            <div class="notice-box">
                ${noticeText}
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="detail-header">
            <span class="detail-number">${number}</span>
            <h3 class="detail-title">${program.name}</h3>
            <p class="detail-desc">${program.description}</p>
        </div>

        <div class="detail-info">
            <div class="info-row">
                <div class="info-label">📅 운영기간</div>
                <div class="info-value">${program.schedule.period}</div>
            </div>
            <div class="info-row">
                <div class="info-label">⏰ 시간</div>
                <div class="info-value">${timeDisplay}</div>
            </div>
            <div class="info-row">
                <div class="info-label">📍 요일</div>
                <div class="info-value">${program.schedule.days}</div>
            </div>
            <div class="info-row">
                <div class="info-label">👤 대상</div>
                <div class="info-value highlight">${program.target}</div>
            </div>
            <div class="info-row">
                <div class="info-label">📝 신청방법</div>
                <div class="info-value">${program.application.method}</div>
            </div>
        </div>

        ${actionSection}
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function goBack() {
    window.location.href = 'index.html';
}