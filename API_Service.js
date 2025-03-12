const test_api_service_ = "";

// 클로바 API를 이용해서 스크립트로변환하기
class API_Service_Transcribe {
  processTranscription(fileId, row) {
    const docId = this.transcribeVideo(fileId);
    this.updateSpreadsheet(docId, row);
    
    return {
      docId: docId
    };
  }

  // 구글드라이버 id로 MP4파일을 가져와서 클로바 API로 전사하기
  transcribeVideo(fileId) {
    

  }

  updateSpreadsheet(docId, row) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // 문서 ID 설정
    sheet.getRange(row, 5).setValue(docId);

    // 문서 링크 설정
    const docUrl = "https://docs.google.com/document/d/" + docId + "/edit";
    const hyperlinkFormula = '=HYPERLINK("' + docUrl + '", "바로가기")';
    sheet.getRange(row, 6).setFormula(hyperlinkFormula);

    // AI 변환 링크 설정
    const url = WEBAPP_URL + "?action=aiPrompt&fileId=" + docId + "&row=" + row;
    const hyperlinkFormulaForAI = '=HYPERLINK("' + url + '", "변환")';
    sheet.getRange(row, 7).setFormula(hyperlinkFormulaForAI);
  }

}



class TranscribeService {
  processTranscription(fileId, row, param_row) {
    const docId = this.transcribeVideo(fileId);
    this.updateSpreadsheet(docId, row, param_row);
    
    return {
      docId: docId
    };
  }

  // 수정된 transcribeVideo 메서드: 기존 함수 호출 대신 직접 구현
  transcribeVideo(fileId) {
    // Google Drive에서 파일 정보를 가져옴
    var file = DriveApp.getFileById(fileId);
    var videoName = file.getName();
    var bucketName = "meet-temp-speech-to-text";

    // Cloud Function URL 구성 (파일 업로드 및 변환 요청)
    var cloudFunctionUrl = `${cloud_run_url}/uploadFromDriveToGCS` +
                           "?fileId=" + encodeURIComponent(fileId) +
                           "&bucketName=" + encodeURIComponent(bucketName);

    // HTTP 요청 옵션 설정
    var cfOptions = {
      method: "get",
      muteHttpExceptions: true
    };

    // Cloud Function 호출 및 결과 파싱
    var cfResponse = UrlFetchApp.fetch(cloudFunctionUrl, cfOptions);
    var cfResult = JSON.parse(cfResponse.getContentText());

    // 전사 결과 추출
    var transcription = cfResult.transcription;

    // Google Docs 문서를 생성하고 전사 결과 기록
    var doc = DocumentApp.create("음성 to 텍스트 - " + videoName);
    var body = doc.getBody();
    body.appendParagraph("Transcription for video: " + videoName);
    body.appendParagraph(transcription);

    return doc.getId();
  }

  updateSpreadsheet(docId, row, param_row) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // 문서 ID 설정
    sheet.getRange(row, 5).setValue(docId);

    // 문서 링크 설정
    const docUrl = "https://docs.google.com/document/d/" + docId + "/edit";
    const hyperlinkFormula = '=HYPERLINK("' + docUrl + '", "바로가기")';
    sheet.getRange(row, 6).setFormula(hyperlinkFormula);

    // AI 변환 링크 설정
    const url = WEBAPP_URL + "?action=aiPrompt&fileId=" + docId + "&row=" + param_row;
    const hyperlinkFormulaForAI = '=HYPERLINK("' + url + '", "변환")';
    sheet.getRange(row, 7).setFormula(hyperlinkFormulaForAI);
  }
}


class AiPromptService {
  processAiPrompt(fileId, row) {
    // fileid 는 docid 이다. 
    // fileid 를 이용해서 doc 를 가져온다. 
    // doc내용을 cound run ai-prompt 으로 바디값 prompt 로 보낸다. 
    // 응답을 받는다. 
    // 응답을 스프레드시트에 기록한다. 
    const docId = this.aiPromptVideo(fileId, row);
    this.updateSpreadsheet(docId, row);

    return {
      docId: docId
    }; // 기존 processAiPrompt 함수 호출
  }

  aiPromptVideo(fileId, row) {
    const doc = DocumentApp.openById(fileId);
    const body = doc.getBody();
    const prompt = body.getText();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("main");
    if (!sheet) {
      sheet = ss.insertSheet("main");
    }

    var select_prompt_guidline = sheet.getRange(row, 8).getValue();
    var default_prompt_guidline = sheet.getRange(2, 3).getValue() || 1;

    if (select_prompt_guidline == "" && default_prompt_guidline == "") {
      select_prompt_guidline = 1;
    } else if (select_prompt_guidline == "") {
      select_prompt_guidline = default_prompt_guidline;
    }


    var prompt_sheet = ss.getSheetByName("prompt");
    if (!prompt_sheet) {
      prompt_sheet = ss.insertSheet("prompt");
      prompt_sheet.getRange(1, 1).setValue("이 값을 지우고 새로 입력해주세요.");
      prompt_sheet.getRange(1, 2).setValue("이 값을 지우고 새로 입력해주세요.");
      prompt_sheet.getRange(1, 3).setValue("이 값을 지우고 새로 입력해주세요.");
    }

    var prompt_guidline = prompt_sheet.getRange(select_prompt_guidline, 1).getValue();


    const response = UrlFetchApp.fetch(`${cloud_run_url}/ai-prompt`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ prompt: `answer reference follow instruction: ${prompt_guidline} \n\n  reference: ${prompt}` })
    });
    const responseText = JSON.parse(response.getContentText());

    var created_doc = DocumentApp.create(`AI 프롬프트 ${row}번의 응답 - ${fileId}`);
    var created_doc_body = created_doc.getBody();
    created_doc_body.appendParagraph("AI 프롬프트 응답");
    created_doc_body.appendParagraph(responseText.result);

    return created_doc.getId();
  }

  updateSpreadsheet(docId, row) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("main");

    sheet.getRange(row, 9).setValue(docId);

    const docUrl = "https://docs.google.com/document/d/" + docId + "/edit";
    const hyperlinkFormula = '=HYPERLINK("' + docUrl + '", "바로가기")';
    sheet.getRange(row, 10).setFormula(hyperlinkFormula);
  }
}

