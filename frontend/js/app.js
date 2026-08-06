// 업무 말투 변환기 프론트엔드 메인 로직

// API 주소 자동 감지: FastAPI가 static 파일을 함께 서빙하므로 동일 origin을 기본값으로 사용
const API_BASE = window.location.origin;

// DOM 요소 캐싱
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const charCounter = document.getElementById("charCounter");
const btnClear = document.getElementById("btnClear");
const btnConvert = document.getElementById("btnConvert");
const btnCopy = document.getElementById("btnCopy");
const audienceButtons = document.querySelectorAll(".audience-btn");
const loadingOverlay = document.getElementById("loadingOverlay");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");

// 상태 관리
let activeTarget = "boss"; // 기본 선택값
let typingInterval = null;

// 1. 수신 대상 선택 카드 이벤트 설정
audienceButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // 기존 active 클래스 제거
        audienceButtons.forEach(b => b.classList.remove("active"));
        // 클릭된 버튼 active 추가
        btn.classList.add("active");
        activeTarget = btn.dataset.target;
    });
});

// 2. 입력란 글자 수 세기 기능 (실시간)
inputText.addEventListener("input", () => {
    const len = inputText.value.length;
    charCounter.textContent = `${len} / 500 자`;
    
    if (len > 500) {
        charCounter.style.color = "#ef4444"; // Red 500
    } else {
        charCounter.style.color = ""; // 기본색
    }
});

// 3. 비우기 버튼 이벤트
btnClear.addEventListener("click", () => {
    inputText.value = "";
    charCounter.textContent = "0 / 500 자";
    charCounter.style.color = "";
    inputText.focus();
});

// 4. 로딩 상태 전환 함수
function setLoading(isLoading) {
    if (isLoading) {
        loadingOverlay.classList.remove("hidden");
        btnConvert.disabled = true;
        btnConvert.style.opacity = "0.7";
    } else {
        loadingOverlay.classList.add("hidden");
        btnConvert.disabled = false;
        btnConvert.style.opacity = "";
    }
}

// 5. 타이핑 효과로 텍스트 출력하기 (WOW 요소)
function typeWriter(text, element, speed = 25) {
    // 진행 중인 타이핑이 있다면 정지
    if (typingInterval) {
        clearInterval(typingInterval);
    }
    
    element.value = "";
    let i = 0;
    
    typingInterval = setInterval(() => {
        if (i < text.length) {
            element.value += text.charAt(i);
            // 텍스트 영역 스크롤을 맨 아래로 이동
            element.scrollTop = element.scrollHeight;
            i++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
        }
    }, speed);
}

// 6. 말투 변환 API 호출 함수
async function convertTone() {
    const text = inputText.value.trim();
    
    if (!text) {
        showToast("변환할 내용을 입력해 주세요.", "⚠️", "#ef4444");
        inputText.focus();
        return;
    }
    
    if (!activeTarget) {
        showToast("수신 대상을 선택해 주세요.", "⚠️", "#ef4444");
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/api/convert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                target_audience: activeTarget
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "서버 에러가 발생했습니다.");
        }
        
        const data = await response.json();
        const converted = data.converted_text;
        
        // 타이핑 애니메이션으로 출력 실행
        typeWriter(converted, outputText);
        
        // 복사 버튼 활성화
        btnCopy.disabled = false;
        
    } catch (error) {
        console.error("변환 중 오류 발생:", error);
        outputText.value = "";
        btnCopy.disabled = true;
        showToast(error.message || "변환 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "❌", "#ef4444");
    } finally {
        setLoading(false);
    }
}

// 말투 변환 버튼 클릭 이벤트 바인딩
btnConvert.addEventListener("click", convertTone);

// 7. 복사하기 기능 및 토스트 노출
btnCopy.addEventListener("click", async () => {
    const textToCopy = outputText.value;
    if (!textToCopy) return;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast("성공적으로 복사되었습니다!", "✅", "#10b981");
    } catch (err) {
        console.error("복사 실패:", err);
        // 클립보드 API 실패 시 폴백 (textarea 강제 셀렉트 및 execCommand)
        outputText.select();
        try {
            document.execCommand("copy");
            showToast("성공적으로 복사되었습니다!", "✅", "#10b981");
        } catch (fallbackErr) {
            showToast("복사에 실패했습니다. 직접 복사해 주세요.", "❌", "#ef4444");
        }
    }
});

// 8. 세련된 토스트 메시지 팝업 기능
let toastTimeout = null;
function showToast(message, icon = "✅", bgColor = "#10b981") {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toastText.textContent = message;
    toast.querySelector(".toast-icon").textContent = icon;
    toast.style.backgroundColor = bgColor;
    toast.classList.remove("hidden");
    
    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2500); // 2.5초 후 사라짐
}

console.log("BizTalk UI initialization complete.");
