function updateMissingFileIds() {
  // 스프레드시트와 활성 시트 가져오기
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("main");
  
  // A2 셀에서 폴더명 읽어오기
  var folderName = sheet.getRange("A2").getValue();
  
  // 폴더명이 존재하는지 확인하고, 해당 폴더 가져오기
  var folders = DriveApp.getFoldersByName(folderName);
  if (!folders.hasNext()) {
    Logger.log("지정된 폴더가 존재하지 않습니다: " + folderName);
    return;
  }
  var folder = folders.next();
  
  // 기존에 기록된 파일 ID 목록 조회 (A열, 5행부터)
  var lastRow = sheet.getLastRow();
  var storedFileIds = [];
  if (lastRow >= 5) {
    var fileIdRange = sheet.getRange(5, 1, lastRow - 4, 1);
    storedFileIds = fileIdRange.getValues().map(function(row) {
      return row[0] ? row[0].toString() : "";
    });
  }
  
  // 폴더 내 파일들을 순회하며, 시트에 없는 파일 ID를 추가
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    var fileId = file.getId();
    var last_row = sheet.getLastRow() + 1;
    
    // 파일 ID가 저장된 리스트에 없으면 새로운 행에 추가 (파일 ID, 파일 이름)
    if (storedFileIds.indexOf(fileId) === -1) {
      var column_c = file.getDateCreated();
      var column_d = params_url_change_script(last_row, fileId);

      sheet.appendRow([fileId, file.getName(), column_c, column_d]);
      Logger.log("추가된 파일: " + file.getName() + " (" + fileId + ")");

      const transcribeService = new TranscribeService();
      const result_transcribeService = transcribeService.processTranscription(
        fileId,
        last_row,
        last_row
      );

      Logger.log("전사 완료. Doc ID: " + result_transcribeService.docId);

      const aiPromptService = new AiPromptService();
      const result_aiPromptService = aiPromptService.processAiPrompt(
        result_transcribeService.docId,
        last_row
      );

      Logger.log("AI 프롬프트 처리 완료. Doc ID: " + result_aiPromptService.docId);


    }
  }
  
  Logger.log("파일 업데이트 완료");
}

function params_url_change_script(_last_row, _fileId) {
  var url = WEBAPP_URL + "?action=transcribe&fileId=" + encodeURIComponent(_fileId) + "&row=" + _last_row;
  var formula = '=HYPERLINK("' + url + '", "변환")';
  return formula;
}
