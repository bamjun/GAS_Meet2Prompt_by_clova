class API_Router {
  handleTranscribe(e) {
    const validation = API_RequestSchema.validateTranscribeParams(e.parameter);
    const validationResponse = API_RequestSchema.createValidationResponse(validation);
    if (validationResponse) return validationResponse;
    
    const transcribeService = new TranscribeService();
    const result = transcribeService.processTranscription(
      validation.data.fileId,
      validation.data.row,
      validation.data.rawRow
    );
    
    return ContentService.createTextOutput("전사 완료. Doc ID: " + result.docId);
  }

  handleAiPrompt(e) {
    const validation = API_RequestSchema.validateAiPromptParams(e.parameter);
    const validationResponse = API_RequestSchema.createValidationResponse(validation);
    if (validationResponse) return validationResponse;

    const aiPromptService = new AiPromptService();
    const result = aiPromptService.processAiPrompt(
      validation.data.fileId,
      validation.data.row
    );

    return ContentService.createTextOutput("AI 프롬프트 처리 완료. Doc ID: " + result.docId);
  }
}

// 전역 핸들러 함수들
function apiRouterTranscribe(e) {
  const router = new API_Router();
  return router.handleTranscribe(e);
}

function apiRouterAiPrompt(e) {
  const router = new API_Router();
  return router.handleAiPrompt(e);
}
