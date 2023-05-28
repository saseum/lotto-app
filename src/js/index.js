let LOTTO = {
    lottoData : null, //로또 데이터
    weekLottoData : null, //이번주 로또 데이터
    autoLottoData : [], //자동 로또 데이터
    fixedList : [], //반자동 선택 수
    isNumberCreate : false, //번호 생성 여부
    //시작
    init : function() {
        this.fn_lotto_turn_change();
        this.fn_create_fixed_number_ball();
    },
    //로또 회차별 데이터 조회
    fn_lotto_turn_change : function() {
        let _this = this;

        const url = '/lotto/turnHistory.json?date=' + new Date();
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                const response = JSON.parse(xhr.responseText);

                _this.lottoData = response;
                _this.fn_lotto_turn(_this.lottoData.length);

                const selectElement = document.getElementById('lottoTurn');
                const selectedValue = selectElement.value ? selectElement.value : selectElement.options[0].value;

                _this.weekLottoData = _this.lottoData[selectedValue-1];
                _this.fn_create_ball();

                document.getElementById('firstWinamnt').innerHTML =_this.weekLottoData.firstWinamnt.toLocaleString();
                document.getElementById('firstPrzwnerCo').innerHTML = _this.weekLottoData.firstPrzwnerCo;

            } else {
                console.error('Error:', xhr.status);
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    },
    //로또 회차 리스트
    fn_lotto_turn : function(lotto_len) {
        let _this = this;
        const lottoTurn = document.getElementById('lottoTurn');

        for (let i = lotto_len; i > 0; i--) {

            let newOption = document.createElement('option');
            newOption.value = i;
            newOption.text = i + '회';

            lottoTurn.appendChild(newOption);
        }
    },
    //당첨번호 그리기
    fn_create_ball : function() {

        let _this = this;

        let drwtArr = [
            _this.weekLottoData.drwtNo1,
            _this.weekLottoData.drwtNo2,
            _this.weekLottoData.drwtNo3,
            _this.weekLottoData.drwtNo4,
            _this.weekLottoData.drwtNo5,
            _this.weekLottoData.drwtNo6,
            _this.weekLottoData.bnusNo,
        ];

        document.getElementById('winDate').innerHTML = '(' + _this.weekLottoData.drwNoDate + ')';

        for(let i = 1; i <= drwtArr.length; i++) {
            document.getElementById('ball-' + i).className = '';
            document.getElementById('ball-' + i).innerHTML = drwtArr[i-1];
            document.getElementById('ball-' + i).classList.add("ball-" + _this.fn_digitNumber(drwtArr[i-1]));
        }
    },
    //공 1자리, 10자리, 20자리, 30자리, 40자리일때 색 다르게 하기 위해 시작숫자 구하기
    fn_digitNumber : function(number) {

        if (number < 10) {
            return 0;
        } else if (number >= 10 && number < 100) {
            const tensDigit = Math.floor(number / 10) * 1;
            return tensDigit;
        }
    },
    //반자동(고정수)안에 볼 그리기
    fn_create_fixed_number_ball : function() {

        const _this = this;

        //우선 숨김 처리
        document.getElementById('fixedNumberList').style.display = 'none';

        let fixedBallList = document.getElementById('fixedNumberList');
        let fixedListDiv = document.createElement('div');

        for (let i = 1; i <= 45; i++) {
            let ballDiv = document.createElement('div');
            ballDiv.className = 'ball-' + _this.fn_digitNumber(i);
            ballDiv.textContent = i;
            ballDiv.onclick = _this.fn_fixed_choice;
            fixedBallList.appendChild(ballDiv);
        }
    },
    //고정수 반자동 숫자 선택
    fn_fixed_choice : function(event) {

        const _this = LOTTO;
        const choiceNumber = event.target.textContent;

        //5개일 이상 선택했을 때(같은 번호 해제인 경우는 제외)
        if(_this.fixedList.length > 4 && !_this.fixedList.includes(choiceNumber)) {
            alert('5개를 초과하여 선택 할 수 없습니다.');
            return;
        }

        if(_this.fixedList.includes(choiceNumber)) {
            event.target.classList.remove('ball-click');
            const index = _this.fixedList.indexOf(choiceNumber);
            if (index !== -1) {
                _this.fixedList.splice(index, 1);
            }
        } else  {
            event.target.classList.add('ball-click');
            _this.fixedList.push(choiceNumber);
        }
    },
    //모달 페이지 열기
    fn_modal_page : function(page) {

        const _this = this;

        switch (page) {
            case 'M' : _this.fn_display_show('mainSection'); break;
            case 'A' :
                _this.fn_set_modal_title('autoTitle', '번호 생성');
                _this.fn_modal_page_init(page);
                _this.fn_auto_ball_list_init();
                _this.fn_display_show('autoSection-modal');
                break;
            case 'V' :
                _this.fn_set_modal_title('saveNumberTitle', '번호 관리');
                _this.fn_modal_page_init(page);
                _this.fn_get_save_number_list();
                _this.fn_display_show('saveNumberSection-modal');
                break;
            case 'E' : _this.fn_display_show('emergeSection'); break;
        }
    },
    //모달 타이틀 설정
    fn_set_modal_title : function(titleId, title) {

        document.getElementById(titleId).innerText = title;
    },
    //모달 페이지 초기화
    fn_modal_page_init : function(page) {

        const _this = this;

        switch (page) {
            case 'M' : break;
            case 'A' :
                document.getElementById('fixedCheckbox').checked = false;
                document.getElementById('fixedNumberList').innerHTML = '';
                _this.fixedList = [];
                this.fn_create_fixed_number_ball();
                break;
            case 'V' :
            case 'E' :
        }
    },
    //모달 페이지 보이기
    fn_display_show : function(id) {

        document.getElementById(id).classList.add('dp-b');
    },
    //모달 페이지 닫기
    fn_modal_close : function(id) {

        const _this = this;

        this.fn_auto_ball_list_init();

        document.getElementById(id).classList.remove('dp-b');
        document.getElementById(id).classList.add('dp-n');
    },
    //생성된 로또 번호 리스트 초기화
    fn_auto_ball_list_init : function() {

        document.getElementById('autoBallList').innerHTML = '';

        let autoBallList = document.getElementById('autoBallList');

        let listDiv = document.createElement('div');
        listDiv.classList.add('list');
        listDiv.classList.add('mg-b5');

        for (let j = 0; j < 6; j++) {
            let ballDiv = document.createElement('div');
            ballDiv.className = 'ball-q';
            ballDiv.textContent = '?';
            listDiv.appendChild(ballDiv);
        }

        autoBallList.appendChild(listDiv);

    },
    //반자동(고정수) 체크
    fn_fixed_number_check : function() {

        const _this = this;
        const checkbox = document.getElementById('fixedCheckbox');
        const fixedList = document.getElementById('fixedNumberList');

        if (checkbox.checked) {
            fixedList.style.display = '';
        } else {
            fixedList.style.display = 'none';
            let elements = document.querySelectorAll('.ball-click');

            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];
                element.classList.remove('ball-click');
            }
            _this.fixedList = [];
        }
    },
    //로또번호 생성
    fn_lotto_number_create : function() {

        const _this = this;

        const checkbox = document.getElementById('fixedCheckbox');

        //반자동 체크가 되어있으면서 숫자가 선택 안 된 경우
        if (checkbox.checked && _this.fixedList.length == 0) {
            alert('반자동 숫자를 선택해주세요.');
            return;
        }

        _this.fn_lotto_number_create_init();

        for (let i = 0; i < 5; i++) {

            let includedNumbers = [..._this.fixedList]; //고정수(반자동)수
            let selectedNumbers = []; //로또번호
            let availableNumbers = Array.apply(null, Array(45)).map(function (_, i) {
                return i + 1;
            });

            // 특정 숫자들을 포함하여 중복되지 않는 랜덤한 6개의 숫자 선택
            for (let j = 0; j < includedNumbers.length; j++) {
                let includedNum = Number(includedNumbers[j]);

                if (selectedNumbers.indexOf(includedNum) !== -1) {
                    continue; // 이미 선택된 숫자는 건너뜀
                }

                selectedNumbers.push(includedNum);
                availableNumbers.splice(availableNumbers.indexOf(includedNum), 1);
            }

            while (selectedNumbers.length < 6) {
                let randomIndex = Math.floor(Math.random() * availableNumbers.length);
                let randomNum = availableNumbers[randomIndex];

                selectedNumbers.push(randomNum);
                availableNumbers.splice(randomIndex, 1);
            }

            // 선택된 숫자 정렬
            selectedNumbers.sort(function(a, b) {
                return a - b;
            });

            _this.autoLottoData.push(selectedNumbers);
        }

        _this.fn_create_lotto_ball_list();
    },
    //로또 자동 html 초기화
    fn_lotto_number_create_init : function() {
        this.autoLottoData = [];
        document.getElementById('autoBallList').innerHTML = '';
    },
    //자동 생성된 로또번호 리스트 그리기
    fn_create_lotto_ball_list : function() {

        const _this = this;

        let lottoData = this.autoLottoData;
        let autoBallList = document.getElementById('autoBallList');

        for(let i = 0; i < lottoData.length; i++) {

            let listDiv = document.createElement('div');
            listDiv.classList.add('list');
            listDiv.classList.add('mg-b5');

            for (let j = 0; j < lottoData[i].length; j++) {

                let ballDiv = document.createElement('div');
                let alp = document.createElement('div');
                alp.classList.add('alp');

                if (i == 0) alp.innerHTML = 'A';
                else if (i == 1) alp.innerHTML = 'B';
                else if (i == 2) alp.innerHTML = 'C';
                else if (i == 3) alp.innerHTML = 'D';
                else if (i == 4) alp.innerHTML = 'E';

                if(j == 0) listDiv.appendChild(alp);
                ballDiv.className = 'ball-' + _this.fn_digitNumber(lottoData[i][j]);
                ballDiv.textContent = lottoData[i][j];
                listDiv.appendChild(ballDiv);
            }

            autoBallList.appendChild(listDiv);
        }

        _this.isNumberCreate = true;
    },
    //로또 번호 저장
    fn_lotto_number_save : function() {

        const _this = this;

        if(_this.autoLottoData.length == 0) {
            alert('저장 할 로또 번호를 생성해주세요.');
            return;
        }

        if(!_this.isNumberCreate) {
            alert('이미 저장 된 번호입니다.\n저장 할 번호를 새로 생성해주세요.');
            return;
        }

        const saveDate = _this.fn_set_now_date();

        let storageData = {
            'lottoData' : _this.autoLottoData,
            'saveDate' : saveDate.currentDateTime,
            'key' : saveDate.key
        }

        // 배열을 JSON 문자열로 변환
        let arrayString = JSON.stringify(storageData);

        // Local Storage 저장
        localStorage.setItem('lottoData_' + saveDate.key, arrayString);

        alert('저장되었습니다.');
        _this.isNumberCreate = false;

    },
    //현재 날짜 및 시간 생성
    fn_set_now_date : function() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const date =  {
            'key' : year + month + day + hours + minutes + seconds,
            'currentDateTime' : year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
        };

        return date;
    },
    //저장된 로또 번호 들고오기
    fn_get_save_number_list : function() {

        const _this = this;

        let keyArr = [];

        for (let i = 0; i < localStorage.length; i++) {
            keyArr.push(localStorage.key(i));
        }

        const saveLottoList = document.getElementById('saveLottoList');

        for (let i = 0; i < keyArr.length; i++) {

            let listDiv = document.createElement('div');

            listDiv.classList.add('list');
            listDiv.classList.add('mg-t10');

            const lottoData = JSON.parse(localStorage.getItem(keyArr[i]));

            //저장 날짜
            let dateDiv = document.createElement('div');
            dateDiv.classList.add('save-date');

            //로또 번호
            let lottoNumberDivs = document.createElement('div');
            lottoNumberDivs.classList.add('lotto-number-list');

            dateDiv.textContent = lottoData.saveDate;
            listDiv.appendChild(dateDiv);

            for (let j = 0; j < lottoData.lottoData.length; j++) {
                let lottoNumbers = document.createElement('div');
                lottoNumbers.classList.add('save-ball-list');
                lottoNumbers.classList.add('txt-ai-c');
                lottoNumbers.classList.add('mg-b5');

                for (let k = 0; k < lottoData.lottoData[j].length; k++) {
                    let lottoNumber = document.createElement('div');
                    lottoNumber.className = 'ball-' + _this.fn_digitNumber(lottoData.lottoData[j][k]);
                    lottoNumber.textContent = lottoData.lottoData[j][k]
                    lottoNumbers.appendChild(lottoNumber);
                }

                listDiv.appendChild(lottoNumbers);
            }

            saveLottoList.appendChild(listDiv);
        }
    }
}

document.addEventListener('DOMContentLoaded', function(){
    LOTTO.init();
});
