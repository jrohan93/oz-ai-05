const display = document.getElementById('display');
let currentFormula = "";   // 화면에 표시 중인 계산식 (예: "10 + 20")
let isPowerOn = true;      // 전원 상태
let isCalculated = false;  // 방금 Enter로 계산 결과를 보여준 상태인지 여부
 
// 페이지가 로드되면 ON/OFF 버튼을 켜진 상태로 표시
window.onload = function () {
    const onOffBtn = document.querySelector('.on-off');
    onOffBtn.classList.add('on');
};
 
// [함수] 전원 on/off 토글
function togglePower() {
    isPowerOn = !isPowerOn;
    const buttons = document.querySelectorAll('button:not(.on-off)');
    const onOffBtn = document.querySelector('.on-off');
 
    if (isPowerOn) {
        display.value = "0";
        display.style.backgroundColor = "#222";
        onOffBtn.classList.add('on');
        buttons.forEach(btn => btn.disabled = false);
    } else {
        display.value = "";
        display.style.backgroundColor = "#111";
        onOffBtn.classList.remove('on');
        buttons.forEach(btn => btn.disabled = true);
        currentFormula = "";
        isCalculated = false;
    }
}
 
// [함수] 부동소수점 오차 보정
// 예) 50.1 - 50 = 0.09999999999999432  ->  0.1
// 소수점 10자리에서 반올림해서 이진수 표현 오차를 지워줍니다.
function fixFloat(num) {
    return Math.round((num + Number.EPSILON) * 1e10) / 1e10;
}
 
// [함수] 더하기
function add(a, b) {
    return fixFloat(a + b);
}
 
// [함수] 빼기
function subtract(a, b) {
    return fixFloat(a - b);
}
 
// [함수] 곱하기
function multiply(a, b) {
    return fixFloat(a * b);
}
 
// [함수] 나누기
function divide(a, b) {
    return fixFloat(a / b);
}
 
// [함수] 숫자 문자열에 천단위 콤마를 넣어주는 포맷 함수
// 정수 부분에만 콤마를 넣고, 소수점 이하는 그대로 둡니다.
// 예) "1234567.89" -> "1,234,567.89"
function formatNumber(numStr) {
    if (numStr === "" || numStr === "-") return numStr;
 
    let sign = "";
    if (numStr.startsWith("-")) {
        sign = "-";
        numStr = numStr.slice(1);
    }
 
    const [intPart, decPart] = numStr.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 
    return sign + formattedInt + (decPart !== undefined ? "." + decPart : "");
}
 
// [함수] currentFormula(콤마 없는 원본)를 콤마 포맷으로 바꿔서 화면에 표시
// 계산에는 currentFormula를 그대로 쓰고, 화면 표시에만 이 함수를 거칩니다.
function updateDisplay() {
    if (currentFormula === "") {
        display.value = "0";
        return;
    }
 
    const formatted = currentFormula
        .split(" ")
        .map(token => (["+", "-", "*", "/"].includes(token) ? token : formatNumber(token)))
        .join(" ");
 
    display.value = formatted;
}
 
// [함수] 숫자 버튼 입력 처리
function appendNumber(number) {
    if (!isPowerOn) return;
 
    // 계산 완료 직후 숫자를 누르면 새 계산식을 시작
    if (isCalculated) {
        currentFormula = "";
        isCalculated = false;
    }
 
    if (currentFormula === "0" || display.value === "Error" || display.value === "DivBy0") {
        currentFormula = number;
    } else {
        currentFormula += number;
    }
 
    updateDisplay();
}
 
// [함수] 연산자 버튼 입력 처리
function appendOperator(operator) {
    if (!isPowerOn) return;
    if (display.value === "Error" || display.value === "DivBy0") return;
 
    // 계산 직후 연산자를 누르면 결과값에 이어서 계산 진행
    if (isCalculated) {
        isCalculated = false;
    }
 
    // 수식이 비어있으면 0부터 시작
    if (currentFormula === "") {
        currentFormula = "0";
    }
 
    // 이미 연산자가 입력된 상태라면(공백으로 끝남) 새 연산자로 교체
    if (currentFormula.endsWith(" ")) {
        currentFormula = currentFormula.slice(0, -3);
    }
 
    currentFormula += " " + operator + " ";
    updateDisplay();
}
 
// [함수] 화면 초기화 (C 버튼)
function clearDisplay() {
    if (!isPowerOn) return;
    currentFormula = "";
    isCalculated = false;
    updateDisplay();
}
 
// [함수] 계산식을 받아서 결과를 계산
// 어제 버전과 동일하게 1단계(*, /) → 2단계(+, -) 순서로 처리
function calculate(formula) {
    const tokens = formula.trim().split(/\s+/);
    if (tokens.length < 3 || tokens.length % 2 === 0) {
        return "Error";
    }
 
    // 1단계: 곱셈과 나눗셈 먼저 처리
    const intermediateTokens = [];
    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];
        if (token === "*" || token === "/") {
            const left = Number(intermediateTokens.pop());
            const operator = token;
            const right = Number(tokens[i + 1]);
 
            if (isNaN(left) || isNaN(right)) return "Error";
 
            let res;
            if (operator === "*") {
                res = multiply(left, right);
            } else {
                if (right === 0) return "DivBy0";
                res = divide(left, right);
            }
            intermediateTokens.push(res);
            i += 2;
        } else {
            intermediateTokens.push(token);
            i++;
        }
    }
 
    // 2단계: 덧셈과 뺄셈 순서대로 처리
    let result = Number(intermediateTokens[0]);
    if (isNaN(result)) return "Error";
 
    for (let j = 1; j < intermediateTokens.length; j += 2) {
        const operator = intermediateTokens[j];
        const nextValue = Number(intermediateTokens[j + 1]);
 
        if (isNaN(nextValue)) return "Error";
 
        if (operator === "+") {
            result = add(result, nextValue);
        } else if (operator === "-") {
            result = subtract(result, nextValue);
        } else {
            return "Error";
        }
    }
    return result;
}
 
// [함수] Enter 버튼 클릭 시 계산 실행
function performCalculate() {
    if (!isPowerOn || !currentFormula) return;
 
    // 연산자로 끝나는 경우, 마지막 연산자를 제거하고 계산
    if (currentFormula.endsWith(" ")) {
        currentFormula = currentFormula.trim();
    }
 
    const result = calculate(currentFormula);
    isCalculated = true;
 
    if (result === "Error" || result === "DivBy0") {
        display.value = result;
        currentFormula = "";
    } else {
        currentFormula = result.toString();
        display.value = formatNumber(currentFormula);
    }
}
 