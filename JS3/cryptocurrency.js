// ============================================
// DOM 요소 가져오기
// (HTML에 있는 id들을 JS 변수에 연결해서 나중에 조작하기 쉽게 함)
// ============================================
const cryptoList = document.getElementById('cryptoList');     // 코인 목록이 그려질 tbody
const searchInput = document.getElementById('searchInput');   // 검색어 입력창
const loading = document.getElementById('loading');           // "불러오는 중..." 문구
const cryptoTable = document.getElementById('cryptoTable');   // 전체 테이블
const noResult = document.getElementById('noResult');         // "검색 결과 없음" 문구
const allTab = document.getElementById('allTab');             // 전체보기 탭 버튼
const favoritesTab = document.getElementById('favoritesTab'); // 관심항목 탭 버튼
const lastUpdated = document.getElementById('lastUpdated');   // 마지막 업데이트 시각 표시
const sortableHeaders = document.querySelectorAll('th[data-sort]'); // 클릭 정렬이 가능한 헤더들

// ============================================
// 상태 변수 (앱이 동작하는 동안 계속 바뀌는 값들)
// ============================================

// API에서 받아온 전체 코인 데이터를 담아두는 배열
// 검색/정렬할 때마다 API를 다시 호출하지 않고 이 배열을 재사용함
let allCryptoData = [];

// 관심항목(즐겨찾기) 심볼 목록
// localStorage에 저장된 값이 있으면 불러오고, 없으면 빈 배열로 시작
// (새로고침해도 즐겨찾기가 유지되는 이유가 바로 이 localStorage 덕분)
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// 현재 선택된 탭. 'all'(전체보기) 또는 'favorites'(관심항목) 둘 중 하나
let currentTab = 'all';

// 현재 정렬 기준 컬럼. null이면 정렬 안 함(API가 준 기본 순서)
// th의 data-sort 값과 동일한 문자열이 들어감: 'favorite' | 'symbol' | 'price' | 'change' | 'high' | 'low'
let sortColumn = null;

// 현재 정렬 방향. 'asc'(오름차순) | 'desc'(내림차순) | null(정렬 없음)
let sortDirection = null;


// ============================================
// 1) API에서 데이터 불러오는 함수
// ============================================
async function fetchCryptoData() {
    try {
        // 바이낸스 24시간 시세 API 호출
        // await를 쓰면 응답이 올 때까지 다음 줄로 안 넘어가고 기다림
        const response = await fetch('https://api4.binance.com/api/v3/ticker/24hr');

        // 응답 상태가 200번대가 아니면(예: 서버 오류, 요청 제한 등) 에러를 발생시켜 catch로 보냄
        if (!response.ok) {
            throw new Error('데이터를 불러오는데 실패했습니다.');
        }

        // 응답 본문을 JSON 형태로 변환
        const data = await response.json();

        // 전체 코인 중에서 아래 두 조건을 모두 만족하는 것만 필터링
        // 1. 심볼이 'USDT'로 끝나는 것 (USDT 마켓만)
        // 2. 현재가(lastPrice)가 0이 아닌 것 (상장폐지/이상 데이터 제외)
        allCryptoData = data.filter(
            (item) => item.symbol.endsWith('USDT') && parseFloat(item.lastPrice) !== 0
        );

        // 데이터를 정상적으로 받아왔으니 로딩 문구는 숨기고 테이블을 보여줌
        loading.classList.add('hidden');
        cryptoTable.classList.remove('hidden');

        // 현재 시각을 사람이 읽기 쉬운 형태(예: 오후 3:12:45)로 표시
        const now = new Date();
        lastUpdated.textContent = `마지막 업데이트: ${now.toLocaleTimeString()}`;

        // 새로 받은 데이터를 화면에 반영 (검색어/탭/정렬 조건까지 다시 적용해서 그림)
        filterSortAndRender();
    } catch (error) {
        // 네트워크 오류나 API 오류가 나면 콘솔에 로그를 남기고
        // 사용자에게도 에러 문구를 보여줌 (다음 주기에 자동으로 다시 시도됨)
        console.error('Error:', error);
        loading.classList.remove('hidden');
        cryptoTable.classList.add('hidden');
        loading.textContent = '데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도합니다. (요청이 너무 잦으면 바이낸스에서 일시적으로 IP를 차단할 수 있습니다)';
    }
}


