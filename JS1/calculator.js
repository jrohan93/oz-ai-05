// =======================================
// 사칙연산 계산기
// start() 를 입력하면 계산기가 실행됩니다.
// 입력 예시: 10 + 20 * 3 - 5 / 5
// (숫자, 연산자 사이는 반드시 공백으로 구분)
// =======================================

// [함수] 더하기
function add(a, b) {
  return a + b;
}

// [함수] 빼기
function subtract(a, b) {
  return a - b;
}

// [함수] 곱하기
function multiply(a, b) {
  return a * b;
}

// [함수] 나누기
function divide(a, b) {
  return a / b;
}

// [함수] 계산식을 입력받는 함수
function inputFormula() {
  return prompt("계산식을 입력하세요. (예: 10 + 20 * 3 - 5 / 5)");
}

// [함수] 계산식을 받아서 결과를 계산하는 함수
// [매개변수] formula (문자열) / [반환값] 계산 결과 또는 에러 메시지(문자열)
function calculate(formula) {

  // [배열 - split] 공백을 기준으로 잘라서 배열로 만듦
  let numbers = formula.split(" ");

  // ==========================
  // 1단계 : *, / 먼저 계산
  // ==========================
  let step1 = [];
  let i = 0;

  while (i < numbers.length) {
    let number = numbers[i];

    if (number == "*" || number == "/") {
      // step1 마지막에 있는 값을 왼쪽 숫자로 사용
      let left = Number(step1[step1.length - 1]);
      let right = Number(numbers[i + 1]);
      let result;

      if (number == "*") {
        result = multiply(left, right);
      } else {
        if (right == 0) {
          return "0으로 나눌 수 없습니다.";
        }
        result = divide(left, right);
      }

      // 마지막 값을 계산 결과로 교체
      step1[step1.length - 1] = result;
      i = i + 2;

    } else {
      step1.push(number);
      i = i + 1;
    }
  }

  // ==========================
  // 2단계 : +, - 순서대로 계산
  // ==========================
  let answer = Number(step1[0]);

  for (let j = 1; j < step1.length; j = j + 2) {
    let operator = step1[j];
    let nextValue = Number(step1[j + 1]);

    if (operator == "+") {
      answer = add(answer, nextValue);
    } else if (operator == "-") {
      answer = subtract(answer, nextValue);
    } else {
      return `예외 발생: ${operator}`;
    }
  }

  return answer;
}

// [함수] 계산기를 실행하는 함수
function start(formula) {
  let input = formula;

  // 인자가 없으면 prompt로 물어봄
  if (!input) {
    input = inputFormula();
  }

  if (!input) {
    console.log("계산식을 입력해주세요.");
    return;
  }

  let result = calculate(input);

  console.log(`계산식 : ${input}`);
  console.log(`결과 : ${result}`);
}

// =======================================
// 실행 안내
// =======================================
console.log("======================================");
console.log("사칙연산 계산기");
console.log("실행하려면 start() 를 입력하세요.");
console.log("======================================");