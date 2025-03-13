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
  // 구글드라이버 id로 MP4파일을 가져와서 클로바 API로 전사하기
  transcribeVideo(fileId, bucketName) {
    try {
      // 1. 구글 드라이브에서 파일 다운로드
      const file = DriveApp.getFileById(fileId);
      const fileBlob = file.getBlob();

      // 2. Clova Speech API 호출 준비
      const clovaInvokeUrl = PropertiesService.getScriptProperties().getProperty("CLOVA_INVOKE_URL") || "https://clovaspeech-gw.ncloud.com";
      const clovaSecret = PropertiesService.getScriptProperties().getProperty("CLOVA_SECRET_KEY");
      if (!clovaSecret) {
        throw new Error("CLOVA_SECRET_KEY가 설정되지 않았습니다.");
      }

      const requestBody = {
        language: "ko-KR",
        completion: "sync",
        wordAlignment: true,
        fullText: true,
        diarization: {
          enable: true,
          speakerCountMin: 2,
          speakerCountMax: 2
        }
      };

      // Clova API는 multipart/form-data 형식으로 파일과 파라미터를 전송합니다.
      const paramsBlob = Utilities.newBlob(JSON.stringify(requestBody), "application/json");
      const payload = {
        media: fileBlob,
        params: paramsBlob
      };

      const headers = {
        "Accept": "application/json;UTF-8",
        "X-CLOVASPEECH-API-KEY": clovaSecret
      };

      const options = {
        method: "post",
        payload: payload,
        headers: headers,
        muteHttpExceptions: true
      };

      const response = UrlFetchApp.fetch(clovaInvokeUrl + "/recognizer/upload", options);
      const statusCode = response.getResponseCode();
      const responseText = response.getContentText();
      Logger.log("API 응답 상태 코드: " + statusCode);
      Logger.log("API 응답 내용: " + responseText);

      if (statusCode === 200) {
        const result = JSON.parse(responseText);
        let transcription = "";
        if (result.segments && result.segments.length > 0) {
          result.segments.forEach(segment => {
            const startTime = API_Service_Utils.formatTime(segment.start);
            const speakerName = (segment.speaker && segment.speaker.name) ? segment.speaker.name : "unknown";
            const text = segment.text || "";
            transcription += `${startTime} speaker ${speakerName} - ${text}\n`;
          });
        }

        // 4. (선택사항) 결과를 Google Cloud Storage (GCS)에 저장
        if (bucketName) {
          const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
          const resultBlobName = `clova_results/${fileId}_${timestamp}.json`;

          // GCS 업로드 기능은 Cloud Storage Advanced Service를 사용하거나 REST API로 구현해야 합니다.
          // 아래는 Cloud Storage Advanced Service를 사용하여 업로드하는 예시입니다.
          /*
          const uploadData = {
            original_result: result,
            formatted_transcription: transcription
          };
          const blob = Utilities.newBlob(JSON.stringify(uploadData, null, 2), 'application/json');
          Storage.Objects.insert(
            {
              bucket: bucketName,
              name: resultBlobName,
              contentType: 'application/json'
            },
            bucketName,
            blob
          );
          */
          
          // 업로드된 결과의 경로를 지정합니다.
          result.gcs_result_path = `gs://${bucketName}/${resultBlobName}`;
        }
        
        return {
          status: "success",
          message: "음성 인식이 완료되었습니다.",
          result: result,
          transcription: transcription
        };
      } else {
        const errorMsg = `Clova API 요청 실패: ${statusCode} - ${responseText}`;
        Logger.log(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (e) {
      const errorMsg = "음성 인식 처리 중 오류 발생: " + e.message;
      Logger.log(errorMsg);
      throw new Error(errorMsg);
    }
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



class API_Service_Utils {
  // 헬퍼 함수: 밀리초(ms)를 [HH:MM:SS] 형식으로 변환
  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = num => num < 10 ? "0" + num : num;
    return `[${pad(hours)}:${pad(minutes)}:${pad(seconds)}]`;
  }
}