// ============================================
// 2) 검색어 + 탭 + 정렬을 모두 적용해서 화면에 그리는 함수
//    (이 함수 하나만 호출하면 현재 상태에 맞는 최신 화면이 만들어짐)
// ============================================
function filterSortAndRender() {
    // 검색창에 입력된 값을 대문자로 변환 (심볼은 대문자라서 대소문자 구분 없이 검색되게 하려고)
    const searchTerm = searchInput.value.toUpperCase();

    // --- 1단계: 검색어로 필터링 ---
    // 심볼 문자열에 검색어가 포함된 것만 남김 (예: "BTC" 입력 시 BTCUSDT, WBTCUSDT 등 매칭)
    let filteredData = allCryptoData.filter((item) => item.symbol.includes(searchTerm));

    // --- 2단계: 관심항목 탭이면 즐겨찾기한 심볼만 추가로 남김 ---
    if (currentTab === 'favorites') {
        filteredData = filteredData.filter((item) => favorites.includes(item.symbol));
    }

    // --- 3단계: 헤더 클릭으로 선택된 컬럼 기준 정렬 ---
    // sortColumn이 null이면 정렬하지 않고 API가 준 원래 순서 그대로 사용
    if (sortColumn && sortDirection) {
        filteredData = sortData(filteredData, sortColumn, sortDirection);
    }

    // 최종적으로 걸러지고 정렬된 데이터를 화면에 그림
    renderData(filteredData);

    // 헤더에 표시되는 화살표(▲▼)도 현재 정렬 상태에 맞게 갱신
    updateSortArrows();
}


// ============================================
// 3) 컬럼 기준으로 데이터를 정렬해주는 함수
//    column: 'favorite' | 'symbol' | 'price' | 'change' | 'high' | 'low'
//    direction: 'asc' | 'desc'
// ============================================
function sortData(data, column, direction) {
    // 컬럼마다 "정렬에 쓸 값을 어떻게 뽑아낼지"를 정의
    // 이렇게 함수로 묶어두면 아래 sort 부분이 컬럼 종류와 상관없이 한 줄로 처리됨
    const getValue = {
        favorite: (item) => (favorites.includes(item.symbol) ? 1 : 0), // 즐겨찾기면 1, 아니면 0
        symbol: (item) => item.symbol,
        price: (item) => parseFloat(item.lastPrice),
        change: (item) => parseFloat(item.priceChangePercent),
        high: (item) => parseFloat(item.highPrice),
        low: (item) => parseFloat(item.lowPrice),
    }[column];

    // 정렬 결과를 원본 배열에 영향 주지 않도록 복사본([...data])을 만들어서 정렬
    return [...data].sort((a, b) => {
        const valueA = getValue(a);
        const valueB = getValue(b);

        // 심볼처럼 문자열인 경우 localeCompare로 비교, 숫자인 경우 뺄셈으로 비교
        let result;
        if (typeof valueA === 'string') {
            result = valueA.localeCompare(valueB);
        } else {
            result = valueA - valueB;
        }

        // 내림차순이면 결과 부호를 뒤집음
        return direction === 'asc' ? result : -result;
    });
}


// ============================================
// 4) 헤더의 화살표(▲▼)를 현재 정렬 상태에 맞게 갱신하는 함수
//    화살표는 항상 둘 다 보이고, 현재 정렬 방향에 해당하는 것만 진한 색(active)이 됨
// ============================================
function updateSortArrows() {
    sortableHeaders.forEach((header) => {
        const arrowUp = header.querySelector('.arrow-up');
        const arrowDown = header.querySelector('.arrow-down');
        const column = header.dataset.sort;

        // 일단 두 화살표 모두 옅은 색(비활성) 상태로 초기화
        arrowUp.classList.remove('active');
        arrowDown.classList.remove('active');

        // 이 헤더가 현재 정렬 기준 컬럼이면, 방향에 맞는 화살표만 진하게 표시
        if (column === sortColumn) {
            if (sortDirection === 'asc') {
                arrowUp.classList.add('active');
            } else if (sortDirection === 'desc') {
                arrowDown.classList.add('active');
            }
        }
    });
}


