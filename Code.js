function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('◉ 커스텀 메뉴')
    .addItem('폴더 선택', 'showFolderPicker')
    .addItem('업데이트', 'updateMissingFileIds')
    .addToUi();
}


/**
 * 구글 시트에서 대화상자로 폴더 선택 창을 띄웁니다.
 */
function showFolderPicker() {
  var html = HtmlService.createHtmlOutputFromFile('FolderPicker')
      .setWidth(400)
      .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '폴더 선택');
}

/**
 * DriveApp을 사용하여 사용자가 접근 가능한 모든 폴더 목록을 가져옵니다.
 * 각 객체는 {id, name} 속성을 가집니다.
 *
 * @return {Array} 폴더 정보 배열
 */
function getFolderList() {
  var folders = [];
  var folderIterator = DriveApp.getFolders();
  while (folderIterator.hasNext()) {
    var folder = folderIterator.next();
    folders.push({
      id: folder.getId(),
      name: folder.getName()
    });
  }
  return folders;
}

/**
 * 선택한 폴더 ID를 받아 시트에 폴더 정보와 동영상 목록을 출력합니다.
 *
 * 시트 구성:
 *   - Row1: A1 = "폴더명", B1 = "폴더id"
 *   - Row2: A2 = 실제 폴더명, B2 = 실제 폴더 id
 *   - Row4: 헤더 (A4: "동영상 id", B4: "동영상이름", C4: "생성날짜", D4: "스크립트 변환",
 *                    E4: "음성to텍스트 문서 id", F4: "음성to텍스트 문서 바로가기")
 *   - Row5 이후: 폴더 내 동영상 파일 정보
 *
 * @param {string} folderId - 선택한 폴더의 ID
 * @return {string} 결과 메시지
 */
function processSelectedFolder(folderId) {
  var folder = DriveApp.getFolderById(folderId);
  var folderName = folder.getName();

  folder.addEditor(cloud_run_account_email);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("main");
  if (!sheet) {
    sheet = ss.insertSheet("main");
  }
  
  // 폴더 정보 기록 (Row1: 헤더, Row2: 값)
  sheet.getRange("A1").setValue("폴더명");
  sheet.getRange("B1").setValue("폴더id");
  sheet.getRange("C1").setValue("기본 프롬프트 선택");
  sheet.getRange("A2").setValue(folderName);
  sheet.getRange("B2").setValue(folderId);
  
  // 동영상 목록 헤더 (Row4)
  sheet.getRange("A4").setValue("동영상 ID");
  sheet.getRange("B4").setValue("동영상이름");
  sheet.getRange("C4").setValue("생성날짜");
  sheet.getRange("D4").setValue("스크립트 변환");
  sheet.getRange("E4").setValue("음성to텍스트 문서 ID");
  sheet.getRange("F4").setValue("음성to텍스트 문서 바로가기");
  sheet.getRange("G4").setValue("AI 프롬프트 변환");
  sheet.getRange("H4").setValue("AI 프롬프트 선택");
  sheet.getRange("I4").setValue("AI 응답 문서 ID");
  sheet.getRange("J4").setValue("AI 응답 문서 바로가기");
  
  // 이전 동영상 목록(행 5 이후) 삭제
  var lastRow = sheet.getLastRow();
  if (lastRow >= 5) {
    sheet.getRange(5, 1, lastRow - 4, 6).clearContent();
  }
  
  // 선택한 폴더 내 파일 중 동영상만 필터링 (MIME 타입이 "video/"로 시작)
  var files = folder.getFiles();
  var row = 5;
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType().indexOf("video/") === 0) {
      // A열: 동영상 id, B열: 동영상이름, C열: 생성날짜
      sheet.getRange(row, 1).setValue(file.getId());
      sheet.getRange(row, 2).setValue(file.getName());
      sheet.getRange(row, 3).setValue(file.getDateCreated());
      
      // D열: "변환" 버튼(하이퍼링크)
      // 웹앱 URL에 fileId와 row 번호를 파라미터로 전달합니다.
      var url = WEBAPP_URL + "?action=transcribe&fileId=" + encodeURIComponent(file.getId()) + "&row=" + row;
      var formula = '=HYPERLINK("' + url + '", "변환")';
      sheet.getRange(row, 4).setFormula(formula);
      
      // E열과 F열은 초기에는 빈칸으로 둡니다.
      row++;
    }
  }
  
  return "폴더 '" + folderName + "' 내부의 동영상 파일 목록을 업데이트 했습니다.";
}