// ============================================
// 5) 실제로 테이블에 <tr> 행들을 그려주는 함수
// ============================================
function renderData(data) {
    // 매번 새로 그리기 전에 기존 목록을 비움 (중복 렌더링 방지)
    cryptoList.innerHTML = '';

    // 필터링 결과가 하나도 없으면 "검색 결과 없음" 문구를 보여주고 함수 종료
    if (data.length === 0) {
        noResult.classList.remove('hidden');
        cryptoTable.classList.add('hidden');
        return;
    } else {
        noResult.classList.add('hidden');
        cryptoTable.classList.remove('hidden');
    }

    // 배열의 각 코인 데이터마다 <tr> 한 줄씩 만들어서 테이블에 추가
    data.forEach((item) => {
        const row = document.createElement('tr');

        const priceChange = parseFloat(item.priceChangePercent);
        // 변동률이 0 이상이면 'up'(빨강), 미만이면 'down'(파랑) 클래스 적용
        const changeClass = priceChange >= 0 ? 'up' : 'down';
        // 양수일 때만 앞에 '+' 기호를 붙임 (음수는 어차피 '-'가 자동으로 붙음)
        const sign = priceChange >= 0 ? '+' : '';
        // 현재 이 코인이 즐겨찾기되어 있는지 확인 (별 아이콘 채워진 모양 결정)
        const isFavorite = favorites.includes(item.symbol);

        // 템플릿 리터럴로 한 행(tr)의 HTML을 통째로 작성
        // toLocaleString()은 숫자에 천 단위 콤마(,)를 자동으로 넣어줌
        row.innerHTML = `
            <td>
                <button class="fav-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${item.symbol}')">
                    ${isFavorite ? '★' : '☆'}
                </button>
            </td>
            <td class="symbol">${item.symbol}</td>
            <td>${parseFloat(item.lastPrice).toLocaleString()}</td>
            <td class="${changeClass}">${sign}${priceChange.toFixed(2)}%</td>
            <td>${parseFloat(item.highPrice).toLocaleString()}</td>
            <td>${parseFloat(item.lowPrice).toLocaleString()}</td>
        `;

        cryptoList.appendChild(row);
    });
}


// ============================================
// 6) 관심항목(즐겨찾기) 추가/제거 함수
//    window에 등록하는 이유: HTML의 onclick="toggleFavorite(...)"에서
//    직접 호출하려면 전역(window) 함수여야 하기 때문
// ============================================
window.toggleFavorite = function (symbol) {
    const index = favorites.indexOf(symbol);

    if (index > -1) {
        // 이미 즐겨찾기 목록에 있으면 배열에서 제거 (별 해제)
        favorites.splice(index, 1);
    } else {
        // 없으면 배열에 추가 (별 채우기)
        favorites.push(symbol);
    }

    // 바뀐 즐겨찾기 목록을 localStorage에 다시 저장 (새로고침해도 유지되게)
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // 화면도 즉시 갱신해서 별 모양이 바뀐 걸 반영
    filterSortAndRender();
};


// ============================================
// 7) 이벤트 리스너 등록
//    (사용자 행동에 반응해서 어떤 함수를 실행할지 연결하는 부분)
// ============================================

// 검색창에 글자를 입력할 때마다(input 이벤트) 목록을 다시 그림
searchInput.addEventListener('input', filterSortAndRender);

// '전체보기' 탭 클릭 시: 상태를 'all'로 바꾸고 버튼 스타일(active) 전환 후 다시 그림
allTab.addEventListener('click', () => {
    currentTab = 'all';
    allTab.classList.add('active');
    favoritesTab.classList.remove('active');
    filterSortAndRender();
});

// '관심항목' 탭 클릭 시: 상태를 'favorites'로 바꾸고 버튼 스타일 전환 후 다시 그림
favoritesTab.addEventListener('click', () => {
    currentTab = 'favorites';
    favoritesTab.classList.add('active');
    allTab.classList.remove('active');
    filterSortAndRender();
});

// 정렬 가능한 헤더(관심/심볼/현재가/변동률/최고가/최저가) 클릭 이벤트
// 클릭할 때마다 "기본 → 오름차순 → 내림차순 → 다시 기본" 순서로 상태가 순환함
sortableHeaders.forEach((header) => {
    header.addEventListener('click', () => {
        const column = header.dataset.sort;

        if (sortColumn !== column) {
            // 다른 컬럼을 처음 클릭한 경우: 오름차순부터 시작
            sortColumn = column;
            sortDirection = 'asc';
        } else if (sortDirection === 'asc') {
            // 같은 컬럼을 두 번째 클릭한 경우: 오름차순 -> 내림차순
            sortDirection = 'desc';
        } else if (sortDirection === 'desc') {
            // 같은 컬럼을 세 번째 클릭한 경우: 내림차순 -> 기본(정렬 없음)
            sortColumn = null;
            sortDirection = null;
        }

        filterSortAndRender();
    });
});


// ============================================
// 8) 초기 실행부
// ============================================

// 페이지가 처음 열리자마자 데이터를 한 번 불러옴
fetchCryptoData();

// 이후로는 일정 주기마다 fetchCryptoData()를 반복 실행해서 실시간 갱신 효과를 냄
// 주의: ticker/24hr은 전체 심볼을 한 번에 가져오는 무거운(weight 높은) 요청이라
// 너무 짧은 주기로 반복 호출하면 바이낸스 요청 한도를 초과해서 IP가 일시적으로 차단(-1003 에러)될 수 있음.
// 그래서 30초(30000ms) 주기로 설정함.
setInterval(fetchCryptoData, 30000);